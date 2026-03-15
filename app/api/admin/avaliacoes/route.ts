// app/api/admin/avaliacoes/route.ts — moderar avaliacoes (so ADMIN)
// GET: lista todas as avaliacoes
// DELETE: remove uma avaliacao
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

interface AvaliacaoRow extends RowDataPacket {
  ID_AVALIACAO: number; NOTA: number; COMENTARIO: string|null;
  DATA_AVALIACAO: string; NOME_USUARIO: string; ALVO: string; TIPO: string;
}
interface CountRow extends RowDataPacket { TOTAL: number; }

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.tipo !== 'ADMIN') return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const page  = Math.max(1, Number(searchParams.get('page') ?? 1));
  const nota  = Number(searchParams.get('nota') ?? 0);
  const limit = 20;
  const offset = (page - 1) * limit;

  const notaClause = nota >= 1 ? `AND av.NOTA = ${nota}` : '';

  try {
    const [countRows] = await pool.execute<CountRow[]>(
      `SELECT COUNT(*) AS TOTAL FROM TABELA_AVALIACOES av WHERE 1=1 ${notaClause}`, []
    );
    const total = countRows[0]?.TOTAL ?? 0;

    const [avaliacoes] = await pool.execute<AvaliacaoRow[]>(
      `SELECT av.ID_AVALIACAO, av.NOTA, av.COMENTARIO, av.DATA_AVALIACAO,
              u.NOME AS NOME_USUARIO,
              COALESCE(r.NOME, a.NOME) AS ALVO,
              CASE WHEN av.ID_ROTA IS NOT NULL THEN 'Rota' ELSE 'Hotel' END AS TIPO
       FROM TABELA_AVALIACOES av
       JOIN TABELA_USUARIOS u ON av.ID_USUARIO = u.ID_USUARIO
       LEFT JOIN TABELA_ROTAS r ON av.ID_ROTA = r.ID_ROTA
       LEFT JOIN TABELA_ACOMODACOES a ON av.ID_ACOMODACAO = a.ID_ACOMODACAO
       WHERE 1=1 ${notaClause}
       ORDER BY av.DATA_AVALIACAO DESC
       LIMIT ${limit} OFFSET ${offset}`, []
    );

    return NextResponse.json({
      avaliacoes,
      paginacao: { total, page, limit, totalPaginas: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('[ADMIN AVALIACOES ERROR]', error);
    return NextResponse.json({ error: 'Erro.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.tipo !== 'ADMIN') return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });

  const { idAvaliacao } = await req.json();
  if (!idAvaliacao) return NextResponse.json({ error: 'ID invalido.' }, { status: 400 });

  try {
    await pool.execute<ResultSetHeader>(
      `DELETE FROM TABELA_AVALIACOES WHERE ID_AVALIACAO = ${Number(idAvaliacao)}`, []
    );
    return NextResponse.json({ message: 'Avaliacao removida.' });
  } catch (error) {
    console.error('[ADMIN DELETE AVALIACAO ERROR]', error);
    return NextResponse.json({ error: 'Erro.' }, { status: 500 });
  }
}