// app/api/hoteis/[id]/reservar/route.ts
// CORRIGIDO: sem 'any' — usa RowDataPacket para tipagem da query de preco

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

// Tipo da linha retornada pela query de preco da acomodacao
interface AcomodacaoPrecoRow extends RowDataPacket {
  PRECO_MEDIO_DIARIA: number | null;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session)                        return NextResponse.json({ error: 'Faca login para reservar.' }, { status: 401 });
  if (session.user.tipo === 'EMPRESA') return NextResponse.json({ error: 'Empresas nao podem fazer reservas.' }, { status: 403 });

  const { id: idParam } = await params;
  const idAcomodacao = Number(idParam);
  if (isNaN(idAcomodacao)) return NextResponse.json({ error: 'ID invalido.' }, { status: 400 });

  const { dataCheckin, dataCheckout, qtdHospedes } = await req.json();
  if (!dataCheckin || !dataCheckout)   return NextResponse.json({ error: 'Datas obrigatorias.' }, { status: 400 });
  if (new Date(dataCheckin) >= new Date(dataCheckout)) return NextResponse.json({ error: 'Checkout deve ser apos o checkin.' }, { status: 400 });
  if (!qtdHospedes || qtdHospedes < 1) return NextResponse.json({ error: 'Quantidade invalida.' }, { status: 400 });

  try {
    // Busca preco com tipagem correta via RowDataPacket — sem 'any'
    const [acRows] = await pool.execute<AcomodacaoPrecoRow[]>(
      `SELECT PRECO_MEDIO_DIARIA FROM TABELA_ACOMODACOES WHERE ID_ACOMODACAO = ${idAcomodacao}`,
      []
    );

    const noites = Math.ceil(
      (new Date(dataCheckout).getTime() - new Date(dataCheckin).getTime()) / 86400000
    );
    const preco      = acRows[0]?.PRECO_MEDIO_DIARIA ?? 0;
    const valorTotal = preco * noites;

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO TABELA_RESERVAS_ACOMODACAO
         (ID_USUARIO, ID_ACOMODACAO, DATA_CHECKIN, DATA_CHECKOUT, QTD_HOSPEDES, STATUS, VALOR_TOTAL)
       VALUES (?, ?, ?, ?, ?, 'PENDENTE', ?)`,
      [Number(session.user.id), idAcomodacao, dataCheckin, dataCheckout, qtdHospedes, valorTotal]
    );

    return NextResponse.json(
      { message: 'Reserva criada!', idReserva: result.insertId, valorTotal },
      { status: 201 }
    );
  } catch (error) {
    console.error('[RESERVAR HOTEL ERROR]', error);
    return NextResponse.json({ error: 'Erro ao criar reserva.' }, { status: 500 });
  }
}