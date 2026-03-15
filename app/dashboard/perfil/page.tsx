'use client';
// app/perfil/page.tsx
// Página de edição de perfil do usuário logado.
// Permite editar nome, telefone e contato de emergência (turistas).

import { useState, useEffect, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Nota: metadata não funciona em Client Components.
// Para adicionar título, crie um layout.tsx na pasta /perfil.

interface FormPerfil {
  nome:                        string;
  telefone:                    string;
  contatoEmergenciaNome:       string;
  contatoEmergenciaTelefone:   string;
  contatoEmergenciaParentesco: string;
}

export default function PerfilPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [form,       setForm]       = useState<FormPerfil>({ nome: '', telefone: '', contatoEmergenciaNome: '', contatoEmergenciaTelefone: '', contatoEmergenciaParentesco: '' });
  const [carregando, setCarregando] = useState(true);
  const [salvando,   setSalvando]   = useState(false);
  const [sucesso,    setSucesso]    = useState(false);
  const [erro,       setErro]       = useState<string | null>(null);

  // Redireciona se não autenticado
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
  }, [status, router]);

  // Carrega dados atuais do perfil
  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/perfil')
      .then(r => r.json())
      .then(data => {
        if (data.usuario) {
          setForm({
            nome:                        data.usuario.NOME                          ?? '',
            telefone:                    data.usuario.TELEFONE                      ?? '',
            contatoEmergenciaNome:       data.usuario.CONTATO_EMERGENCIA_NOME       ?? '',
            contatoEmergenciaTelefone:   data.usuario.CONTATO_EMERGENCIA_TELEFONE   ?? '',
            contatoEmergenciaParentesco: data.usuario.CONTATO_EMERGENCIA_PARENTESCO ?? '',
          });
        }
      })
      .catch(() => setErro('Erro ao carregar perfil.'))
      .finally(() => setCarregando(false));
  }, [status]);

  function handleChange(campo: keyof FormPerfil, valor: string) {
    setForm(prev => ({ ...prev, [campo]: valor }));
    setSucesso(false);
    setErro(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) { setErro('O nome é obrigatório.'); return; }
    setSalvando(true);
    setErro(null);

    try {
      const res = await fetch('/api/perfil', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.error ?? 'Erro ao salvar.'); return; }
      setSucesso(true);
      // Atualiza o nome na sessão do NextAuth
      await update({ name: form.nome.trim() });
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  if (status === 'loading' || carregando) {
    return (
      <div className="perfil-page">
        <div className="container perfil-container">
          {[1,2,3,4].map(i => <div key={i} className="perfil-skeleton" />)}
        </div>
        <PerfilStyles />
      </div>
    );
  }

  if (!session) return null;

  const ehTurista = session.user.tipo === 'TURISTA';

  return (
    <div className="perfil-page">
      <div className="container perfil-container">

        {/* Breadcrumb */}
        <div className="perfil-breadcrumb">
          <Link href="/dashboard" className="perfil-breadcrumb-link">Dashboard</Link>
          <span>/</span>
          <span>Meu Perfil</span>
        </div>

        {/* Card principal */}
        <div className="perfil-card">

          {/* Cabeçalho */}
          <div className="perfil-header">
            <div className="perfil-avatar">
              {session.user.name[0].toUpperCase()}
            </div>
            <div>
              <h1 className="perfil-nome">{session.user.name}</h1>
              <p className="perfil-email">{session.user.email}</p>
              <span className={`perfil-tipo-badge perfil-tipo-${session.user.tipo.toLowerCase()}`}>
                {session.user.tipo}
              </span>
            </div>
          </div>

          {/* Alertas */}
          {sucesso && <div className="perfil-alerta perfil-alerta-sucesso">✅ Perfil atualizado com sucesso!</div>}
          {erro    && <div className="perfil-alerta perfil-alerta-erro">❌ {erro}</div>}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="perfil-form" noValidate>

            {/* Dados básicos */}
            <div className="perfil-grupo">
              <h2 className="perfil-grupo-titulo">Dados pessoais</h2>

              <div className="perfil-linha-dupla">
                <div className="perfil-campo">
                  <label className="perfil-label">Nome completo *</label>
                  <input
                    type="text"
                    value={form.nome}
                    onChange={e => handleChange('nome', e.target.value)}
                    className="perfil-input"
                    required
                    disabled={salvando}
                  />
                </div>
                <div className="perfil-campo">
                  <label className="perfil-label">Telefone</label>
                  <input
                    type="tel"
                    value={form.telefone}
                    onChange={e => handleChange('telefone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="perfil-input"
                    disabled={salvando}
                  />
                </div>
              </div>

              {/* E-mail (somente leitura) */}
              <div className="perfil-campo">
                <label className="perfil-label">E-mail <span className="perfil-hint">(não editável)</span></label>
                <input
                  type="email"
                  value={session.user.email}
                  className="perfil-input perfil-input-readonly"
                  readOnly
                  disabled
                />
              </div>
            </div>

            {/* Contato de emergência — apenas turistas */}
            {ehTurista && (
              <div className="perfil-grupo">
                <h2 className="perfil-grupo-titulo">
                  Contato de emergência
                  <span className="perfil-hint"> — recomendado para passeios de aventura</span>
                </h2>

                <div className="perfil-linha-dupla">
                  <div className="perfil-campo">
                    <label className="perfil-label">Nome do contato</label>
                    <input
                      type="text"
                      value={form.contatoEmergenciaNome}
                      onChange={e => handleChange('contatoEmergenciaNome', e.target.value)}
                      placeholder="Nome completo"
                      className="perfil-input"
                      disabled={salvando}
                    />
                  </div>
                  <div className="perfil-campo">
                    <label className="perfil-label">Parentesco</label>
                    <input
                      type="text"
                      value={form.contatoEmergenciaParentesco}
                      onChange={e => handleChange('contatoEmergenciaParentesco', e.target.value)}
                      placeholder="Ex: Mãe, Cônjuge, Amigo"
                      className="perfil-input"
                      disabled={salvando}
                    />
                  </div>
                </div>

                <div className="perfil-campo">
                  <label className="perfil-label">Telefone do contato</label>
                  <input
                    type="tel"
                    value={form.contatoEmergenciaTelefone}
                    onChange={e => handleChange('contatoEmergenciaTelefone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="perfil-input"
                    style={{ maxWidth: '280px' }}
                    disabled={salvando}
                  />
                </div>
              </div>
            )}

            {/* Rodapé do formulário */}
            <div className="perfil-footer">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={salvando}
              >
                {salvando ? <><span className="perfil-spinner" /> Salvando...</> : '💾 Salvar alterações'}
              </button>
              <Link href="/dashboard" className="btn btn-outline">
                Voltar ao painel
              </Link>
            </div>
          </form>
        </div>
      </div>

      <PerfilStyles />
    </div>
  );
}

function PerfilStyles() {
  return (
    <style>{`
      .perfil-page { min-height: 100vh; padding-top: 70px; background: var(--creme-suave); }
      .perfil-container { max-width: 720px; padding: 2.5rem 1.5rem 4rem; }

      .perfil-breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--texto-suave); margin-bottom: 1.5rem; }
      .perfil-breadcrumb-link { color: var(--laranja-manga); text-decoration: none; }
      .perfil-breadcrumb-link:hover { text-decoration: underline; }

      .perfil-card { background: var(--branco-puro); border-radius: var(--radius-xl); box-shadow: var(--sombra-md); overflow: hidden; }

      .perfil-header { display: flex; align-items: center; gap: 1.25rem; padding: 2rem; background: linear-gradient(135deg, #1A1A1A, #2D3A2E); flex-wrap: wrap; }
      .perfil-avatar { width: 64px; height: 64px; background: var(--laranja-manga); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: var(--fonte-display); font-size: 1.75rem; font-weight: 800; color: white; flex-shrink: 0; }
      .perfil-nome  { font-family: var(--fonte-display); font-size: 1.4rem; color: white; margin-bottom: 0.15rem; }
      .perfil-email { font-size: 0.85rem; color: rgba(255,255,255,0.55); margin-bottom: 0.5rem; }
      .perfil-tipo-badge { font-size: 0.72rem; font-weight: 800; padding: 0.2rem 0.75rem; border-radius: var(--radius-full); text-transform: uppercase; letter-spacing: 0.05em; }
      .perfil-tipo-turista { background: rgba(255,107,26,0.2); color: var(--laranja-manga); }
      .perfil-tipo-empresa { background: rgba(46,204,113,0.2); color: var(--verde-palmeira); }
      .perfil-tipo-admin   { background: rgba(0,188,212,0.2); color: var(--azul-turquesa); }

      .perfil-alerta { margin: 1.5rem 2rem 0; padding: 0.75rem 1rem; border-radius: var(--radius-md); font-size: 0.88rem; }
      .perfil-alerta-sucesso { background: var(--verde-palmeira-light); color: var(--verde-palmeira-dark); border: 1px solid #A7F3D0; }
      .perfil-alerta-erro    { background: #FEF2F2; color: #B91C1C; border: 1px solid #FECACA; }

      .perfil-form { padding: 2rem; display: flex; flex-direction: column; gap: 2rem; }

      .perfil-grupo { display: flex; flex-direction: column; gap: 1rem; }
      .perfil-grupo-titulo { font-size: 1rem; font-weight: 700; color: var(--texto-principal); padding-bottom: 0.75rem; border-bottom: 1px solid var(--cinza-borda); }
      .perfil-hint { font-weight: 400; color: var(--texto-suave); font-size: 0.85rem; }

      .perfil-linha-dupla { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
      @media(max-width:520px){ .perfil-linha-dupla { grid-template-columns: 1fr; } }

      .perfil-campo { display: flex; flex-direction: column; gap: 0.35rem; }
      .perfil-label { font-size: 0.85rem; font-weight: 700; color: var(--texto-principal); }

      .perfil-input { width: 100%; padding: 0.7rem 0.9rem; border: 1.5px solid var(--cinza-borda); border-radius: var(--radius-md); font-family: var(--fonte-corpo); font-size: 0.92rem; color: var(--texto-principal); background: var(--branco-puro); transition: border-color var(--transicao), box-shadow var(--transicao); outline: none; }
      .perfil-input:focus { border-color: var(--laranja-manga); box-shadow: 0 0 0 3px rgba(255,107,26,0.12); }
      .perfil-input:disabled { opacity: 0.6; cursor: not-allowed; }
      .perfil-input-readonly { background: var(--cinza-claro); color: var(--texto-suave); }

      .perfil-footer { display: flex; gap: 1rem; flex-wrap: wrap; padding-top: 0.5rem; border-top: 1px solid var(--cinza-borda); }

      .perfil-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; margin-right: 0.25rem; vertical-align: middle; }
      @keyframes spin { to { transform: rotate(360deg); } }

      .perfil-skeleton { height: 60px; background: linear-gradient(90deg, var(--cinza-borda) 25%, var(--cinza-claro) 50%, var(--cinza-borda) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: var(--radius-md); margin-bottom: 1rem; }
      @keyframes shimmer { to { background-position: -200% 0; } }
    `}</style>
  );
}