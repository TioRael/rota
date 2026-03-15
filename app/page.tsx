// app/page.tsx
// Página inicial do ROTA — Server Component (sem 'use client')
// CORRIGIDO: hovers via CSS classes, sem onMouseEnter/onMouseLeave inline

import Link from 'next/link';
import type { Metadata } from 'next';
import RotaRunner from '@/components/RotaRunner';

export const metadata: Metadata = {
  title: 'ROTA — Descubra o Brasil',
};

// ─── Dados estáticos (futuramente virão do banco) ─────────────

const STATS = [
  { numero: '200+', label: 'Rotas cadastradas', cor: 'laranja' },
  { numero: '50+',  label: 'Cidades cobertas',  cor: 'verde'   },
  { numero: '300+', label: 'Hotéis parceiros',  cor: 'turquesa'},
  { numero: '4.8★', label: 'Avaliação média',   cor: 'laranja' },
];

const CATEGORIAS = [
  { emoji: '🏖️', nome: 'Praias',       descricao: 'Litoral brasileiro',    classe: 'cat-azul'    },
  { emoji: '🌿', nome: 'Natureza',     descricao: 'Trilhas e ecoturismo',  classe: 'cat-verde'   },
  { emoji: '🏛️', nome: 'Cultural',     descricao: 'História e arte',       classe: 'cat-laranja' },
  { emoji: '🏔️', nome: 'Aventura',     descricao: 'Adrenalina e esporte',  classe: 'cat-laranja' },
  { emoji: '🍽️', nome: 'Gastronomia', descricao: 'Sabores do Brasil',      classe: 'cat-rosa'    },
  { emoji: '🌆', nome: 'Urbano',       descricao: 'Capitais e metrópoles', classe: 'cat-roxo'    },
];

const ROTAS_DESTAQUE = [
  {
    id: 1,
    nome: 'Chapada Diamantina',
    regiao: 'Lençóis, BA',
    duracao: '5 dias',
    categoria: 'Natureza',
    avaliacao: 4.9,
    avaliacoes: 128,
    preco: 'R$ 890',
    emoji: '🌿',
    descricao: 'Cachoeiras, grutas e trilhas no coração da Bahia.',
  },
  {
    id: 2,
    nome: 'Fernando de Noronha',
    regiao: 'Noronha, PE',
    duracao: '4 dias',
    categoria: 'Praias',
    avaliacao: 5.0,
    avaliacoes: 215,
    preco: 'R$ 1.450',
    emoji: '🏖️',
    descricao: 'O arquipélago mais bonito do Brasil, com praias paradisíacas.',
  },
  {
    id: 3,
    nome: 'Pantanal Selvagem',
    regiao: 'Bonito, MS',
    duracao: '3 dias',
    categoria: 'Aventura',
    avaliacao: 4.8,
    avaliacoes: 94,
    preco: 'R$ 750',
    emoji: '🐊',
    descricao: 'Safári brasileiro: onças, araras e rios cristalinos.',
  },
];

// ─── Subcomponentes (sem handlers — hover via CSS) ────────────

function CardCategoria({ emoji, nome, descricao, classe }: typeof CATEGORIAS[0]) {
  return (
    <Link
      href={`/rotas?categoria=${encodeURIComponent(nome)}`}
      className={`card-categoria ${classe}`}
    >
      <span className="card-categoria-emoji">{emoji}</span>
      <span className="card-categoria-nome">{nome}</span>
      <span className="card-categoria-desc">{descricao}</span>
    </Link>
  );
}

