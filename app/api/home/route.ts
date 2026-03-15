// app/api/home/route.ts
// GET /api/home — dados reais para a pagina inicial:
// rotas em destaque (com imagem), stats do banco

import { NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';

interface RotaRow extends RowDataPacket {
  ID_ROTA: number; NOME: string; DESCRICAO: string | null;
  DURACAO: string | null; CATEGORIA: string | null;
  URL_IMAGEM_CAPA: string | null; CIDADE: string; ESTADO: string;
  RAZAO_SOCIAL: string; MEDIA_AVALIACAO: number | null;
  TOTAL_AVALIACOES: number; PRECO_MIN: number | null;
}
interface StatsRow extends RowDataPacket {
  TOTAL_ROTAS: number; TOTAL_CIDADES: number;
  TOTAL_HOTEIS: number; MEDIA_GERAL: number | null;
}

export async function GET() {
  try {
    const [rotasDestaque] = await pool.execute<RotaRow[]>(
      `SELECT
         r.ID_ROTA, r.NOME, r.DESCRICAO, r.DURACAO, r.CATEGORIA, r.URL_IMAGEM_CAPA,
         re.CIDADE, re.ESTADO, et.RAZAO_SOCIAL,
         ROUND(AVG(av.NOTA), 1)          AS MEDIA_AVALIACAO,
         COUNT(DISTINCT av.ID_AVALIACAO) AS TOTAL_AVALIACOES,
         MIN(s.VALOR)                    AS PRECO_MIN
       FROM TABELA_ROTAS r
       JOIN TABELA_REGIOES re           ON r.ID_REGIAO  = re.ID_REGIAO
       JOIN TABELA_EMPRESAS_TURISMO et  ON r.ID_EMPRESA = et.ID_EMPRESA
       LEFT JOIN TABELA_AVALIACOES av   ON av.ID_ROTA   = r.ID_ROTA
       LEFT JOIN TABELA_SERVICOS s      ON s.ID_ROTA    = r.ID_ROTA
       GROUP BY r.ID_ROTA
       ORDER BY MEDIA_AVALIACAO DESC, r.DATA_CADASTRO DESC
       LIMIT 6`, []
    );

    const [statsRows] = await pool.execute<StatsRow[]>(
      `SELECT
         (SELECT COUNT(*) FROM TABELA_ROTAS)                       AS TOTAL_ROTAS,
         (SELECT COUNT(DISTINCT ID_REGIAO) FROM TABELA_ROTAS)      AS TOTAL_CIDADES,
         (SELECT COUNT(*) FROM TABELA_ACOMODACOES)                 AS TOTAL_HOTEIS,
         (SELECT ROUND(AVG(NOTA),1) FROM TABELA_AVALIACOES)        AS MEDIA_GERAL`, []
    );

    return NextResponse.json({ rotasDestaque, stats: statsRows[0] });
  } catch (error) {
    console.error('[API HOME ERROR]', error);
    return NextResponse.json({ error: 'Erro.' }, { status: 500 });
  }
}