// app/api/admin/usuarios/route.ts — listagem e busca de usuarios (so ADMIN)
// GET: lista usuarios com filtros q, tipo, page
// PATCH: ativa/desativa conta (campo TIPO usado como flag via coluna extra ou logica)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

interface UsuarioRow extends RowDataPacket {
  ID_USUARIO: number; NOME: string; EMAIL: string; TIPO: string;
  TELEFONE: string|null; DATA_CADASTRO: string; ATIVO: number;
  RAZAO_SOCIAL: string|null; TOTAL_RESERVAS: number;
}
interface CountRow extends RowDataPacket { TOTAL: number; }

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.tipo !== 'ADMIN') return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const q    = searchParams.get('q')?.trim()    ?? '';
  const tipo = searchParams.get('tipo')?.trim() ?? '';
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const limit = 20;
  const offset = (page - 1) * limit;

  const conds: string[] = ['1=1'];
  const params: (string|number)[] = [];
  if (q)    { conds.push('(u.NOME LIKE ? OR u.EMAIL LIKE ?)'); params.push(`%${q}%`, `%${q}%`); }
  if (tipo) { conds.push('u.TIPO = ?'); params.push(tipo); }
  const where = conds.join(' AND ');

  try {
    const [countRows] = await pool.execute<CountRow[]>(
      `SELECT COUNT(*) AS TOTAL FROM TABELA_USUARIOS u WHERE ${where}`, params
    );
    const total = countRows[0]?.TOTAL ?? 0;

    const [usuarios] = await pool.execute<UsuarioRow[]>(
      `SELECT u.ID_USUARIO, u.NOME, u.EMAIL, u.TIPO, u.TELEFONE, u.DATA_CADASTRO,
              et.RAZAO_SOCIAL,
              (SELECT COUNT(*) FROM TABELA_RESERVAS_ROTAS rr WHERE rr.ID_USUARIO = u.ID_USUARIO) +
              (SELECT COUNT(*) FROM TABELA_RESERVAS_ACOMODACAO ra WHERE ra.ID_USUARIO = u.ID_USUARIO) AS TOTAL_RESERVAS
       FROM TABELA_USUARIOS u
       LEFT JOIN TABELA_EMPRESAS_TURISMO et ON et.ID_USUARIO = u.ID_USUARIO
       WHERE ${where}
       ORDER BY u.DATA_CADASTRO DESC
       LIMIT ${limit} OFFSET ${offset}`, params
    );

    return NextResponse.json({
      usuarios,
      paginacao: { total, page, limit, totalPaginas: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('[ADMIN USUARIOS ERROR]', error);
    return NextResponse.json({ error: 'Erro.' }, { status: 500 });
  }
}

// PATCH /api/admin/usuarios — altera o TIPO de um usuario (ex: desativar forcando tipo INATIVO)
// Estrategia didatica: usamos um TIPO especial 'INATIVO' para desativar sem excluir
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.tipo !== 'ADMIN') return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });

  const { idUsuario, acao } = await req.json();
  if (!idUsuario || !acao) return NextResponse.json({ error: 'Dados invalidos.' }, { status: 400 });
  // Nao permite desativar o proprio admin
  if (Number(idUsuario) === Number(session.user.id)) return NextResponse.json({ error: 'Voce nao pode alterar sua propria conta.' }, { status: 403 });

  try {
    if (acao === 'desativar') {
      await pool.execute<ResultSetHeader>(
        `UPDATE TABELA_USUARIOS SET TIPO = 'INATIVO' WHERE ID_USUARIO = ${Number(idUsuario)} AND TIPO != 'ADMIN'`, []
      );
      return NextResponse.json({ message: 'Conta desativada.' });
    }
    if (acao === 'reativar') {
      // Reativa como TURISTA por padrao — admin pode ajustar manualmente se necessario
      await pool.execute<ResultSetHeader>(
        `UPDATE TABELA_USUARIOS SET TIPO = 'TURISTA' WHERE ID_USUARIO = ${Number(idUsuario)} AND TIPO = 'INATIVO'`, []
      );
      return NextResponse.json({ message: 'Conta reativada.' });
    }
    return NextResponse.json({ error: 'Acao invalida.' }, { status: 400 });
  } catch (error) {
    console.error('[ADMIN PATCH USUARIO ERROR]', error);
    return NextResponse.json({ error: 'Erro.' }, { status: 500 });
  }
}