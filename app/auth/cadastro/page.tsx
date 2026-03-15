'use client';
// app/auth/cadastro/page.tsx
// Página de cadastro — suporta TURISTA e EMPRESA.
// Campos extras aparecem conforme o tipo selecionado.

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { TipoUsuario } from '@/lib/types';

export default function CadastroPage() {
  const router = useRouter();

  // ── Estado do formulário ──────────────────────────────────
  const [tipo,         setTipo]         = useState<TipoUsuario>('TURISTA');
  const [nome,         setNome]         = useState('');
  const [email,        setEmail]        = useState('');
  const [senha,        setSenha]        = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [telefone,     setTelefone]     = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Campos de empresa
  const [cnpj,        setCnpj]        = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');

  // Campos de contato de emergência (turista)
  const [emergNome,        setEmergNome]        = useState('');
  const [emergTelefone,    setEmergTelefone]    = useState('');
  const [emergParentesco,  setEmergParentesco]  = useState('');

  const [carregando, setCarregando] = useState(false);
  const [erro,       setErro]       = useState<string | null>(null);
  const [sucesso,    setSucesso]    = useState(false);

  // ── Submit ────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);

    // Validações no cliente
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }
    if (senha.length < 8) {
      setErro('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    setCarregando(true);

    try {
      // Chama o endpoint de cadastro
      const res = await fetch('/api/auth/cadastro', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome, email, senha, telefone, tipo,
          cnpj,        razaoSocial,
          contatoEmergenciaNome:       emergNome       || undefined,
          contatoEmergenciaTelefone:   emergTelefone   || undefined,
          contatoEmergenciaParentesco: emergParentesco || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || 'Erro ao realizar cadastro.');
        return;
      }

      setSucesso(true);

      // Faz login automático após cadastro bem-sucedido
      const loginResult = await signIn('credentials', {
        email:    email.toLowerCase().trim(),
        senha,
        redirect: false,
      });

      if (loginResult?.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        // Cadastro funcionou mas login automático falhou — redireciona ao login
        router.push('/auth/login?cadastro=sucesso');
      }

    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  // ── Máscara simples de CNPJ (didática) ───────────────────
  function formatarCNPJ(valor: string) {
    const d = valor.replace(/\D/g, '').slice(0, 14);
    return d
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }

  return (
    <div className="auth-page">
      <div className="auth-bg" aria-hidden="true" />

      <div className="auth-container auth-container-wide">

        {/* Painel lateral */}
        <div className="auth-destaque auth-destaque-cadastro">
          <div className="auth-destaque-conteudo">
            <div className="auth-destaque-emoji">🧭</div>
            <h2 className="auth-destaque-titulo">
              Comece sua jornada pelo Brasil
            </h2>
            <p className="auth-destaque-sub">
              Crie sua conta gratuitamente e acesse rotas, hotéis e restaurantes
              de todo o país.
            </p>
            <div className="cadastro-beneficios">
              {[
                ['🗺️', 'Acesse rotas exclusivas'],
                ['📅', 'Faça reservas com facilidade'],
                ['⭐', 'Avalie e compartilhe'],
              ].map(([icon, texto]) => (
                <div key={texto} className="cadastro-beneficio">
                  <span>{icon}</span>
                  <span>{texto}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card do formulário */}
        <div className="auth-card">

          {/* Logo */}
          <Link href="/" className="auth-logo">
            <span className="auth-logo-icone">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.8"/>
                <circle cx="12" cy="12" r="2" fill="white"/>
                <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M9 9l6 3-3 6-6-3z" fill="white" opacity="0.9"/>
              </svg>
            </span>
            <span className="auth-logo-texto">ROTA</span>
          </Link>

          <h1 className="auth-titulo">Criar conta gratuita</h1>
          <p className="auth-subtitulo">Preencha os dados abaixo para começar</p>

          {/* Seletor de tipo */}
          <div className="tipo-selector">
            {(['TURISTA', 'EMPRESA'] as TipoUsuario[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                className={`tipo-btn ${tipo === t ? 'tipo-btn-ativo' : ''}`}
              >
                {t === 'TURISTA' ? '🧳 Sou Turista' : '🏢 Sou Empresa'}
              </button>
            ))}
          </div>

          {erro && <div className="auth-alerta auth-alerta-erro">❌ {erro}</div>}
          {sucesso && <div className="auth-alerta auth-alerta-sucesso">✅ Cadastro realizado! Redirecionando...</div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>

            {/* ── Dados básicos ── */}
            <div className="form-linha-dupla">
              <div className="auth-campo">
                <label className="auth-label">Nome completo *</label>
                <input type="text" value={nome} onChange={e => setNome(e.target.value)}
                  placeholder="Seu nome" className="auth-input" required disabled={carregando} />
              </div>
              <div className="auth-campo">
                <label className="auth-label">Telefone</label>
                <input type="tel" value={telefone} onChange={e => setTelefone(e.target.value)}
                  placeholder="(11) 99999-9999" className="auth-input" disabled={carregando} />
              </div>
            </div>

            <div className="auth-campo">
              <label className="auth-label">E-mail *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com" className="auth-input" required disabled={carregando} />
            </div>

            <div className="form-linha-dupla">
              <div className="auth-campo">
                <label className="auth-label">Senha * <span className="auth-hint">(mín. 8 caracteres)</span></label>
                <div className="auth-input-wrapper">
                  <input type={mostrarSenha ? 'text' : 'password'} value={senha}
                    onChange={e => setSenha(e.target.value)}
                    placeholder="Crie uma senha" className="auth-input auth-input-com-icone"
                    required disabled={carregando} />
                  <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="auth-toggle-senha" aria-label="Mostrar/ocultar senha">
                    {mostrarSenha ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div className="auth-campo">
                <label className="auth-label">Confirmar senha *</label>
                <input type={mostrarSenha ? 'text' : 'password'} value={confirmarSenha}
                  onChange={e => setConfirmarSenha(e.target.value)}
                  placeholder="Repita a senha" className="auth-input"
                  required disabled={carregando} />
              </div>
            </div>

            {/* ── Campos de Empresa ── */}
            {tipo === 'EMPRESA' && (
              <div className="campos-extras">
                <p className="campos-extras-titulo">Dados da empresa</p>
                <div className="auth-campo">
                  <label className="auth-label">Razão Social *</label>
                  <input type="text" value={razaoSocial} onChange={e => setRazaoSocial(e.target.value)}
                    placeholder="Nome oficial da empresa" className="auth-input"
                    required disabled={carregando} />
                </div>
                <div className="auth-campo">
                  <label className="auth-label">CNPJ *</label>
                  <input type="text" value={cnpj}
                    onChange={e => setCnpj(formatarCNPJ(e.target.value))}
                    placeholder="00.000.000/0001-00" className="auth-input"
                    maxLength={18} required disabled={carregando} />
                </div>
              </div>
            )}

            {/* ── Contato de Emergência (Turista) ── */}
            {tipo === 'TURISTA' && (
              <div className="campos-extras">
                <p className="campos-extras-titulo">Contato de emergência <span className="auth-hint">(opcional)</span></p>
                <div className="form-linha-dupla">
                  <div className="auth-campo">
                    <label className="auth-label">Nome</label>
                    <input type="text" value={emergNome} onChange={e => setEmergNome(e.target.value)}
                      placeholder="Nome do contato" className="auth-input" disabled={carregando} />
                  </div>
                  <div className="auth-campo">
                    <label className="auth-label">Parentesco</label>
                    <input type="text" value={emergParentesco} onChange={e => setEmergParentesco(e.target.value)}
                      placeholder="Ex: Mãe, Cônjuge" className="auth-input" disabled={carregando} />
                  </div>
                </div>
                <div className="auth-campo">
                  <label className="auth-label">Telefone do contato</label>
                  <input type="tel" value={emergTelefone} onChange={e => setEmergTelefone(e.target.value)}
                    placeholder="(11) 99999-9999" className="auth-input" disabled={carregando} />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary auth-btn-submit" disabled={carregando}>
              {carregando ? <><span className="auth-spinner" /> Criando conta...</> : 'Criar minha conta grátis'}
            </button>
          </form>

          <p className="auth-rodape">
            Já tem conta?{' '}
            <Link href="/auth/login" className="auth-link">Fazer login</Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 2rem 1rem;
          position: relative;
          background: var(--creme-suave);
        }
        .auth-bg {
          position: fixed; inset: 0;
          background:
            radial-gradient(ellipse at 80% 20%, rgba(255,107,26,0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 20% 80%, rgba(46,204,113,0.08) 0%, transparent 50%);
          pointer-events: none; z-index: 0;
        }
        .auth-container {
          position: relative; z-index: 1;
          display: grid; grid-template-columns: 1fr;
          width: 100%; max-width: 900px;
          background: var(--branco-puro);
          border-radius: var(--radius-xl);
          box-shadow: var(--sombra-lg);
          overflow: hidden;
        }
        .auth-container-wide { max-width: 1000px; }
        @media (min-width: 768px) {
          .auth-container { grid-template-columns: 1fr 1.4fr; }
        }
        .auth-card {
          padding: 2.5rem 2rem;
          display: flex; flex-direction: column; gap: 0;
          overflow-y: auto; max-height: 90vh;
        }
        .auth-logo {
          display: flex; align-items: center; gap: 0.5rem;
          text-decoration: none; margin-bottom: 1.5rem;
        }
        .auth-logo-icone {
          width: 36px; height: 36px;
          background: var(--laranja-manga); border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
        }
        .auth-logo-texto {
          font-family: var(--fonte-display); font-weight: 800;
          font-size: 1.4rem; color: var(--texto-principal);
        }
        .auth-titulo { font-size: 1.5rem; margin-bottom: 0.2rem; }
        .auth-subtitulo { font-size: 0.9rem; color: var(--texto-suave); margin-bottom: 1.25rem; }
        .auth-hint { font-weight: 400; color: var(--texto-suave); }

        /* Seletor de tipo */
        .tipo-selector {
          display: flex; gap: 0.5rem;
          background: var(--cinza-claro);
          border-radius: var(--radius-md);
          padding: 0.3rem;
          margin-bottom: 1.25rem;
        }
        .tipo-btn {
          flex: 1; padding: 0.6rem;
          border: none; border-radius: var(--radius-sm);
          font-family: var(--fonte-corpo); font-size: 0.88rem; font-weight: 600;
          cursor: pointer; transition: all var(--transicao);
          background: transparent; color: var(--texto-suave);
        }
        .tipo-btn-ativo {
          background: var(--branco-puro);
          color: var(--laranja-manga);
          box-shadow: var(--sombra-sm);
        }

        /* Alertas */
        .auth-alerta {
          padding: 0.75rem 1rem; border-radius: var(--radius-md);
          font-size: 0.88rem; margin-bottom: 1rem; line-height: 1.4;
        }
        .auth-alerta-erro    { background: #FEF2F2; color: #B91C1C; border: 1px solid #FECACA; }
        .auth-alerta-sucesso { background: var(--verde-palmeira-light); color: var(--verde-palmeira-dark); border: 1px solid #A7F3D0; }
        .auth-alerta-aviso   { background: #FFFBEB; color: #92400E; border: 1px solid #FDE68A; }

        /* Formulário */
        .auth-form { display: flex; flex-direction: column; gap: 1rem; }
        .auth-campo { display: flex; flex-direction: column; gap: 0.35rem; }
        .auth-label { font-size: 0.85rem; font-weight: 700; color: var(--texto-principal); }
        .auth-label-row { display: flex; justify-content: space-between; align-items: center; }
        .auth-link-pequeno { font-size: 0.82rem; color: var(--azul-turquesa); }
        .auth-link-pequeno:hover { color: var(--azul-turquesa-hover); }

        .form-linha-dupla { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        @media (max-width: 500px) { .form-linha-dupla { grid-template-columns: 1fr; } }

        .auth-input {
          width: 100%; padding: 0.7rem 0.9rem;
          border: 1.5px solid var(--cinza-borda);
          border-radius: var(--radius-md);
          font-family: var(--fonte-corpo); font-size: 0.92rem;
          color: var(--texto-principal); background: var(--branco-puro);
          transition: border-color var(--transicao), box-shadow var(--transicao);
          outline: none;
        }
        .auth-input:focus {
          border-color: var(--laranja-manga);
          box-shadow: 0 0 0 3px rgba(255,107,26,0.12);
        }
        .auth-input:disabled { opacity: 0.6; cursor: not-allowed; }
        .auth-input-com-icone { padding-right: 3rem; }
        .auth-input-wrapper { position: relative; }
        .auth-toggle-senha {
          position: absolute; right: 0.75rem; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          font-size: 1rem; padding: 0.25rem; opacity: 0.6;
          transition: opacity var(--transicao);
        }
        .auth-toggle-senha:hover { opacity: 1; }

        /* Campos extras */
        .campos-extras {
          background: var(--creme-medio);
          border-radius: var(--radius-md);
          padding: 1rem;
          display: flex; flex-direction: column; gap: 0.75rem;
        }
        .campos-extras-titulo {
          font-size: 0.82rem; font-weight: 700;
          color: var(--texto-secundario);
          text-transform: uppercase; letter-spacing: 0.05em;
        }

        /* Botão */
        .auth-btn-submit {
          width: 100%; justify-content: center;
          padding: 0.85rem; font-size: 1rem; margin-top: 0.5rem;
        }
        .auth-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .auth-link { color: var(--laranja-manga); font-weight: 700; }
        .auth-link:hover { color: var(--laranja-manga-hover); }
        .auth-rodape {
          text-align: center; font-size: 0.88rem;
          color: var(--texto-suave); margin-top: 1.25rem;
        }

        /* Painel lateral */
        .auth-destaque {
          display: none;
          padding: 3rem 2rem;
          align-items: center; justify-content: center;
        }
        .auth-destaque-cadastro {
          background: linear-gradient(160deg, #1A2A3A 0%, #1A1A1A 100%);
        }
        @media (min-width: 768px) { .auth-destaque { display: flex; } }
        .auth-destaque-conteudo { color: white; }
        .auth-destaque-emoji { font-size: 3rem; margin-bottom: 1.25rem; }
        .auth-destaque-titulo {
          font-family: var(--fonte-display); font-size: 1.5rem; font-weight: 700;
          color: white; margin-bottom: 0.75rem; line-height: 1.3;
        }
        .auth-destaque-sub {
          font-size: 0.9rem; color: rgba(255,255,255,0.65);
          line-height: 1.6; margin-bottom: 1.75rem;
        }
        .cadastro-beneficios { display: flex; flex-direction: column; gap: 0.75rem; }
        .cadastro-beneficio {
          display: flex; gap: 0.75rem; align-items: center;
          font-size: 0.9rem; color: rgba(255,255,255,0.8);
        }
      `}</style>
    </div>
  );
}