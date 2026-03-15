'use client';
// components/MapaBrasil.tsx
// Mapa SVG interativo do Brasil — clique num estado para ver as rotas.
// Dados buscados da API /api/mapa (rotas reais do banco).
// Uso na home: <MapaBrasil /> (sem props — busca os dados internamente)

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';

// ─── Tipos ────────────────────────────────────────────────────
interface RotaEstado {
  ID_ROTA: number; NOME: string; DURACAO: string | null;
  CATEGORIA: string | null; CIDADE: string; ESTADO: string;
  MEDIA_AVALIACAO: number | null; PRECO_MIN: number | null;
}
interface DadosMapa {
  estados:        { ESTADO: string; TOTAL_ROTAS: number }[];
  rotasPorEstado: Record<string, RotaEstado[]>;
}

const EMOJI_CAT: Record<string, string> = {
  'Praias':'🏖️','Natureza':'🌿','Cultural':'🏛️',
  'Aventura':'🏔️','Gastronomia':'🍽️','Urbano':'🌆',
};

const NOMES_UF: Record<string, string> = {
  AC:'Acre',AL:'Alagoas',AP:'Amapá',AM:'Amazonas',BA:'Bahia',
  CE:'Ceará',DF:'Distrito Federal',ES:'Espírito Santo',GO:'Goiás',
  MA:'Maranhão',MT:'Mato Grosso',MS:'Mato Grosso do Sul',
  MG:'Minas Gerais',PA:'Pará',PB:'Paraíba',PR:'Paraná',
  PE:'Pernambuco',PI:'Piauí',RJ:'Rio de Janeiro',RN:'Rio Grande do Norte',
  RS:'Rio Grande do Sul',RO:'Rondônia',RR:'Roraima',SC:'Santa Catarina',
  SP:'São Paulo',SE:'Sergipe',TO:'Tocantins',
};

// ─── Paths SVG dos 27 estados (viewBox 0 0 500 530) ──────────
// Coordenadas simplificadas mas proporcionais ao mapa real
const ESTADOS_SVG: Record<string, string> = {
  AM:'M60 118 L185 98 L212 130 L222 182 L192 224 L138 242 L78 232 L48 192Z',
  PA:'M212 90 L305 78 L332 118 L322 172 L282 202 L222 182 L212 130Z',
  RO:'M138 242 L192 224 L214 262 L182 292 L138 282Z',
  AC:'M58 232 L138 242 L138 282 L78 278 L48 258Z',
  RR:'M98 78 L182 58 L182 98 L118 108 L78 98Z',
  AP:'M305 58 L342 52 L348 88 L312 94 L305 78Z',
  TO:'M282 168 L322 162 L328 222 L292 252 L262 232 L268 202Z',
  MA:'M305 98 L365 92 L372 135 L342 162 L312 158 L298 132Z',
  PI:'M342 138 L382 132 L392 175 L362 202 L338 188 L338 162Z',
  CE:'M372 118 L418 112 L422 155 L392 172 L372 158 L368 138Z',
  RN:'M418 102 L448 108 L448 138 L422 148 L418 128Z',
  PB:'M422 148 L452 142 L450 162 L422 168Z',
  PE:'M392 172 L448 162 L450 185 L422 195 L388 190Z',
  AL:'M422 195 L450 188 L448 210 L422 212Z',
  SE:'M422 212 L448 208 L445 228 L422 228Z',
  BA:'M342 188 L398 185 L418 228 L402 292 L352 312 L308 282 L292 252 L328 222Z',
  MT:'M158 272 L262 258 L282 312 L242 358 L162 348 L138 308Z',
  GO:'M268 248 L312 248 L322 308 L282 332 L258 318Z',
  DF:'M297 278 L312 278 L312 292 L297 292Z',
  MS:'M198 348 L282 332 L298 382 L252 412 L195 392Z',
  MG:'M298 295 L358 288 L388 312 L372 362 L312 378 L282 358Z',
  SP:'M258 378 L312 372 L328 412 L282 432 L242 418Z',
  RJ:'M342 362 L388 358 L392 388 L358 398 L332 382Z',
  ES:'M372 322 L402 318 L408 358 L388 362Z',
  PR:'M258 418 L322 410 L332 448 L282 462 L252 450Z',
  SC:'M260 452 L328 448 L332 478 L272 482Z',
  RS:'M258 482 L328 480 L332 512 L282 520 L248 508Z',
};

