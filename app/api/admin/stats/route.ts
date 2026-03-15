// app/api/admin/stats/route.ts — estatisticas gerais (so ADMIN)
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { RowDataPacket } from 'mysql2';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

interface StatsRow extends RowDataPacket {
  TOTAL_USUARIOS: number; TOTAL_TURISTAS: number; TOTAL_EMPRESAS: number;
  TOTAL_ROTAS: number; TOTAL_HOTEIS: number; TOTAL_RESTAURANTES: number;
  TOTAL_RESERVAS_ROTAS: number; TOTAL_RESERVAS_HOTEIS: number;
  RECEITA_ROTAS: number|null; RECEITA_HOTEIS: number|null;
  TOTAL_AVALIACOES: number; MEDIA_AVALIACOES: number|null;
}
interface CrescRow extends RowDataPacket { MES: string; NOVOS_USUARIOS: number; }

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.tipo !== 'ADMIN') return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
  try {
    const [statsRows] = await pool.execute<StatsRow[]>(
      `SELECT
         (SELECT COUNT(*) FROM TABELA_USUARIOS) AS TOTAL_USUARIOS,
         (SELECT COUNT(*) FROM TABELA_USUARIOS WHERE TIPO='TURISTA') AS TOTAL_TURISTAS,
         (SELECT COUNT(*) FROM TABELA_USUARIOS WHERE TIPO='EMPRESA') AS TOTAL_EMPRESAS,
         (SELECT COUNT(*) FROM TABELA_ROTAS) AS TOTAL_ROTAS,
         (SELECT COUNT(*) FROM TABELA_ACOMODACOES) AS TOTAL_HOTEIS,
         (SELECT COUNT(*) FROM TABELA_RESTAURANTES) AS TOTAL_RESTAURANTES,
         (SELECT COUNT(*) FROM TABELA_RESERVAS_ROTAS) AS TOTAL_RESERVAS_ROTAS,
         (SELECT COUNT(*) FROM TABELA_RESERVAS_ACOMODACAO) AS TOTAL_RESERVAS_HOTEIS,
         (SELECT SUM(VALOR_TOTAL) FROM TABELA_RESERVAS_ROTAS WHERE STATUS!='CANCELADA') AS RECEITA_ROTAS,
         (SELECT SUM(VALOR_TOTAL) FROM TABELA_RESERVAS_ACOMODACAO WHERE STATUS!='CANCELADA') AS RECEITA_HOTEIS,
         (SELECT COUNT(*) FROM TABELA_AVALIACOES) AS TOTAL_AVALIACOES,
         (SELECT ROUND(AVG(NOTA),1) FROM TABELA_AVALIACOES) AS MEDIA_AVALIACOES`, []
    );
    const [crescimento] = await pool.execute<CrescRow[]>(
      `SELECT DATE_FORMAT(DATA_CADASTRO,'%Y-%m') AS MES, COUNT(*) AS NOVOS_USUARIOS
       FROM TABELA_USUARIOS
       WHERE DATA_CADASTRO >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(DATA_CADASTRO,'%Y-%m') ORDER BY MES ASC`, []
    );
    return NextResponse.json({ stats: statsRows[0], crescimento });
  } catch (error) {
    console.error('[ADMIN STATS ERROR]', error);
    return NextResponse.json({ error: 'Erro.' }, { status: 500 });
  }
}