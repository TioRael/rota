// app/api/rotas/[id]/avaliar/route.ts
// CORRIGIDO: params é Promise no Next.js 16

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

interface AvaliacaoExistenteRow extends RowDataPacket { ID_AVALIACAO: number; }

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) return NextResponse.json({ error: 'Faça login para avaliar.' }, { status: 401 });
  if (session.user.tipo !== 'TURISTA') return NextResponse.json({ error: 'Apenas turistas podem avaliar.' }, { status: 403 });

  const { id: idParam } = await params;
  const idRota = Number(idParam);
  if (isNaN(idRota)) return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });

  const { nota, comentario } = await req.json();

  if (!nota || nota < 1 || nota > 5) {
    return NextResponse.json({ error: 'Nota deve ser entre 1 e 5.' }, { status: 400 });
  }

  try {
    const [existing] = await pool.execute<AvaliacaoExistenteRow[]>(
      `SELECT ID_AVALIACAO FROM TABELA_AVALIACOES
       WHERE ID_USUARIO = ? AND ID_ROTA = ${idRota} LIMIT 1`,
      [Number(session.user.id)]
    );

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Você já avaliou esta rota.' }, { status: 409 });
    }

    await pool.execute<ResultSetHeader>(
      `INSERT INTO TABELA_AVALIACOES (ID_USUARIO, ID_ROTA, NOTA, COMENTARIO)
       VALUES (?, ${idRota}, ?, ?)`,
      [Number(session.user.id), nota, comentario?.trim() || null]
    );

    return NextResponse.json({ message: 'Avaliação enviada com sucesso!' }, { status: 201 });

  } catch (error) {
    console.error('[AVALIAR ROTA ERROR]', error);
    return NextResponse.json({ error: 'Erro ao enviar avaliação.' }, { status: 500 });
  }
}