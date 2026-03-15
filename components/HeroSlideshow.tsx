'use client';
// components/HeroSlideshow.tsx
// Hero com slideshow automatico das rotas do banco.
// Recebe os slides via props (dados buscados no Server Component da home).
// Funcionalidades:
//   - Troca automática a cada 6s com transição de opacidade suave
//   - Barra de progresso animada
//   - Pause ao passar o mouse
//   - Setas de navegação
//   - Dots indicadores clicáveis
//   - Suporte a swipe no mobile
//   - Fallback gracioso se nao houver imagens

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// ─── Tipos ────────────────────────────────────────────────────
export interface SlideData {
  id:       number;
  nome:     string;
  cidade:   string;
  estado:   string;
  duracao:  string | null;
  categoria:string | null;
  imagem:   string | null;
  preco:    string | null;
}

interface Props {
  slides: SlideData[];
}

const DURACAO_MS   = 6000;   // tempo em cada slide
const EMOJI_CAT: Record<string, string> = {
  'Praias':'🏖️','Natureza':'🌿','Cultural':'🏛️',
  'Aventura':'🏔️','Gastronomia':'🍽️','Urbano':'🌆',
};
// Gradientes de fallback por categoria (quando nao ha imagem)
const GRAD_CAT: Record<string, string> = {
  'Praias':      'linear-gradient(160deg,#0A2A4A 0%,#1A4A6A 50%,#0A3A5A 100%)',
  'Natureza':    'linear-gradient(160deg,#0A3A1A 0%,#1A5A2A 50%,#0A4A1A 100%)',
  'Cultural':    'linear-gradient(160deg,#3A1A0A 0%,#5A2A0A 50%,#4A1A0A 100%)',
  'Aventura':    'linear-gradient(160deg,#1A1A3A 0%,#2A2A5A 50%,#1A1A4A 100%)',
  'Gastronomia': 'linear-gradient(160deg,#3A0A0A 0%,#5A1A0A 50%,#4A0A0A 100%)',
  'default':     'linear-gradient(160deg,#1A1A1A 0%,#2D3A2E 50%,#1A2A3A 100%)',
};

// ─── Icone seta ───────────────────────────────────────────────
function Seta({ dir }: { dir: 'esq' | 'dir' }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {dir === 'esq'
        ? <polyline points="15 18 9 12 15 6"/>
        : <polyline points="9 6 15 12 9 18"/>
      }
    </svg>
  );
}

