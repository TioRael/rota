// app/api/restaurantes/[id]/route.ts — detalhe de um restaurante
import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';

interface RestauranteDetalheRow extends RowDataPacket {
  ID_RESTAURANTE: number; NOME: string; TIPO: string | null;
  CARACTERISTICAS: string | null; PRECO_MEDIO: number | null;
  URL_IMAGEM_CAPA: string | null; CIDADE: string; ESTADO: string; PAIS: string;
  ID_REGIAO: number;
}
interface RotaProximaRow extends RowDataPacket {
  ID_ROTA: number; NOME: string; CATEGORIA: string | null; DURACAO: string | null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (isNaN(id)) return NextResponse.json({ error: 'ID invalido.' }, { status: 400 });

  try {
    const [rows] = await pool.execute<RestauranteDetalheRow[]>(
      `SELECT r.*, re.CIDADE, re.ESTADO, re.PAIS, re.ID_REGIAO
       FROM TABELA_RESTAURANTES r
       JOIN TABELA_REGIOES re ON r.ID_REGIAO = re.ID_REGIAO
       WHERE r.ID_RESTAURANTE = ${id}`, []
    );
    if (rows.length === 0) return NextResponse.json({ error: 'Nao encontrado.' }, { status: 404 });

    const restaurante = rows[0];

    // Rotas na mesma regiao
    const [rotas] = await pool.execute<RotaProximaRow[]>(
      `SELECT ID_ROTA, NOME, CATEGORIA, DURACAO FROM TABELA_ROTAS
       WHERE ID_REGIAO = ${restaurante.ID_REGIAO} LIMIT 4`, []
    );

    return NextResponse.json({ restaurante, rotas });
  } catch (error) {
    console.error('[API RESTAURANTE DETALHE ERROR]', error);
    return NextResponse.json({ error: 'Erro ao buscar restaurante.' }, { status: 500 });
  }
}