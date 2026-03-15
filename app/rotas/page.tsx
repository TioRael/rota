'use client';
// app/rotas/page.tsx
// Listagem pública de rotas com busca em tempo real e filtros.

import { useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

// ─── Tipos ────────────────────────────────────────────────────
interface Rota {
  ID_ROTA:         number;
  NOME:            string;
  DESCRICAO:       string | null;
  DURACAO:         string | null;
  CATEGORIA:       string | null;
  URL_IMAGEM_CAPA: string | null;
  CIDADE:          string;
  ESTADO:          string;
  RAZAO_SOCIAL:    string;
  MEDIA_AVALIACAO: number | null;
  TOTAL_AVALIACOES:number;
  PRECO_MIN:       number | null;
}

interface Paginacao { total: number; page: number; limit: number; totalPaginas: number; }
interface Filtros   { categorias: string[]; estados: { ESTADO: string; CIDADE: string }[]; }

// ─── Emoji por categoria ──────────────────────────────────────
const EMOJI_CATEGORIA: Record<string, string> = {
  'Praias':      '🏖️',
  'Natureza':    '🌿',
  'Cultural':    '🏛️',
  'Aventura':    '🏔️',
  'Gastronomia': '🍽️',
  'Urbano':      '🌆',
};

function emojiCategoria(cat: string | null) {
  if (!cat) return '🗺️';
  return EMOJI_CATEGORIA[cat] ?? '🗺️';
}

// ─── Card de rota ─────────────────────────────────────────────
function CardRota({ rota }: { rota: Rota }) {
  return (
    <Link href={`/rotas/${rota.ID_ROTA}`} className="rota-card">
      {/* Imagem / placeholder */}
      <div className="rota-card-img">
        {rota.URL_IMAGEM_CAPA ? (
          <Image
            src={rota.URL_IMAGEM_CAPA}
            alt={rota.NOME}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 600px) 100vw, 33vw"
            priority
          />
        ) : (
          <span className="rota-card-emoji">{emojiCategoria(rota.CATEGORIA)}</span>
        )}
        {rota.CATEGORIA && (
          <span className="badge badge-verde rota-card-badge">{rota.CATEGORIA}</span>
        )}
      </div>

      {/* Corpo */}
      <div className="rota-card-corpo">
        <div className="rota-card-header">
          <h3 className="rota-card-titulo">{rota.NOME}</h3>
          {rota.PRECO_MIN ? (
            <div className="rota-card-preco-bloco">
              <p className="rota-card-preco">
                {rota.PRECO_MIN.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              <p className="rota-card-preco-label">por pessoa</p>
            </div>
          ) : null}
        </div>

        <p className="rota-card-local">📍 {rota.CIDADE}, {rota.ESTADO}</p>

        {rota.DESCRICAO && (
          <p className="rota-card-desc">{rota.DESCRICAO.slice(0, 100)}{rota.DESCRICAO.length > 100 ? '…' : ''}</p>
        )}

        <div className="rota-card-footer">
          <div className="rota-card-meta">
            {rota.DURACAO  && <span>⏱ {rota.DURACAO}</span>}
            {rota.MEDIA_AVALIACAO ? (
              <span>⭐ {rota.MEDIA_AVALIACAO} <span className="meta-count">({rota.TOTAL_AVALIACOES})</span></span>
            ) : <span style={{ color: 'var(--texto-suave)', fontSize: '0.78rem' }}>Sem avaliações</span>}
          </div>
          <span className="rota-card-empresa">{rota.RAZAO_SOCIAL}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="rota-card rota-card-skeleton">
      <div className="rota-card-img rota-skeleton" />
      <div className="rota-card-corpo" style={{ gap: '0.75rem' }}>
        <div className="rota-skeleton" style={{ height: '20px', width: '70%' }} />
        <div className="rota-skeleton" style={{ height: '14px', width: '45%' }} />
        <div className="rota-skeleton" style={{ height: '14px', width: '90%' }} />
        <div className="rota-skeleton" style={{ height: '14px', width: '60%' }} />
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────
export default function RotasPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const pathname     = usePathname();
  const [, startTransition] = useTransition();

  const [rotas,      setRotas]      = useState<Rota[]>([]);
  const [paginacao,  setPaginacao]  = useState<Paginacao | null>(null);
  const [filtros,    setFiltros]    = useState<Filtros>({ categorias: [], estados: [] });
  const [carregando, setCarregando] = useState(true);

  // Estado dos filtros sincronizado com a URL
  const [busca,      setBusca]      = useState(searchParams.get('q')         ?? '');
  const [categoria,  setCategoria]  = useState(searchParams.get('categoria') ?? '');
  const [estado,     setEstado]     = useState(searchParams.get('estado')    ?? '');
  const [duracao,    setDuracao]    = useState(searchParams.get('duracao')   ?? '');
  const [page,       setPage]       = useState(Number(searchParams.get('page') ?? 1));

  // ── Atualiza URL com os filtros ativos ──────────────────────
  const atualizarURL = useCallback((novosFiltros: Record<string, string>) => {
    const params = new URLSearchParams();
    if (novosFiltros.q)         params.set('q',         novosFiltros.q);
    if (novosFiltros.categoria) params.set('categoria', novosFiltros.categoria);
    if (novosFiltros.estado)    params.set('estado',    novosFiltros.estado);
    if (novosFiltros.duracao)   params.set('duracao',   novosFiltros.duracao);
    if (novosFiltros.page && novosFiltros.page !== '1') params.set('page', novosFiltros.page);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [router, pathname]);

  // ── Busca as rotas sempre que os filtros mudarem ─────────────
  useEffect(() => {
    queueMicrotask(() => setCarregando(true));
    const params = new URLSearchParams();
    if (busca)     params.set('q',         busca);
    if (categoria) params.set('categoria', categoria);
    if (estado)    params.set('estado',    estado);
    if (duracao)   params.set('duracao',   duracao);
    params.set('page',  String(page));
    params.set('limit', '12');

    fetch(`/api/rotas?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        setRotas(data.rotas     ?? []);
        setPaginacao(data.paginacao ?? null);
        if (data.filtros) setFiltros(data.filtros);
      })
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, [busca, categoria, estado, duracao, page]);

  // ── Handlers de filtro ───────────────────────────────────────
  function handleBusca(valor: string) {
    setBusca(valor);
    setPage(1);
    atualizarURL({ q: valor, categoria, estado, duracao, page: '1' });
  }
  function handleFiltro(campo: string, valor: string) {
    const novo = { q: busca, categoria, estado, duracao, page: '1', [campo]: valor };
    if (campo === 'categoria') setCategoria(valor);
    if (campo === 'estado')    setEstado(valor);
    if (campo === 'duracao')   setDuracao(valor);
    setPage(1);
    atualizarURL(novo);
  }
  function limparFiltros() {
    setBusca(''); setCategoria(''); setEstado(''); setDuracao(''); setPage(1);
    atualizarURL({});
  }

  const temFiltros = busca || categoria || estado || duracao;

  return (
    <div className="rotas-page">

      {/* ── Hero da listagem ── */}
      <div className="rotas-hero">
        <div className="container">
          <h1 className="rotas-hero-titulo">Explore o Brasil 🗺️</h1>
          <p className="rotas-hero-sub">
            {paginacao ? `${paginacao.total} rota${paginacao.total !== 1 ? 's' : ''} disponível${paginacao.total !== 1 ? 'is' : ''}` : 'Carregando...'}
          </p>

          {/* Campo de busca */}
          <div className="rotas-busca-wrapper">
            <span className="rotas-busca-icone">🔍</span>
            <input
              type="text"
              value={busca}
              onChange={e => handleBusca(e.target.value)}
              placeholder="Buscar por nome da rota..."
              className="rotas-busca-input"
            />
            {busca && (
              <button className="rotas-busca-limpar" onClick={() => handleBusca('')}>✕</button>
            )}
          </div>
        </div>
      </div>

      <div className="container rotas-container">
        <div className="rotas-layout">

          {/* ── Sidebar de filtros ── */}
          <aside className="rotas-sidebar">
            <div className="rotas-filtros-card">
              <div className="rotas-filtros-header">
                <h2 className="rotas-filtros-titulo">Filtros</h2>
                {temFiltros && (
                  <button className="rotas-limpar-btn" onClick={limparFiltros}>Limpar</button>
                )}
              </div>

              {/* Categoria */}
              <div className="filtro-grupo">
                <p className="filtro-grupo-label">Categoria</p>
                <div className="filtro-opcoes">
                  {filtros.categorias.map(cat => (
                    <button
                      key={cat}
                      className={`filtro-btn ${categoria === cat ? 'filtro-btn-ativo' : ''}`}
                      onClick={() => handleFiltro('categoria', categoria === cat ? '' : cat)}
                    >
                      {emojiCategoria(cat)} {cat}
                    </button>
                  ))}
                  {filtros.categorias.length === 0 && (
                    <p className="filtro-vazio">Nenhuma categoria disponível</p>
                  )}
                </div>
              </div>

              {/* Duração */}
              <div className="filtro-grupo">
                <p className="filtro-grupo-label">Duração</p>
                <div className="filtro-opcoes">
                  {[
                    { valor: 'curta', label: '⚡ Curta (1-2 dias)' },
                    { valor: 'media', label: '📅 Média (3-5 dias)' },
                    { valor: 'longa', label: '🏕️ Longa (6+ dias)'  },
                  ].map(op => (
                    <button
                      key={op.valor}
                      className={`filtro-btn ${duracao === op.valor ? 'filtro-btn-ativo' : ''}`}
                      onClick={() => handleFiltro('duracao', duracao === op.valor ? '' : op.valor)}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estado */}
              {filtros.estados.length > 0 && (
                <div className="filtro-grupo">
                  <p className="filtro-grupo-label">Estado</p>
                  <select
                    value={estado}
                    onChange={e => handleFiltro('estado', e.target.value)}
                    className="filtro-select"
                  >
                    <option value="">Todos os estados</option>
                    {[...new Set(filtros.estados.map(e => e.ESTADO))].map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </aside>

          {/* ── Grade de rotas ── */}
          <div className="rotas-conteudo">

            {/* Filtros ativos */}
            {temFiltros && (
              <div className="rotas-filtros-ativos">
                {busca     && <span className="filtro-tag">🔍 {busca} <button onClick={() => handleBusca('')}>✕</button></span>}
                {categoria && <span className="filtro-tag">{emojiCategoria(categoria)} {categoria} <button onClick={() => handleFiltro('categoria', '')}>✕</button></span>}
                {estado    && <span className="filtro-tag">📍 {estado} <button onClick={() => handleFiltro('estado', '')}>✕</button></span>}
                {duracao   && <span className="filtro-tag">⏱ {duracao} <button onClick={() => handleFiltro('duracao', '')}>✕</button></span>}
              </div>
            )}

            {/* Grade */}
            {carregando ? (
              <div className="rotas-grade">
                {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : rotas.length > 0 ? (
              <div className="rotas-grade">
                {rotas.map(rota => <CardRota key={rota.ID_ROTA} rota={rota} />)}
              </div>
            ) : (
              <div className="rotas-vazio">
                <p>🗺️</p>
                <p>Nenhuma rota encontrada com esses filtros.</p>
                <button className="btn btn-outline" onClick={limparFiltros}>Limpar filtros</button>
              </div>
            )}

            {/* Paginação */}
            {paginacao && paginacao.totalPaginas > 1 && (
              <div className="rotas-paginacao">
                <button
                  className="btn btn-outline btn-sm"
                  disabled={page <= 1}
                  onClick={() => { setPage(p => p - 1); atualizarURL({ q: busca, categoria, estado, duracao, page: String(page - 1) }); }}
                >
                  ← Anterior
                </button>
                <span className="paginacao-info">
                  Página {page} de {paginacao.totalPaginas}
                </span>
                <button
                  className="btn btn-outline btn-sm"
                  disabled={page >= paginacao.totalPaginas}
                  onClick={() => { setPage(p => p + 1); atualizarURL({ q: busca, categoria, estado, duracao, page: String(page + 1) }); }}
                >
                  Próxima →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <RotasStyles />
    </div>
  );
}

function RotasStyles() {
  return (
    <style>{`
      .rotas-page { min-height: 100vh; padding-top: 70px; background: var(--creme-suave); }

      /* Hero */
      .rotas-hero { background: linear-gradient(135deg, #1A1A1A 0%, #2D3A2E 100%); padding: 3rem 0 2rem; }
      .rotas-hero-titulo { font-family: var(--fonte-display); font-size: clamp(1.8rem, 4vw, 2.8rem); color: white; margin-bottom: 0.25rem; }
      .rotas-hero-sub { color: rgba(255,255,255,0.55); font-size: 0.9rem; margin-bottom: 1.5rem; }

      /* Busca */
      .rotas-busca-wrapper { position: relative; max-width: 560px; }
      .rotas-busca-icone { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); font-size: 1rem; }
      .rotas-busca-input { width: 100%; padding: 0.85rem 3rem; background: rgba(255,255,255,0.12); border: 1.5px solid rgba(255,255,255,0.2); border-radius: var(--radius-full); font-family: var(--fonte-corpo); font-size: 0.95rem; color: white; outline: none; transition: all var(--transicao); }
      .rotas-busca-input::placeholder { color: rgba(255,255,255,0.45); }
      .rotas-busca-input:focus { background: rgba(255,255,255,0.18); border-color: var(--laranja-manga); }
      .rotas-busca-limpar { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: rgba(255,255,255,0.6); cursor: pointer; font-size: 0.9rem; padding: 0.25rem; }

      /* Layout */
      .rotas-container { padding: 2rem 1.5rem 4rem; }
      .rotas-layout { display: grid; grid-template-columns: 1fr; gap: 2rem; }
      @media(min-width:768px){ .rotas-layout { grid-template-columns: 240px 1fr; } }

      /* Sidebar */
      .rotas-sidebar { position: sticky; top: 86px; align-self: start; }
      .rotas-filtros-card { background: var(--branco-puro); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: var(--sombra-sm); }
      .rotas-filtros-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
      .rotas-filtros-titulo { font-size: 1rem; font-weight: 700; }
      .rotas-limpar-btn { background: none; border: none; font-size: 0.82rem; color: var(--laranja-manga); cursor: pointer; font-family: var(--fonte-corpo); font-weight: 600; }

      .filtro-grupo { margin-bottom: 1.25rem; }
      .filtro-grupo-label { font-size: 0.78rem; font-weight: 700; color: var(--texto-suave); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.6rem; }
      .filtro-opcoes { display: flex; flex-direction: column; gap: 0.35rem; }
      .filtro-btn { text-align: left; padding: 0.5rem 0.75rem; border-radius: var(--radius-md); border: 1.5px solid var(--cinza-borda); background: transparent; font-family: var(--fonte-corpo); font-size: 0.85rem; color: var(--texto-principal); cursor: pointer; transition: all var(--transicao); }
      .filtro-btn:hover { border-color: var(--laranja-manga); color: var(--laranja-manga); }
      .filtro-btn-ativo { border-color: var(--laranja-manga); background: var(--laranja-manga-light); color: var(--laranja-manga); font-weight: 700; }
      .filtro-select { width: 100%; padding: 0.5rem 0.75rem; border: 1.5px solid var(--cinza-borda); border-radius: var(--radius-md); font-family: var(--fonte-corpo); font-size: 0.85rem; color: var(--texto-principal); background: var(--branco-puro); outline: none; cursor: pointer; }
      .filtro-select:focus { border-color: var(--laranja-manga); }
      .filtro-vazio { font-size: 0.82rem; color: var(--texto-suave); }

      /* Filtros ativos */
      .rotas-filtros-ativos { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.25rem; }
      .filtro-tag { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.3rem 0.75rem; background: var(--laranja-manga-light); color: var(--laranja-manga); border-radius: var(--radius-full); font-size: 0.82rem; font-weight: 600; }
      .filtro-tag button { background: none; border: none; cursor: pointer; color: var(--laranja-manga); font-size: 0.8rem; padding: 0; line-height: 1; }

      /* Grade */
      .rotas-grade { display: grid; grid-template-columns: 1fr; gap: 1.25rem; }
      @media(min-width:540px){ .rotas-grade { grid-template-columns: repeat(2, 1fr); } }
      @media(min-width:900px){ .rotas-grade { grid-template-columns: repeat(2, 1fr); } }
      @media(min-width:1100px){ .rotas-grade { grid-template-columns: repeat(3, 1fr); } }

      /* Card */
      .rota-card { display: flex; flex-direction: column; background: var(--branco-puro); border-radius: var(--radius-lg); box-shadow: var(--sombra-sm); overflow: hidden; text-decoration: none; color: var(--texto-principal); transition: all var(--transicao); }
      .rota-card:hover { box-shadow: var(--sombra-md); transform: translateY(-4px); }
      .rota-card-img { height: 170px; background: linear-gradient(135deg, var(--laranja-manga-light), var(--verde-palmeira-light)); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; flex-shrink: 0; }
      .rota-card-emoji { font-size: 3.5rem; }
      .rota-card-badge { position: absolute; top: 0.65rem; right: 0.65rem; }
      .rota-card-corpo { padding: 1.1rem; display: flex; flex-direction: column; gap: 0.4rem; flex: 1; }
      .rota-card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; }
      .rota-card-titulo { font-family: var(--fonte-display); font-size: 1rem; font-weight: 700; line-height: 1.3; }
      .rota-card-preco-bloco { text-align: right; flex-shrink: 0; }
      .rota-card-preco { font-family: var(--fonte-display); font-weight: 800; font-size: 1rem; color: var(--laranja-manga); white-space: nowrap; }
      .rota-card-preco-label { font-size: 0.7rem; color: var(--texto-suave); }
      .rota-card-local { font-size: 0.82rem; color: var(--texto-suave); }
      .rota-card-desc { font-size: 0.83rem; color: var(--texto-secundario); line-height: 1.4; }
      .rota-card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 0.6rem; border-top: 1px solid var(--cinza-borda); flex-wrap: wrap; gap: 0.25rem; }
      .rota-card-meta { display: flex; gap: 0.75rem; font-size: 0.8rem; color: var(--texto-suave); }
      .meta-count { opacity: 0.6; }
      .rota-card-empresa { font-size: 0.75rem; color: var(--texto-suave); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px; }

      /* Skeleton */
      .rota-card-skeleton { pointer-events: none; }
      .rota-skeleton { background: linear-gradient(90deg, var(--cinza-borda) 25%, var(--cinza-claro) 50%, var(--cinza-borda) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: var(--radius-sm); }
      @keyframes shimmer { to { background-position: -200% 0; } }

      /* Vazio */
      .rotas-vazio { text-align: center; padding: 4rem 1rem; color: var(--texto-suave); display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
      .rotas-vazio p:first-child { font-size: 3rem; }

      /* Paginação */
      .rotas-paginacao { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 2rem; }
      .paginacao-info { font-size: 0.88rem; color: var(--texto-suave); }
    `}</style>
  );
}