// app/api/auth/cadastro/route.ts
// Endpoint de registro de novos usuários.
// CORRIGIDO: sem 'any' — usa ResultSetHeader e RowDataPacket do mysql2.

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '@/lib/db';
import type { FormCadastro } from '@/lib/types';

// ─── Tipos das queries ────────────────────────────────────────

// Linha retornada na verificação de duplicidade
interface IdRow extends RowDataPacket {
  ID_USUARIO?: number;
  ID_EMPRESA?: number;
}

// Tipo do erro MySQL que pode ter a propriedade 'code'
interface MySQLError extends Error {
  code?: string;
}

// ─── Helpers de validação ─────────────────────────────────────

function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarCNPJ(cnpj: string): boolean {
  return cnpj.replace(/\D/g, '').length === 14;
}

// ─── POST /api/auth/cadastro ──────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body: FormCadastro = await req.json();

    const {
      nome, email, senha, telefone, tipo,
      contatoEmergenciaNome, contatoEmergenciaTelefone, contatoEmergenciaParentesco,
      cnpj, razaoSocial,
    } = body;

    // ── 1. Validações ──────────────────────────────────────────
    if (!nome?.trim())  return erro('Nome é obrigatório.', 400);
    if (!email?.trim()) return erro('E-mail é obrigatório.', 400);
    if (!senha)         return erro('Senha é obrigatória.', 400);
    if (!tipo)          return erro('Tipo de usuário é obrigatório.', 400);

    if (!validarEmail(email))  return erro('E-mail inválido.', 400);
    if (senha.length < 8)      return erro('A senha deve ter no mínimo 8 caracteres.', 400);

    if (!['TURISTA', 'EMPRESA'].includes(tipo)) {
      return erro('Tipo de usuário inválido.', 400);
    }

    if (tipo === 'EMPRESA') {
      if (!cnpj?.trim())        return erro('CNPJ é obrigatório para empresas.', 400);
      if (!razaoSocial?.trim()) return erro('Razão Social é obrigatória para empresas.', 400);
      if (!validarCNPJ(cnpj))   return erro('CNPJ inválido.', 400);
    }

    // ── 2. Normalização ────────────────────────────────────────
    const emailNormalizado = email.toLowerCase().trim();
    const cnpjDigitos      = cnpj ? cnpj.replace(/\D/g, '') : null;

    // ── 3. Verifica duplicidade de e-mail ──────────────────────
    // pool.execute<IdRow[]> elimina o 'any' — retorna [IdRow[], FieldPacket[]]
    const [existingRows] = await pool.execute<IdRow[]>(
      'SELECT ID_USUARIO FROM TABELA_USUARIOS WHERE EMAIL = ? LIMIT 1',
      [emailNormalizado]
    );

    if (existingRows.length > 0) {
      return erro('Este e-mail já está cadastrado.', 409);
    }

    // Verifica duplicidade de CNPJ (apenas para empresas)
    if (tipo === 'EMPRESA' && cnpjDigitos) {
      const [cnpjRows] = await pool.execute<IdRow[]>(
        'SELECT ID_EMPRESA FROM TABELA_EMPRESAS_TURISMO WHERE CNPJ = ? LIMIT 1',
        [cnpjDigitos]
      );

      if (cnpjRows.length > 0) {
        return erro('Este CNPJ já está cadastrado.', 409);
      }
    }

    // ── 4. Hash da senha ───────────────────────────────────────
    const senhaHash = await bcrypt.hash(senha, 12);

    // ── 5. Transação ───────────────────────────────────────────
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      // ResultSetHeader é o tipo correto para INSERT/UPDATE/DELETE
      const [resultUsuario] = await conn.execute<ResultSetHeader>(
        `INSERT INTO TABELA_USUARIOS
          (NOME, EMAIL, SENHA_HASH, TELEFONE, TIPO,
           CONTATO_EMERGENCIA_NOME, CONTATO_EMERGENCIA_TELEFONE, CONTATO_EMERGENCIA_PARENTESCO)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nome.trim(),
          emailNormalizado,
          senhaHash,
          telefone?.trim() || null,
          tipo,
          contatoEmergenciaNome?.trim()       || null,
          contatoEmergenciaTelefone?.trim()   || null,
          contatoEmergenciaParentesco?.trim() || null,
        ]
      );

      const novoIdUsuario = resultUsuario.insertId;

      if (tipo === 'EMPRESA' && cnpjDigitos && razaoSocial) {
        await conn.execute<ResultSetHeader>(
          `INSERT INTO TABELA_EMPRESAS_TURISMO (ID_USUARIO, CNPJ, RAZAO_SOCIAL)
           VALUES (?, ?, ?)`,
          [novoIdUsuario, cnpjDigitos, razaoSocial.trim()]
        );
      }

      await conn.commit();
      conn.release();

      return NextResponse.json(
        {
          message: 'Cadastro realizado com sucesso!',
          usuario: { id: novoIdUsuario, nome: nome.trim(), email: emailNormalizado, tipo },
        },
        { status: 201 }
      );

    } catch (txError) {
      await conn.rollback();
      conn.release();
      throw txError;
    }

  } catch (error: unknown) {
    console.error('[CADASTRO ERROR]', error);

    // Verifica código de erro MySQL sem usar 'any'
    const mysqlError = error as MySQLError;
    if (mysqlError?.code === 'ER_DUP_ENTRY') {
      return erro('E-mail ou CNPJ já cadastrado.', 409);
    }

    return erro('Erro interno do servidor. Tente novamente.', 500);
  }
}

// ─── Helper para respostas de erro ───────────────────────────
function erro(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}