function CardRota({ nome, regiao, duracao, categoria, avaliacao, avaliacoes, preco, emoji, descricao, id }: typeof ROTAS_DESTAQUE[0]) {
  return (
    <div className="card card-rota">
      <div className="card-rota-imagem">
        <span className="card-rota-emoji">{emoji}</span>
        <span className="badge badge-verde">{categoria}</span>
      </div>
      <div className="card-rota-corpo">
        <div className="card-rota-header">
          <div>
            <h3 className="card-rota-titulo">{nome}</h3>
            <p className="card-rota-regiao">📍 {regiao}</p>
          </div>
          <div className="card-rota-preco-bloco">
            <p className="card-rota-preco">{preco}</p>
            <p className="card-rota-preco-label">por pessoa</p>
          </div>
        </div>
        <p className="card-rota-desc">{descricao}</p>
        <div className="card-rota-footer">
          
          <div className="card-rota-meta">
            <span>⏱ {duracao}</span>
            <span>⭐ {avaliacao} <span className="meta-count">({avaliacoes})</span></span>
          </div>
          <Link href={`/rotas/${id}`} className="btn btn-primary btn-sm">
            Ver rota
          </Link>
          
        </div>
      </div>
      
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      {/* ══════════════════════════════════════════════════════
          SEÇÃO 1 — HERO
          ══════════════════════════════════════════════════════ */}
      <section className="hero-section">
        {/* Decorações de fundo */}
        <div className="hero-bg-decoracao" aria-hidden="true">
          <div className="hero-orb" />
          <svg width="100%" height="100%" className="hero-grid-svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="container hero-container">
          <div className="hero-grid">

            {/* Conteúdo textual */}
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
                Rotas incríveis criadas por especialistas locais, hotéis selecionados
                e restaurantes autênticos — tudo organizado para você viajar sem complicação.
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
                  {['T','M','A','J'].map((letra, i) => (
                    <div key={letra} className={`hero-avatar avatar-${i}`}>{letra}</div>
                  ))}
                </div>
                <p className="hero-prova-texto">
                  <strong>+1.200 viajantes</strong> já descobriram rotas incríveis
                </p>
              </div>
            </div>

            {/* Cartão flutuante decorativo */}
            <div className="hero-card-container animate-float">
              <div className="hero-card-glass">
                <div className="hero-card-emoji">🌴</div>
                <h3 className="hero-card-titulo">Chapada Diamantina</h3>
                <p className="hero-card-sub">Bahia • 5 dias • Natureza & Aventura</p>
                <div className="hero-card-stats">
                  {[['⏱', '5 dias'], ['📍', '12 pontos'], ['⭐', '4.9/5']].map(([icon, text]) => (
                    <div key={text} className="hero-card-stat">
                      <span>{icon}</span>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
                <div className="hero-card-preco">A partir de R$ 890 / pessoa</div>
              </div>
            </div>
          </div>
        </div>

        {/* Onda de transição */}
        <div className="hero-onda" aria-hidden="true">
          <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none">
            <path d="M0 80L1440 80L1440 40C1200 80 960 0 720 20C480 40 240 80 0 40L0 80Z" fill="var(--creme-suave)"/>
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SEÇÃO 2 — STATS
          ══════════════════════════════════════════════════════ */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {STATS.map(({ numero, label, cor }, i) => (
              <div key={label} className={`stat-card stat-${cor} animate-fade-in-up delay-${(i+1)*100}`}>
                <p className="stat-numero">{numero}</p>
                <p className="stat-label">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SEÇÃO 3 — CATEGORIAS
          ══════════════════════════════════════════════════════ */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header text-center">
            <span className="badge badge-verde">Explore por tema</span>
            <h2>Qual tipo de viagem é a sua?</h2>
            <div className="divisor-tropical" />
          </div>
          <div className="categorias-grid">
            {CATEGORIAS.map((cat) => (
              <CardCategoria key={cat.nome} {...cat} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SEÇÃO 4 — ROTAS EM DESTAQUE
          ══════════════════════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <div className="section-header-row">
            <div>
              <span className="badge badge-laranja">Mais populares</span>
              <h2>Rotas em destaque</h2>
              <div className="divisor-tropical" />
            </div>
            <Link href="/rotas" className="btn btn-outline">
              Ver todas as rotas →
            </Link>
          </div>
          <div className="rotas-grid">
            {ROTAS_DESTAQUE.map((rota) => (
              <CardRota key={rota.id} {...rota} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SEÇÃO 5 — PARA EMPRESAS
          ══════════════════════════════════════════════════════ */}
      <section className="empresa-section">
        <div className="container">
          <div className="empresa-grid">
            <div>
              <span className="badge badge-verde-dark">Para empresas de turismo</span>
              <h2 className="empresa-titulo">
                Cadastre sua empresa e alcance mais viajantes
              </h2>
              <p className="empresa-sub">
                Publique suas rotas, registre seus guias e gerencie reservas em um painel completo.
                Conecte-se com turistas de todo o Brasil.
              </p>
              <div className="empresa-botoes">
                <Link href="/empresas" className="btn btn-secondary">
                  Cadastrar minha empresa
                </Link>
                <Link href="/empresas/saiba-mais" className="btn btn-ghost">
                  Saiba mais
                </Link>
              </div>
            </div>
            <div className="empresa-beneficios">
              {[
                { icon: '🗺️', titulo: 'Publique suas rotas',  texto: 'Cadastre itinerários completos com pontos turísticos, guias e serviços.' },
                { icon: '📅', titulo: 'Gerencie reservas',    texto: 'Controle todas as reservas e pagamentos em um painel centralizado.' },
                { icon: '⭐', titulo: 'Receba avaliações',    texto: 'Construa reputação com avaliações verificadas dos seus clientes.' },
              ].map(({ icon, titulo, texto }) => (
                <div key={titulo} className="beneficio-card">
                  <span className="beneficio-icon">{icon}</span>
                  <div>
                    <h4 className="beneficio-titulo">{titulo}</h4>
                    <p className="beneficio-texto">{texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SEÇÃO 6 — CTA FINAL
          ══════════════════════════════════════════════════════ */}
      <section className="cta-section text-center">
        <div className="container">
          <div className="cta-emoji">🌴</div>
          <h2>Pronto para a sua próxima aventura?</h2>
          <p className="cta-sub">
            Crie sua conta gratuita e comece a explorar as melhores rotas do Brasil hoje mesmo.
          </p>
          <div className="cta-botoes">
            <Link href="/auth/cadastro" className="btn btn-primary btn-lg">
              Criar conta grátis
            </Link>
            <Link href="/rotas" className="btn btn-outline">
              Explorar rotas
            </Link>
          </div>
        </div>
      </section>
      <RotaRunner />
    </>
  );
}