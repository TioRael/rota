// app/api/rotas/route.ts
// GET /api/rotas — listagem pública com busca e filtros.
// CORRIGIDO:
//  - LIMIT/OFFSET passados como inteiros explícitos (fix ER_WRONG_ARGUMENTS)
//  - Filtro de duração com parênteses corretos no WHERE (fix ER_BAD_FIELD_ERROR)
//  - Condições dinâmicas usando apenas parâmetros posicionais simples

import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';

interface RotaListaRow extends RowDataPacket {
  ID_ROTA:          number;
  NOME:             string;
  DESCRICAO:        string | null;
  DURACAO:          string | null;
  QUILOMETRAGEM:    number | null;
  MELHOR_PERIODO:   string | null;
  CATEGORIA:        string | null;
  URL_IMAGEM_CAPA:  string | null;
  DATA_CADASTRO:    string;
  CIDADE:           string;
  ESTADO:           string;
  RAZAO_SOCIAL:     string;
  MEDIA_AVALIACAO:  number | null;
  TOTAL_AVALIACOES: number;
  PRECO_MIN:        number | null;
}

interface CountRow extends RowDataPacket { TOTAL: number; }

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const q         = searchParams.get('q')?.trim()         ?? '';
  const categoria = searchParams.get('categoria')?.trim() ?? '';
  const estado    = searchParams.get('estado')?.trim()    ?? '';
  const duracao   = searchParams.get('duracao')?.trim()   ?? '';
  const page      = Math.max(1, Number(searchParams.get('page')  ?? 1));
  const limit     = Math.min(24, Math.max(1, Number(searchParams.get('limit') ?? 12)));
  const offset    = (page - 1) * limit;

  // ── Monta WHERE dinamicamente ──────────────────────────────
  // Importante: condições de duração usam LIKE com valor embutido
  // diretamente na string SQL (não como parâmetro posicional),
  // porque o mysql2 não interpreta corretamente LIKE com '?' em
  // certos contextos de GROUP BY + aggregate.
  const condicoes: string[] = ['1=1'];
  const params: (string | number)[] = [];

  if (q) {
    condicoes.push('r.NOME LIKE ?');
    params.push(`%${q}%`);
  }
  if (categoria) {
    condicoes.push('r.CATEGORIA = ?');
    params.push(categoria);
  }
  if (estado) {
    condicoes.push('re.ESTADO = ?');
    params.push(estado.toUpperCase());
  }

  // Duração: valores fixos embutidos diretamente (sem input do usuário,
  // portanto seguro contra SQL injection)
  if (duracao === 'curta') {
    condicoes.push("(r.DURACAO LIKE '%1 dia%' OR r.DURACAO LIKE '%2 dias%')");
  } else if (duracao === 'media') {
    condicoes.push("(r.DURACAO LIKE '%3 dias%' OR r.DURACAO LIKE '%4 dias%' OR r.DURACAO LIKE '%5 dias%')");
  } else if (duracao === 'longa') {
    condicoes.push("(r.DURACAO LIKE '%6 dias%' OR r.DURACAO LIKE '%7 dias%' OR r.DURACAO LIKE '%semana%')");
  }

  const where = condicoes.join(' AND ');

  try {
    // ── Contagem para paginação ────────────────────────────
    const [countRows] = await pool.execute<CountRow[]>(
      `SELECT COUNT(*) AS TOTAL
       FROM TABELA_ROTAS r
       JOIN TABELA_REGIOES re ON r.ID_REGIAO = re.ID_REGIAO
       WHERE ${where}`,
      params
    );
    const total = countRows[0]?.TOTAL ?? 0;

    // ── Busca principal ────────────────────────────────────
    // LIMIT e OFFSET são embutidos diretamente como inteiros
    // (valores calculados internamente, sem input do usuário —
    // portanto seguros). Isso evita o ER_WRONG_ARGUMENTS do mysql2
    // com prepared statements e GROUP BY + aggregate functions.
    const [rotas] = await pool.execute<RotaListaRow[]>(
      `SELECT
         r.ID_ROTA,
         r.NOME,
         r.DESCRICAO,
         r.DURACAO,
         r.QUILOMETRAGEM,
         r.MELHOR_PERIODO,
         r.CATEGORIA,
         r.URL_IMAGEM_CAPA,
         r.DATA_CADASTRO,
         re.CIDADE,
         re.ESTADO,
         et.RAZAO_SOCIAL,
         ROUND(AVG(av.NOTA), 1)          AS MEDIA_AVALIACAO,
         COUNT(DISTINCT av.ID_AVALIACAO) AS TOTAL_AVALIACOES,
         MIN(s.VALOR)                    AS PRECO_MIN
       FROM TABELA_ROTAS r
       JOIN TABELA_REGIOES re           ON r.ID_REGIAO  = re.ID_REGIAO
       JOIN TABELA_EMPRESAS_TURISMO et  ON r.ID_EMPRESA = et.ID_EMPRESA
       LEFT JOIN TABELA_AVALIACOES av   ON av.ID_ROTA   = r.ID_ROTA
       LEFT JOIN TABELA_SERVICOS s      ON s.ID_ROTA    = r.ID_ROTA
       WHERE ${where}
       GROUP BY r.ID_ROTA
       ORDER BY MEDIA_AVALIACAO DESC, r.DATA_CADASTRO DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    // ── Categorias para o filtro ───────────────────────────
    const [categorias] = await pool.execute<RowDataPacket[]>(
      `SELECT DISTINCT CATEGORIA
       FROM TABELA_ROTAS
       WHERE CATEGORIA IS NOT NULL
       ORDER BY CATEGORIA`
    );

    // ── Estados para o filtro ──────────────────────────────
    const [estados] = await pool.execute<RowDataPacket[]>(
      `SELECT DISTINCT re.ESTADO, re.CIDADE
       FROM TABELA_REGIOES re
       JOIN TABELA_ROTAS r ON r.ID_REGIAO = re.ID_REGIAO
       ORDER BY re.ESTADO`
    );

    return NextResponse.json({
      rotas,
      paginacao: {
        total,
        page,
        limit,
        totalPaginas: Math.ceil(total / limit),
      },
      filtros: {
        categorias: categorias.map(c => c.CATEGORIA),
        estados,
      },
    });

  } catch (error) {
    console.error('[API ROTAS ERROR]', error);
    return NextResponse.json({ error: 'Erro ao buscar rotas.' }, { status: 500 });
  }
}