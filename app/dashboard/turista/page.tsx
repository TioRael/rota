'use client';
// app/dashboard/turista/page.tsx
// Painel do turista: reservas, avaliações e acesso rápido.
// Client Component — busca dados da API /api/dashboard/turista.

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ─── Tipos ────────────────────────────────────────────────────

interface ReservaAcomodacao {
  ID_RESERVA:    number;
  NOME_HOTEL:    string;
  DATA_CHECKIN:  string;
  DATA_CHECKOUT: string;
  QTD_HOSPEDES:  number;
  STATUS:        string;
  VALOR_TOTAL:   number;
}

interface ReservaRota {
  ID_RESERVA_ROTA: number;
  NOME_ROTA:       string;
  DATA_PASSEIO:    string;
  QTD_PESSOAS:     number;
  STATUS:          string;
  VALOR_TOTAL:     number;
  CATEGORIA:       string | null;
}

interface Avaliacao {
  ID_AVALIACAO:   number;
  NOTA:           number;
  COMENTARIO:     string | null;
  DATA_AVALIACAO: string;
  ALVO:           string;
  TIPO:           'ROTA' | 'ACOMODACAO';
}

interface DadosTurista {
  reservasAcomodacao: ReservaAcomodacao[];
  reservasRotas:      ReservaRota[];
  avaliacoes:         Avaliacao[];
}

// ─── Helpers ──────────────────────────────────────────────────

function formatarData(data: string) {
  return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function corStatus(status: string) {
  const mapa: Record<string, string> = {
    PENDENTE:   'status-pendente',
    CONFIRMADA: 'status-confirmada',
    CANCELADA:  'status-cancelada',
    CONCLUIDA:  'status-concluida',
  };
  return mapa[status] ?? 'status-pendente';
}

function Estrelas({ nota }: { nota: number }) {
  return (
    <span className="estrelas">
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= nota ? 'var(--laranja-manga)' : 'var(--cinza-borda)', fontSize: '1rem' }}>★</span>
      ))}
    </span>
  );
}

// ─── Componente principal ─────────────────────────────────────

