'use client';
// app/hoteis/[id]/page.tsx — Detalhe de acomodacao com reserva e avaliacao

import { useState, useEffect, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Acomodacao {
  ID_ACOMODACAO: number; NOME: string; TIPO: string;
  DESCRICAO: string | null; CLASSIFICACAO: number | null;
  PRECO_MEDIO_DIARIA: number | null; URL_IMAGEM_CAPA: string | null;
  CIDADE: string; ESTADO: string; PAIS: string;
  MEDIA_AVALIACAO: number | null; TOTAL_AVALIACOES: number;
}
interface Avaliacao { ID_AVALIACAO: number; NOTA: number; COMENTARIO: string | null; DATA_AVALIACAO: string; NOME_USUARIO: string; }
interface Restaurante { ID_RESTAURANTE: number; NOME: string; TIPO: string | null; PRECO_MEDIO: number | null; }

const DADOS_VAZIO = { acomodacao: null as Acomodacao | null, avaliacoes: [] as Avaliacao[], restaurantes: [] as Restaurante[] };

function Estrelas({ n, tamanho = '1rem' }: { n: number; tamanho?: string }) {
  return <span>{[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= n ? '#FFB800' : 'var(--cinza-borda)', fontSize: tamanho }}>★</span>)}</span>;
}
function formatarData(d: string) { return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }); }

