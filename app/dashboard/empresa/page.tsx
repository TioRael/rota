'use client';
// app/dashboard/empresa/page.tsx
// Painel da empresa: stats, rotas, guias e reservas recebidas.

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ─── Tipos ────────────────────────────────────────────────────

interface Empresa  { ID_EMPRESA: number; RAZAO_SOCIAL: string; CNPJ: string; }
interface Stats    { TOTAL_ROTAS: number; TOTAL_GUIAS: number; TOTAL_RESERVAS: number; MEDIA_AVALIACAO: number | null; }
interface Rota     { ID_ROTA: number; NOME: string; CATEGORIA: string | null; DURACAO: string | null; DATA_CADASTRO: string; TOTAL_RESERVAS: number; }
interface Guia     { ID_GUIA: number; NOME: string; IDIOMAS: string | null; CPF: string; }
interface Reserva  { ID_RESERVA_ROTA: number; NOME_ROTA: string; NOME_TURISTA: string; DATA_PASSEIO: string; QTD_PESSOAS: number; STATUS: string; VALOR_TOTAL: number; }

interface DadosEmpresa { empresa: Empresa; stats: Stats; rotas: Rota[]; guias: Guia[]; reservas: Reserva[]; }

// ─── Helpers ──────────────────────────────────────────────────

function formatarData(data: string) {
  return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}
function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function formatarCNPJ(cnpj: string) {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}
function corStatus(status: string) {
  const m: Record<string,string> = { PENDENTE: 'status-pendente', CONFIRMADA: 'status-confirmada', CANCELADA: 'status-cancelada', CONCLUIDA: 'status-concluida' };
  return m[status] ?? 'status-pendente';
}

// ─── Componente principal ─────────────────────────────────────

