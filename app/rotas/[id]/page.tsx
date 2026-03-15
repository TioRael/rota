'use client';
// app/rotas/[id]/page.tsx
// CORRIGIDO:
//  - dados inicializado com arrays vazios (evita .find de undefined)
//  - useParams tipado corretamente para Next.js 16

import { useState, useEffect, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface RotaDetalhe {
  ID_ROTA: number; NOME: string; DESCRICAO: string | null;
  DURACAO: string | null; QUILOMETRAGEM: number | null;
  MELHOR_PERIODO: string | null; CATEGORIA: string | null;
  URL_IMAGEM_CAPA: string | null; CIDADE: string; ESTADO: string;
  RAZAO_SOCIAL: string; MEDIA_AVALIACAO: number | null; TOTAL_AVALIACOES: number;
}
interface Ponto    { ID_PONTO: number; NOME: string; DESCRICAO: string | null; URL_IMAGEM: string | null; ORDEM_VISITA: number; }
interface Guia     { ID_GUIA: number; NOME: string; IDIOMAS: string | null; }
interface Servico  { ID_SERVICO: number; TIPO: string; DESCRICAO: string | null; VALOR: number; }
interface Avaliacao{ ID_AVALIACAO: number; NOTA: number; COMENTARIO: string | null; DATA_AVALIACAO: string; NOME_USUARIO: string; }

// Estado inicial com arrays vazios — evita erros de .find/.map em undefined
const DADOS_VAZIO = {
  rota:       null as RotaDetalhe | null,
  pontos:     [] as Ponto[],
  guias:      [] as Guia[],
  servicos:   [] as Servico[],
  avaliacoes: [] as Avaliacao[],
};

function Estrelas({ nota, tamanho = '1.1rem' }: { nota: number; tamanho?: string }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= nota ? 'var(--laranja-manga)' : 'var(--cinza-borda)', fontSize: tamanho }}>★</span>
      ))}
    </span>
  );
}

