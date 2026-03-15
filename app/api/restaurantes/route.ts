// app/api/restaurantes/route.ts — listagem publica com filtros: q, tipo, estado, page, limit
import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';

interface RestauranteRow extends RowDataPacket {
  ID_RESTAURANTE: number; NOME: string; TIPO: string | null;
  CARACTERISTICAS: string | null; PRECO_MEDIO: number | null;
  URL_IMAGEM_CAPA: string | null; CIDADE: string; ESTADO: string;
}
interface CountRow extends RowDataPacket { TOTAL: number; }

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q      = searchParams.get('q')?.trim()      ?? '';
  const tipo   = searchParams.get('tipo')?.trim()   ?? '';
  const estado = searchParams.get('estado')?.trim() ?? '';
  const page   = Math.max(1, Number(searchParams.get('page')  ?? 1));
  const limit  = Math.min(24, Math.max(1, Number(searchParams.get('limit') ?? 12)));
  const offset = (page - 1) * limit;

  const conds: string[] = ['1=1'];
  const params: (string | number)[] = [];
  if (q)      { conds.push('r.NOME LIKE ?');  params.push(`%${q}%`); }
  if (tipo)   { conds.push('r.TIPO = ?');      params.push(tipo); }
  if (estado) { conds.push('re.ESTADO = ?');   params.push(estado.toUpperCase()); }
  const where = conds.join(' AND ');

  try {
    const [countRows] = await pool.execute<CountRow[]>(
      `SELECT COUNT(*) AS TOTAL FROM TABELA_RESTAURANTES r
       JOIN TABELA_REGIOES re ON r.ID_REGIAO = re.ID_REGIAO WHERE ${where}`, params
    );
    const total = countRows[0]?.TOTAL ?? 0;

    const [restaurantes] = await pool.execute<RestauranteRow[]>(
      `SELECT r.ID_RESTAURANTE, r.NOME, r.TIPO, r.CARACTERISTICAS, r.PRECO_MEDIO, r.URL_IMAGEM_CAPA,
              re.CIDADE, re.ESTADO
       FROM TABELA_RESTAURANTES r
       JOIN TABELA_REGIOES re ON r.ID_REGIAO = re.ID_REGIAO
       WHERE ${where}
       ORDER BY r.NOME ASC
       LIMIT ${limit} OFFSET ${offset}`, params
    );

    const [tipos]   = await pool.execute<RowDataPacket[]>(`SELECT DISTINCT TIPO FROM TABELA_RESTAURANTES WHERE TIPO IS NOT NULL ORDER BY TIPO`);
    const [estados] = await pool.execute<RowDataPacket[]>(
      `SELECT DISTINCT re.ESTADO FROM TABELA_REGIOES re JOIN TABELA_RESTAURANTES r ON r.ID_REGIAO = re.ID_REGIAO ORDER BY re.ESTADO`
    );

    return NextResponse.json({
      restaurantes,
      paginacao: { total, page, limit, totalPaginas: Math.ceil(total / limit) },
      filtros:   { tipos: tipos.map(t => t.TIPO), estados: estados.map(e => e.ESTADO) },
    });
  } catch (error) {
    console.error('[API RESTAURANTES ERROR]', error);
    return NextResponse.json({ error: 'Erro ao buscar restaurantes.' }, { status: 500 });
  }
}