// ─── Componente ───────────────────────────────────────────────
export default function HeroSlideshow({ slides }: Props) {
  const [atual,        setAtual]        = useState(0);
  const [progresso,    setProgresso]    = useState(0);
  const [pausado,      setPausado]      = useState(false);
  const [transitando,  setTransitando]  = useState(false);
  const timerRef   = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const progRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchXRef  = useRef(0);

  const total = slides.length;

  // ── Navegar para um slide ───────────────────────────────────
  const irPara = useCallback((idx: number) => {
    if (timerRef.current)  clearTimeout(timerRef.current);
    if (progRef.current)   clearInterval(progRef.current);
    setTransitando(true);
    setTimeout(() => {
      setAtual((idx + total) % total);
      setProgresso(0);
      setTransitando(false);
    }, 50);
  }, [total]);

  const proximo   = useCallback(() => irPara(atual + 1), [atual, irPara]);
  const anterior  = useCallback(() => irPara(atual - 1), [atual, irPara]);

  // ── Timers ──────────────────────────────────────────────────
  useEffect(() => {
    if (total === 0) return;
    if (progRef.current) clearInterval(progRef.current);

    let pct = 0;
    progRef.current = setInterval(() => {
      if (pausado) return;
      pct += 100 / (DURACAO_MS / 100);
      setProgresso(Math.min(pct, 100));
    }, 100);

    timerRef.current = setTimeout(() => {
      if (!pausado) proximo();
    }, DURACAO_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progRef.current)  clearInterval(progRef.current);
    };
  }, [atual, pausado, proximo, total]);

  // ── Swipe mobile ────────────────────────────────────────────
  function handleTouchStart(e: React.TouchEvent) {
    touchXRef.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    const diff = touchXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        proximo();
      } else {
        anterior();
      }
    }
  }

  // ── Sem slides ───────────────────────────────────────────────
  if (total === 0) return <HeroFallback />;

  const slide    = slides[atual];
  const gradFall = GRAD_CAT[slide.categoria ?? ''] ?? GRAD_CAT['default'];

  return (
    <section
      className="hero-slideshow"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Destinos em destaque"
    >
      {/* ── Barra de progresso ── */}
      <div className="hs-progress-track" aria-hidden="true">
        <div className="hs-progress-bar" style={{ width: `${progresso}%` }} />
      </div>

      {/* ── Slides (imagens empilhadas, transicao por opacity) ── */}
      <div className="hs-slides" aria-hidden="true">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`hs-slide ${i === atual ? 'hs-slide-ativo' : ''} ${transitando && i === atual ? 'hs-slide-transitando' : ''}`}
          >
            {s.imagem ? (
              <Image
                src={s.imagem}
                alt={s.nome}
                fill
                priority={i === 0}
                sizes="100vw"
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            ) : (
              <div style={{ position: 'absolute', inset: 0, background: gradFall }} />
            )}
            {/* Overlay escuro gradiente */}
            <div className="hs-overlay" />
          </div>
        ))}
      </div>

      {/* ── Conteúdo do hero (texto + botões) ── */}
      <div className="container hs-conteudo">
        <div className="hs-texto animate-fade-in-up">
          <div className="hero-badge">
            <span>🌴</span>
            <span className="hero-badge-texto">Plataforma de Turismo Brasileiro</span>
          </div>

          <h1 className="hero-titulo">
            Descubra o Brasil{' '}
            <span className="hero-titulo-destaque animate-float">de verdade</span>
          </h1>

          <p className="hero-subtitulo">
            Rotas criadas por especialistas locais, hotéis selecionados e restaurantes
            autênticos — tudo organizado para você viajar sem complicação.
          </p>

          <div className="hero-botoes">
            <Link href="/rotas" className="btn btn-primary btn-lg btn-pulse">
              🗺️ Explorar Rotas
            </Link>
            <Link href="/auth/cadastro" className="btn btn-ghost">
              Criar conta grátis →
            </Link>
          </div>

          {/* Prova social */}
          <div className="hero-prova-social">
            <div className="hero-avatares">
              {['T','M','A','J'].map((l, i) => (
                <div key={l} className={`hero-avatar avatar-${i}`}>{l}</div>
              ))}
            </div>
            <p className="hero-prova-texto">
              <strong>+1.200 viajantes</strong> já descobriram rotas incríveis
            </p>
          </div>
        </div>

        {/* Card da rota atual — canto direito */}
        <Link href={`/rotas/${slide.id}`} className="hs-card-rota animate-float">
          <div className="hs-card-tag">
            {EMOJI_CAT[slide.categoria ?? ''] ?? '🗺️'} {slide.categoria ?? 'Destino'}
          </div>
          <h3 className="hs-card-titulo">{slide.nome}</h3>
          <p className="hs-card-local">📍 {slide.cidade}, {slide.estado}</p>
          <div className="hs-card-meta">
            {slide.duracao && <span>⏱ {slide.duracao}</span>}
            {slide.preco   && <span>💰 a partir de {slide.preco}</span>}
          </div>
          <span className="hs-card-cta">Ver rota →</span>
        </Link>
      </div>

      {/* ── Setas de navegacao ── */}
      {total > 1 && (
        <>
          <button
            className="hs-seta hs-seta-esq"
            onClick={anterior}
            aria-label="Slide anterior"
          >
            <Seta dir="esq" />
          </button>
          <button
            className="hs-seta hs-seta-dir"
            onClick={proximo}
            aria-label="Proximo slide"
          >
            <Seta dir="dir" />
          </button>
        </>
      )}

      {/* ── Dots + info da rota no rodapé ── */}
      <div className="hs-rodape">
        {/* Nome da rota atual */}
        <div className="hs-slide-info">
          <p className="hs-slide-nome">{slide.nome}</p>
          <p className="hs-slide-local">📍 {slide.cidade}, {slide.estado}</p>
        </div>

        {/* Dots */}
        {total > 1 && (
          <div className="hs-dots" role="tablist" aria-label="Navegacao de slides">
            {slides.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === atual}
                aria-label={`Slide ${i + 1}`}
                className={`hs-dot ${i === atual ? 'hs-dot-ativo' : ''}`}
                onClick={() => irPara(i)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Onda de transicao (igual ao hero original) ── */}
      <div className="hero-onda" aria-hidden="true">
        <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none">
          <path d="M0 80L1440 80L1440 40C1200 80 960 0 720 20C480 40 240 80 0 40L0 80Z" fill="var(--creme-suave)"/>
        </svg>
      </div>
    </section>
  );
}

// ─── Fallback sem slides ──────────────────────────────────────
function HeroFallback() {
  return (
    <section className="hero-section">
      <div className="hero-bg-decoracao" aria-hidden="true">
        <div className="hero-orb" />
      </div>
      <div className="container hero-container">
        <div className="hero-grid">
          <div className="animate-fade-in-up">
            <div className="hero-badge">
              <span>🌴</span>
              <span className="hero-badge-texto">Plataforma de Turismo Brasileiro</span>
            </div>
            <h1 className="hero-titulo">
              Descubra o Brasil{' '}
              <span className="hero-titulo-destaque animate-float">de verdade</span>
            </h1>
            <p className="hero-subtitulo">
              Rotas criadas por especialistas locais, hotéis selecionados e restaurantes
              autênticos — tudo organizado para você viajar sem complicação.
            </p>
            <div className="hero-botoes">
              <Link href="/rotas" className="btn btn-primary btn-lg btn-pulse">🗺️ Explorar Rotas</Link>
              <Link href="/auth/cadastro" className="btn btn-ghost">Criar conta grátis →</Link>
            </div>
          </div>
          <div className="hero-card-container animate-float">
            <div className="hero-card-glass">
              <div className="hero-card-emoji">🌴</div>
              <h3 className="hero-card-titulo">Brasil te espera</h3>
              <p className="hero-card-sub">Explore destinos incríveis</p>
            </div>
          </div>
        </div>
      </div>
      <div className="hero-onda" aria-hidden="true">
        <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none">
          <path d="M0 80L1440 80L1440 40C1200 80 960 0 720 20C480 40 240 80 0 40L0 80Z" fill="var(--creme-suave)"/>
        </svg>
      </div>
    </section>
  );
}