// app/api/rotas/[id]/route.ts
// CORRIGIDO: params é Promise no Next.js 16 — usar await params

import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';

interface RotaDetalheRow extends RowDataPacket {
  ID_ROTA: number; NOME: string; DESCRICAO: string | null;
  DURACAO: string | null; QUILOMETRAGEM: number | null;
  MELHOR_PERIODO: string | null; CATEGORIA: string | null;
  URL_IMAGEM_CAPA: string | null; DATA_CADASTRO: string;
  CIDADE: string; ESTADO: string; PAIS: string;
  ID_EMPRESA: number; RAZAO_SOCIAL: string;
  MEDIA_AVALIACAO: number | null; TOTAL_AVALIACOES: number;
}
interface PontoRow extends RowDataPacket {
  ID_PONTO: number; NOME: string; DESCRICAO: string | null;
  URL_IMAGEM: string | null; ORDEM_VISITA: number;
}
interface GuiaRow extends RowDataPacket {
  ID_GUIA: number; NOME: string; IDIOMAS: string | null;
}
interface ServicoRow extends RowDataPacket {
  ID_SERVICO: number; TIPO: string; DESCRICAO: string | null; VALOR: number;
}
interface AvaliacaoRow extends RowDataPacket {
  ID_AVALIACAO: number; NOTA: number; COMENTARIO: string | null;
  DATA_AVALIACAO: string; NOME_USUARIO: string;
}

export async function GET(
  _req: NextRequest,
  // Next.js 16: params é uma Promise — deve ser tipado como tal
  { params }: { params: Promise<{ id: string }> }
) {
  // await obrigatório no Next.js 16+
  const { id: idParam } = await params;
  const id = Number(idParam);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
  }

  try {
    const [rotaRows] = await pool.execute<RotaDetalheRow[]>(
      `SELECT
         r.*,
         re.CIDADE, re.ESTADO, re.PAIS,
         et.ID_EMPRESA, et.RAZAO_SOCIAL,
         ROUND(AVG(av.NOTA), 1)          AS MEDIA_AVALIACAO,
         COUNT(DISTINCT av.ID_AVALIACAO) AS TOTAL_AVALIACOES
       FROM TABELA_ROTAS r
       JOIN TABELA_REGIOES re           ON r.ID_REGIAO  = re.ID_REGIAO
       JOIN TABELA_EMPRESAS_TURISMO et  ON r.ID_EMPRESA = et.ID_EMPRESA
       LEFT JOIN TABELA_AVALIACOES av   ON av.ID_ROTA   = r.ID_ROTA
       WHERE r.ID_ROTA = ${id}
       GROUP BY r.ID_ROTA`,
      []
    );

    if (rotaRows.length === 0) {
      return NextResponse.json({ error: 'Rota não encontrada.' }, { status: 404 });
    }

    const rota = rotaRows[0];

    const [pontos] = await pool.execute<PontoRow[]>(
      `SELECT p.ID_PONTO, p.NOME, p.DESCRICAO, p.URL_IMAGEM, rp.ORDEM_VISITA
       FROM TABELA_ROTA_PONTOS rp
       JOIN TABELA_PONTOS p ON rp.ID_PONTO = p.ID_PONTO
       WHERE rp.ID_ROTA = ${id}
       ORDER BY rp.ORDEM_VISITA ASC`,
      []
    );

    const [guias] = await pool.execute<GuiaRow[]>(
      `SELECT ID_GUIA, NOME, IDIOMAS
       FROM TABELA_GUIAS
       WHERE ID_EMPRESA = ${rota.ID_EMPRESA}
       ORDER BY NOME ASC`,
      []
    );

    const [servicos] = await pool.execute<ServicoRow[]>(
      `SELECT ID_SERVICO, TIPO, DESCRICAO, VALOR
       FROM TABELA_SERVICOS
       WHERE ID_ROTA = ${id}
       ORDER BY VALOR ASC`,
      []
    );

    const [avaliacoes] = await pool.execute<AvaliacaoRow[]>(
      `SELECT
         av.ID_AVALIACAO, av.NOTA, av.COMENTARIO, av.DATA_AVALIACAO,
         u.NOME AS NOME_USUARIO
       FROM TABELA_AVALIACOES av
       JOIN TABELA_USUARIOS u ON av.ID_USUARIO = u.ID_USUARIO
       WHERE av.ID_ROTA = ${id}
       ORDER BY av.DATA_AVALIACAO DESC
       LIMIT 10`,
      []
    );

    return NextResponse.json({ rota, pontos, guias, servicos, avaliacoes });

  } catch (error) {
    console.error('[API ROTA DETALHE ERROR]', error);
    return NextResponse.json({ error: 'Erro ao buscar rota.' }, { status: 500 });
  }
}