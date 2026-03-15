// app/api/hoteis/[id]/route.ts — detalhe completo de uma acomodacao
import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';

interface AcomodacaoDetalheRow extends RowDataPacket {
  ID_ACOMODACAO: number; NOME: string; TIPO: string;
  DESCRICAO: string | null; CLASSIFICACAO: number | null;
  PRECO_MEDIO_DIARIA: number | null; URL_IMAGEM_CAPA: string | null;
  CIDADE: string; ESTADO: string; PAIS: string;
  MEDIA_AVALIACAO: number | null; TOTAL_AVALIACOES: number;
}
interface AvaliacaoRow extends RowDataPacket {
  ID_AVALIACAO: number; NOTA: number; COMENTARIO: string | null;
  DATA_AVALIACAO: string; NOME_USUARIO: string;
}
interface RestauranteRow extends RowDataPacket {
  ID_RESTAURANTE: number; NOME: string; TIPO: string | null; PRECO_MEDIO: number | null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (isNaN(id)) return NextResponse.json({ error: 'ID invalido.' }, { status: 400 });

  try {
    const [rows] = await pool.execute<AcomodacaoDetalheRow[]>(
      `SELECT a.*, re.CIDADE, re.ESTADO, re.PAIS,
              ROUND(AVG(av.NOTA), 1)          AS MEDIA_AVALIACAO,
              COUNT(DISTINCT av.ID_AVALIACAO) AS TOTAL_AVALIACOES
       FROM TABELA_ACOMODACOES a
       JOIN TABELA_REGIOES re           ON a.ID_REGIAO      = re.ID_REGIAO
       LEFT JOIN TABELA_AVALIACOES av   ON av.ID_ACOMODACAO = a.ID_ACOMODACAO
       WHERE a.ID_ACOMODACAO = ${id}
       GROUP BY a.ID_ACOMODACAO`, []
    );
    if (rows.length === 0) return NextResponse.json({ error: 'Nao encontrado.' }, { status: 404 });

    const acomodacao = rows[0];

    const [avaliacoes] = await pool.execute<AvaliacaoRow[]>(
      `SELECT av.ID_AVALIACAO, av.NOTA, av.COMENTARIO, av.DATA_AVALIACAO, u.NOME AS NOME_USUARIO
       FROM TABELA_AVALIACOES av
       JOIN TABELA_USUARIOS u ON av.ID_USUARIO = u.ID_USUARIO
       WHERE av.ID_ACOMODACAO = ${id}
       ORDER BY av.DATA_AVALIACAO DESC LIMIT 10`, []
    );

    // Restaurantes da mesma regiao
    const [restaurantes] = await pool.execute<RestauranteRow[]>(
      `SELECT ID_RESTAURANTE, NOME, TIPO, PRECO_MEDIO
       FROM TABELA_RESTAURANTES
       WHERE ID_REGIAO = ${acomodacao.ID_REGIAO ?? 0} LIMIT 5`, []
    );

    return NextResponse.json({ acomodacao, avaliacoes, restaurantes });
  } catch (error) {
    console.error('[API HOTEL DETALHE ERROR]', error);
    return NextResponse.json({ error: 'Erro ao buscar acomodacao.' }, { status: 500 });
  }
}