export default function DashboardEmpresaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dados,      setDados]      = useState<DadosEmpresa | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro,       setErro]       = useState<string | null>(null);
  const [aba,        setAba]        = useState<'rotas' | 'guias' | 'reservas'>('rotas');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
    if (status === 'authenticated' && session?.user.tipo === 'TURISTA') router.push('/dashboard/turista');
  }, [status, session, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/dashboard/empresa')
      .then(r => r.json())
      .then(data => { if (data.error) setErro(data.error); else setDados(data); })
      .catch(() => setErro('Erro ao carregar dados.'))
      .finally(() => setCarregando(false));
  }, [status]);

  if (status === 'loading' || carregando) return <EmpresaSkeleton />;
  if (erro) return <div style={{ padding: '5rem 1rem', textAlign: 'center', color: 'var(--texto-suave)' }}>⚠️ {erro}<EmpresaStyles /></div>;
  if (!dados) return null;

  const { empresa, stats, rotas, guias, reservas } = dados;

  return (
    <div className="db-page">

      {/* ── Header ── */}
      <div className="db-header db-header-empresa">
        <div className="container">
          <div className="db-header-inner">
            <div>
              <p className="db-header-label">Painel da Empresa</p>
              <h1 className="db-header-titulo">{empresa.RAZAO_SOCIAL} 🏢</h1>
              <p className="db-cnpj">CNPJ: {formatarCNPJ(empresa.CNPJ)}</p>
            </div>
            <Link href="/perfil" className="btn btn-outline btn-sm db-btn-perfil">
              ✏️ Editar perfil
            </Link>
          </div>

          {/* Stats */}
          <div className="db-stats">
            {[
              { valor: stats.TOTAL_ROTAS,                                    label: 'Rotas cadastradas', cor: 'var(--laranja-manga)'  },
              { valor: stats.TOTAL_GUIAS,                                    label: 'Guias ativos',      cor: 'var(--verde-palmeira)' },
              { valor: stats.TOTAL_RESERVAS,                                 label: 'Reservas recebidas',cor: 'var(--azul-turquesa)'  },
              { valor: stats.MEDIA_AVALIACAO ? stats.MEDIA_AVALIACAO + '★' : '—', label: 'Avaliação média', cor: 'var(--laranja-manga)' },
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

        {/* ── Abas ── */}
        <div className="db-abas">
          {([
            ['rotas',    `🗺️ Rotas (${rotas.length})`],
            ['guias',    `🧭 Guias (${guias.length})`],
            ['reservas', `📅 Reservas (${reservas.length})`],
          ] as const).map(([key, label]) => (
            <button key={key} className={`db-aba ${aba === key ? 'db-aba-ativa' : ''}`} onClick={() => setAba(key)}>
              {label}
            </button>
          ))}
        </div>

        {/* ── ABA: Rotas ── */}
        {aba === 'rotas' && (
          <div className="db-secao">
            <div className="db-secao-header">
              <h3 className="db-secao-titulo">Suas rotas</h3>
              <Link href="/empresas/painel/rotas/nova" className="btn btn-primary btn-sm">+ Nova rota</Link>
            </div>
            {rotas.length > 0 ? (
              <div className="db-lista">
                {rotas.map(r => (
                  <div key={r.ID_ROTA} className="db-item">
                    <div className="db-item-icone">🗺️</div>
                    <div className="db-item-corpo">
                      <p className="db-item-titulo">{r.NOME}</p>
                      <p className="db-item-sub">
                        {r.CATEGORIA && <span className="badge badge-verde" style={{ fontSize: '0.72rem' }}>{r.CATEGORIA}</span>}
                        {r.DURACAO && <> · {r.DURACAO}</>}
                        · Cadastrada em {formatarData(r.DATA_CADASTRO)}
                      </p>
                    </div>
                    <div className="db-item-direita">
                      <p className="db-item-valor">{r.TOTAL_RESERVAS} reserva{r.TOTAL_RESERVAS !== 1 ? 's' : ''}</p>
                      <Link href={`/empresas/painel/rotas/${r.ID_ROTA}`} className="btn btn-outline btn-sm">Editar</Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="db-vazio">
                <p>🗺️</p>
                <p>Nenhuma rota cadastrada ainda.</p>
                <Link href="/empresas/painel/rotas/nova" className="btn btn-primary btn-sm">Cadastrar primeira rota</Link>
              </div>
            )}
          </div>
        )}

        {/* ── ABA: Guias ── */}
        {aba === 'guias' && (
          <div className="db-secao">
            <div className="db-secao-header">
              <h3 className="db-secao-titulo">Seus guias</h3>
              <Link href="/empresas/painel/guias/novo" className="btn btn-primary btn-sm">+ Novo guia</Link>
            </div>
            {guias.length > 0 ? (
              <div className="db-lista">
                {guias.map(g => (
                  <div key={g.ID_GUIA} className="db-item">
                    <div className="db-item-icone db-guia-avatar">
                      {g.NOME[0].toUpperCase()}
                    </div>
                    <div className="db-item-corpo">
                      <p className="db-item-titulo">{g.NOME}</p>
                      <p className="db-item-sub">
                        CPF: {g.CPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                        {g.IDIOMAS && <> · 🌐 {g.IDIOMAS}</>}
                      </p>
                    </div>
                    <Link href={`/empresas/painel/guias/${g.ID_GUIA}`} className="btn btn-outline btn-sm">Editar</Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="db-vazio">
                <p>🧭</p>
                <p>Nenhum guia cadastrado ainda.</p>
                <Link href="/empresas/painel/guias/novo" className="btn btn-primary btn-sm">Cadastrar guia</Link>
              </div>
            )}
          </div>
        )}

        {/* ── ABA: Reservas ── */}
        {aba === 'reservas' && (
          <div className="db-secao">
            <h3 className="db-secao-titulo">Reservas recebidas</h3>
            {reservas.length > 0 ? (
              <div className="db-lista">
                {reservas.map(r => (
                  <div key={r.ID_RESERVA_ROTA} className="db-item">
                    <div className="db-item-icone">📅</div>
                    <div className="db-item-corpo">
                      <p className="db-item-titulo">{r.NOME_ROTA}</p>
                      <p className="db-item-sub">
                        👤 {r.NOME_TURISTA} · {formatarData(r.DATA_PASSEIO)} · {r.QTD_PESSOAS} pessoa{r.QTD_PESSOAS > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="db-item-direita">
                      <p className="db-item-valor">{formatarMoeda(r.VALOR_TOTAL)}</p>
                      <span className={`status-badge ${corStatus(r.STATUS)}`}>{r.STATUS}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="db-vazio">
                <p>📅</p>
                <p>Nenhuma reserva recebida ainda.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <EmpresaStyles />
    </div>
  );
}

function EmpresaSkeleton() {
  return (
    <div className="db-page" style={{ paddingTop: '70px' }}>
      <div className="db-header db-header-empresa" style={{ minHeight: '200px' }}>
        <div className="container">
          <div className="db-skeleton" style={{ width: '260px', height: '32px', marginBottom: '1rem' }} />
          <div className="db-stats">
            {[1,2,3,4].map(i => <div key={i} className="db-skeleton" style={{ height: '80px', borderRadius: '12px' }} />)}
          </div>
        </div>
      </div>
      <div className="container db-body">
        {[1,2,3].map(i => <div key={i} className="db-skeleton" style={{ height: '64px', borderRadius: '12px', marginBottom: '0.75rem' }} />)}
      </div>
      <EmpresaStyles />
    </div>
  );
}

function EmpresaStyles() {
  return (
    <style>{`
      .db-page { min-height: 100vh; padding-top: 70px; background: var(--creme-suave); }
      .db-header { padding: 2.5rem 0 1.5rem; }
      .db-header-empresa { background: linear-gradient(135deg, #1A2A3A 0%, #1A1A1A 100%); }
      .db-header-inner { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
      .db-header-label { font-size: 0.8rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.25rem; }
      .db-header-titulo { font-family: var(--fonte-display); font-size: clamp(1.4rem, 3vw, 1.9rem); color: white; }
      .db-cnpj { font-size: 0.82rem; color: rgba(255,255,255,0.45); margin-top: 0.25rem; }
      .db-btn-perfil { font-size: 0.82rem !important; padding: 0.45rem 1rem !important; border-color: rgba(255,255,255,0.3) !important; color: rgba(255,255,255,0.8) !important; }
      .db-btn-perfil:hover { background: rgba(255,255,255,0.1) !important; }

      .db-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
      @media(min-width:640px){ .db-stats { grid-template-columns: repeat(4, 1fr); } }
      .db-stat-card { background: rgba(255,255,255,0.07); border-radius: var(--radius-md); padding: 1rem; border-top: 3px solid; }
      .db-stat-num { font-family: var(--fonte-display); font-size: 1.6rem; font-weight: 800; line-height: 1; }
      .db-stat-label { font-size: 0.78rem; color: rgba(255,255,255,0.55); margin-top: 0.25rem; }

      .db-body { padding: 2rem 1.5rem 4rem; display: flex; flex-direction: column; gap: 1.5rem; }

      .db-abas { display: flex; gap: 0.5rem; border-bottom: 2px solid var(--cinza-borda); flex-wrap: wrap; }
      .db-aba { background: none; border: none; padding: 0.75rem 1.25rem; font-family: var(--fonte-corpo); font-size: 0.9rem; font-weight: 600; color: var(--texto-suave); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all var(--transicao); }
      .db-aba-ativa { color: var(--laranja-manga); border-bottom-color: var(--laranja-manga); }
      .db-aba:hover:not(.db-aba-ativa) { color: var(--texto-principal); }

      .db-secao { display: flex; flex-direction: column; gap: 0.75rem; }
      .db-secao-header { display: flex; justify-content: space-between; align-items: center; }
      .db-secao-titulo { font-size: 0.82rem; font-weight: 700; color: var(--texto-suave); text-transform: uppercase; letter-spacing: 0.06em; }

      .db-lista { display: flex; flex-direction: column; gap: 0.5rem; }
      .db-item { background: var(--branco-puro); border-radius: var(--radius-md); padding: 1rem 1.25rem; box-shadow: var(--sombra-sm); display: flex; align-items: center; gap: 1rem; transition: box-shadow var(--transicao); }
      .db-item:hover { box-shadow: var(--sombra-md); }
      .db-item-icone { font-size: 1.5rem; flex-shrink: 0; }
      .db-guia-avatar { font-size: 1rem !important; width: 38px; height: 38px; background: var(--laranja-manga); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; }
      .db-item-corpo { flex: 1; min-width: 0; }
      .db-item-titulo { font-weight: 700; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .db-item-sub { font-size: 0.82rem; color: var(--texto-suave); margin-top: 0.2rem; display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap; }
      .db-item-direita { display: flex; flex-direction: column; align-items: flex-end; gap: 0.4rem; flex-shrink: 0; }
      .db-item-valor { font-family: var(--fonte-display); font-weight: 800; font-size: 0.95rem; color: var(--laranja-manga); }

      .status-badge { font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: var(--radius-full); text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap; }
      .status-pendente   { background: #FFFBEB; color: #92400E; }
      .status-confirmada { background: var(--verde-palmeira-light); color: var(--verde-palmeira-dark); }
      .status-cancelada  { background: #FEF2F2; color: #B91C1C; }
      .status-concluida  { background: var(--azul-turquesa-light); color: var(--azul-turquesa-hover); }

      .db-vazio { text-align: center; padding: 3rem 1rem; color: var(--texto-suave); display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
      .db-vazio p:first-child { font-size: 2.5rem; }

      .db-skeleton { background: linear-gradient(90deg, var(--cinza-borda) 25%, var(--cinza-claro) 50%, var(--cinza-borda) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: var(--radius-md); }
      @keyframes shimmer { to { background-position: -200% 0; } }
    `}</style>
  );
}