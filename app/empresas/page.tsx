// app/empresas/page.tsx
// Pagina de conversao para empresas de turismo
// Server Component — sem interatividade direta (CTA redireciona para /auth/cadastro)

import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Para Empresas | ROTA',
  description: 'Cadastre sua empresa de turismo no ROTA e conecte-se com milhares de turistas brasileiros. Gerencie rotas, guias e reservas em um unico lugar.',
};

// ─── Dados ────────────────────────────────────────────────────

const BENEFICIOS = [
  {
    emoji: '🗺️',
    titulo: 'Publique suas rotas',
    desc: 'Cadastre itinerarios completos com pontos turisticos, guias disponíveis, servicos e politica de precos. Chegue a turistas que ja estao buscando sua regiao.',
    cor: 'var(--laranja-manga)',
  },
  {
    emoji: '📅',
    titulo: 'Gerencie reservas',
    desc: 'Acompanhe todas as reservas em tempo real no seu painel. Veja quem vai, quantas pessoas e o valor total de cada passeio confirmado.',
    cor: 'var(--verde-palmeira)',
  },
  {
    emoji: '🧭',
    titulo: 'Cadastre seus guias',
    desc: 'Registre os guias da sua equipe com idiomas e especializacoes. Os turistas podem escolher o guia na hora da reserva.',
    cor: 'var(--azul-turquesa)',
  },
  {
    emoji: '⭐',
    titulo: 'Construa sua reputacao',
    desc: 'Receba avaliacoes verificadas de turistas reais. Uma boa nota media atrai mais clientes e aumenta a confianca na sua empresa.',
    cor: 'var(--laranja-manga)',
  },
  {
    emoji: '📊',
    titulo: 'Acompanhe suas metricas',
    desc: 'Veja estatisticas de reservas, avaliacao media e desempenho das suas rotas. Tome decisoes com base em dados reais.',
    cor: 'var(--verde-palmeira)',
  },
  {
    emoji: '🌍',
    titulo: 'Alcance nacional',
    desc: 'Turistas de todo o Brasil encontram suas rotas na plataforma. Sem limite geografico para o seu negocio crescer.',
    cor: 'var(--azul-turquesa)',
  },
];

const COMO_FUNCIONA = [
  { num: '01', titulo: 'Crie sua conta',      desc: 'Cadastre-se como empresa com CNPJ e Razao Social. Processo simples e rapido.' },
  { num: '02', titulo: 'Configure seu perfil', desc: 'Adicione informacoes da empresa, regiao de atuacao e registre seus guias.' },
  { num: '03', titulo: 'Publique suas rotas',  desc: 'Cadastre itinerarios com pontos turisticos, servicos e precos.' },
  { num: '04', titulo: 'Receba reservas',      desc: 'Turistas reservam diretamente pela plataforma. Voce gerencia tudo no painel.' },
];

const PLANOS = [
  {
    nome: 'Starter',
    preco: 'Gratis',
    periodo: 'para sempre',
    destaque: false,
    cor: 'var(--cinza-borda)',
    itens: [
      'Ate 3 rotas publicadas',
      'Ate 2 guias cadastrados',
      'Painel de reservas basico',
      'Perfil publico da empresa',
      'Suporte por e-mail',
    ],
    cta: 'Comecar gratis',
  },
  {
    nome: 'Pro',
    preco: 'R$ 89',
    periodo: 'por mes',
    destaque: true,
    cor: 'var(--laranja-manga)',
    itens: [
      'Rotas ilimitadas',
      'Guias ilimitados',
      'Painel completo com metricas',
      'Destaque na busca',
      'Relatorio mensal de desempenho',
      'Suporte prioritario',
    ],
    cta: 'Assinar Pro',
    badge: 'Mais popular',
  },
  {
    nome: 'Enterprise',
    preco: 'Sob consulta',
    periodo: '',
    destaque: false,
    cor: 'var(--verde-palmeira)',
    itens: [
      'Tudo do plano Pro',
      'Integracao via API',
      'Gerente de conta dedicado',
      'Treinamento da equipe',
      'SLA garantido',
      'Marca branca',
    ],
    cta: 'Falar com vendas',
  },
];