// ─── Componente ───────────────────────────────────────────────
export default function MapaBrasil() {
  const [dados,        setDados]        = useState<DadosMapa | null>(null);
  const [ufAtiva,      setUfAtiva]      = useState<string | null>(null);
  const [carregando,   setCarregando]   = useState(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    fetch('/api/mapa')
      .then(r => r.json())
      .then(d => setDados(d))
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, []);

  const estadosComRota = new Set(dados?.estados.map(e => e.ESTADO) ?? []);
  const rotasAtivas    = ufAtiva ? (dados?.rotasPorEstado[ufAtiva] ?? []) : [];
  const nomeAtivo      = ufAtiva ? NOMES_UF[ufAtiva] ?? ufAtiva : null;
  const totalAtivo     = ufAtiva ? (dados?.estados.find(e => e.ESTADO === ufAtiva)?.TOTAL_ROTAS ?? 0) : 0;

  function selecionar(uf: string) {
    startTransition(() => setUfAtiva(prev => prev === uf ? null : uf));
  }

  return (
    <div className="mapa-section">
      <div className="mapa-layout">

        {/* ── SVG do mapa ── */}
        <div className="mapa-svg-container">
          {carregando ? (
            <div className="mapa-loading">
              <div className="mapa-spinner" />
              <p>Carregando mapa...</p>
            </div>
          ) : (
            <svg
              viewBox="0 0 500 530"
              xmlns="http://www.w3.org/2000/svg"
              className="mapa-svg"
              role="img"
              aria-label="Mapa interativo do Brasil"
            >
              {Object.entries(ESTADOS_SVG).map(([uf, path]) => {
                const temRota = estadosComRota.has(uf);
                const ativo   = ufAtiva === uf;
                return (
                  <path
                    key={uf}
                    d={path}
                    className={[
                      'mapa-estado',
                      temRota  ? 'mapa-estado-com-rota' : '',
                      ativo    ? 'mapa-estado-ativo'    : '',
                    ].join(' ')}
                    onClick={() => selecionar(uf)}
                    role="button"
                    aria-label={`${NOMES_UF[uf] ?? uf}${temRota ? ` — ${dados?.estados.find(e=>e.ESTADO===uf)?.TOTAL_ROTAS} rota(s)` : ''}`}
                    aria-pressed={ativo}
                  >
                    <title>{NOMES_UF[uf] ?? uf}{temRota ? ` (${dados?.estados.find(e=>e.ESTADO===uf)?.TOTAL_ROTAS} rota${totalAtivo !== 1 ? 's' : ''})` : ''}</title>
                  </path>
                );
              })}
            </svg>
          )}

          {/* Legenda */}
          <div className="mapa-legenda">
            <div className="mapa-leg-item">
              <div className="mapa-leg-cor mapa-leg-cor-rota" />
              <span>Com rotas</span>
            </div>
            <div className="mapa-leg-item">
              <div className="mapa-leg-cor mapa-leg-cor-ativo" />
              <span>Selecionado</span>
            </div>
            <div className="mapa-leg-item">
              <div className="mapa-leg-cor mapa-leg-cor-vazio" />
              <span>Sem rotas ainda</span>
            </div>
          </div>
        </div>

        {/* ── Painel lateral ── */}
        <div className="mapa-painel">
          {!ufAtiva ? (
            /* Estado inicial */
            <div className="mapa-painel-idle">
              <div className="mapa-painel-idle-icone">🗺️</div>
              <h3 className="mapa-painel-idle-titulo">Explore o Brasil</h3>
              <p className="mapa-painel-idle-sub">
                Clique em qualquer estado para ver as rotas disponíveis naquela região.
              </p>
              {dados && (
                <div className="mapa-painel-resumo">
                  <div className="mapa-resumo-item">
                    <p className="mapa-resumo-num">{dados.estados.length}</p>
                    <p className="mapa-resumo-label">estados cobertos</p>
                  </div>
                  <div className="mapa-resumo-divider" />
                  <div className="mapa-resumo-item">
                    <p className="mapa-resumo-num">
                      {dados.estados.reduce((acc, e) => acc + e.TOTAL_ROTAS, 0)}
                    </p>
                    <p className="mapa-resumo-label">rotas no total</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Estado selecionado */
            <div className="mapa-painel-ativo">
              <div className="mapa-painel-header">
                <div>
                  <p className="mapa-painel-uf">{ufAtiva}</p>
                  <h3 className="mapa-painel-nome">{nomeAtivo}</h3>
                </div>
                <div className="mapa-painel-contagem">
                  <p className="mapa-painel-contagem-num">{totalAtivo}</p>
                  <p className="mapa-painel-contagem-label">rota{totalAtivo !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {rotasAtivas.length > 0 ? (
                <div className="mapa-rotas-lista">
                  {rotasAtivas.map(rota => (
                    <Link key={rota.ID_ROTA} href={`/rotas/${rota.ID_ROTA}`} className="mapa-rota-card">
                      <div className="mapa-rota-topo">
                        <span className="mapa-rota-emoji">
                          {EMOJI_CAT[rota.CATEGORIA ?? ''] ?? '🗺️'}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p className="mapa-rota-nome">{rota.NOME}</p>
                          <p className="mapa-rota-local">📍 {rota.CIDADE}</p>
                        </div>
                        {rota.MEDIA_AVALIACAO && (
                          <span className="mapa-rota-nota">⭐ {rota.MEDIA_AVALIACAO}</span>
                        )}
                      </div>
                      <div className="mapa-rota-rodape">
                        {rota.DURACAO && <span>⏱ {rota.DURACAO}</span>}
                        {rota.PRECO_MIN && (
                          <span className="mapa-rota-preco">
                            {rota.PRECO_MIN.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="mapa-sem-rotas">
                  <p>😕</p>
                  <p>Nenhuma rota cadastrada em {nomeAtivo} ainda.</p>
                  <p style={{ fontSize: '0.82rem', marginTop: '0.5rem' }}>
                    É uma empresa de turismo deste estado?
                  </p>
                  <Link href="/empresas" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
                    Cadastrar rota
                  </Link>
                </div>
              )}

              <button
                className="mapa-btn-ver-todas"
                onClick={() => window.location.href = `/rotas?estado=${ufAtiva}`}
              >
                Ver todas as rotas de {ufAtiva} →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}