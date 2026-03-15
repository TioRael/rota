// app/api/dashboard/turista/route.ts
// Retorna todos os dados necessários para o painel do turista:
//  - Próximas reservas (acomodações + rotas)
//  - Histórico de avaliações
// Protegido: exige sessão ativa de TURISTA.

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { RowDataPacket } from 'mysql2';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

// ─── Tipos das queries ────────────────────────────────────────

interface ReservaAcomodacaoRow extends RowDataPacket {
  ID_RESERVA:    number;
  NOME_HOTEL:    string;
  DATA_CHECKIN:  string;
  DATA_CHECKOUT: string;
  QTD_HOSPEDES:  number;
  STATUS:        string;
  VALOR_TOTAL:   number;
}

interface ReservaRotaRow extends RowDataPacket {
  ID_RESERVA_ROTA: number;
  NOME_ROTA:       string;
  DATA_PASSEIO:    string;
  QTD_PESSOAS:     number;
  STATUS:          string;
  VALOR_TOTAL:     number;
  CATEGORIA:       string | null;
}

interface AvaliacaoRow extends RowDataPacket {
  ID_AVALIACAO:  number;
  NOTA:          number;
  COMENTARIO:    string | null;
  DATA_AVALIACAO:string;
  ALVO:          string; // nome da rota ou acomodação
  TIPO:          'ROTA' | 'ACOMODACAO';
}

// ─── GET /api/dashboard/turista ───────────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.tipo === 'EMPRESA') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const idUsuario = Number(session.user.id);

  try {
    // ── Reservas de acomodação ─────────────────────────────────
    const [reservasAcomodacao] = await pool.execute<ReservaAcomodacaoRow[]>(
      `SELECT
         ra.ID_RESERVA,
         a.NOME        AS NOME_HOTEL,
         ra.DATA_CHECKIN,
         ra.DATA_CHECKOUT,
         ra.QTD_HOSPEDES,
         ra.STATUS,
         ra.VALOR_TOTAL
       FROM TABELA_RESERVAS_ACOMODACAO ra
       JOIN TABELA_ACOMODACOES a ON ra.ID_ACOMODACAO = a.ID_ACOMODACAO
       WHERE ra.ID_USUARIO = ?
       ORDER BY ra.DATA_CHECKIN DESC
       LIMIT 10`,
      [idUsuario]
    );

    // ── Reservas de rotas ──────────────────────────────────────
    const [reservasRotas] = await pool.execute<ReservaRotaRow[]>(
      `SELECT
         rr.ID_RESERVA_ROTA,
         r.NOME       AS NOME_ROTA,
         rr.DATA_PASSEIO,
         rr.QTD_PESSOAS,
         rr.STATUS,
         rr.VALOR_TOTAL,
         r.CATEGORIA
       FROM TABELA_RESERVAS_ROTAS rr
       JOIN TABELA_ROTAS r ON rr.ID_ROTA = r.ID_ROTA
       WHERE rr.ID_USUARIO = ?
       ORDER BY rr.DATA_PASSEIO DESC
       LIMIT 10`,
      [idUsuario]
    );

    // ── Histórico de avaliações ────────────────────────────────
    const [avaliacoes] = await pool.execute<AvaliacaoRow[]>(
      `SELECT
         av.ID_AVALIACAO,
         av.NOTA,
         av.COMENTARIO,
         av.DATA_AVALIACAO,
         COALESCE(r.NOME, a.NOME) AS ALVO,
         CASE WHEN av.ID_ROTA IS NOT NULL THEN 'ROTA' ELSE 'ACOMODACAO' END AS TIPO
       FROM TABELA_AVALIACOES av
       LEFT JOIN TABELA_ROTAS r       ON av.ID_ROTA       = r.ID_ROTA
       LEFT JOIN TABELA_ACOMODACOES a ON av.ID_ACOMODACAO = a.ID_ACOMODACAO
       WHERE av.ID_USUARIO = ?
       ORDER BY av.DATA_AVALIACAO DESC
       LIMIT 5`,
      [idUsuario]
    );

    return NextResponse.json({
      reservasAcomodacao,
      reservasRotas,
      avaliacoes,
    });

  } catch (error) {
    console.error('[DASHBOARD TURISTA ERROR]', error);
    return NextResponse.json({ error: 'Erro ao carregar dados.' }, { status: 500 });
  }
}