const DEPOIMENTOS = [
  {
    nome: 'Carlos Mendonca',
    empresa: 'Aventura Chapada Turismo',
    regiao: 'Lencois, BA',
    nota: 5,
    texto: 'Desde que cadastramos nossas rotas no ROTA, o volume de reservas triplicou. A plataforma e intuitiva e o painel de gestao facilita muito o dia a dia da equipe.',
    emoji: '🧭',
  },
  {
    nome: 'Josefa Lima',
    empresa: 'Nordeste Vivo Turismo',
    regiao: 'Jericoacoara, CE',
    nota: 5,
    texto: 'O suporte e excepcional e a visibilidade que o ROTA trouxe para nossa empresa foi incrivel. Recomendo para qualquer empresa de turismo que queira crescer.',
    emoji: '🏖️',
  },
  {
    nome: 'Marcos Tupinamaba',
    empresa: 'Amazonia Ecoturismo',
    regiao: 'Manaus, AM',
    nota: 5,
    texto: 'Conseguimos conectar turistas do Sul e Sudeste com nossas rotas na Amazonia. Sem o ROTA, seria muito dificil ter esse alcance nacional.',
    emoji: '🌿',
  },
];

// ─── Pagina ───────────────────────────────────────────────────

export default function EmpresasPage() {
  return (
    <div className="emp-page">

      {/* ══ HERO ══ */}
      <section className="emp-hero">
        <div className="emp-hero-bg" aria-hidden="true" />
        <div className="container emp-hero-inner">
          <div className="emp-hero-texto">
            <span className="emp-hero-badge">🏢 Para empresas de turismo</span>
            <h1 className="emp-hero-titulo">
              Leve seu negocio para<br/>
              <span className="emp-hero-destaque">milhares de turistas</span>
            </h1>
            <p className="emp-hero-sub">
              Cadastre suas rotas, gerencie guias e receba reservas de turistas de todo o Brasil.
              Tudo em uma plataforma simples, moderna e gratuita para comecar.
            </p>
            <div className="emp-hero-botoes">
              <Link href="/auth/cadastro" className="btn btn-primary emp-btn-lg">
                Cadastrar minha empresa gratis →
              </Link>
              <a href="#como-funciona" className="btn btn-ghost">
                Como funciona
              </a>
            </div>
            <div className="emp-hero-stats">
              {[
                ['200+', 'Rotas publicadas'],
                ['1.200+', 'Turistas ativos'],
                ['4.8★', 'Satisfacao media'],
              ].map(([num, label]) => (
                <div key={label} className="emp-hero-stat">
                  <p className="emp-hero-stat-num">{num}</p>
                  <p className="emp-hero-stat-label">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Card flutuante decorativo */}
          <div className="emp-hero-card">
            <div className="emp-hero-card-header">
              <span style={{ fontSize: '1.5rem' }}>🏢</span>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'white' }}>Seu Painel</p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)' }}>Empresa de turismo</p>
              </div>
            </div>
            {[
              { label: 'Rotas publicadas', valor: '12', cor: 'var(--laranja-manga)' },
              { label: 'Reservas este mes', valor: '47', cor: 'var(--verde-palmeira)' },
              { label: 'Avaliacao media', valor: '4.9★', cor: '#FFB800' },
              { label: 'Receita estimada', valor: 'R$ 42.300', cor: 'var(--azul-turquesa)' },
            ].map(({ label, valor, cor }) => (
              <div key={label} className="emp-hero-card-item">
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>{label}</span>
                <span style={{ fontFamily: 'var(--fonte-display)', fontWeight: 800, fontSize: '1rem', color: cor }}>{valor}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BENEFICIOS ══ */}
      <section className="emp-section">
        <div className="container">
          <div className="emp-secao-header">
            <span className="badge badge-laranja">Por que escolher o ROTA</span>
            <h2>Tudo que sua empresa precisa</h2>
            <div className="divisor-tropical" />
          </div>
          <div className="emp-beneficios-grade">
            {BENEFICIOS.map(({ emoji, titulo, desc, cor }) => (
              <div key={titulo} className="emp-beneficio-card">
                <div className="emp-beneficio-icone" style={{ background: `${cor}18`, border: `1.5px solid ${cor}30` }}>
                  <span style={{ fontSize: '1.75rem' }}>{emoji}</span>
                </div>
                <h3 style={{ fontFamily: 'var(--fonte-display)', fontSize: '1.05rem', marginBottom: '0.5rem' }}>{titulo}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--texto-suave)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ COMO FUNCIONA ══ */}
      <section className="emp-section emp-section-alt" id="como-funciona">
        <div className="container">
          <div className="emp-secao-header">
            <span className="badge badge-verde">Simples e rapido</span>
            <h2>Como funciona</h2>
            <div className="divisor-tropical" />
          </div>
          <div className="emp-passos">
            {COMO_FUNCIONA.map(({ num, titulo, desc }, idx) => (
              <div key={num} className="emp-passo">
                <div className="emp-passo-num">{num}</div>
                {idx < COMO_FUNCIONA.length - 1 && <div className="emp-passo-linha" aria-hidden="true" />}
                <h3 style={{ fontFamily: 'var(--fonte-display)', fontSize: '1rem', marginBottom: '0.4rem', marginTop: '1rem' }}>{titulo}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--texto-suave)', lineHeight: 1.5 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PLANOS ══ */}
      <section className="emp-section">
        <div className="container">
          <div className="emp-secao-header">
            <span className="badge badge-azul">Transparente</span>
            <h2>Planos e precos</h2>
            <div className="divisor-tropical" />
            <p style={{ color: 'var(--texto-suave)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Comece gratis. Escale quando precisar.
            </p>
          </div>
          <div className="emp-planos-grade">
            {PLANOS.map(({ nome, preco, periodo, destaque, cor, itens, cta, badge }) => (
              <div key={nome} className={`emp-plano-card ${destaque ? 'emp-plano-destaque' : ''}`}
                style={{ borderTopColor: cor }}>
                {badge && (
                  <div className="emp-plano-badge" style={{ background: cor }}>{badge}</div>
                )}
                <h3 style={{ fontFamily: 'var(--fonte-display)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{nome}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', margin: '0.75rem 0' }}>
                  <span style={{ fontFamily: 'var(--fonte-display)', fontWeight: 800, fontSize: preco === 'Gratis' || preco === 'Sob consulta' ? '1.5rem' : '2rem', color: destaque ? cor : 'var(--texto-principal)' }}>{preco}</span>
                  {periodo && <span style={{ fontSize: '0.82rem', color: 'var(--texto-suave)' }}>{periodo}</span>}
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', margin: '1.25rem 0', flex: 1 }}>
                  {itens.map(item => (
                    <li key={item} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--texto-secundario)' }}>
                      <span style={{ color: 'var(--verde-palmeira)', flexShrink: 0 }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/cadastro"
                  className={destaque ? 'btn btn-primary' : 'btn btn-outline'}
                  style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: 'var(--texto-suave)' }}>
            * Planos Pro e Enterprise sao recursos futuros. Atualmente todos os recursos estao disponiveis gratuitamente.
          </p>
        </div>
      </section>

      {/* ══ DEPOIMENTOS ══ */}
      <section className="emp-section emp-section-alt">
        <div className="container">
          <div className="emp-secao-header">
            <span className="badge badge-laranja">Quem ja usa</span>
            <h2>O que as empresas dizem</h2>
            <div className="divisor-tropical" />
          </div>
          <div className="emp-depoimentos-grade">
            {DEPOIMENTOS.map(({ nome, empresa, regiao, nota, texto, emoji }) => (
              <div key={nome} className="emp-depoimento-card">
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                  {Array.from({ length: nota }).map((_, i) => (
                    <span key={i} style={{ color: '#FFB800', fontSize: '1rem' }}>★</span>
                  ))}
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--texto-secundario)', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '1.25rem', flex: 1 }}>
                  &ldquo;{texto}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--cinza-borda)' }}>
                  <div style={{ width: '42px', height: '42px', background: 'var(--laranja-manga)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                    {emoji}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.88rem' }}>{nome}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--texto-suave)' }}>{empresa} · {regiao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA FINAL ══ */}
      <section className="emp-cta">
        <div className="container emp-cta-inner">
          <div>
            <h2 className="emp-cta-titulo">Pronto para comecar?</h2>
            <p className="emp-cta-sub">
              Cadastre sua empresa gratuitamente e comece a receber reservas hoje mesmo.
              Sem taxa de adesao, sem contrato de fidelidade.
            </p>
          </div>
          <div className="emp-cta-botoes">
            <Link href="/auth/cadastro" className="btn btn-primary emp-btn-lg">
              Criar conta gratis agora
            </Link>
            <Link href="/contato" className="btn btn-ghost">
              Falar com a equipe
            </Link>
          </div>
        </div>
      </section>

      {/* ══ ESTILOS ══ */}
      <style>{`
        .emp-page { min-height:100vh; padding-top:70px; background:var(--creme-suave); }

        /* Hero */
        .emp-hero {
          position: relative;
          background: linear-gradient(160deg, #1A1A1A 0%, #2D3A2E 55%, #1A2A3A 100%);
          padding: 5rem 0 4rem;
          overflow: hidden;
        }
        .emp-hero-bg {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse at 80% 20%, rgba(255,107,26,0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 10% 80%, rgba(46,204,113,0.12) 0%, transparent 50%);
        }
        .emp-hero-inner {
          position: relative; z-index: 1;
          display: grid; grid-template-columns: 1fr; gap: 3rem; align-items: center;
        }
        @media(min-width:1024px){ .emp-hero-inner { grid-template-columns: 1fr 380px; } }

        .emp-hero-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: rgba(255,107,26,0.15); border: 1px solid rgba(255,107,26,0.3);
          border-radius: var(--radius-full); padding: 0.4rem 1rem;
          font-size: 0.82rem; font-weight: 600; color: var(--laranja-manga);
          letter-spacing: 0.04em; margin-bottom: 1.25rem; display: block; width: fit-content;
        }
        .emp-hero-titulo {
          font-family: var(--fonte-display); font-size: clamp(2rem,5vw,3.2rem);
          color: white; line-height: 1.15; margin-bottom: 1.25rem;
        }
        .emp-hero-destaque { color: var(--laranja-manga); }
        .emp-hero-sub {
          color: rgba(255,255,255,0.7); max-width: 520px; line-height: 1.7;
          font-size: clamp(0.95rem,1.5vw,1.05rem); margin-bottom: 2rem;
        }
        .emp-hero-botoes { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2.5rem; }
        .emp-btn-lg { font-size: 1rem !important; padding: 0.9rem 2rem !important; }

        .emp-hero-stats { display: flex; gap: 2rem; flex-wrap: wrap; }
        .emp-hero-stat { display: flex; flex-direction: column; gap: 0.1rem; }
        .emp-hero-stat-num { font-family: var(--fonte-display); font-weight: 800; font-size: 1.4rem; color: var(--laranja-manga); }
        .emp-hero-stat-label { font-size: 0.78rem; color: rgba(255,255,255,0.5); }

        /* Card hero */
        .emp-hero-card {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
          border-radius: var(--radius-xl);
          border: 1px solid rgba(255,255,255,0.12);
          padding: 1.5rem;
          display: none;
        }
        @media(min-width:1024px){ .emp-hero-card { display: block; } }
        .emp-hero-card-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .emp-hero-card-item { display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .emp-hero-card-item:last-child { border-bottom: none; }

        /* Sections */
        .emp-section { padding: 5rem 0; }
        .emp-section-alt { background: var(--creme-medio); }
        .emp-secao-header { text-align: center; margin-bottom: 3rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
        .emp-secao-header h2 { margin-top: 0.25rem; }

        /* Beneficios */
        .emp-beneficios-grade { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
        @media(min-width:640px){ .emp-beneficios-grade { grid-template-columns: repeat(2,1fr); } }
        @media(min-width:1024px){ .emp-beneficios-grade { grid-template-columns: repeat(3,1fr); } }
        .emp-beneficio-card {
          background: var(--branco-puro); border-radius: var(--radius-lg);
          padding: 1.75rem; box-shadow: var(--sombra-sm);
          transition: all var(--transicao);
        }
        .emp-beneficio-card:hover { box-shadow: var(--sombra-md); transform: translateY(-4px); }
        .emp-beneficio-icone {
          width: 56px; height: 56px; border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1rem;
        }

        /* Como funciona */
        .emp-passos { display: grid; grid-template-columns: 1fr; gap: 2rem; position: relative; }
        @media(min-width:768px){ .emp-passos { grid-template-columns: repeat(4,1fr); gap: 0; } }
        .emp-passo { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 0 1rem; position: relative; }
        .emp-passo-num {
          width: 56px; height: 56px; border-radius: 50%;
          background: var(--laranja-manga); color: white;
          font-family: var(--fonte-display); font-weight: 800; font-size: 1.1rem;
          display: flex; align-items: center; justify-content: center;
          box-shadow: var(--sombra-laranja); flex-shrink: 0; z-index: 1;
        }
        .emp-passo-linha {
          display: none;
          position: absolute; top: 28px; left: calc(50% + 28px);
          width: calc(100% - 56px); height: 2px;
          background: linear-gradient(90deg, var(--laranja-manga), var(--cinza-borda));
        }
        @media(min-width:768px){ .emp-passo-linha { display: block; } }

        /* Planos */
        .emp-planos-grade { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
        @media(min-width:768px){ .emp-planos-grade { grid-template-columns: repeat(3,1fr); } }
        .emp-plano-card {
          background: var(--branco-puro); border-radius: var(--radius-lg);
          padding: 2rem; box-shadow: var(--sombra-sm);
          border-top: 4px solid; display: flex; flex-direction: column;
          position: relative; transition: all var(--transicao);
        }
        .emp-plano-card:hover { box-shadow: var(--sombra-md); transform: translateY(-4px); }
        .emp-plano-destaque { box-shadow: var(--sombra-lg); transform: scale(1.02); }
        .emp-plano-destaque:hover { transform: scale(1.02) translateY(-4px); }
        .emp-plano-badge {
          position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
          color: white; padding: 0.2rem 1rem; border-radius: var(--radius-full);
          font-size: 0.75rem; font-weight: 800; white-space: nowrap; letter-spacing: 0.04em;
        }

        /* Depoimentos */
        .emp-depoimentos-grade { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
        @media(min-width:640px){ .emp-depoimentos-grade { grid-template-columns: repeat(3,1fr); } }
        .emp-depoimento-card {
          background: var(--branco-puro); border-radius: var(--radius-lg);
          padding: 1.75rem; box-shadow: var(--sombra-sm);
          display: flex; flex-direction: column;
        }

        /* CTA */
        .emp-cta {
          padding: 5rem 0;
          background: linear-gradient(135deg, #1A3A2A 0%, #1A1A1A 100%);
        }
        .emp-cta-inner {
          display: flex; flex-direction: column; gap: 2rem; align-items: flex-start;
        }
        @media(min-width:768px){ .emp-cta-inner { flex-direction: row; align-items: center; justify-content: space-between; } }
        .emp-cta-titulo {
          font-family: var(--fonte-display); font-size: clamp(1.5rem,3vw,2rem); color: white; margin-bottom: 0.75rem;
        }
        .emp-cta-sub { color: rgba(255,255,255,0.65); font-size: 0.95rem; line-height: 1.6; max-width: 480px; }
        .emp-cta-botoes { display: flex; gap: 1rem; flex-wrap: wrap; flex-shrink: 0; }
      `}</style>
    </div>
  );
}