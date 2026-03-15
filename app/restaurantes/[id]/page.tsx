'use client';
// app/restaurantes/[id]/page.tsx — Detalhe de restaurante

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Restaurante {
  ID_RESTAURANTE: number; NOME: string; TIPO: string | null;
  CARACTERISTICAS: string | null; PRECO_MEDIO: number | null;
  URL_IMAGEM_CAPA: string | null; CIDADE: string; ESTADO: string; PAIS: string;
}
interface Rota { ID_ROTA: number; NOME: string; CATEGORIA: string | null; DURACAO: string | null; }

const EMOJI_TIPO: Record<string, string> = {
  'Brasileiro Regional': '🇧🇷', 'Frutos do Mar': '🦐', 'Amazonico': '🌿',
  'Mineiro': '🍲', 'Italiano': '🍕', 'Alemao': '🍺', 'Frances': '🥐',
  'Internacional': '🌍', 'Natural': '🥗', 'Caicara': '🐟', 'Nordestino': '🌶️',
  'Churrascaria': '🥩', 'Pub': '🍻', 'Cafe': '☕',
};

export default function RestauranteDetalhePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';

  const [restaurante, setRestaurante] = useState<Restaurante | null>(null);
  const [rotas,       setRotas]       = useState<Rota[]>([]);
  const [carregando,  setCarregando]  = useState(true);
  const [notFound,    setNotFound]    = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/restaurantes/${id}`)
      .then(r => { if (r.status === 404) { setNotFound(true); return null; } return r.json(); })
      .then(d => { if (d) { setRestaurante(d.restaurante ?? null); setRotas(d.rotas ?? []); } })
      .catch(console.error).finally(() => setCarregando(false));
  }, [id]);

  if (carregando) return <div style={{ paddingTop: '70px', minHeight: '100vh', background: 'var(--creme-suave)' }}><div style={{ height: '280px', background: 'var(--cinza-claro)' }} /></div>;
  if (notFound || !restaurante) return (
    <div style={{ paddingTop: '5rem', textAlign: 'center', padding: '5rem 1rem' }}>
      <p style={{ fontSize: '3rem' }}>🍽️</p><h2>Restaurante não encontrado</h2>
      <Link href="/restaurantes" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Ver todos os restaurantes</Link>
    </div>
  );

  const emoji = restaurante.TIPO ? (EMOJI_TIPO[restaurante.TIPO] ?? '🍽️') : '🍽️';

  return (
    <div style={{ minHeight: '100vh', paddingTop: '70px', background: 'var(--creme-suave)' }}>
      {/* Hero */}
      <div style={{ position: 'relative', height: '280px', overflow: 'hidden', background: 'linear-gradient(135deg, #3A1A1A, #1A1A1A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {restaurante.URL_IMAGEM_CAPA
          ? <Image src={restaurante.URL_IMAGEM_CAPA} alt={restaurante.NOME} fill style={{ objectFit: 'cover', position: 'absolute', inset: 0 }} />
          : <span style={{ fontSize: '6rem', zIndex: 1 }}>{emoji}</span>
        }
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)' }} />
        <div className="container" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem 1.5rem' }}>
          <Link href="/restaurantes" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-block', marginBottom: '0.75rem' }}>← Todos os restaurantes</Link>
          {restaurante.TIPO && <span className="badge badge-laranja" style={{ display: 'block', width: 'fit-content', marginBottom: '0.5rem' }}>{restaurante.TIPO}</span>}
          <h1 style={{ fontFamily: 'var(--fonte-display)', fontSize: 'clamp(1.5rem,4vw,2.2rem)', color: 'white', marginBottom: '0.25rem' }}>{restaurante.NOME}</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>📍 {restaurante.CIDADE}, {restaurante.ESTADO}</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem 4rem', maxWidth: '860px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Info rapida */}
          <div style={{ background: 'var(--branco-puro)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--sombra-sm)', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {restaurante.PRECO_MEDIO && (
              <div>
                <p style={{ fontSize: '0.72rem', color: 'var(--texto-suave)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ticket médio/pessoa</p>
                <p style={{ fontFamily: 'var(--fonte-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--laranja-manga)' }}>
                  {restaurante.PRECO_MEDIO.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            )}
            {restaurante.TIPO && (
              <div>
                <p style={{ fontSize: '0.72rem', color: 'var(--texto-suave)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tipo de cozinha</p>
                <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{emoji} {restaurante.TIPO}</p>
              </div>
            )}
            <div>
              <p style={{ fontSize: '0.72rem', color: 'var(--texto-suave)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Localização</p>
              <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{restaurante.CIDADE}, {restaurante.ESTADO}</p>
            </div>
          </div>

          {/* Caracteristicas */}
          {restaurante.CARACTERISTICAS && (
            <div style={{ background: 'var(--branco-puro)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--sombra-sm)' }}>
              <h2 style={{ fontFamily: 'var(--fonte-display)', fontSize: '1.2rem', marginBottom: '0.75rem' }}>Sobre o restaurante</h2>
              <p style={{ color: 'var(--texto-secundario)', lineHeight: 1.7, fontSize: '0.95rem' }}>{restaurante.CARACTERISTICAS}</p>
            </div>
          )}

          {/* Rotas proximas */}
          {rotas.length > 0 && (
            <div style={{ background: 'var(--branco-puro)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--sombra-sm)' }}>
              <h2 style={{ fontFamily: 'var(--fonte-display)', fontSize: '1.2rem', marginBottom: '1rem' }}>🗺️ Rotas na região</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {rotas.map(r => (
                  <Link key={r.ID_ROTA} href={`/rotas/${r.ID_ROTA}`}
                    style={{ display: 'block', padding: '0.85rem', border: '1.5px solid var(--cinza-borda)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--texto-principal)', transition: 'all var(--transicao)' }}
                    className="rota-link-hover">
                    <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.NOME}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                      {r.CATEGORIA && <span className="badge badge-verde" style={{ fontSize: '0.7rem' }}>{r.CATEGORIA}</span>}
                      {r.DURACAO  && <span style={{ fontSize: '0.78rem', color: 'var(--texto-suave)' }}>⏱ {r.DURACAO}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div style={{ background: 'var(--laranja-manga-light)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--fonte-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Vai visitar {restaurante.CIDADE}?</p>
            <p style={{ fontSize: '0.88rem', color: 'var(--texto-secundario)', marginBottom: '1rem' }}>Encontre onde se hospedar na mesma região.</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href={`/hoteis?estado=${restaurante.ESTADO}`} className="btn btn-primary btn-sm">🏨 Ver hotéis em {restaurante.ESTADO}</Link>
              <Link href={`/rotas?estado=${restaurante.ESTADO}`}  className="btn btn-outline btn-sm">🗺️ Ver rotas em {restaurante.ESTADO}</Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`.rota-link-hover:hover { border-color: var(--laranja-manga); background: var(--laranja-manga-light); }`}</style>
    </div>
  );
}