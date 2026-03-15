// app/api/rotas/[id]/reservar/route.ts
// CORRIGIDO: params é Promise no Next.js 16

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

interface ServicoRow extends RowDataPacket { VALOR: number; }

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Faça login para reservar.' }, { status: 401 });
  }
  if (session.user.tipo === 'EMPRESA') {
    return NextResponse.json({ error: 'Empresas não podem fazer reservas.' }, { status: 403 });
  }

  const { id: idParam } = await params;
  const idRota = Number(idParam);
  if (isNaN(idRota)) return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });

  const { dataPasseio, qtdPessoas, idServico, idGuia } = await req.json();

  if (!dataPasseio) return NextResponse.json({ error: 'Data do passeio é obrigatória.' }, { status: 400 });
  if (!qtdPessoas || qtdPessoas < 1) return NextResponse.json({ error: 'Quantidade de pessoas inválida.' }, { status: 400 });

  if (new Date(dataPasseio) <= new Date()) {
    return NextResponse.json({ error: 'A data do passeio deve ser futura.' }, { status: 400 });
  }

  try {
    let valorTotal = 0;

    if (idServico) {
      const [servicoRows] = await pool.execute<ServicoRow[]>(
        `SELECT VALOR FROM TABELA_SERVICOS WHERE ID_SERVICO = ${Number(idServico)} AND ID_ROTA = ${idRota} LIMIT 1`,
        []
      );
      if (servicoRows.length === 0) {
        return NextResponse.json({ error: 'Serviço não encontrado.' }, { status: 404 });
      }
      valorTotal = servicoRows[0].VALOR * qtdPessoas;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO TABELA_RESERVAS_ROTAS
         (ID_USUARIO, ID_ROTA, ID_SERVICO, ID_GUIA, DATA_PASSEIO, QTD_PESSOAS, STATUS, VALOR_TOTAL)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDENTE', ?)`,
      [
        Number(session.user.id),
        idRota,
        idServico  || null,
        idGuia     || null,
        dataPasseio,
        qtdPessoas,
        valorTotal,
      ]
    );

    return NextResponse.json(
      { message: 'Reserva criada com sucesso!', idReserva: result.insertId },
      { status: 201 }
    );

  } catch (error) {
    console.error('[RESERVAR ROTA ERROR]', error);
    return NextResponse.json({ error: 'Erro ao criar reserva.' }, { status: 500 });
  }
}