// app/api/hoteis/[id]/avaliar/route.ts — POST avaliacao de acomodacao
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

interface ExistenteRow extends RowDataPacket { ID_AVALIACAO: number; }

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session)                         return NextResponse.json({ error: 'Faca login para avaliar.' }, { status: 401 });
  if (session.user.tipo !== 'TURISTA')  return NextResponse.json({ error: 'Apenas turistas podem avaliar.' }, { status: 403 });

  const { id: idParam } = await params;
  const idAcomodacao = Number(idParam);
  const { nota, comentario } = await req.json();
  if (!nota || nota < 1 || nota > 5) return NextResponse.json({ error: 'Nota entre 1 e 5.' }, { status: 400 });

  const [existing] = await pool.execute<ExistenteRow[]>(
    `SELECT ID_AVALIACAO FROM TABELA_AVALIACOES WHERE ID_USUARIO = ? AND ID_ACOMODACAO = ${idAcomodacao} LIMIT 1`,
    [Number(session.user.id)]
  );
  if (existing.length > 0) return NextResponse.json({ error: 'Voce ja avaliou esta acomodacao.' }, { status: 409 });

  await pool.execute<ResultSetHeader>(
    `INSERT INTO TABELA_AVALIACOES (ID_USUARIO, ID_ACOMODACAO, NOTA, COMENTARIO) VALUES (?, ${idAcomodacao}, ?, ?)`,
    [Number(session.user.id), nota, comentario?.trim() || null]
  );
  return NextResponse.json({ message: 'Avaliacao enviada!' }, { status: 201 });
}