function formatarData(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function RotaDetalhePage() {
  // useParams retorna Record<string, string> no Next.js 16
  const params  = useParams<{ id: string }>();
  const id      = params?.id ?? '';
  const { data: session } = useSession();
  const router  = useRouter();

  // Inicializa com dados vazios para evitar erros de acesso antes da carga
  const [dados,      setDados]      = useState(DADOS_VAZIO);
  const [carregando, setCarregando] = useState(true);
  const [notFound,   setNotFound]   = useState(false);

  // Reserva
  const [dataPasseio,    setDataPasseio]    = useState('');
  const [qtdPessoas,     setQtdPessoas]     = useState(1);
  const [idServico,      setIdServico]      = useState<number | ''>('');
  const [idGuia,         setIdGuia]         = useState<number | ''>('');
  const [reservando,     setReservando]     = useState(false);
  const [erroReserva,    setErroReserva]    = useState<string | null>(null);
  const [sucessoReserva, setSucessoReserva] = useState(false);

  // Avaliação
  const [nota,        setNota]        = useState(0);
  const [comentario,  setComentario]  = useState('');
  const [avaliando,   setAvaliando]   = useState(false);
  const [erroAval,    setErroAval]    = useState<string | null>(null);
  const [sucessoAval, setSucessoAval] = useState(false);

  useEffect(() => {
    if (!id) return;
    setCarregando(true);
    fetch(`/api/rotas/${id}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then(data => {
        if (data) {
          // Garante que todos os arrays existem mesmo se a API retornar incompleto
          setDados({
            rota:       data.rota       ?? null,
            pontos:     data.pontos     ?? [],
            guias:      data.guias      ?? [],
            servicos:   data.servicos   ?? [],
            avaliacoes: data.avaliacoes ?? [],
          });
        }
      })
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, [id]);

  async function handleReservar(e: FormEvent) {
    e.preventDefault();
    if (!session) { router.push(`/auth/login?callbackUrl=/rotas/${id}`); return; }
    setReservando(true); setErroReserva(null);
    try {
      const res = await fetch(`/api/rotas/${id}/reservar`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataPasseio, qtdPessoas, idServico: idServico || null, idGuia: idGuia || null }),
      });
      const data = await res.json();
      if (!res.ok) { setErroReserva(data.error); return; }
      setSucessoReserva(true);
    } catch { setErroReserva('Erro de conexão.'); }
    finally { setReservando(false); }
  }

  async function handleAvaliar(e: FormEvent) {
    e.preventDefault();
    if (!session) { router.push(`/auth/login?callbackUrl=/rotas/${id}`); return; }
    if (!nota) { setErroAval('Selecione uma nota.'); return; }
    setAvaliando(true); setErroAval(null);
    try {
      const res = await fetch(`/api/rotas/${id}/avaliar`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nota, comentario }),
      });
      const data = await res.json();
      if (!res.ok) { setErroAval(data.error); return; }
      setSucessoAval(true);
      fetch(`/api/rotas/${id}`).then(r => r.json()).then(d => {
        setDados(prev => ({ ...prev, avaliacoes: d.avaliacoes ?? [] }));
      });
    } catch { setErroAval('Erro de conexão.'); }
    finally { setAvaliando(false); }
  }

  if (carregando) return <DetalheSkeleton />;
  if (notFound || !dados.rota) return (
    <div style={{ paddingTop: '70px', textAlign: 'center', padding: '5rem 1rem' }}>
      <p style={{ fontSize: '3rem' }}>🗺️</p>
      <h2>Rota não encontrada</h2>
      <Link href="/rotas" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Ver todas as rotas</Link>
      <DetalheStyles />
    </div>
  );

  const { rota, pontos, guias, servicos, avaliacoes } = dados;
  const servicoSelecionado = servicos.find(s => s.ID_SERVICO === idServico);
  const valorTotal = servicoSelecionado ? servicoSelecionado.VALOR * qtdPessoas : 0;
  const hoje = new Date().toISOString().split('T')[0];

  return (
    <div className="detalhe-page">

      {/* ── Hero ── */}
      <div className="detalhe-hero">
        {rota.URL_IMAGEM_CAPA ? (
          <Image
            src={rota.URL_IMAGEM_CAPA}
            alt={rota.NOME}
            className="detalhe-hero-img"
            fill
            style={{ objectFit: 'cover' }}
            priority
            sizes="100vw"
          />
        ) : (
          <div className="detalhe-hero-placeholder">
            <span style={{ fontSize: '5rem' }}>🗺️</span>
          </div>
        )}
        <div className="detalhe-hero-overlay" />
        <div className="container detalhe-hero-conteudo">
          <Link href="/rotas" className="detalhe-voltar">← Todas as rotas</Link>
          {rota.CATEGORIA && <span className="badge badge-laranja">{rota.CATEGORIA}</span>}
          <h1 className="detalhe-titulo">{rota.NOME}</h1>
          <p className="detalhe-local">📍 {rota.CIDADE}, {rota.ESTADO} · por {rota.RAZAO_SOCIAL}</p>
          {rota.MEDIA_AVALIACAO && (
            <div className="detalhe-rating">
              <Estrelas nota={Math.round(rota.MEDIA_AVALIACAO)} />
              <span>{rota.MEDIA_AVALIACAO} ({rota.TOTAL_AVALIACOES} avaliações)</span>
            </div>
          )}
        </div>
      </div>

      <div className="container detalhe-container">
        <div className="detalhe-layout">

          {/* ── Coluna principal ── */}
          <div className="detalhe-main">

            {/* Info rápida */}
            <div className="detalhe-info-rapida">
              {[
                { icone: '⏱', label: 'Duração',        valor: rota.DURACAO },
                { icone: '📏', label: 'Quilometragem',  valor: rota.QUILOMETRAGEM ? `${rota.QUILOMETRAGEM} km` : null },
                { icone: '🌤️', label: 'Melhor período', valor: rota.MELHOR_PERIODO },
              ].filter(i => i.valor).map(({ icone, label, valor }) => (
                <div key={label} className="info-rapida-item">
                  <span className="info-rapida-icone">{icone}</span>
                  <div>
                    <p className="info-rapida-label">{label}</p>
                    <p className="info-rapida-valor">{valor}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Descrição */}
            {rota.DESCRICAO && (
              <div className="detalhe-secao">
                <h2 className="detalhe-secao-titulo">Sobre esta rota</h2>
                <p className="detalhe-desc">{rota.DESCRICAO}</p>
              </div>
            )}

            {/* Pontos turísticos */}
            {pontos.length > 0 && (
              <div className="detalhe-secao">
                <h2 className="detalhe-secao-titulo">Pontos do itinerário</h2>
                <div className="pontos-lista">
                  {pontos.map((ponto, idx) => (
                    <div key={ponto.ID_PONTO} className="ponto-item">
                      <div className="ponto-numero">{idx + 1}</div>
                      <div className="ponto-corpo">
                        <p className="ponto-nome">{ponto.NOME}</p>
                        {ponto.DESCRICAO && <p className="ponto-desc">{ponto.DESCRICAO}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guias */}
            {guias.length > 0 && (
              <div className="detalhe-secao">
                <h2 className="detalhe-secao-titulo">Guias disponíveis</h2>
                <div className="guias-grade">
                  {guias.map(g => (
                    <div key={g.ID_GUIA} className="guia-card">
                      <div className="guia-avatar">{g.NOME[0].toUpperCase()}</div>
                      <div>
                        <p className="guia-nome">{g.NOME}</p>
                        {g.IDIOMAS && <p className="guia-idiomas">🌐 {g.IDIOMAS}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Avaliações */}
            <div className="detalhe-secao">
              <h2 className="detalhe-secao-titulo">
                Avaliações {rota.TOTAL_AVALIACOES > 0 && <span className="secao-count">({rota.TOTAL_AVALIACOES})</span>}
              </h2>

              {session?.user.tipo === 'TURISTA' && !sucessoAval && (
                <form onSubmit={handleAvaliar} className="aval-form">
                  <p className="aval-form-titulo">Deixe sua avaliação</p>
                  <div className="aval-estrelas">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type="button" onClick={() => setNota(n)} className="aval-estrela-btn">
                        <span style={{ color: n <= nota ? 'var(--laranja-manga)' : 'var(--cinza-borda)', fontSize: '1.75rem', transition: 'color 0.15s' }}>★</span>
                      </button>
                    ))}
                  </div>
                  <textarea value={comentario} onChange={e => setComentario(e.target.value)}
                    placeholder="Conte como foi sua experiência (opcional)..."
                    className="aval-textarea" rows={3} />
                  {erroAval && <p className="aval-erro">❌ {erroAval}</p>}
                  <button type="submit" className="btn btn-secondary btn-sm" disabled={avaliando}>
                    {avaliando ? 'Enviando...' : '⭐ Enviar avaliação'}
                  </button>
                </form>
              )}
              {sucessoAval && <p className="aval-sucesso">✅ Avaliação enviada! Obrigado pelo feedback.</p>}

              {avaliacoes.length > 0 ? (
                <div className="avaliacoes-lista">
                  {avaliacoes.map(av => (
                    <div key={av.ID_AVALIACAO} className="avaliacao-item">
                      <div className="avaliacao-header">
                        <div className="avaliacao-autor">
                          <div className="avaliacao-avatar">{av.NOME_USUARIO[0].toUpperCase()}</div>
                          <div>
                            <p className="avaliacao-nome">{av.NOME_USUARIO}</p>
                            <p className="avaliacao-data">{formatarData(av.DATA_AVALIACAO)}</p>
                          </div>
                        </div>
                        <Estrelas nota={av.NOTA} tamanho="0.95rem" />
                      </div>
                      {av.COMENTARIO && <p className="avaliacao-comentario">&ldquo;{av.COMENTARIO}&rdquo;</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="aval-vazio">Ainda não há avaliações. Seja o primeiro!</p>
              )}
            </div>
          </div>

          {/* ── Sidebar: reserva ── */}
          <aside className="detalhe-sidebar">
            <div className="reserva-card">
              <p className="reserva-card-titulo">Reserve esta rota</p>

              {sucessoReserva ? (
                <div className="reserva-sucesso">
                  <p style={{ fontSize: '2rem' }}>🎉</p>
                  <p>Reserva realizada!</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--texto-suave)', marginTop: '0.5rem' }}>Acompanhe no seu painel.</p>
                  <Link href="/dashboard" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>Ver no painel</Link>
                </div>
              ) : (
                <form onSubmit={handleReservar} className="reserva-form">
                  {servicos.length > 0 && (
                    <div className="reserva-campo">
                      <label className="reserva-label">Serviço / Pacote</label>
                      <select value={idServico} onChange={e => setIdServico(Number(e.target.value) || '')} className="reserva-select">
                        <option value="">Selecione um serviço</option>
                        {servicos.map(s => (
                          <option key={s.ID_SERVICO} value={s.ID_SERVICO}>
                            {s.TIPO} — {s.VALOR.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/pessoa
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {guias.length > 0 && (
                    <div className="reserva-campo">
                      <label className="reserva-label">Guia (opcional)</label>
                      <select value={idGuia} onChange={e => setIdGuia(Number(e.target.value) || '')} className="reserva-select">
                        <option value="">Sem guia específico</option>
                        {guias.map(g => (
                          <option key={g.ID_GUIA} value={g.ID_GUIA}>{g.NOME}{g.IDIOMAS ? ` — ${g.IDIOMAS}` : ''}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="reserva-campo">
                    <label className="reserva-label">Data do passeio *</label>
                    <input type="date" value={dataPasseio} onChange={e => setDataPasseio(e.target.value)}
                      min={hoje} className="reserva-input" required />
                  </div>

                  <div className="reserva-campo">
                    <label className="reserva-label">Número de pessoas *</label>
                    <div className="reserva-counter">
                      <button type="button" onClick={() => setQtdPessoas(q => Math.max(1, q - 1))} className="counter-btn">−</button>
                      <span className="counter-valor">{qtdPessoas}</span>
                      <button type="button" onClick={() => setQtdPessoas(q => Math.min(20, q + 1))} className="counter-btn">+</button>
                    </div>
                  </div>

                  {valorTotal > 0 && (
                    <div className="reserva-total">
                      <span>Total estimado</span>
                      <span className="reserva-total-valor">{valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                  )}

                  {erroReserva && <p className="reserva-erro">❌ {erroReserva}</p>}

                  <button type="submit" className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }} disabled={reservando}>
                    {reservando ? 'Processando...' : session ? '🗺️ Reservar agora' : '🔐 Entrar para reservar'}
                  </button>

                  {!session && (
                    <p className="reserva-login-hint">
                      <Link href={`/auth/login?callbackUrl=/rotas/${id}`} className="auth-link">Faça login</Link>{' '}
                      ou <Link href="/auth/cadastro" className="auth-link">crie uma conta</Link> para reservar.
                    </p>
                  )}
                </form>
              )}
            </div>
          </aside>
        </div>
      </div>

      <DetalheStyles />
    </div>
  );
}

function DetalheSkeleton() {
  return (
    <div style={{ paddingTop: '70px' }}>
      <div style={{ height: '360px', background: 'var(--cinza-claro)' }} />
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div style={{ height: '28px', width: '60%', background: 'var(--cinza-borda)', borderRadius: '8px', marginBottom: '1rem' }} />
        <div style={{ height: '16px', width: '40%', background: 'var(--cinza-borda)', borderRadius: '8px' }} />
      </div>
      <DetalheStyles />
    </div>
  );
}

function DetalheStyles() {
  return (
    <style>{`
      .detalhe-page { min-height: 100vh; padding-top: 70px; background: var(--creme-suave); }
      .detalhe-hero { position: relative; height: 360px; overflow: hidden; }
      .detalhe-hero-img { width: 100%; height: 100%; object-fit: cover; }
      .detalhe-hero-placeholder { width: 100%; height: 100%; background: linear-gradient(135deg, var(--laranja-manga-light), var(--verde-palmeira-light)); display: flex; align-items: center; justify-content: center; }
      .detalhe-hero-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 60%, transparent 100%); }
      .detalhe-hero-conteudo { position: absolute; bottom: 0; left: 0; right: 0; padding: 2rem 1.5rem; }
      .detalhe-voltar { display: inline-block; color: rgba(255,255,255,0.7); font-size: 0.85rem; text-decoration: none; margin-bottom: 0.75rem; transition: color var(--transicao); }
      .detalhe-voltar:hover { color: white; }
      .detalhe-titulo { font-family: var(--fonte-display); font-size: clamp(1.6rem, 4vw, 2.4rem); color: white; margin: 0.5rem 0 0.35rem; line-height: 1.2; }
      .detalhe-local { font-size: 0.9rem; color: rgba(255,255,255,0.75); margin-bottom: 0.5rem; }
      .detalhe-rating { display: flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; color: rgba(255,255,255,0.85); }
      .detalhe-container { padding: 2rem 1.5rem 4rem; }
      .detalhe-layout { display: grid; grid-template-columns: 1fr; gap: 2rem; }
      @media(min-width:900px){ .detalhe-layout { grid-template-columns: 1fr 340px; } }
      .detalhe-info-rapida { display: flex; flex-wrap: wrap; gap: 1rem; padding: 1.25rem; background: var(--branco-puro); border-radius: var(--radius-lg); box-shadow: var(--sombra-sm); }
      .info-rapida-item { display: flex; align-items: center; gap: 0.6rem; }
      .info-rapida-icone { font-size: 1.3rem; }
      .info-rapida-label { font-size: 0.72rem; color: var(--texto-suave); text-transform: uppercase; letter-spacing: 0.05em; }
      .info-rapida-valor { font-weight: 700; font-size: 0.9rem; }
      .detalhe-secao { background: var(--branco-puro); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: var(--sombra-sm); }
      .detalhe-secao-titulo { font-family: var(--fonte-display); font-size: 1.2rem; margin-bottom: 1rem; }
      .secao-count { font-size: 0.85rem; color: var(--texto-suave); font-weight: 400; }
      .detalhe-desc { color: var(--texto-secundario); line-height: 1.7; font-size: 0.95rem; }
      .pontos-lista { display: flex; flex-direction: column; gap: 0.75rem; }
      .ponto-item { display: flex; gap: 1rem; align-items: flex-start; }
      .ponto-numero { width: 28px; height: 28px; background: var(--laranja-manga); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.78rem; font-weight: 800; flex-shrink: 0; margin-top: 2px; }
      .ponto-nome { font-weight: 700; font-size: 0.95rem; }
      .ponto-desc { font-size: 0.85rem; color: var(--texto-suave); margin-top: 0.2rem; line-height: 1.4; }
      .guias-grade { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.75rem; }
      .guia-card { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border: 1.5px solid var(--cinza-borda); border-radius: var(--radius-md); }
      .guia-avatar { width: 36px; height: 36px; background: var(--verde-palmeira); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 0.9rem; flex-shrink: 0; }
      .guia-nome { font-weight: 700; font-size: 0.88rem; }
      .guia-idiomas { font-size: 0.78rem; color: var(--texto-suave); margin-top: 0.1rem; }
      .aval-form { background: var(--creme-medio); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; }
      .aval-form-titulo { font-weight: 700; font-size: 0.9rem; }
      .aval-estrelas { display: flex; gap: 0.25rem; }
      .aval-estrela-btn { background: none; border: none; cursor: pointer; padding: 0; line-height: 1; }
      .aval-textarea { width: 100%; padding: 0.65rem 0.85rem; border: 1.5px solid var(--cinza-borda); border-radius: var(--radius-md); font-family: var(--fonte-corpo); font-size: 0.88rem; resize: vertical; outline: none; }
      .aval-textarea:focus { border-color: var(--laranja-manga); }
      .aval-erro { font-size: 0.85rem; color: #B91C1C; }
      .aval-sucesso { background: var(--verde-palmeira-light); color: var(--verde-palmeira-dark); padding: 0.75rem 1rem; border-radius: var(--radius-md); font-size: 0.88rem; margin-bottom: 1rem; }
      .aval-vazio { font-size: 0.88rem; color: var(--texto-suave); font-style: italic; }
      .avaliacoes-lista { display: flex; flex-direction: column; gap: 1rem; }
      .avaliacao-item { padding: 1rem; border: 1px solid var(--cinza-borda); border-radius: var(--radius-md); }
      .avaliacao-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem; }
      .avaliacao-autor { display: flex; align-items: center; gap: 0.6rem; }
      .avaliacao-avatar { width: 32px; height: 32px; background: var(--laranja-manga); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.8rem; font-weight: 800; flex-shrink: 0; }
      .avaliacao-nome { font-weight: 700; font-size: 0.88rem; }
      .avaliacao-data { font-size: 0.75rem; color: var(--texto-suave); }
      .avaliacao-comentario { font-size: 0.88rem; color: var(--texto-secundario); font-style: italic; line-height: 1.5; }
      .detalhe-sidebar { position: sticky; top: 86px; align-self: start; }
      .reserva-card { background: var(--branco-puro); border-radius: var(--radius-xl); box-shadow: var(--sombra-lg); padding: 1.75rem; }
      .reserva-card-titulo { font-family: var(--fonte-display); font-size: 1.2rem; font-weight: 700; margin-bottom: 1.25rem; }
      .reserva-form { display: flex; flex-direction: column; gap: 1rem; }
      .reserva-campo { display: flex; flex-direction: column; gap: 0.35rem; }
      .reserva-label { font-size: 0.82rem; font-weight: 700; color: var(--texto-principal); }
      .reserva-select, .reserva-input { width: 100%; padding: 0.65rem 0.85rem; border: 1.5px solid var(--cinza-borda); border-radius: var(--radius-md); font-family: var(--fonte-corpo); font-size: 0.9rem; color: var(--texto-principal); background: var(--branco-puro); outline: none; transition: border-color var(--transicao); }
      .reserva-select:focus, .reserva-input:focus { border-color: var(--laranja-manga); }
      .reserva-counter { display: flex; align-items: center; border: 1.5px solid var(--cinza-borda); border-radius: var(--radius-md); overflow: hidden; }
      .counter-btn { width: 40px; height: 40px; background: var(--cinza-claro); border: none; font-size: 1.1rem; cursor: pointer; transition: background var(--transicao); display: flex; align-items: center; justify-content: center; }
      .counter-btn:hover { background: var(--laranja-manga-light); }
      .counter-valor { flex: 1; text-align: center; font-weight: 700; font-size: 1rem; }
      .reserva-total { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--creme-medio); border-radius: var(--radius-md); }
      .reserva-total-valor { font-family: var(--fonte-display); font-weight: 800; font-size: 1.1rem; color: var(--laranja-manga); }
      .reserva-erro { font-size: 0.85rem; color: #B91C1C; }
      .reserva-login-hint { font-size: 0.82rem; color: var(--texto-suave); text-align: center; }
      .reserva-sucesso { text-align: center; padding: 1rem 0; display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
      .auth-link { color: var(--laranja-manga); font-weight: 600; text-decoration: none; }
    `}</style>
  );
}