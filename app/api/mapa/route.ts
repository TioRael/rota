// app/api/mapa/route.ts
// GET /api/mapa — retorna os estados que tem rotas e a contagem
// Usado pelo MapaBrasil para colorir estados com dados reais

import { NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';

interface EstadoRow extends RowDataPacket {
  ESTADO:       string;
  TOTAL_ROTAS:  number;
  PRECO_MIN:    number | null;
}
interface RotaEstadoRow extends RowDataPacket {
  ID_ROTA:         number;
  NOME:            string;
  CIDADE:          string;
  ESTADO:          string;
  DURACAO:         string | null;
  CATEGORIA:       string | null;
  MEDIA_AVALIACAO: number | null;
  PRECO_MIN:       number | null;
}

export async function GET() {
  try {
    // Estados com contagem de rotas
    const [estados] = await pool.execute<EstadoRow[]>(
      `SELECT re.ESTADO, COUNT(r.ID_ROTA) AS TOTAL_ROTAS, MIN(s.VALOR) AS PRECO_MIN
       FROM TABELA_REGIOES re
       JOIN TABELA_ROTAS r     ON r.ID_REGIAO  = re.ID_REGIAO
       LEFT JOIN TABELA_SERVICOS s ON s.ID_ROTA = r.ID_ROTA
       GROUP BY re.ESTADO
       ORDER BY re.ESTADO`, []
    );

    // Rotas por estado (para o painel lateral)
    const [rotas] = await pool.execute<RotaEstadoRow[]>(
      `SELECT
         r.ID_ROTA, r.NOME, r.DURACAO, r.CATEGORIA,
         re.CIDADE, re.ESTADO,
         ROUND(AVG(av.NOTA), 1) AS MEDIA_AVALIACAO,
         MIN(s.VALOR)           AS PRECO_MIN
       FROM TABELA_ROTAS r
       JOIN TABELA_REGIOES re          ON r.ID_REGIAO = re.ID_REGIAO
       LEFT JOIN TABELA_AVALIACOES av  ON av.ID_ROTA  = r.ID_ROTA
       LEFT JOIN TABELA_SERVICOS s     ON s.ID_ROTA   = r.ID_ROTA
       GROUP BY r.ID_ROTA
       ORDER BY MEDIA_AVALIACAO DESC`, []
    );

    // Agrupa rotas por estado
    const rotasPorEstado: Record<string, RotaEstadoRow[]> = {};
    rotas.forEach(r => {
      if (!rotasPorEstado[r.ESTADO]) rotasPorEstado[r.ESTADO] = [];
      rotasPorEstado[r.ESTADO].push(r);
    });

    return NextResponse.json({ estados, rotasPorEstado });
  } catch (error) {
    console.error('[API MAPA ERROR]', error);
    return NextResponse.json({ error: 'Erro ao buscar dados do mapa.' }, { status: 500 });
  }
}