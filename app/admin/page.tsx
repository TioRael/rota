'use client';
// app/admin/page.tsx — Painel administrativo completo
// Protegido via proxy.ts — apenas usuarios com TIPO = 'ADMIN' chegam aqui

import { useState, useEffect, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// ─── Tipos ───────────────────────────────────────────────────
interface Stats {
  TOTAL_USUARIOS: number; TOTAL_TURISTAS: number; TOTAL_EMPRESAS: number;
  TOTAL_ROTAS: number; TOTAL_HOTEIS: number; TOTAL_RESTAURANTES: number;
  TOTAL_RESERVAS_ROTAS: number; TOTAL_RESERVAS_HOTEIS: number;
  RECEITA_ROTAS: number|null; RECEITA_HOTEIS: number|null;
  TOTAL_AVALIACOES: number; MEDIA_AVALIACOES: number|null;
}
interface Crescimento { MES: string; NOVOS_USUARIOS: number; }
interface Usuario { ID_USUARIO: number; NOME: string; EMAIL: string; TIPO: string; DATA_CADASTRO: string; RAZAO_SOCIAL: string|null; TOTAL_RESERVAS: number; }
interface Reserva { ID: number; TIPO: string; NOME_ITEM: string; NOME_USUARIO: string; DATA_EVENTO: string; QTD: number; STATUS: string; VALOR_TOTAL: number; DATA_RESERVA: string; }
interface Avaliacao { ID_AVALIACAO: number; NOTA: number; COMENTARIO: string|null; DATA_AVALIACAO: string; NOME_USUARIO: string; ALVO: string; TIPO: string; }
interface Paginacao { total: number; page: number; totalPaginas: number; }

// ─── Helpers ─────────────────────────────────────────────────
const moeda = (v: number|null) => (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const data  = (d: string) => new Date(d).toLocaleDateString('pt-BR');

function corStatus(s: string) {
  const m: Record<string,string> = { PENDENTE:'#92400E', CONFIRMADA:'#1A8A4A', CANCELADA:'#B91C1C', CONCLUIDA:'#0097A7', INATIVO:'#B91C1C' };
  const bg: Record<string,string> = { PENDENTE:'#FFFBEB', CONFIRMADA:'#E8FAF1', CANCELADA:'#FEF2F2', CONCLUIDA:'#E0F7FA', INATIVO:'#FEF2F2' };
  return { color: m[s]??'#555', background: bg[s]??'#F5F5F0', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.04em', whiteSpace: 'nowrap' as const };
}

function Estrelas({ n }: { n: number }) {
  return <span>{[1,2,3,4,5].map(i=><span key={i} style={{color:i<=n?'#FFB800':'var(--cinza-borda)',fontSize:'0.9rem'}}>★</span>)}</span>;
}

// ─── Componente principal ─────────────────────────────────────
export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Abas
  const [aba, setAba] = useState<'stats'|'usuarios'|'reservas'|'avaliacoes'>('stats');

  // Stats
  const [stats,       setStats]       = useState<Stats|null>(null);
  const [crescimento, setCrescimento] = useState<Crescimento[]>([]);

  // Usuarios
  const [usuarios,    setUsuarios]    = useState<Usuario[]>([]);
  const [busca,       setBusca]       = useState('');
  const [filtroTipo,  setFiltroTipo]  = useState('');
  const [pageU,       setPageU]       = useState(1);
  const [pagU,        setPagU]        = useState<Paginacao|null>(null);
  const [acoesU,      setAcoesU]      = useState<Record<number,boolean>>({});

  // Reservas
  const [reservas,    setReservas]    = useState<Reserva[]>([]);
  const [filtroStatus,setFiltroStatus]= useState('');
  const [filtroTipoR, setFiltroTipoR] = useState('');
  const [pageR,       setPageR]       = useState(1);
  const [pagR,        setPagR]        = useState<Paginacao|null>(null);

  // Avaliacoes
  const [avaliacoes,  setAvaliacoes]  = useState<Avaliacao[]>([]);
  const [filtroNota,  setFiltroNota]  = useState(0);
  const [pageAv,      setPageAv]      = useState(1);
  const [pagAv,       setPagAv]       = useState<Paginacao|null>(null);

  const [carregando,  setCarregando]  = useState(false);
  const [msgAcao,     setMsgAcao]     = useState<{tipo:'ok'|'erro',texto:string}|null>(null);

  // Protecao extra de rota
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
    if (status === 'authenticated' && session?.user.tipo !== 'ADMIN') router.push('/dashboard');
  }, [status, session, router]);

  // Carrega stats na montagem
  useEffect(() => {
    fetch('/api/admin/stats').then(r=>r.json()).then(d=>{
      setStats(d.stats); setCrescimento(d.crescimento??[]);
    });
  }, []);

  // Carrega usuarios
  useEffect(() => {
    if (aba !== 'usuarios') return;
    startTransition(() => setCarregando(true));
    const p = new URLSearchParams();
    if (busca)      p.set('q', busca);
    if (filtroTipo) p.set('tipo', filtroTipo);
    p.set('page', String(pageU));
    fetch(`/api/admin/usuarios?${p}`).then(r=>r.json()).then(d=>{
      setUsuarios(d.usuarios??[]); setPagU(d.paginacao??null);
    }).finally(()=>setCarregando(false));
  }, [aba, busca, filtroTipo, pageU]);

  // Carrega reservas
  useEffect(() => {
    if (aba !== 'reservas') return;
    startTransition(() => setCarregando(true));
    const p = new URLSearchParams();
    if (filtroStatus) p.set('status', filtroStatus);
    if (filtroTipoR)  p.set('tipo',   filtroTipoR);
    p.set('page', String(pageR));
    fetch(`/api/admin/reservas?${p}`).then(r=>r.json()).then(d=>{
      setReservas(d.reservas??[]); setPagR(d.paginacao??null);
    }).finally(()=>setCarregando(false));
  }, [aba, filtroStatus, filtroTipoR, pageR]);

  // Carrega avaliacoes
  useEffect(() => {
    if (aba !== 'avaliacoes') return;
    startTransition(() => setCarregando(true));
    const p = new URLSearchParams();
    if (filtroNota) p.set('nota', String(filtroNota));
    p.set('page', String(pageAv));
    fetch(`/api/admin/avaliacoes?${p}`).then(r=>r.json()).then(d=>{
      setAvaliacoes(d.avaliacoes??[]); setPagAv(d.paginacao??null);
    }).finally(()=>setCarregando(false));
  }, [aba, filtroNota, pageAv]);

  // Ativar/desativar usuario
  async function toggleUsuario(id: number, tipoAtual: string) {
    setAcoesU(prev=>({...prev,[id]:true}));
    const acao = tipoAtual === 'INATIVO' ? 'reativar' : 'desativar';
    const res = await fetch('/api/admin/usuarios', {
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ idUsuario: id, acao }),
    });
    const d = await res.json();
    setMsgAcao({ tipo: res.ok ? 'ok' : 'erro', texto: d.message ?? d.error });
    if (res.ok) {
      setUsuarios(prev => prev.map(u => u.ID_USUARIO === id
        ? { ...u, TIPO: acao === 'desativar' ? 'INATIVO' : 'TURISTA' }
        : u
      ));
    }
    setAcoesU(prev=>({...prev,[id]:false}));
    setTimeout(()=>setMsgAcao(null), 3000);
  }

  // Remover avaliacao
  async function removerAvaliacao(id: number) {
    if (!confirm('Remover esta avaliacao permanentemente?')) return;
    const res = await fetch('/api/admin/avaliacoes', {
      method:'DELETE', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ idAvaliacao: id }),
    });
    const d = await res.json();
    setMsgAcao({ tipo: res.ok ? 'ok' : 'erro', texto: d.message ?? d.error });
    if (res.ok) setAvaliacoes(prev=>prev.filter(av=>av.ID_AVALIACAO!==id));
    setTimeout(()=>setMsgAcao(null), 3000);
  }

  if (status === 'loading' || !session) return null;

  const receitaTotal = (stats?.RECEITA_ROTAS??0) + (stats?.RECEITA_HOTEIS??0);
  const reservasTotal = (stats?.TOTAL_RESERVAS_ROTAS??0) + (stats?.TOTAL_RESERVAS_HOTEIS??0);

  return (
    <div className="admin-page">

      {/* Header */}
      <div className="admin-header">
        <div className="container admin-header-inner">
          <div>
            <p className="admin-header-label">Painel Administrativo</p>
            <h1 className="admin-header-titulo">⚙️ ROTA Admin</h1>
          </div>
          <div className="admin-header-badges">
            <span className="admin-badge-admin">ADMIN</span>
            <span style={{fontSize:'0.82rem',color:'rgba(255,255,255,0.5)'}}>{session.user.email}</span>
          </div>
        </div>
      </div>

      {/* Mensagem de acao */}
      {msgAcao && (
        <div style={{
          position:'fixed',top:'80px',right:'1.5rem',zIndex:9999,
          padding:'0.75rem 1.25rem',borderRadius:'var(--radius-md)',
          background: msgAcao.tipo==='ok' ? 'var(--verde-palmeira)' : '#B91C1C',
          color:'white',fontWeight:700,fontSize:'0.88rem',boxShadow:'var(--sombra-lg)',
        }}>
          {msgAcao.tipo==='ok'?'✅':'❌'} {msgAcao.texto}
        </div>
      )}

      <div className="container admin-body">

        {/* Stats Cards */}
        <div className="admin-stats-grade">
          {[
            { label:'Total usuarios',  valor: stats?.TOTAL_USUARIOS??'—',   cor:'var(--laranja-manga)',  sub: `${stats?.TOTAL_TURISTAS??0} turistas · ${stats?.TOTAL_EMPRESAS??0} empresas` },
            { label:'Rotas cadastradas',valor:stats?.TOTAL_ROTAS??'—',      cor:'var(--verde-palmeira)', sub:`${stats?.TOTAL_HOTEIS??0} hoteis · ${stats?.TOTAL_RESTAURANTES??0} restaurantes` },
            { label:'Total reservas',   valor:reservasTotal||'—',           cor:'var(--azul-turquesa)',  sub:`${stats?.TOTAL_RESERVAS_ROTAS??0} rotas · ${stats?.TOTAL_RESERVAS_HOTEIS??0} hospedagens` },
            { label:'Receita total',    valor:moeda(receitaTotal),          cor:'var(--laranja-manga)',  sub:`Rotas: ${moeda(stats?.RECEITA_ROTAS??0)}` },
            { label:'Avaliacoes',       valor:stats?.TOTAL_AVALIACOES??'—', cor:'var(--verde-palmeira)', sub:`Media: ${stats?.MEDIA_AVALIACOES??'—'}★` },
          ].map(({label,valor,cor,sub})=>(
            <div key={label} className="admin-stat-card" style={{borderTopColor:cor}}>
              <p className="admin-stat-valor" style={{color:cor}}>{valor}</p>
              <p className="admin-stat-label">{label}</p>
              <p className="admin-stat-sub">{sub}</p>
            </div>
          ))}
        </div>

        {/* Crescimento */}
        {crescimento.length > 0 && (
          <div className="admin-section-card">
            <h2 className="admin-section-titulo">Novos usuários — últimos 6 meses</h2>
            <div style={{display:'flex',alignItems:'flex-end',gap:'0.75rem',height:'80px',padding:'0.5rem 0'}}>
              {crescimento.map(c=>{
                const max = Math.max(...crescimento.map(x=>x.NOVOS_USUARIOS),1);
                const pct = (c.NOVOS_USUARIOS/max)*100;
                return (
                  <div key={c.MES} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'0.25rem',flex:1}}>
                    <span style={{fontSize:'0.7rem',color:'var(--texto-suave)',fontWeight:700}}>{c.NOVOS_USUARIOS}</span>
                    <div style={{width:'100%',height:`${Math.max(pct,8)}%`,background:'var(--laranja-manga)',borderRadius:'4px 4px 0 0',minHeight:'6px'}}/>
                    <span style={{fontSize:'0.65rem',color:'var(--texto-suave)'}}>{c.MES.slice(5)}/{c.MES.slice(2,4)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Abas */}
        <div className="admin-abas">
          {([
            ['usuarios',   '👥 Usuários'],
            ['reservas',   '📅 Reservas'],
            ['avaliacoes', '⭐ Avaliações'],
          ] as const).map(([key,label])=>(
            <button key={key} className={`admin-aba ${aba===key?'admin-aba-ativa':''}`}
              onClick={()=>{ setAba(key); }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── ABA USUARIOS ── */}
        {aba==='usuarios' && (
          <div className="admin-section-card">
            <div className="admin-filtros-row">
              <input type="text" value={busca} onChange={e=>{setBusca(e.target.value);setPageU(1);}}
                placeholder="🔍 Buscar por nome ou e-mail..."
                style={{flex:1,padding:'0.65rem 1rem',border:'1.5px solid var(--cinza-borda)',borderRadius:'var(--radius-md)',fontFamily:'var(--fonte-corpo)',fontSize:'0.9rem',outline:'none'}}
              />
              <select value={filtroTipo} onChange={e=>{setFiltroTipo(e.target.value);setPageU(1);}}
                style={{padding:'0.65rem 1rem',border:'1.5px solid var(--cinza-borda)',borderRadius:'var(--radius-md)',fontFamily:'var(--fonte-corpo)',fontSize:'0.9rem',background:'var(--branco-puro)',outline:'none',cursor:'pointer'}}>
                <option value="">Todos os tipos</option>
                <option value="TURISTA">Turistas</option>
                <option value="EMPRESA">Empresas</option>
                <option value="ADMIN">Admins</option>
                <option value="INATIVO">Inativos</option>
              </select>
            </div>

            {carregando ? <AdminSkeleton/> : (
              <div className="admin-tabela-wrapper">
                <table className="admin-tabela">
                  <thead>
                    <tr>
                      <th>ID</th><th>Nome</th><th>E-mail</th><th>Tipo</th>
                      <th>Reservas</th><th>Cadastro</th><th>Acao</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map(u=>(
                      <tr key={u.ID_USUARIO}>
                        <td style={{color:'var(--texto-suave)',fontSize:'0.8rem'}}>#{u.ID_USUARIO}</td>
                        <td>
                          <p style={{fontWeight:700,fontSize:'0.9rem'}}>{u.NOME}</p>
                          {u.RAZAO_SOCIAL && <p style={{fontSize:'0.75rem',color:'var(--texto-suave)'}}>{u.RAZAO_SOCIAL}</p>}
                        </td>
                        <td style={{fontSize:'0.85rem',color:'var(--texto-suave)'}}>{u.EMAIL}</td>
                        <td><span style={corStatus(u.TIPO)}>{u.TIPO}</span></td>
                        <td style={{textAlign:'center',fontWeight:700}}>{u.TOTAL_RESERVAS}</td>
                        <td style={{fontSize:'0.82rem',color:'var(--texto-suave)'}}>{data(u.DATA_CADASTRO)}</td>
                        <td>
                          {u.TIPO !== 'ADMIN' && (
                            <button
                              onClick={()=>toggleUsuario(u.ID_USUARIO, u.TIPO)}
                              disabled={acoesU[u.ID_USUARIO]}
                              style={{
                                padding:'0.3rem 0.75rem',borderRadius:'var(--radius-sm)',border:'none',cursor:'pointer',
                                fontFamily:'var(--fonte-corpo)',fontSize:'0.78rem',fontWeight:700,
                                background: u.TIPO==='INATIVO' ? 'var(--verde-palmeira-light)' : '#FEF2F2',
                                color:      u.TIPO==='INATIVO' ? 'var(--verde-palmeira-dark)'  : '#B91C1C',
                              }}>
                              {acoesU[u.ID_USUARIO] ? '...' : u.TIPO==='INATIVO' ? 'Reativar' : 'Desativar'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {usuarios.length===0 && <p className="admin-vazio">Nenhum usuario encontrado.</p>}
              </div>
            )}
            <AdminPaginacao pag={pagU} page={pageU} setPage={setPageU}/>
          </div>
        )}

        {/* ── ABA RESERVAS ── */}
        {aba==='reservas' && (
          <div className="admin-section-card">
            <div className="admin-filtros-row">
              <select value={filtroTipoR} onChange={e=>{setFiltroTipoR(e.target.value);setPageR(1);}}
                style={{padding:'0.65rem 1rem',border:'1.5px solid var(--cinza-borda)',borderRadius:'var(--radius-md)',fontFamily:'var(--fonte-corpo)',fontSize:'0.9rem',background:'var(--branco-puro)',outline:'none',cursor:'pointer'}}>
                <option value="">Todos os tipos</option>
                <option value="rota">Rotas</option>
                <option value="hotel">Hospedagens</option>
              </select>
              <select value={filtroStatus} onChange={e=>{setFiltroStatus(e.target.value);setPageR(1);}}
                style={{padding:'0.65rem 1rem',border:'1.5px solid var(--cinza-borda)',borderRadius:'var(--radius-md)',fontFamily:'var(--fonte-corpo)',fontSize:'0.9rem',background:'var(--branco-puro)',outline:'none',cursor:'pointer'}}>
                <option value="">Todos os status</option>
                <option value="PENDENTE">Pendentes</option>
                <option value="CONFIRMADA">Confirmadas</option>
                <option value="CANCELADA">Canceladas</option>
                <option value="CONCLUIDA">Concluidas</option>
              </select>
            </div>

            {carregando ? <AdminSkeleton/> : (
              <div className="admin-tabela-wrapper">
                <table className="admin-tabela">
                  <thead>
                    <tr><th>ID</th><th>Tipo</th><th>Item</th><th>Usuario</th><th>Data</th><th>Qtd</th><th>Valor</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {reservas.map(r=>(
                      <tr key={`${r.TIPO}-${r.ID}`}>
                        <td style={{color:'var(--texto-suave)',fontSize:'0.8rem'}}>#{r.ID}</td>
                        <td><span style={{...corStatus(r.TIPO==='Rota'?'CONFIRMADA':'PENDENTE'),background:r.TIPO==='Rota'?'var(--verde-palmeira-light)':'var(--azul-turquesa-light)',color:r.TIPO==='Rota'?'var(--verde-palmeira-dark)':'var(--azul-turquesa-hover)'}}>{r.TIPO}</span></td>
                        <td style={{fontWeight:700,fontSize:'0.88rem',maxWidth:'180px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.NOME_ITEM}</td>
                        <td style={{fontSize:'0.85rem',color:'var(--texto-suave)'}}>{r.NOME_USUARIO}</td>
                        <td style={{fontSize:'0.82rem'}}>{data(r.DATA_EVENTO)}</td>
                        <td style={{textAlign:'center'}}>{r.QTD}</td>
                        <td style={{fontWeight:700,color:'var(--laranja-manga)',fontFamily:'var(--fonte-display)',fontSize:'0.9rem',whiteSpace:'nowrap'}}>{moeda(r.VALOR_TOTAL)}</td>
                        <td><span style={corStatus(r.STATUS)}>{r.STATUS}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reservas.length===0 && <p className="admin-vazio">Nenhuma reserva encontrada.</p>}
              </div>
            )}
            <AdminPaginacao pag={pagR} page={pageR} setPage={setPageR}/>
          </div>
        )}

        {/* ── ABA AVALIACOES ── */}
        {aba==='avaliacoes' && (
          <div className="admin-section-card">
            <div className="admin-filtros-row">
              <span style={{fontSize:'0.88rem',fontWeight:700,color:'var(--texto-suave)'}}>Filtrar por nota:</span>
              {[0,1,2,3,4,5].map(n=>(
                <button key={n} onClick={()=>{setFiltroNota(n);setPageAv(1);}}
                  style={{padding:'0.4rem 0.75rem',borderRadius:'var(--radius-sm)',border:`1.5px solid ${filtroNota===n?'var(--laranja-manga)':'var(--cinza-borda)'}`,background:filtroNota===n?'var(--laranja-manga-light)':'transparent',cursor:'pointer',fontFamily:'var(--fonte-corpo)',fontSize:'0.85rem',color:filtroNota===n?'var(--laranja-manga)':'var(--texto-principal)',fontWeight:filtroNota===n?700:400}}>
                  {n===0?'Todas':`${n}★`}
                </button>
              ))}
            </div>

            {carregando ? <AdminSkeleton/> : (
              <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                {avaliacoes.map(av=>(
                  <div key={av.ID_AVALIACAO} style={{display:'flex',gap:'1rem',alignItems:'flex-start',padding:'1rem',border:'1px solid var(--cinza-borda)',borderRadius:'var(--radius-md)',background:'var(--branco-puro)'}}>
                    <div style={{width:'36px',height:'36px',background:'var(--laranja-manga)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:'0.85rem',flexShrink:0}}>
                      {av.NOME_USUARIO[0].toUpperCase()}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'0.5rem',flexWrap:'wrap',marginBottom:'0.25rem'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                          <p style={{fontWeight:700,fontSize:'0.88rem'}}>{av.NOME_USUARIO}</p>
                          <Estrelas n={av.NOTA}/>
                          <span style={{fontSize:'0.78rem',color:'var(--texto-suave)'}}>{data(av.DATA_AVALIACAO)}</span>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                          <span style={{...corStatus(av.TIPO==='Rota'?'CONFIRMADA':'CONCLUIDA'),background:av.TIPO==='Rota'?'var(--verde-palmeira-light)':'var(--azul-turquesa-light)',color:av.TIPO==='Rota'?'var(--verde-palmeira-dark)':'var(--azul-turquesa-hover)'}}>{av.TIPO}</span>
                          <button onClick={()=>removerAvaliacao(av.ID_AVALIACAO)}
                            style={{padding:'0.3rem 0.65rem',borderRadius:'var(--radius-sm)',border:'none',cursor:'pointer',background:'#FEF2F2',color:'#B91C1C',fontSize:'0.78rem',fontWeight:700,fontFamily:'var(--fonte-corpo)'}}>
                            🗑️ Remover
                          </button>
                        </div>
                      </div>
                      <p style={{fontSize:'0.82rem',color:'var(--texto-suave)',marginBottom:'0.2rem'}}>📍 {av.ALVO}</p>
                      {av.COMENTARIO && <p style={{fontSize:'0.88rem',color:'var(--texto-secundario)',fontStyle:'italic',lineHeight:1.5}}>&ldquo;{av.COMENTARIO}&rdquo;</p>}
                      {!av.COMENTARIO && <p style={{fontSize:'0.82rem',color:'var(--texto-suave)',fontStyle:'italic'}}>Sem comentario.</p>}
                    </div>
                  </div>
                ))}
                {avaliacoes.length===0 && <p className="admin-vazio">Nenhuma avaliacao encontrada.</p>}
              </div>
            )}
            <AdminPaginacao pag={pagAv} page={pageAv} setPage={setPageAv}/>
          </div>
        )}
      </div>

      <AdminStyles/>
    </div>
  );
}

function AdminPaginacao({ pag, page, setPage }: { pag: Paginacao|null; page: number; setPage: (p: number)=>void }) {
  if (!pag || pag.totalPaginas <= 1) return null;
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'1.25rem',paddingTop:'1rem',borderTop:'1px solid var(--cinza-borda)'}}>
      <span style={{fontSize:'0.82rem',color:'var(--texto-suave)'}}>{pag.total} registros · Pagina {page}/{pag.totalPaginas}</span>
      <div style={{display:'flex',gap:'0.5rem'}}>
        <button className="btn btn-outline btn-sm" disabled={page<=1} onClick={()=>setPage(page-1)}>←</button>
        <button className="btn btn-outline btn-sm" disabled={page>=pag.totalPaginas} onClick={()=>setPage(page+1)}>→</button>
      </div>
    </div>
  );
}

function AdminSkeleton() {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:'0.5rem',padding:'0.5rem 0'}}>
      {[1,2,3,4].map(i=><div key={i} style={{height:'48px',borderRadius:'var(--radius-sm)',background:'linear-gradient(90deg,var(--cinza-borda) 25%,var(--cinza-claro) 50%,var(--cinza-borda) 75%)',backgroundSize:'200% 100%',animation:'shimmer 1.4s infinite'}}/>)}
    </div>
  );
}

function AdminStyles() {
  return (
    <style>{`
      .admin-page { min-height:100vh; padding-top:70px; background:var(--creme-suave); }
      .admin-header { background:linear-gradient(135deg,#1A1A1A 0%,#2D1A3A 100%); padding:2rem 0; }
      .admin-header-inner { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; }
      .admin-header-label { font-size:0.78rem; color:rgba(255,255,255,0.45); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:0.25rem; }
      .admin-header-titulo { font-family:var(--fonte-display); font-size:clamp(1.4rem,3vw,1.9rem); color:white; }
      .admin-header-badges { display:flex; flex-direction:column; align-items:flex-end; gap:0.35rem; }
      .admin-badge-admin { background:rgba(255,107,26,0.2); color:var(--laranja-manga); padding:0.2rem 0.75rem; border-radius:999px; font-size:0.75rem; font-weight:800; letter-spacing:0.05em; }

      .admin-body { padding:2rem 1.5rem 4rem; display:flex; flex-direction:column; gap:1.5rem; }

      .admin-stats-grade { display:grid; grid-template-columns:repeat(2,1fr); gap:1rem; }
      @media(min-width:640px){ .admin-stats-grade { grid-template-columns:repeat(3,1fr); } }
      @media(min-width:1024px){ .admin-stats-grade { grid-template-columns:repeat(5,1fr); } }
      .admin-stat-card { background:var(--branco-puro); border-radius:var(--radius-md); padding:1.25rem; box-shadow:var(--sombra-sm); border-top:3px solid; }
      .admin-stat-valor { font-family:var(--fonte-display); font-size:1.5rem; font-weight:800; line-height:1; margin-bottom:0.25rem; }
      .admin-stat-label { font-size:0.8rem; font-weight:700; color:var(--texto-principal); margin-bottom:0.15rem; }
      .admin-stat-sub { font-size:0.72rem; color:var(--texto-suave); }

      .admin-section-card { background:var(--branco-puro); border-radius:var(--radius-lg); padding:1.5rem; box-shadow:var(--sombra-sm); }
      .admin-section-titulo { font-family:var(--fonte-display); font-size:1rem; margin-bottom:1.25rem; }

      .admin-abas { display:flex; gap:0.5rem; border-bottom:2px solid var(--cinza-borda); }
      .admin-aba { background:none; border:none; padding:0.75rem 1.25rem; font-family:var(--fonte-corpo); font-size:0.9rem; font-weight:600; color:var(--texto-suave); cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-2px; transition:all var(--transicao); }
      .admin-aba-ativa { color:var(--laranja-manga); border-bottom-color:var(--laranja-manga); }
      .admin-aba:hover:not(.admin-aba-ativa){ color:var(--texto-principal); }

      .admin-filtros-row { display:flex; gap:0.75rem; flex-wrap:wrap; margin-bottom:1.25rem; align-items:center; }

      .admin-tabela-wrapper { overflow-x:auto; }
      .admin-tabela { width:100%; border-collapse:collapse; font-size:0.88rem; }
      .admin-tabela th { background:var(--creme-medio); padding:0.65rem 0.85rem; text-align:left; font-size:0.75rem; font-weight:700; color:var(--texto-suave); text-transform:uppercase; letter-spacing:0.05em; white-space:nowrap; }
      .admin-tabela td { padding:0.75rem 0.85rem; border-bottom:1px solid var(--cinza-borda); vertical-align:middle; }
      .admin-tabela tr:last-child td { border-bottom:none; }
      .admin-tabela tr:hover td { background:var(--creme-suave); }

      .admin-vazio { text-align:center; padding:2rem; color:var(--texto-suave); font-style:italic; font-size:0.9rem; }

      @keyframes shimmer { to { background-position:-200% 0; } }
    `}</style>
  );
}