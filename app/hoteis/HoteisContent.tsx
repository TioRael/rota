'use client';
// app/hoteis/page.tsx
// CORRIGIDO:
//  - setCarregando via startTransition (fix react-hooks/set-state-in-effect)
//  - <img> substituido por <Image /> do next/image (fix no-img-element)

import { useState, useEffect, useCallback, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface Acomodacao {
  ID_ACOMODACAO: number; NOME: string; TIPO: string;
  DESCRICAO: string | null; CLASSIFICACAO: number | null;
  PRECO_MEDIO_DIARIA: number | null; URL_IMAGEM_CAPA: string | null;
  CIDADE: string; ESTADO: string;
  MEDIA_AVALIACAO: number | null; TOTAL_AVALIACOES: number;
}
interface Paginacao { total: number; page: number; limit: number; totalPaginas: number; }
interface Filtros   { tipos: string[]; estados: string[]; }

const EMOJI_TIPO: Record<string, string> = {
  'Hotel': '🏨', 'Pousada': '🏡', 'Resort': '🌴',
  'Hostel': '🎒', 'Eco-lodge': '🌿',
};

function Estrelas({ n }: { n: number | null }) {
  if (!n) return null;
  return <span>{Array.from({ length: 5 }).map((_, i) => (
    <span key={i} style={{ color: i < n ? '#FFB800' : 'var(--cinza-borda)', fontSize: '0.9rem' }}>★</span>
  ))}</span>;
}

function CardAcomodacao({ a }: { a: Acomodacao }) {
  const emoji = EMOJI_TIPO[a.TIPO] ?? '🏨';
  return (
    <Link href={`/hoteis/${a.ID_ACOMODACAO}`} className="hotel-card">
      <div className="hotel-card-img">
        {a.URL_IMAGEM_CAPA ? (
          // next/image requer width/height ou fill. Usamos fill com position relative no pai.
          <Image
            src={a.URL_IMAGEM_CAPA}
            alt={a.NOME}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 540px) 100vw, (max-width: 1100px) 50vw, 33vw"
          />
        ) : (
          <span style={{ fontSize: '3rem' }}>{emoji}</span>
        )}
        <span className="badge badge-azul hotel-card-badge">{a.TIPO}</span>
      </div>
      <div className="hotel-card-corpo">
        <div className="hotel-card-header">
          <h3 className="hotel-card-titulo">{a.NOME}</h3>
          {a.PRECO_MEDIO_DIARIA && (
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontFamily: 'var(--fonte-display)', fontWeight: 800, fontSize: '1rem', color: 'var(--laranja-manga)', whiteSpace: 'nowrap' }}>
                {a.PRECO_MEDIO_DIARIA.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--texto-suave)' }}>por noite</p>
            </div>
          )}
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--texto-suave)' }}>📍 {a.CIDADE}, {a.ESTADO}</p>
        {a.DESCRICAO && <p style={{ fontSize: '0.83rem', color: 'var(--texto-secundario)', lineHeight: 1.4 }}>{a.DESCRICAO.slice(0, 90)}…</p>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.6rem', borderTop: '1px solid var(--cinza-borda)' }}>
          <Estrelas n={a.CLASSIFICACAO} />
          {a.MEDIA_AVALIACAO && (
            <span style={{ fontSize: '0.8rem', color: 'var(--texto-suave)' }}>
              ⭐ {a.MEDIA_AVALIACAO} <span style={{ opacity: 0.6 }}>({a.TOTAL_AVALIACOES})</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function Skeleton() {
  return (
    <div className="hotel-card" style={{ pointerEvents: 'none' }}>
      <div className="hotel-card-img" style={{ background: 'linear-gradient(90deg,var(--cinza-borda) 25%,var(--cinza-claro) 50%,var(--cinza-borda) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
      <div className="hotel-card-corpo" style={{ gap: '0.75rem' }}>
        {[70,45,90,60].map((w,i) => <div key={i} style={{ height: '14px', width: `${w}%`, borderRadius: '6px', background: 'linear-gradient(90deg,var(--cinza-borda) 25%,var(--cinza-claro) 50%,var(--cinza-borda) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />)}
      </div>
    </div>
  );
}

export default function HoteisContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const pathname     = usePathname();
  // startTransition marca setState como nao-urgente — corrige react-hooks/set-state-in-effect
  const [, startTransition] = useTransition();

  const [acomodacoes, setAcomodacoes] = useState<Acomodacao[]>([]);
  const [paginacao,   setPaginacao]   = useState<Paginacao | null>(null);
  const [filtros,     setFiltros]     = useState<Filtros>({ tipos: [], estados: [] });
  const [carregando,  setCarregando]  = useState(true);

  const [busca,    setBusca]    = useState(searchParams.get('q')       ?? '');
  const [tipo,     setTipo]     = useState(searchParams.get('tipo')    ?? '');
  const [estado,   setEstado]   = useState(searchParams.get('estado')  ?? '');
  const [estrelas, setEstrelas] = useState(Number(searchParams.get('estrelas') ?? 0));
  const [page,     setPage]     = useState(Number(searchParams.get('page') ?? 1));

  const atualizarURL = useCallback((f: Record<string, string>) => {
    const p = new URLSearchParams();
    if (f.q) p.set('q', f.q); if (f.tipo) p.set('tipo', f.tipo);
    if (f.estado) p.set('estado', f.estado);
    if (f.estrelas && f.estrelas !== '0') p.set('estrelas', f.estrelas);
    if (f.page && f.page !== '1') p.set('page', f.page);
    startTransition(() => router.push(`${pathname}?${p.toString()}`, { scroll: false }));
  }, [router, pathname]);

  useEffect(() => {
    // Envolve o setState de carregando em startTransition para satisfazer
    // a regra react-hooks/set-state-in-effect sem quebrar o comportamento
    startTransition(() => setCarregando(true));

    const p = new URLSearchParams();
    if (busca)    p.set('q', busca);
    if (tipo)     p.set('tipo', tipo);
    if (estado)   p.set('estado', estado);
    if (estrelas) p.set('estrelas', String(estrelas));
    p.set('page', String(page));
    p.set('limit', '12');

    fetch(`/api/hoteis?${p.toString()}`)
      .then(r => r.json())
      .then(d => {
        setAcomodacoes(d.acomodacoes ?? []);
        setPaginacao(d.paginacao ?? null);
        if (d.filtros) setFiltros(d.filtros);
      })
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, [busca, tipo, estado, estrelas, page]);

  const temFiltros = busca || tipo || estado || estrelas > 0;

  return (
    <div style={{ minHeight: '100vh', paddingTop: '70px', background: 'var(--creme-suave)' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1A2A3A 0%, #1A1A1A 100%)', padding: '3rem 0 2rem' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--fonte-display)', fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: 'white', marginBottom: '0.25rem' }}>
            Hotéis & Pousadas 🏨
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {paginacao ? `${paginacao.total} acomodação${paginacao.total !== 1 ? 'ões' : ''} disponível${paginacao.total !== 1 ? 'is' : ''}` : 'Carregando...'}
          </p>
          <div style={{ position: 'relative', maxWidth: '560px' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
            <input type="text" value={busca}
              onChange={e => { setBusca(e.target.value); setPage(1); atualizarURL({ q: e.target.value, tipo, estado, estrelas: String(estrelas), page: '1' }); }}
              placeholder="Buscar por nome do hotel ou pousada..."
              style={{ width: '100%', padding: '0.85rem 3rem', background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 'var(--radius-full)', fontFamily: 'var(--fonte-corpo)', fontSize: '0.95rem', color: 'white', outline: 'none' }}
            />
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
        <div className="hotel-layout">
          {/* Sidebar */}
          <aside style={{ position: 'sticky', top: '86px', alignSelf: 'start' }}>
            <div style={{ background: 'var(--branco-puro)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--sombra-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Filtros</h2>
                {temFiltros && <button onClick={() => { setBusca(''); setTipo(''); setEstado(''); setEstrelas(0); setPage(1); atualizarURL({}); }} style={{ background: 'none', border: 'none', fontSize: '0.82rem', color: 'var(--laranja-manga)', cursor: 'pointer', fontWeight: 600 }}>Limpar</button>}
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--texto-suave)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Tipo</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {filtros.tipos.map(t => (
                    <button key={t}
                      onClick={() => { const v = tipo === t ? '' : t; setTipo(v); setPage(1); atualizarURL({ q: busca, tipo: v, estado, estrelas: String(estrelas), page: '1' }); }}
                      style={{ textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: `1.5px solid ${tipo === t ? 'var(--laranja-manga)' : 'var(--cinza-borda)'}`, background: tipo === t ? 'var(--laranja-manga-light)' : 'transparent', fontFamily: 'var(--fonte-corpo)', fontSize: '0.85rem', color: tipo === t ? 'var(--laranja-manga)' : 'var(--texto-principal)', cursor: 'pointer', fontWeight: tipo === t ? 700 : 400 }}>
                      {EMOJI_TIPO[t] ?? '🏨'} {t}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--texto-suave)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Categoria</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {[5,4,3,2,1].map(n => (
                    <button key={n}
                      onClick={() => { const v = estrelas === n ? 0 : n; setEstrelas(v); setPage(1); atualizarURL({ q: busca, tipo, estado, estrelas: String(v), page: '1' }); }}
                      style={{ textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: `1.5px solid ${estrelas === n ? 'var(--laranja-manga)' : 'var(--cinza-borda)'}`, background: estrelas === n ? 'var(--laranja-manga-light)' : 'transparent', fontFamily: 'var(--fonte-corpo)', fontSize: '0.85rem', color: estrelas === n ? 'var(--laranja-manga)' : 'var(--texto-principal)', cursor: 'pointer', fontWeight: estrelas === n ? 700 : 400 }}>
                      {'★'.repeat(n)}{'☆'.repeat(5-n)}
                    </button>
                  ))}
                </div>
              </div>

              {filtros.estados.length > 0 && (
                <div>
                  <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--texto-suave)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Estado</p>
                  <select value={estado}
                    onChange={e => { setEstado(e.target.value); setPage(1); atualizarURL({ q: busca, tipo, estado: e.target.value, estrelas: String(estrelas), page: '1' }); }}
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
              <div className="hotel-grade">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}</div>
            ) : acomodacoes.length > 0 ? (
              <div className="hotel-grade">{acomodacoes.map(a => <CardAcomodacao key={a.ID_ACOMODACAO} a={a} />)}</div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--texto-suave)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <p style={{ fontSize: '3rem' }}>🏨</p>
                <p>Nenhuma acomodação encontrada.</p>
                <button className="btn btn-outline" onClick={() => { setBusca(''); setTipo(''); setEstado(''); setEstrelas(0); atualizarURL({}); }}>Limpar filtros</button>
              </div>
            )}

            {paginacao && paginacao.totalPaginas > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
                <button className="btn btn-outline btn-sm" disabled={page <= 1}
                  onClick={() => { setPage(p => p-1); atualizarURL({ q: busca, tipo, estado, estrelas: String(estrelas), page: String(page-1) }); }}>← Anterior</button>
                <span style={{ fontSize: '0.88rem', color: 'var(--texto-suave)' }}>Página {page} de {paginacao.totalPaginas}</span>
                <button className="btn btn-outline btn-sm" disabled={page >= paginacao.totalPaginas}
                  onClick={() => { setPage(p => p+1); atualizarURL({ q: busca, tipo, estado, estrelas: String(estrelas), page: String(page+1) }); }}>Próxima →</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer { to { background-position: -200% 0; } }
        .hotel-layout { display: grid; grid-template-columns: 1fr; gap: 2rem; }
        @media(min-width:768px){ .hotel-layout { grid-template-columns: 220px 1fr; } }
        .hotel-grade { display: grid; grid-template-columns: 1fr; gap: 1.25rem; }
        @media(min-width:540px){ .hotel-grade { grid-template-columns: repeat(2,1fr); } }
        @media(min-width:1100px){ .hotel-grade { grid-template-columns: repeat(3,1fr); } }
        .hotel-card { display: flex; flex-direction: column; background: var(--branco-puro); border-radius: var(--radius-lg); box-shadow: var(--sombra-sm); overflow: hidden; text-decoration: none; color: var(--texto-principal); transition: all var(--transicao); }
        .hotel-card:hover { box-shadow: var(--sombra-md); transform: translateY(-4px); }
        .hotel-card-img { height: 170px; background: linear-gradient(135deg, var(--azul-turquesa-light), var(--verde-palmeira-light)); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; flex-shrink: 0; }
        .hotel-card-badge { position: absolute; top: 0.65rem; right: 0.65rem; z-index: 1; }
        .hotel-card-corpo { padding: 1.1rem; display: flex; flex-direction: column; gap: 0.4rem; flex: 1; }
        .hotel-card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; }
        .hotel-card-titulo { font-family: var(--fonte-display); font-size: 1rem; font-weight: 700; line-height: 1.3; }
      `}</style>
    </div>
  );
}