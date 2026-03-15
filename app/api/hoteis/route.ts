// app/api/hoteis/route.ts
// GET /api/hoteis — listagem publica com filtros: q, tipo, estado, estrelas, page, limit

import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';

interface AcomodacaoRow extends RowDataPacket {
  ID_ACOMODACAO: number; NOME: string; TIPO: string;
  DESCRICAO: string | null; CLASSIFICACAO: number | null;
  PRECO_MEDIO_DIARIA: number | null; URL_IMAGEM_CAPA: string | null;
  CIDADE: string; ESTADO: string;
  MEDIA_AVALIACAO: number | null; TOTAL_AVALIACOES: number;
}
interface CountRow extends RowDataPacket { TOTAL: number; }

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q        = searchParams.get('q')?.trim()      ?? '';
  const tipo     = searchParams.get('tipo')?.trim()   ?? '';
  const estado   = searchParams.get('estado')?.trim() ?? '';
  const estrelas = Number(searchParams.get('estrelas') ?? 0);
  const page     = Math.max(1, Number(searchParams.get('page')  ?? 1));
  const limit    = Math.min(24, Math.max(1, Number(searchParams.get('limit') ?? 12)));
  const offset   = (page - 1) * limit;

  const conds: string[] = ['1=1'];
  const params: (string | number)[] = [];

  if (q)           { conds.push('a.NOME LIKE ?');          params.push(`%${q}%`); }
  if (tipo)        { conds.push('a.TIPO = ?');              params.push(tipo); }
  if (estado)      { conds.push('re.ESTADO = ?');           params.push(estado.toUpperCase()); }
  if (estrelas>=1) { conds.push('a.CLASSIFICACAO = ?');     params.push(estrelas); }

  const where = conds.join(' AND ');

  try {
    const [countRows] = await pool.execute<CountRow[]>(
      `SELECT COUNT(*) AS TOTAL
       FROM TABELA_ACOMODACOES a
       JOIN TABELA_REGIOES re ON a.ID_REGIAO = re.ID_REGIAO
       WHERE ${where}`, params
    );
    const total = countRows[0]?.TOTAL ?? 0;

    const [acomodacoes] = await pool.execute<AcomodacaoRow[]>(
      `SELECT a.ID_ACOMODACAO, a.NOME, a.TIPO, a.DESCRICAO,
              a.CLASSIFICACAO, a.PRECO_MEDIO_DIARIA, a.URL_IMAGEM_CAPA,
              re.CIDADE, re.ESTADO,
              ROUND(AVG(av.NOTA), 1)          AS MEDIA_AVALIACAO,
              COUNT(DISTINCT av.ID_AVALIACAO) AS TOTAL_AVALIACOES
       FROM TABELA_ACOMODACOES a
       JOIN TABELA_REGIOES re           ON a.ID_REGIAO      = re.ID_REGIAO
       LEFT JOIN TABELA_AVALIACOES av   ON av.ID_ACOMODACAO = a.ID_ACOMODACAO
       WHERE ${where}
       GROUP BY a.ID_ACOMODACAO
       ORDER BY a.CLASSIFICACAO DESC, a.PRECO_MEDIO_DIARIA ASC
       LIMIT ${limit} OFFSET ${offset}`, params
    );

    const [tipos]   = await pool.execute<RowDataPacket[]>(`SELECT DISTINCT TIPO FROM TABELA_ACOMODACOES ORDER BY TIPO`);
    const [estados] = await pool.execute<RowDataPacket[]>(
      `SELECT DISTINCT re.ESTADO FROM TABELA_REGIOES re
       JOIN TABELA_ACOMODACOES a ON a.ID_REGIAO = re.ID_REGIAO ORDER BY re.ESTADO`
    );

    return NextResponse.json({
      acomodacoes,
      paginacao: { total, page, limit, totalPaginas: Math.ceil(total / limit) },
      filtros:   { tipos: tipos.map(t => t.TIPO), estados: estados.map(e => e.ESTADO) },
    });
  } catch (error) {
    console.error('[API HOTEIS ERROR]', error);
    return NextResponse.json({ error: 'Erro ao buscar acomodacoes.' }, { status: 500 });
  }
}