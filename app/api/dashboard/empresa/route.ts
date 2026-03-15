// app/api/dashboard/empresa/route.ts
// Retorna dados para o painel da empresa:
//  - Estatísticas (total reservas, avaliação média, total rotas, total guias)
//  - Rotas cadastradas
//  - Guias cadastrados
//  - Reservas recebidas recentes
// Protegido: exige sessão de EMPRESA ou ADMIN.

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { RowDataPacket } from 'mysql2';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

// ─── Tipos das queries ────────────────────────────────────────

interface EmpresaRow extends RowDataPacket {
  ID_EMPRESA:   number;
  RAZAO_SOCIAL: string;
  CNPJ:         string;
}

interface StatsRow extends RowDataPacket {
  TOTAL_ROTAS:    number;
  TOTAL_GUIAS:    number;
  TOTAL_RESERVAS: number;
  MEDIA_AVALIACAO:number | null;
}

interface RotaRow extends RowDataPacket {
  ID_ROTA:    number;
  NOME:       string;
  CATEGORIA:  string | null;
  DURACAO:    string | null;
  DATA_CADASTRO: string;
  TOTAL_RESERVAS: number;
}

interface GuiaRow extends RowDataPacket {
  ID_GUIA: number;
  NOME:    string;
  IDIOMAS: string | null;
  CPF:     string;
}

interface ReservaEmpresaRow extends RowDataPacket {
  ID_RESERVA_ROTA: number;
  NOME_ROTA:       string;
  NOME_TURISTA:    string;
  DATA_PASSEIO:    string;
  QTD_PESSOAS:     number;
  STATUS:          string;
  VALOR_TOTAL:     number;
}

// ─── GET /api/dashboard/empresa ───────────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.tipo === 'TURISTA') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const idUsuario = Number(session.user.id);

  try {
    // ── Busca a empresa vinculada ao usuário ───────────────────
    const [empresaRows] = await pool.execute<EmpresaRow[]>(
      `SELECT ID_EMPRESA, RAZAO_SOCIAL, CNPJ
       FROM TABELA_EMPRESAS_TURISMO
       WHERE ID_USUARIO = ?
       LIMIT 1`,
      [idUsuario]
    );

    if (empresaRows.length === 0) {
      return NextResponse.json({ error: 'Empresa não encontrada.' }, { status: 404 });
    }

    const empresa = empresaRows[0];
    const idEmpresa = empresa.ID_EMPRESA;

    // ── Estatísticas agregadas ─────────────────────────────────
    const [statsRows] = await pool.execute<StatsRow[]>(
      `SELECT
         (SELECT COUNT(*) FROM TABELA_ROTAS       WHERE ID_EMPRESA = ?)  AS TOTAL_ROTAS,
         (SELECT COUNT(*) FROM TABELA_GUIAS        WHERE ID_EMPRESA = ?)  AS TOTAL_GUIAS,
         (SELECT COUNT(*) FROM TABELA_RESERVAS_ROTAS rr
            JOIN TABELA_ROTAS r ON rr.ID_ROTA = r.ID_ROTA
            WHERE r.ID_EMPRESA = ?)                                        AS TOTAL_RESERVAS,
         (SELECT ROUND(AVG(av.NOTA), 1)
            FROM TABELA_AVALIACOES av
            JOIN TABELA_ROTAS r ON av.ID_ROTA = r.ID_ROTA
            WHERE r.ID_EMPRESA = ?)                                        AS MEDIA_AVALIACAO`,
      [idEmpresa, idEmpresa, idEmpresa, idEmpresa]
    );

    // ── Rotas da empresa com contagem de reservas ──────────────
    const [rotas] = await pool.execute<RotaRow[]>(
      `SELECT
         r.ID_ROTA,
         r.NOME,
         r.CATEGORIA,
         r.DURACAO,
         r.DATA_CADASTRO,
         COUNT(rr.ID_RESERVA_ROTA) AS TOTAL_RESERVAS
       FROM TABELA_ROTAS r
       LEFT JOIN TABELA_RESERVAS_ROTAS rr ON r.ID_ROTA = rr.ID_ROTA
       WHERE r.ID_EMPRESA = ?
       GROUP BY r.ID_ROTA
       ORDER BY r.DATA_CADASTRO DESC`,
      [idEmpresa]
    );

    // ── Guias da empresa ───────────────────────────────────────
    const [guias] = await pool.execute<GuiaRow[]>(
      `SELECT ID_GUIA, NOME, IDIOMAS, CPF
       FROM TABELA_GUIAS
       WHERE ID_EMPRESA = ?
       ORDER BY NOME ASC`,
      [idEmpresa]
    );

    // ── Reservas recentes recebidas ────────────────────────────
    const [reservas] = await pool.execute<ReservaEmpresaRow[]>(
      `SELECT
         rr.ID_RESERVA_ROTA,
         r.NOME           AS NOME_ROTA,
         u.NOME           AS NOME_TURISTA,
         rr.DATA_PASSEIO,
         rr.QTD_PESSOAS,
         rr.STATUS,
         rr.VALOR_TOTAL
       FROM TABELA_RESERVAS_ROTAS rr
       JOIN TABELA_ROTAS r    ON rr.ID_ROTA    = r.ID_ROTA
       JOIN TABELA_USUARIOS u ON rr.ID_USUARIO = u.ID_USUARIO
       WHERE r.ID_EMPRESA = ?
       ORDER BY rr.DATA_RESERVA DESC
       LIMIT 15`,
      [idEmpresa]
    );

    return NextResponse.json({
      empresa,
      stats: statsRows[0],
      rotas,
      guias,
      reservas,
    });

  } catch (error) {
    console.error('[DASHBOARD EMPRESA ERROR]', error);
    return NextResponse.json({ error: 'Erro ao carregar dados.' }, { status: 500 });
  }
}