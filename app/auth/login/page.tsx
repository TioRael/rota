'use client';
// app/auth/login/page.tsx
// Página de login — Client Component (usa useState, signIn do NextAuth).
// Visual alinhado à identidade Tropicália do ROTA.

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  // ── Estado do formulário ──────────────────────────────────
  const [email,       setEmail]       = useState('');
  const [senha,       setSenha]       = useState('');
  const [mostrarSenha,setMostrarSenha]= useState(false);
  const [carregando,  setCarregando]  = useState(false);
  const [erro,        setErro]        = useState<string | null>(null);

  // Mensagem de erro vinda da URL (ex: ?erro=acesso_negado)
  const erroUrl = searchParams.get('erro');
  const mensagemErroUrl =
    erroUrl === 'acesso_negado' ? 'Você não tem permissão para acessar esta página.' :
    erroUrl === 'sessao_expirada' ? 'Sua sessão expirou. Faça login novamente.' :
    null;

  // ── Submit do formulário ──────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!email.trim() || !senha) {
      setErro('Preencha e-mail e senha.');
      return;
    }

    setCarregando(true);

    try {
      // signIn do NextAuth com redirect: false para tratar o erro aqui
      const resultado = await signIn('credentials', {
        email:    email.toLowerCase().trim(),
        senha,
        redirect: false,
      });

      if (resultado?.error) {
        // O NextAuth retorna mensagens de erro como string
        setErro(resultado.error === 'CredentialsSignin'
          ? 'E-mail ou senha incorretos.'
          : resultado.error
        );
        return;
      }

      // Login bem-sucedido — redireciona ao dashboard
      const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
      router.push(callbackUrl);
      router.refresh(); // garante que a sessão é lida na navbar

    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="auth-page">
      {/* Fundo decorativo */}
      <div className="auth-bg" aria-hidden="true" />

      <div className="auth-container">
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

          <h1 className="auth-titulo">Bem-vindo de volta!</h1>
          <p className="auth-subtitulo">Entre na sua conta para continuar explorando</p>

          {/* Alerta de erro de URL */}
          {mensagemErroUrl && (
            <div className="auth-alerta auth-alerta-aviso">
              ⚠️ {mensagemErroUrl}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="auth-form" noValidate>

            {/* Campo E-mail */}
            <div className="auth-campo">
              <label htmlFor="email" className="auth-label">E-mail</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="auth-input"
                autoComplete="email"
                required
                disabled={carregando}
              />
            </div>

            {/* Campo Senha */}
            <div className="auth-campo">
              <div className="auth-label-row">
                <label htmlFor="senha" className="auth-label">Senha</label>
                <Link href="/auth/esqueci-senha" className="auth-link-pequeno">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="auth-input-wrapper">
                <input
                  id="senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Sua senha"
                  className="auth-input auth-input-com-icone"
                  autoComplete="current-password"
                  required
                  disabled={carregando}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="auth-toggle-senha"
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {mostrarSenha ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Mensagem de erro */}
            {erro && (
              <div className="auth-alerta auth-alerta-erro">
                ❌ {erro}
              </div>
            )}

            {/* Botão submit */}
            <button
              type="submit"
              className="btn btn-primary auth-btn-submit"
              disabled={carregando}
            >
              {carregando ? (
                <>
                  <span className="auth-spinner" />
                  Entrando...
                </>
              ) : (
                'Entrar na minha conta'
              )}
            </button>
          </form>

          {/* Rodapé do card */}
          <p className="auth-rodape">
            Não tem conta?{' '}
            <Link href="/auth/cadastro" className="auth-link">
              Cadastre-se gratuitamente
            </Link>
          </p>
        </div>

        {/* Destaque lateral */}
        <div className="auth-destaque">
          <div className="auth-destaque-conteudo">
            <div className="auth-destaque-emoji">🌴</div>
            <h2 className="auth-destaque-titulo">
              O Brasil inteiro na palma da sua mão
            </h2>
            <p className="auth-destaque-sub">
              Rotas incríveis, hotéis selecionados e restaurantes autênticos —
              organizados para você viajar sem complicação.
            </p>
            <div className="auth-destaque-stats">
              {[['200+', 'Rotas'], ['50+', 'Cidades'], ['4.8★', 'Avaliação']].map(([num, label]) => (
                <div key={label} className="auth-destaque-stat">
                  <span className="auth-destaque-stat-num">{num}</span>
                  <span className="auth-destaque-stat-label">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Estilos da página de autenticação */}
      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          position: relative;
          background: var(--creme-suave);
        }
        .auth-bg {
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse at 80% 20%, rgba(255,107,26,0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 20% 80%, rgba(46,204,113,0.08) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }
        .auth-container {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr;
          width: 100%;
          max-width: 900px;
          background: var(--branco-puro);
          border-radius: var(--radius-xl);
          box-shadow: var(--sombra-lg);
          overflow: hidden;
        }
        @media (min-width: 768px) {
          .auth-container { grid-template-columns: 1fr 1fr; }
        }

        /* Card do formulário */
        .auth-card {
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .auth-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          margin-bottom: 2rem;
        }
        .auth-logo-icone {
          width: 36px; height: 36px;
          background: var(--laranja-manga);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
        }
        .auth-logo-texto {
          font-family: var(--fonte-display);
          font-weight: 800;
          font-size: 1.4rem;
          color: var(--texto-principal);
        }
        .auth-titulo {
          font-size: 1.6rem;
          margin-bottom: 0.25rem;
        }
        .auth-subtitulo {
          font-size: 0.9rem;
          color: var(--texto-suave);
          margin-bottom: 1.5rem;
        }

        /* Alertas */
        .auth-alerta {
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.88rem;
          margin-bottom: 1rem;
          line-height: 1.4;
        }
        .auth-alerta-erro   { background: #FEF2F2; color: #B91C1C; border: 1px solid #FECACA; }
        .auth-alerta-aviso  { background: #FFFBEB; color: #92400E; border: 1px solid #FDE68A; }
        .auth-alerta-sucesso{ background: var(--verde-palmeira-light); color: var(--verde-palmeira-dark); border: 1px solid #A7F3D0; }

        /* Formulário */
        .auth-form { display: flex; flex-direction: column; gap: 1.25rem; }
        .auth-campo { display: flex; flex-direction: column; gap: 0.4rem; }
        .auth-label {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--texto-principal);
        }
        .auth-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .auth-link-pequeno {
          font-size: 0.82rem;
          color: var(--azul-turquesa);
        }
        .auth-link-pequeno:hover { color: var(--azul-turquesa-hover); }

        .auth-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1.5px solid var(--cinza-borda);
          border-radius: var(--radius-md);
          font-family: var(--fonte-corpo);
          font-size: 0.95rem;
          color: var(--texto-principal);
          background: var(--branco-puro);
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
          position: absolute;
          right: 0.75rem; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          cursor: pointer; font-size: 1rem;
          padding: 0.25rem;
          opacity: 0.6;
          transition: opacity var(--transicao);
        }
        .auth-toggle-senha:hover { opacity: 1; }

        /* Botão submit */
        .auth-btn-submit {
          width: 100%;
          justify-content: center;
          padding: 0.85rem;
          font-size: 1rem;
          margin-top: 0.5rem;
        }

        /* Spinner de loading */
        .auth-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Links */
        .auth-link { color: var(--laranja-manga); font-weight: 700; }
        .auth-link:hover { color: var(--laranja-manga-hover); }
        .auth-rodape {
          text-align: center;
          font-size: 0.88rem;
          color: var(--texto-suave);
          margin-top: 1.5rem;
        }

        /* Painel decorativo lateral */
        .auth-destaque {
          display: none;
          background: linear-gradient(160deg, #1A3A2A 0%, #1A1A1A 100%);
          padding: 3rem 2rem;
          align-items: center;
          justify-content: center;
        }
        @media (min-width: 768px) {
          .auth-destaque { display: flex; }
        }
        .auth-destaque-conteudo { color: white; }
        .auth-destaque-emoji { font-size: 3rem; margin-bottom: 1.25rem; }
        .auth-destaque-titulo {
          font-family: var(--fonte-display);
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }
        .auth-destaque-sub {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.65);
          line-height: 1.6;
          margin-bottom: 2rem;
        }
        .auth-destaque-stats {
          display: flex;
          gap: 1.5rem;
        }
        .auth-destaque-stat { display: flex; flex-direction: column; gap: 0.15rem; }
        .auth-destaque-stat-num {
          font-family: var(--fonte-display);
          font-weight: 800;
          font-size: 1.4rem;
          color: var(--laranja-manga);
        }
        .auth-destaque-stat-label { font-size: 0.78rem; color: rgba(255,255,255,0.55); }
      `}</style>
    </div>
  );
}