// app/api/perfil/route.ts
// GET  — retorna dados do perfil do usuário logado
// PATCH — atualiza nome, telefone e contato de emergência

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

interface UsuarioPerfilRow extends RowDataPacket {
  NOME:                           string;
  TELEFONE:                       string | null;
  CONTATO_EMERGENCIA_NOME:        string | null;
  CONTATO_EMERGENCIA_TELEFONE:    string | null;
  CONTATO_EMERGENCIA_PARENTESCO:  string | null;
}

// ─── GET /api/perfil ──────────────────────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

  const [rows] = await pool.execute<UsuarioPerfilRow[]>(
    `SELECT NOME, TELEFONE,
            CONTATO_EMERGENCIA_NOME, CONTATO_EMERGENCIA_TELEFONE, CONTATO_EMERGENCIA_PARENTESCO
     FROM TABELA_USUARIOS WHERE ID_USUARIO = ? LIMIT 1`,
    [Number(session.user.id)]
  );

  if (rows.length === 0) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });

  return NextResponse.json({ usuario: rows[0] });
}

// ─── PATCH /api/perfil ────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

  const { nome, telefone, contatoEmergenciaNome, contatoEmergenciaTelefone, contatoEmergenciaParentesco } = await req.json();

  if (!nome?.trim()) return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 });

  await pool.execute<ResultSetHeader>(
    `UPDATE TABELA_USUARIOS SET
       NOME                          = ?,
       TELEFONE                      = ?,
       CONTATO_EMERGENCIA_NOME       = ?,
       CONTATO_EMERGENCIA_TELEFONE   = ?,
       CONTATO_EMERGENCIA_PARENTESCO = ?
     WHERE ID_USUARIO = ?`,
    [
      nome.trim(),
      telefone?.trim()                    || null,
      contatoEmergenciaNome?.trim()       || null,
      contatoEmergenciaTelefone?.trim()   || null,
      contatoEmergenciaParentesco?.trim() || null,
      Number(session.user.id),
    ]
  );

  return NextResponse.json({ message: 'Perfil atualizado com sucesso.' });
}