export default function HotelDetalhePage() {
  const params  = useParams<{ id: string }>();
  const id      = params?.id ?? '';
  const { data: session } = useSession();
  const router  = useRouter();

  const [dados,       setDados]       = useState(DADOS_VAZIO);
  const [carregando,  setCarregando]  = useState(true);
  const [notFound,    setNotFound]    = useState(false);

  // Reserva
  const [checkin,   setCheckin]   = useState('');
  const [checkout,  setCheckout]  = useState('');
  const [hospedes,  setHospedes]  = useState(1);
  const [reservando,    setReservando]    = useState(false);
  const [erroReserva,   setErroReserva]   = useState<string | null>(null);
  const [sucessoReserva,setSucessoReserva]= useState(false);
  const [valorEstimado, setValorEstimado] = useState(0);

  // Avaliacao
  const [nota,       setNota]       = useState(0);
  const [comentario, setComentario] = useState('');
  const [avaliando,  setAvaliando]  = useState(false);
  const [erroAval,   setErroAval]   = useState<string | null>(null);
  const [sucessoAval,setSucessoAval]= useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/hoteis/${id}`)
      .then(r => { if (r.status === 404) { setNotFound(true); return null; } return r.json(); })
      .then(d => { if (d) setDados({ acomodacao: d.acomodacao ?? null, avaliacoes: d.avaliacoes ?? [], restaurantes: d.restaurantes ?? [] }); })
      .catch(console.error).finally(() => setCarregando(false));
  }, [id]);

  // Calcula valor estimado ao mudar datas
  useEffect(() => {
    if (!checkin || !checkout || !dados.acomodacao?.PRECO_MEDIO_DIARIA) { setValorEstimado(0); return; }
    const noites = Math.ceil((new Date(checkout).getTime() - new Date(checkin).getTime()) / 86400000);
    if (noites > 0) setValorEstimado(dados.acomodacao.PRECO_MEDIO_DIARIA * noites);
    else setValorEstimado(0);
  }, [checkin, checkout, dados.acomodacao]);

  async function handleReservar(e: FormEvent) {
    e.preventDefault();
    if (!session) { router.push(`/auth/login?callbackUrl=/hoteis/${id}`); return; }
    setReservando(true); setErroReserva(null);
    try {
      const res = await fetch(`/api/hoteis/${id}/reservar`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataCheckin: checkin, dataCheckout: checkout, qtdHospedes: hospedes }),
      });
      const data = await res.json();
      if (!res.ok) { setErroReserva(data.error); return; }
      setSucessoReserva(true);
    } catch { setErroReserva('Erro de conexao.'); } finally { setReservando(false); }
  }

  async function handleAvaliar(e: FormEvent) {
    e.preventDefault();
    if (!session) { router.push(`/auth/login?callbackUrl=/hoteis/${id}`); return; }
    if (!nota) { setErroAval('Selecione uma nota.'); return; }
    setAvaliando(true); setErroAval(null);
    try {
      const res = await fetch(`/api/hoteis/${id}/avaliar`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nota, comentario }),
      });
      const data = await res.json();
      if (!res.ok) { setErroAval(data.error); return; }
      setSucessoAval(true);
      fetch(`/api/hoteis/${id}`).then(r => r.json()).then(d => setDados(prev => ({ ...prev, avaliacoes: d.avaliacoes ?? [] })));
    } catch { setErroAval('Erro de conexao.'); } finally { setAvaliando(false); }
  }

  const hoje = new Date().toISOString().split('T')[0];

  if (carregando) return <div style={{ paddingTop: '70px', minHeight: '100vh', background: 'var(--creme-suave)' }}><div style={{ height: '320px', background: 'var(--cinza-claro)' }} /></div>;
  if (notFound || !dados.acomodacao) return (
    <div style={{ paddingTop: '5rem', textAlign: 'center', padding: '5rem 1rem' }}>
      <p style={{ fontSize: '3rem' }}>🏨</p><h2>Acomodação não encontrada</h2>
      <Link href="/hoteis" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Ver todos os hotéis</Link>
    </div>
  );

  const { acomodacao, avaliacoes, restaurantes } = dados;
  const noites = checkin && checkout ? Math.ceil((new Date(checkout).getTime() - new Date(checkin).getTime()) / 86400000) : 0;

  return (
    <div style={{ minHeight: '100vh', paddingTop: '70px', background: 'var(--creme-suave)' }}>
      {/* Hero */}
      <div style={{ position: 'relative', height: '320px', overflow: 'hidden', background: 'linear-gradient(135deg, var(--azul-turquesa-light), var(--verde-palmeira-light))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {acomodacao.URL_IMAGEM_CAPA
          ? <Image src={acomodacao.URL_IMAGEM_CAPA} alt={acomodacao.NOME} fill style={{ objectFit: 'cover', position: 'absolute', inset: 0 }} />
          : <span style={{ fontSize: '6rem', zIndex: 1 }}>🏨</span>
        }
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
        <div className="container" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem 1.5rem' }}>
          <Link href="/hoteis" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-block', marginBottom: '0.75rem' }}>← Todos os hotéis</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
            <span className="badge badge-azul">{acomodacao.TIPO}</span>
            {acomodacao.CLASSIFICACAO && <Estrelas n={acomodacao.CLASSIFICACAO} tamanho="1rem" />}
          </div>
          <h1 style={{ fontFamily: 'var(--fonte-display)', fontSize: 'clamp(1.5rem,4vw,2.2rem)', color: 'white', marginBottom: '0.25rem' }}>{acomodacao.NOME}</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>📍 {acomodacao.CIDADE}, {acomodacao.ESTADO}</p>
          {acomodacao.MEDIA_AVALIACAO && <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.88rem', marginTop: '0.25rem' }}>⭐ {acomodacao.MEDIA_AVALIACAO} ({acomodacao.TOTAL_AVALIACOES} avaliações)</p>}
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="hotel-detalhe-layout">

          {/* Coluna principal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Info rapida */}
            {acomodacao.PRECO_MEDIO_DIARIA && (
              <div style={{ background: 'var(--branco-puro)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--sombra-sm)', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--texto-suave)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Diária média</p>
                  <p style={{ fontFamily: 'var(--fonte-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--laranja-manga)' }}>
                    {acomodacao.PRECO_MEDIO_DIARIA.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--texto-suave)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tipo</p>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{acomodacao.TIPO}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--texto-suave)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Localização</p>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{acomodacao.CIDADE}, {acomodacao.ESTADO}</p>
                </div>
              </div>
            )}

            {/* Descricao */}
            {acomodacao.DESCRICAO && (
              <div style={{ background: 'var(--branco-puro)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--sombra-sm)' }}>
                <h2 style={{ fontFamily: 'var(--fonte-display)', fontSize: '1.2rem', marginBottom: '0.75rem' }}>Sobre a acomodação</h2>
                <p style={{ color: 'var(--texto-secundario)', lineHeight: 1.7, fontSize: '0.95rem' }}>{acomodacao.DESCRICAO}</p>
              </div>
            )}

            {/* Restaurantes proximos */}
            {restaurantes.length > 0 && (
              <div style={{ background: 'var(--branco-puro)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--sombra-sm)' }}>
                <h2 style={{ fontFamily: 'var(--fonte-display)', fontSize: '1.2rem', marginBottom: '1rem' }}>🍽️ Restaurantes na região</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {restaurantes.map(r => (
                    <Link key={r.ID_RESTAURANTE} href={`/restaurantes/${r.ID_RESTAURANTE}`}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid var(--cinza-borda)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--texto-principal)', transition: 'background var(--transicao)' }}
                      className="restaurante-link-hover">
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.NOME}</p>
                        {r.TIPO && <p style={{ fontSize: '0.78rem', color: 'var(--texto-suave)' }}>{r.TIPO}</p>}
                      </div>
                      {r.PRECO_MEDIO && <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--laranja-manga)' }}>~{r.PRECO_MEDIO.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/pessoa</span>}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Avaliacoes */}
            <div style={{ background: 'var(--branco-puro)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--sombra-sm)' }}>
              <h2 style={{ fontFamily: 'var(--fonte-display)', fontSize: '1.2rem', marginBottom: '1rem' }}>
                Avaliações {acomodacao.TOTAL_AVALIACOES > 0 && <span style={{ fontSize: '0.85rem', color: 'var(--texto-suave)', fontWeight: 400 }}>({acomodacao.TOTAL_AVALIACOES})</span>}
              </h2>

              {session?.user.tipo === 'TURISTA' && !sucessoAval && (
                <form onSubmit={handleAvaliar} style={{ background: 'var(--creme-medio)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Deixe sua avaliação</p>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type="button" onClick={() => setNota(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}>
                        <span style={{ color: n <= nota ? '#FFB800' : 'var(--cinza-borda)', fontSize: '1.75rem', transition: 'color 0.15s' }}>★</span>
                      </button>
                    ))}
                  </div>
                  <textarea value={comentario} onChange={e => setComentario(e.target.value)}
                    placeholder="Como foi sua experiencia? (opcional)"
                    style={{ width: '100%', padding: '0.65rem', border: '1.5px solid var(--cinza-borda)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--fonte-corpo)', fontSize: '0.88rem', resize: 'vertical', outline: 'none' }}
                    rows={3} />
                  {erroAval && <p style={{ color: '#B91C1C', fontSize: '0.85rem' }}>❌ {erroAval}</p>}
                  <button type="submit" className="btn btn-secondary btn-sm" disabled={avaliando}>{avaliando ? 'Enviando...' : '⭐ Enviar avaliacao'}</button>
                </form>
              )}
              {sucessoAval && <p style={{ background: 'var(--verde-palmeira-light)', color: 'var(--verde-palmeira-dark)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', marginBottom: '1rem' }}>✅ Avaliacao enviada!</p>}

              {avaliacoes.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {avaliacoes.map(av => (
                    <div key={av.ID_AVALIACAO} style={{ padding: '1rem', border: '1px solid var(--cinza-borda)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{ width: '32px', height: '32px', background: 'var(--azul-turquesa)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 800 }}>{av.NOME_USUARIO[0].toUpperCase()}</div>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: '0.88rem' }}>{av.NOME_USUARIO}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--texto-suave)' }}>{formatarData(av.DATA_AVALIACAO)}</p>
                          </div>
                        </div>
                        <Estrelas n={av.NOTA} tamanho="0.95rem" />
                      </div>
                      {av.COMENTARIO && <p style={{ fontSize: '0.88rem', color: 'var(--texto-secundario)', fontStyle: 'italic', lineHeight: 1.5 }}>&quot;{av.COMENTARIO}&quot;</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.88rem', color: 'var(--texto-suave)', fontStyle: 'italic' }}>Ainda sem avaliacoes. Seja o primeiro!</p>
              )}
            </div>
          </div>

          {/* Sidebar reserva */}
          <aside style={{ position: 'sticky', top: '86px', alignSelf: 'start' }}>
            <div style={{ background: 'var(--branco-puro)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--sombra-lg)', padding: '1.75rem' }}>
              <p style={{ fontFamily: 'var(--fonte-display)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>Reservar hospedagem</p>

              {sucessoReserva ? (
                <div style={{ textAlign: 'center', padding: '1rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <p style={{ fontSize: '2rem' }}>🎉</p>
                  <p style={{ fontWeight: 700 }}>Reserva realizada!</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--texto-suave)' }}>Acompanhe no seu painel.</p>
                  <Link href="/dashboard" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>Ver no painel</Link>
                </div>
              ) : (
                <form onSubmit={handleReservar} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Check-in *</label>
                      <input type="date" value={checkin} onChange={e => setCheckin(e.target.value)} min={hoje} required
                        style={{ padding: '0.65rem', border: '1.5px solid var(--cinza-borda)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--fonte-corpo)', fontSize: '0.9rem', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Check-out *</label>
                      <input type="date" value={checkout} onChange={e => setCheckout(e.target.value)} min={checkin || hoje} required
                        style={{ padding: '0.65rem', border: '1.5px solid var(--cinza-borda)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--fonte-corpo)', fontSize: '0.9rem', outline: 'none' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Hospedes *</label>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--cinza-borda)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      <button type="button" onClick={() => setHospedes(h => Math.max(1, h-1))}
                        style={{ width: '40px', height: '40px', background: 'var(--cinza-claro)', border: 'none', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ flex: 1, textAlign: 'center', fontWeight: 700 }}>{hospedes}</span>
                      <button type="button" onClick={() => setHospedes(h => Math.min(20, h+1))}
                        style={{ width: '40px', height: '40px', background: 'var(--cinza-claro)', border: 'none', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                  </div>

                  {noites > 0 && valorEstimado > 0 && (
                    <div style={{ background: 'var(--creme-medio)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--texto-suave)', marginBottom: '0.25rem' }}>
                        <span>{noites} noite{noites > 1 ? 's' : ''}</span>
                        <span>{acomodacao.PRECO_MEDIO_DIARIA?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/noite</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700 }}>Total estimado</span>
                        <span style={{ fontFamily: 'var(--fonte-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--laranja-manga)' }}>
                          {valorEstimado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    </div>
                  )}

                  {erroReserva && <p style={{ color: '#B91C1C', fontSize: '0.85rem' }}>❌ {erroReserva}</p>}

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={reservando}>
                    {reservando ? 'Processando...' : session ? '🏨 Reservar agora' : '🔐 Entrar para reservar'}
                  </button>

                  {!session && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--texto-suave)', textAlign: 'center' }}>
                      <Link href={`/auth/login?callbackUrl=/hoteis/${id}`} style={{ color: 'var(--laranja-manga)', fontWeight: 600, textDecoration: 'none' }}>Faça login</Link>
                      {' '}ou{' '}
                      <Link href="/auth/cadastro" style={{ color: 'var(--laranja-manga)', fontWeight: 600, textDecoration: 'none' }}>crie uma conta</Link>.
                    </p>
                  )}
                </form>
              )}
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .hotel-detalhe-layout { display: grid; grid-template-columns: 1fr; gap: 2rem; }
        @media(min-width:900px){ .hotel-detalhe-layout { grid-template-columns: 1fr 340px; } }
        .restaurante-link-hover:hover { background: var(--creme-medio); }
      `}</style>
    </div>
  );
}