export default function DashboardTuristaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dados,      setDados]      = useState<DadosTurista | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro,       setErro]       = useState<string | null>(null);
  const [aba,        setAba]        = useState<'reservas' | 'avaliacoes'>('reservas');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/dashboard/turista')
      .then(r => r.json())
      .then(data => {
        if (data.error) setErro(data.error);
        else setDados(data);
      })
      .catch(() => setErro('Erro ao carregar dados.'))
      .finally(() => setCarregando(false));
  }, [status]);

  if (status === 'loading' || carregando) return <DashboardSkeleton />;
  if (erro) return <DashboardErro mensagem={erro} />;
  if (!session || !dados) return null;

  const primeiroNome = session.user.name.split(' ')[0];
  const totalReservas = dados.reservasAcomodacao.length + dados.reservasRotas.length;
  const proximaReservaRota = dados.reservasRotas.find(r => r.STATUS === 'CONFIRMADA' || r.STATUS === 'PENDENTE');

  return (
    <div className="db-page">

      {/* ── Header ── */}
      <div className="db-header">
        <div className="container">
          <div className="db-header-inner">
            <div>
              <p className="db-header-label">Painel do Turista</p>
              <h1 className="db-header-titulo">Olá, {primeiroNome}! 🧳</h1>
            </div>
            <Link href="/perfil" className="btn btn-outline btn-sm db-btn-perfil">
              ✏️ Editar perfil
            </Link>
          </div>

          {/* Stats rápidos */}
          <div className="db-stats">
            {[
              { valor: totalReservas,             label: 'Reservas totais',    cor: 'var(--laranja-manga)'  },
              { valor: dados.reservasRotas.length, label: 'Passeios feitos',   cor: 'var(--verde-palmeira)' },
              { valor: dados.avaliacoes.length,    label: 'Avaliações',        cor: 'var(--azul-turquesa)'  },
              {
                valor: dados.avaliacoes.length > 0
                  ? (dados.avaliacoes.reduce((s, a) => s + a.NOTA, 0) / dados.avaliacoes.length).toFixed(1) + '★'
                  : '—',
                label: 'Sua nota média', cor: 'var(--laranja-manga)',
              },
            ].map(({ valor, label, cor }) => (
              <div key={label} className="db-stat-card" style={{ borderTopColor: cor }}>
                <p className="db-stat-num" style={{ color: cor }}>{valor}</p>
                <p className="db-stat-label">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container db-body">

        {/* ── Próximo passeio (destaque) ── */}
        {proximaReservaRota && (
          <div className="db-destaque-card">
            <div>
              <span className="badge badge-verde">Próximo passeio</span>
              <h2 className="db-destaque-titulo">{proximaReservaRota.NOME_ROTA}</h2>
              <p className="db-destaque-info">
                📅 {formatarData(proximaReservaRota.DATA_PASSEIO)} &nbsp;·&nbsp;
                👥 {proximaReservaRota.QTD_PESSOAS} pessoa{proximaReservaRota.QTD_PESSOAS > 1 ? 's' : ''} &nbsp;·&nbsp;
                {formatarMoeda(proximaReservaRota.VALOR_TOTAL)}
              </p>
            </div>
            <span className={`status-badge ${corStatus(proximaReservaRota.STATUS)}`}>
              {proximaReservaRota.STATUS}
            </span>
          </div>
        )}

        {/* ── Abas ── */}
        <div className="db-abas">
          <button
            className={`db-aba ${aba === 'reservas' ? 'db-aba-ativa' : ''}`}
            onClick={() => setAba('reservas')}
          >
            📅 Reservas ({totalReservas})
          </button>
          <button
            className={`db-aba ${aba === 'avaliacoes' ? 'db-aba-ativa' : ''}`}
            onClick={() => setAba('avaliacoes')}
          >
            ⭐ Avaliações ({dados.avaliacoes.length})
          </button>
        </div>

        {/* ── Conteúdo das abas ── */}
        {aba === 'reservas' && (
          <div className="db-secao">

            {/* Reservas de rotas */}
            {dados.reservasRotas.length > 0 && (
              <>
                <h3 className="db-secao-titulo">Passeios e Rotas</h3>
                <div className="db-lista">
                  {dados.reservasRotas.map(r => (
                    <div key={r.ID_RESERVA_ROTA} className="db-item">
                      <div className="db-item-icone">🗺️</div>
                      <div className="db-item-corpo">
                        <p className="db-item-titulo">{r.NOME_ROTA}</p>
                        <p className="db-item-sub">
                          {formatarData(r.DATA_PASSEIO)} · {r.QTD_PESSOAS} pessoa{r.QTD_PESSOAS > 1 ? 's' : ''}
                          {r.CATEGORIA && <> · <span className="badge badge-verde" style={{ fontSize: '0.72rem' }}>{r.CATEGORIA}</span></>}
                        </p>
                      </div>
                      <div className="db-item-direita">
                        <p className="db-item-valor">{formatarMoeda(r.VALOR_TOTAL)}</p>
                        <span className={`status-badge ${corStatus(r.STATUS)}`}>{r.STATUS}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Reservas de acomodação */}
            {dados.reservasAcomodacao.length > 0 && (
              <>
                <h3 className="db-secao-titulo" style={{ marginTop: '2rem' }}>Hospedagens</h3>
                <div className="db-lista">
                  {dados.reservasAcomodacao.map(r => (
                    <div key={r.ID_RESERVA} className="db-item">
                      <div className="db-item-icone">🏨</div>
                      <div className="db-item-corpo">
                        <p className="db-item-titulo">{r.NOME_HOTEL}</p>
                        <p className="db-item-sub">
                          {formatarData(r.DATA_CHECKIN)} → {formatarData(r.DATA_CHECKOUT)} · {r.QTD_HOSPEDES} hóspede{r.QTD_HOSPEDES > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="db-item-direita">
                        <p className="db-item-valor">{formatarMoeda(r.VALOR_TOTAL)}</p>
                        <span className={`status-badge ${corStatus(r.STATUS)}`}>{r.STATUS}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {totalReservas === 0 && (
              <div className="db-vazio">
                <p>🗺️</p>
                <p>Você ainda não tem reservas.</p>
                <Link href="/rotas" className="btn btn-primary btn-sm">Explorar rotas</Link>
              </div>
            )}
          </div>
        )}

        {aba === 'avaliacoes' && (
          <div className="db-secao">
            {dados.avaliacoes.length > 0 ? (
              <div className="db-lista">
                {dados.avaliacoes.map(av => (
                  <div key={av.ID_AVALIACAO} className="db-item db-item-avaliacao">
                    <div className="db-item-icone">{av.TIPO === 'ROTA' ? '🗺️' : '🏨'}</div>
                    <div className="db-item-corpo">
                      <div className="db-aval-header">
                        <p className="db-item-titulo">{av.ALVO}</p>
                        <Estrelas nota={av.NOTA} />
                      </div>
                      {av.COMENTARIO && <p className="db-aval-comentario">&quot;{av.COMENTARIO}&quot;</p>}
                      <p className="db-item-sub">{formatarData(av.DATA_AVALIACAO)} · {av.TIPO === 'ROTA' ? 'Rota' : 'Acomodação'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="db-vazio">
                <p>⭐</p>
                <p>Você ainda não fez nenhuma avaliação.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Acesso rápido ── */}
        <div className="db-acesso-rapido">
          <h3 className="db-secao-titulo">Acesso rápido</h3>
          <div className="db-acoes">
            {[
              { href: '/rotas',        icone: '🗺️', label: 'Explorar Rotas'   },
              { href: '/hoteis',       icone: '🏨', label: 'Buscar Hotéis'    },
              { href: '/restaurantes', icone: '🍽️', label: 'Restaurantes'     },
              { href: '/perfil',       icone: '👤', label: 'Meu Perfil'       },
            ].map(({ href, icone, label }) => (
              <Link key={href} href={href} className="db-acao-btn">
                <span>{icone}</span>
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <DashboardStyles />
    </div>
  );
}

// ─── Skeleton de carregamento ─────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="db-page" style={{ paddingTop: '70px' }}>
      <div className="db-header" style={{ minHeight: '180px' }}>
        <div className="container">
          <div className="db-skeleton" style={{ width: '200px', height: '32px', marginBottom: '1rem' }} />
          <div className="db-stats">
            {[1,2,3,4].map(i => <div key={i} className="db-skeleton" style={{ height: '80px', borderRadius: '12px' }} />)}
          </div>
        </div>
      </div>
      <div className="container db-body">
        {[1,2,3].map(i => <div key={i} className="db-skeleton" style={{ height: '64px', borderRadius: '12px', marginBottom: '0.75rem' }} />)}
      </div>
      <DashboardStyles />
    </div>
  );
}

function DashboardErro({ mensagem }: { mensagem: string }) {
  return (
    <div className="db-page" style={{ paddingTop: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ fontSize: '2rem' }}>⚠️</p>
        <p style={{ color: 'var(--texto-suave)', marginTop: '0.5rem' }}>{mensagem}</p>
      </div>
      <DashboardStyles />
    </div>
  );
}

// ─── Estilos do dashboard ─────────────────────────────────────
function DashboardStyles() {
  return (
    <style>{`
      .db-page { min-height: 100vh; padding-top: 70px; background: var(--creme-suave); }

      /* Header */
      .db-header { background: linear-gradient(135deg, #1A1A1A 0%, #2D3A2E 100%); padding: 2.5rem 0 1.5rem; }
      .db-header-inner { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
      .db-header-label { font-size: 0.8rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.25rem; }
      .db-header-titulo { font-family: var(--fonte-display); font-size: clamp(1.5rem, 3vw, 2rem); color: white; }
      .db-btn-perfil { font-size: 0.82rem !important; padding: 0.45rem 1rem !important; border-color: rgba(255,255,255,0.3) !important; color: rgba(255,255,255,0.8) !important; }
      .db-btn-perfil:hover { background: rgba(255,255,255,0.1) !important; }

      /* Stats */
      .db-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
      @media(min-width:640px){ .db-stats { grid-template-columns: repeat(4, 1fr); } }
      .db-stat-card { background: rgba(255,255,255,0.07); border-radius: var(--radius-md); padding: 1rem; border-top: 3px solid; }
      .db-stat-num { font-family: var(--fonte-display); font-size: 1.6rem; font-weight: 800; line-height: 1; }
      .db-stat-label { font-size: 0.78rem; color: rgba(255,255,255,0.55); margin-top: 0.25rem; }

      /* Body */
      .db-body { padding: 2rem 1.5rem 4rem; display: flex; flex-direction: column; gap: 1.5rem; }

      /* Card destaque */
      .db-destaque-card { background: var(--branco-puro); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: var(--sombra-sm); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; border-left: 4px solid var(--laranja-manga); }
      .db-destaque-titulo { font-family: var(--fonte-display); font-size: 1.2rem; margin: 0.4rem 0; }
      .db-destaque-info { font-size: 0.88rem; color: var(--texto-suave); display: flex; align-items: center; flex-wrap: wrap; gap: 0.25rem; }

      /* Abas */
      .db-abas { display: flex; gap: 0.5rem; border-bottom: 2px solid var(--cinza-borda); }
      .db-aba { background: none; border: none; padding: 0.75rem 1.25rem; font-family: var(--fonte-corpo); font-size: 0.9rem; font-weight: 600; color: var(--texto-suave); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all var(--transicao); }
      .db-aba-ativa { color: var(--laranja-manga); border-bottom-color: var(--laranja-manga); }
      .db-aba:hover:not(.db-aba-ativa) { color: var(--texto-principal); }

      /* Seção */
      .db-secao { display: flex; flex-direction: column; gap: 0.75rem; }
      .db-secao-titulo { font-size: 0.82rem; font-weight: 700; color: var(--texto-suave); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.25rem; }

      /* Lista de itens */
      .db-lista { display: flex; flex-direction: column; gap: 0.5rem; }
      .db-item { background: var(--branco-puro); border-radius: var(--radius-md); padding: 1rem 1.25rem; box-shadow: var(--sombra-sm); display: flex; align-items: center; gap: 1rem; transition: box-shadow var(--transicao); }
      .db-item:hover { box-shadow: var(--sombra-md); }
      .db-item-icone { font-size: 1.5rem; flex-shrink: 0; }
      .db-item-corpo { flex: 1; min-width: 0; }
      .db-item-titulo { font-weight: 700; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .db-item-sub { font-size: 0.82rem; color: var(--texto-suave); margin-top: 0.2rem; display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap; }
      .db-item-direita { display: flex; flex-direction: column; align-items: flex-end; gap: 0.3rem; flex-shrink: 0; }
      .db-item-valor { font-family: var(--fonte-display); font-weight: 800; font-size: 0.95rem; color: var(--laranja-manga); }

      /* Avaliações */
      .db-item-avaliacao { align-items: flex-start; }
      .db-aval-header { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
      .db-aval-comentario { font-size: 0.88rem; color: var(--texto-secundario); font-style: italic; margin-top: 0.35rem; line-height: 1.4; }

      /* Status badges */
      .status-badge { font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: var(--radius-full); text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap; }
      .status-pendente   { background: #FFFBEB; color: #92400E; }
      .status-confirmada { background: var(--verde-palmeira-light); color: var(--verde-palmeira-dark); }
      .status-cancelada  { background: #FEF2F2; color: #B91C1C; }
      .status-concluida  { background: var(--azul-turquesa-light); color: var(--azul-turquesa-hover); }

      /* Acesso rápido */
      .db-acesso-rapido { margin-top: 0.5rem; }
      .db-acoes { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-top: 0.75rem; }
      @media(min-width:640px){ .db-acoes { grid-template-columns: repeat(4, 1fr); } }
      .db-acao-btn { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1.25rem 1rem; background: var(--branco-puro); border-radius: var(--radius-lg); box-shadow: var(--sombra-sm); text-decoration: none; font-size: 0.88rem; font-weight: 700; color: var(--texto-principal); transition: all var(--transicao); border: 2px solid transparent; }
      .db-acao-btn span:first-child { font-size: 1.75rem; }
      .db-acao-btn:hover { border-color: var(--laranja-manga); transform: translateY(-3px); box-shadow: var(--sombra-md); color: var(--texto-principal); }

      /* Vazio */
      .db-vazio { text-align: center; padding: 3rem 1rem; color: var(--texto-suave); display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
      .db-vazio p:first-child { font-size: 2.5rem; }

      /* Skeleton */
      .db-skeleton { background: linear-gradient(90deg, var(--cinza-borda) 25%, var(--cinza-claro) 50%, var(--cinza-borda) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: var(--radius-md); }
      @keyframes shimmer { to { background-position: -200% 0; } }
    `}</style>
  );
}