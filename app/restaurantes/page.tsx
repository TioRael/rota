'use client';
// app/restaurantes/page.tsx
// CORRIGIDO:
//  - setCarregando via startTransition (fix react-hooks/set-state-in-effect)
//  - <img> substituido por <Image /> do next/image (fix no-img-element)

import { useState, useEffect, useCallback, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface Restaurante {
  ID_RESTAURANTE: number; NOME: string; TIPO: string | null;
  CARACTERISTICAS: string | null; PRECO_MEDIO: number | null;
  URL_IMAGEM_CAPA: string | null; CIDADE: string; ESTADO: string;
}

const EMOJI_TIPO: Record<string, string> = {
  'Brasileiro Regional': '🇧🇷', 'Frutos do Mar': '🦐', 'Amazonico': '🌿',
  'Mineiro': '🍲', 'Italiano': '🍕', 'Alemao': '🍺', 'Frances': '🥐',
  'Internacional': '🌍', 'Natural': '🥗', 'Caicara': '🐟', 'Nordestino': '🌶️',
  'Churrascaria': '🥩', 'Pub': '🍻', 'Cafe': '☕',
};

function CardRestaurante({ r }: { r: Restaurante }) {
  const emoji = r.TIPO ? (EMOJI_TIPO[r.TIPO] ?? '🍽️') : '🍽️';
  return (
    <Link href={`/restaurantes/${r.ID_RESTAURANTE}`} className="rest-card">
      <div className="rest-card-img">
        {r.URL_IMAGEM_CAPA ? (
          <Image
            src={r.URL_IMAGEM_CAPA}
            alt={r.NOME}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 540px) 100vw, (max-width: 1100px) 50vw, 33vw"
          />
        ) : (
          <span style={{ fontSize: '3rem' }}>{emoji}</span>
        )}
        {r.TIPO && <span className="badge badge-laranja rest-card-badge">{r.TIPO}</span>}
      </div>
      <div className="rest-card-corpo">
        <h3 className="rest-card-titulo">{r.NOME}</h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--texto-suave)' }}>📍 {r.CIDADE}, {r.ESTADO}</p>
        {r.CARACTERISTICAS && <p style={{ fontSize: '0.83rem', color: 'var(--texto-secundario)', lineHeight: 1.4 }}>{r.CARACTERISTICAS.slice(0, 90)}…</p>}
        {r.PRECO_MEDIO && (
          <div style={{ marginTop: 'auto', paddingTop: '0.6rem', borderTop: '1px solid var(--cinza-borda)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--texto-suave)' }}>Ticket médio/pessoa</span>
            <span style={{ fontFamily: 'var(--fonte-display)', fontWeight: 800, color: 'var(--laranja-manga)', fontSize: '0.95rem' }}>
              {r.PRECO_MEDIO.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function RestaurantesPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const pathname     = usePathname();
  const [, startTransition] = useTransition();

  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [paginacao,    setPaginacao]    = useState<{ total: number; totalPaginas: number; page: number } | null>(null);
  const [filtros,      setFiltros]      = useState<{ tipos: string[]; estados: string[] }>({ tipos: [], estados: [] });
  const [carregando,   setCarregando]   = useState(true);

  const [busca,  setBusca]  = useState(searchParams.get('q')      ?? '');
  const [tipo,   setTipo]   = useState(searchParams.get('tipo')   ?? '');
  const [estado, setEstado] = useState(searchParams.get('estado') ?? '');
  const [page,   setPage]   = useState(Number(searchParams.get('page') ?? 1));

  const atualizarURL = useCallback((f: Record<string, string>) => {
    const p = new URLSearchParams();
    if (f.q) p.set('q', f.q);
    if (f.tipo) p.set('tipo', f.tipo);
    if (f.estado) p.set('estado', f.estado);
    if (f.page && f.page !== '1') p.set('page', f.page);
    startTransition(() => router.push(`${pathname}?${p.toString()}`, { scroll: false }));
  }, [router, pathname]);

  useEffect(() => {
    // startTransition marca o setState como nao-urgente — satisfaz react-hooks/set-state-in-effect
    startTransition(() => setCarregando(true));

    const p = new URLSearchParams();
    if (busca)  p.set('q', busca);
    if (tipo)   p.set('tipo', tipo);
    if (estado) p.set('estado', estado);
    p.set('page', String(page));
    p.set('limit', '12');

    fetch(`/api/restaurantes?${p.toString()}`)
      .then(r => r.json())
      .then(d => {
        setRestaurantes(d.restaurantes ?? []);
        setPaginacao(d.paginacao ?? null);
        if (d.filtros) setFiltros(d.filtros);
      })
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, [busca, tipo, estado, page]);

  const temFiltros = busca || tipo || estado;

  return (
    <div style={{ minHeight: '100vh', paddingTop: '70px', background: 'var(--creme-suave)' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #3A1A1A 0%, #1A1A1A 100%)', padding: '3rem 0 2rem' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--fonte-display)', fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: 'white', marginBottom: '0.25rem' }}>Restaurantes 🍽️</h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {paginacao ? `${paginacao.total} restaurante${paginacao.total !== 1 ? 's' : ''} encontrado${paginacao.total !== 1 ? 's' : ''}` : 'Carregando...'}
          </p>
          <div style={{ position: 'relative', maxWidth: '560px' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
            <input type="text" value={busca}
              onChange={e => { setBusca(e.target.value); setPage(1); atualizarURL({ q: e.target.value, tipo, estado, page: '1' }); }}
              placeholder="Buscar restaurante..."
              style={{ width: '100%', padding: '0.85rem 3rem', background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 'var(--radius-full)', fontFamily: 'var(--fonte-corpo)', fontSize: '0.95rem', color: 'white', outline: 'none' }}
            />
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
        <div className="rest-layout">
          {/* Sidebar */}
          <aside style={{ position: 'sticky', top: '86px', alignSelf: 'start' }}>
            <div style={{ background: 'var(--branco-puro)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--sombra-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Filtros</h2>
                {temFiltros && <button onClick={() => { setBusca(''); setTipo(''); setEstado(''); setPage(1); atualizarURL({}); }} style={{ background: 'none', border: 'none', fontSize: '0.82rem', color: 'var(--laranja-manga)', cursor: 'pointer', fontWeight: 600 }}>Limpar</button>}
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--texto-suave)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Tipo de Cozinha</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '280px', overflowY: 'auto' }}>
                  {filtros.tipos.map(t => (
                    <button key={t}
                      onClick={() => { const v = tipo === t ? '' : t; setTipo(v); setPage(1); atualizarURL({ q: busca, tipo: v, estado, page: '1' }); }}
                      style={{ textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: `1.5px solid ${tipo === t ? 'var(--laranja-manga)' : 'var(--cinza-borda)'}`, background: tipo === t ? 'var(--laranja-manga-light)' : 'transparent', fontFamily: 'var(--fonte-corpo)', fontSize: '0.85rem', color: tipo === t ? 'var(--laranja-manga)' : 'var(--texto-principal)', cursor: 'pointer', fontWeight: tipo === t ? 700 : 400 }}>
                      {EMOJI_TIPO[t] ?? '🍽️'} {t}
                    </button>
                  ))}
                </div>
              </div>
              {filtros.estados.length > 0 && (
                <div>
                  <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--texto-suave)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Estado</p>
                  <select value={estado}
                    onChange={e => { setEstado(e.target.value); setPage(1); atualizarURL({ q: busca, tipo, estado: e.target.value, page: '1' }); }}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1.5px solid var(--cinza-borda)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--fonte-corpo)', fontSize: '0.85rem', background: 'var(--branco-puro)', outline: 'none', cursor: 'pointer' }}>
                    <option value="">Todos os estados</option>
                    {filtros.estados.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              )}
            </div>
          </aside>

          {/* Grade */}
          <div>
            {carregando ? (
              <div className="rest-grade">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rest-card" style={{ pointerEvents: 'none' }}>
                    <div className="rest-card-img" style={{ background: 'linear-gradient(90deg,var(--cinza-borda) 25%,var(--cinza-claro) 50%,var(--cinza-borda) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                    <div className="rest-card-corpo" style={{ gap: '0.75rem' }}>
                      {[70,45,90,55].map((w,j) => <div key={j} style={{ height: '14px', width: `${w}%`, borderRadius: '6px', background: 'linear-gradient(90deg,var(--cinza-borda) 25%,var(--cinza-claro) 50%,var(--cinza-borda) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />)}
                    </div>
                  </div>
                ))}
              </div>
            ) : restaurantes.length > 0 ? (
              <div className="rest-grade">{restaurantes.map(r => <CardRestaurante key={r.ID_RESTAURANTE} r={r} />)}</div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--texto-suave)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <p style={{ fontSize: '3rem' }}>🍽️</p>
                <p>Nenhum restaurante encontrado.</p>
                <button className="btn btn-outline" onClick={() => { setBusca(''); setTipo(''); setEstado(''); atualizarURL({}); }}>Limpar filtros</button>
              </div>
            )}

            {paginacao && paginacao.totalPaginas > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
                <button className="btn btn-outline btn-sm" disabled={page <= 1}
                  onClick={() => { setPage(p => p-1); atualizarURL({ q: busca, tipo, estado, page: String(page-1) }); }}>← Anterior</button>
                <span style={{ fontSize: '0.88rem', color: 'var(--texto-suave)' }}>Página {page} de {paginacao.totalPaginas}</span>
                <button className="btn btn-outline btn-sm" disabled={page >= paginacao.totalPaginas}
                  onClick={() => { setPage(p => p+1); atualizarURL({ q: busca, tipo, estado, page: String(page+1) }); }}>Próxima →</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer { to { background-position: -200% 0; } }
        .rest-layout { display: grid; grid-template-columns: 1fr; gap: 2rem; }
        @media(min-width:768px){ .rest-layout { grid-template-columns: 220px 1fr; } }
        .rest-grade { display: grid; grid-template-columns: 1fr; gap: 1.25rem; }
        @media(min-width:540px){ .rest-grade { grid-template-columns: repeat(2,1fr); } }
        @media(min-width:1100px){ .rest-grade { grid-template-columns: repeat(3,1fr); } }
        .rest-card { display: flex; flex-direction: column; background: var(--branco-puro); border-radius: var(--radius-lg); box-shadow: var(--sombra-sm); overflow: hidden; text-decoration: none; color: var(--texto-principal); transition: all var(--transicao); }
        .rest-card:hover { box-shadow: var(--sombra-md); transform: translateY(-4px); }
        .rest-card-img { height: 160px; background: linear-gradient(135deg, #3A1A1A20, var(--laranja-manga-light)); display: flex; align-items: center; justify-content: center; position: relative; flex-shrink: 0; overflow: hidden; }
        .rest-card-badge { position: absolute; top: 0.65rem; right: 0.65rem; z-index: 1; }
        .rest-card-corpo { padding: 1.1rem; display: flex; flex-direction: column; gap: 0.4rem; flex: 1; }
        .rest-card-titulo { font-family: var(--fonte-display); font-size: 1rem; font-weight: 700; line-height: 1.3; }
      `}</style>
    </div>
  );
}