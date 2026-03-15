// app/api/admin/reservas/route.ts — todas as reservas do sistema (so ADMIN)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { RowDataPacket } from 'mysql2';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

interface ReservaRotaRow extends RowDataPacket {
  ID: number; TIPO: string; NOME_ITEM: string; NOME_USUARIO: string;
  DATA_EVENTO: string; QTD: number; STATUS: string; VALOR_TOTAL: number; DATA_RESERVA: string;
}
interface CountRow extends RowDataPacket { TOTAL: number; }

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.tipo !== 'ADMIN') return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status')?.trim() ?? '';
  const tipo   = searchParams.get('tipo')?.trim()   ?? ''; // 'rota' ou 'hotel'
  const page   = Math.max(1, Number(searchParams.get('page') ?? 1));
  const limit  = 20;
  const offset = (page - 1) * limit;

  try {
    // Uniao de reservas de rotas e acomodacoes
    const statusClause = status ? `AND STATUS = '${status}'` : '';

    const queryRotas = `
      SELECT rr.ID_RESERVA_ROTA AS ID, 'Rota' AS TIPO,
             r.NOME AS NOME_ITEM, u.NOME AS NOME_USUARIO,
             rr.DATA_PASSEIO AS DATA_EVENTO, rr.QTD_PESSOAS AS QTD,
             rr.STATUS, rr.VALOR_TOTAL, rr.DATA_RESERVA
      FROM TABELA_RESERVAS_ROTAS rr
      JOIN TABELA_ROTAS r ON rr.ID_ROTA = r.ID_ROTA
      JOIN TABELA_USUARIOS u ON rr.ID_USUARIO = u.ID_USUARIO
      WHERE 1=1 ${statusClause}`;

    const queryHoteis = `
      SELECT ra.ID_RESERVA AS ID, 'Hotel' AS TIPO,
             a.NOME AS NOME_ITEM, u.NOME AS NOME_USUARIO,
             ra.DATA_CHECKIN AS DATA_EVENTO, ra.QTD_HOSPEDES AS QTD,
             ra.STATUS, ra.VALOR_TOTAL, ra.DATA_RESERVA
      FROM TABELA_RESERVAS_ACOMODACAO ra
      JOIN TABELA_ACOMODACOES a ON ra.ID_ACOMODACAO = a.ID_ACOMODACAO
      JOIN TABELA_USUARIOS u ON ra.ID_USUARIO = u.ID_USUARIO
      WHERE 1=1 ${statusClause}`;

    let query = '';
    if (tipo === 'rota')  query = queryRotas;
    else if (tipo === 'hotel') query = queryHoteis;
    else query = `${queryRotas} UNION ALL ${queryHoteis}`;

    // Contagem total
    const [countRows] = await pool.execute<CountRow[]>(
      `SELECT COUNT(*) AS TOTAL FROM (${query}) AS combined`, []
    );
    const total = countRows[0]?.TOTAL ?? 0;

    const [reservas] = await pool.execute<ReservaRotaRow[]>(
      `SELECT * FROM (${query}) AS combined ORDER BY DATA_RESERVA DESC LIMIT ${limit} OFFSET ${offset}`, []
    );

    return NextResponse.json({
      reservas,
      paginacao: { total, page, limit, totalPaginas: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('[ADMIN RESERVAS ERROR]', error);
    return NextResponse.json({ error: 'Erro.' }, { status: 500 });
  }
}