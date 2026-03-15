'use client';
// app/contato/page.tsx — Pagina de Contato
import { useState, FormEvent } from 'react';

export default function ContatoPage() {
  const [nome,     setNome]     = useState('');
  const [email,    setEmail]    = useState('');
  const [assunto,  setAssunto]  = useState('');
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [sucesso,  setSucesso]  = useState(false);
  const [erro,     setErro]     = useState<string|null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nome.trim()||!email.trim()||!mensagem.trim()) { setErro('Preencha todos os campos obrigatorios.'); return; }
    setEnviando(true); setErro(null);
    await new Promise(r=>setTimeout(r,1200));
    setSucesso(true); setEnviando(false);
  }

  return (
    <div style={{minHeight:'100vh',paddingTop:'70px',background:'var(--creme-suave)'}}>
      <div style={{background:'linear-gradient(135deg,#1A2A3A 0%,#1A1A1A 100%)',padding:'4rem 0 3rem',textAlign:'center'}}>
        <div className="container">
          <div style={{fontSize:'3rem',marginBottom:'0.75rem'}}>📧</div>
          <h1 style={{fontFamily:'var(--fonte-display)',fontSize:'clamp(1.8rem,4vw,2.5rem)',color:'white',marginBottom:'0.5rem'}}>Fale conosco</h1>
          <p style={{color:'rgba(255,255,255,0.6)',fontSize:'0.95rem'}}>Duvidas, sugestoes ou parcerias? Estamos aqui!</p>
        </div>
      </div>

      <div className="container" style={{padding:'3rem 1.5rem 5rem'}}>
        <div className="contato-layout">
          <div>
            <h2 style={{fontFamily:'var(--fonte-display)',fontSize:'1.3rem',marginBottom:'1.5rem'}}>Informacoes de contato</h2>
            {[
              {icone:'🎓',titulo:'Projeto academico',texto:'Modulo 5 — Analise e Desenvolvimento de Sistemas'},
              {icone:'💻',titulo:'Repositorio',texto:'github.com/TioRael',link:'https://github.com/TioRael'},
              {icone:'🚀',titulo:'Deploy',texto:'Hospedado na Vercel',link:'https://vercel.com'},
            ].map(({icone,titulo,texto,link})=>(
              <div key={titulo} style={{display:'flex',gap:'1rem',padding:'1rem',borderRadius:'var(--radius-md)',background:'var(--branco-puro)',boxShadow:'var(--sombra-sm)',marginBottom:'1rem'}}>
                <span style={{fontSize:'1.5rem',flexShrink:0}}>{icone}</span>
                <div>
                  <p style={{fontWeight:700,fontSize:'0.9rem',marginBottom:'0.15rem'}}>{titulo}</p>
                  {link
                    ? <a href={link} target="_blank" rel="noopener noreferrer" style={{fontSize:'0.85rem',color:'var(--azul-turquesa)',textDecoration:'none'}}>{texto}</a>
                    : <p style={{fontSize:'0.85rem',color:'var(--texto-suave)'}}>{texto}</p>
                  }
                </div>
              </div>
            ))}
            <div style={{marginTop:'1.5rem',padding:'1.25rem',background:'var(--laranja-manga-light)',borderRadius:'var(--radius-lg)',borderLeft:'4px solid var(--laranja-manga)'}}>
              <p style={{fontSize:'0.88rem',color:'var(--texto-secundario)',lineHeight:1.6}}>
                <strong>Nota:</strong> Este e um projeto academico. O formulario e demonstrativo. Para contato real, acesse o repositorio no GitHub.
              </p>
            </div>
          </div>

          <div style={{background:'var(--branco-puro)',borderRadius:'var(--radius-xl)',boxShadow:'var(--sombra-md)',padding:'2rem'}}>
            <h2 style={{fontFamily:'var(--fonte-display)',fontSize:'1.3rem',marginBottom:'1.5rem'}}>Enviar mensagem</h2>
            {sucesso ? (
              <div style={{textAlign:'center',padding:'2rem',display:'flex',flexDirection:'column',alignItems:'center',gap:'0.75rem'}}>
                <p style={{fontSize:'3rem'}}>✅</p>
                <h3 style={{fontFamily:'var(--fonte-display)'}}>Mensagem enviada!</h3>
                <p style={{color:'var(--texto-suave)',fontSize:'0.9rem'}}>Obrigado pelo contato. Retornaremos em breve.</p>
                <button onClick={()=>{setSucesso(false);setNome('');setEmail('');setAssunto('');setMensagem('');}} className="btn btn-outline btn-sm">Enviar outra mensagem</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'1.25rem'}} noValidate>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}} className="contato-linha-dupla">
                  <div style={{display:'flex',flexDirection:'column',gap:'0.35rem'}}>
                    <label style={{fontSize:'0.85rem',fontWeight:700}}>Nome *</label>
                    <input type="text" value={nome} onChange={e=>setNome(e.target.value)} placeholder="Seu nome completo" className="contato-input" required disabled={enviando}/>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:'0.35rem'}}>
                    <label style={{fontSize:'0.85rem',fontWeight:700}}>E-mail *</label>
                    <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" className="contato-input" required disabled={enviando}/>
                  </div>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'0.35rem'}}>
                  <label style={{fontSize:'0.85rem',fontWeight:700}}>Assunto</label>
                  <select value={assunto} onChange={e=>setAssunto(e.target.value)} className="contato-input" disabled={enviando}>
                    <option value="">Selecione um assunto</option>
                    <option value="duvida">Duvida geral</option>
                    <option value="parceria">Parceria comercial</option>
                    <option value="sugestao">Sugestao de melhoria</option>
                    <option value="bug">Relatar problema</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'0.35rem'}}>
                  <label style={{fontSize:'0.85rem',fontWeight:700}}>Mensagem *</label>
                  <textarea value={mensagem} onChange={e=>setMensagem(e.target.value)} placeholder="Escreva sua mensagem aqui..." rows={5}
                    style={{width:'100%',padding:'0.75rem',border:'1.5px solid var(--cinza-borda)',borderRadius:'var(--radius-md)',fontFamily:'var(--fonte-corpo)',fontSize:'0.92rem',resize:'vertical',outline:'none'}}
                    disabled={enviando}/>
                </div>
                {erro&&<p style={{color:'#B91C1C',fontSize:'0.85rem'}}>❌ {erro}</p>}
                <button type="submit" className="btn btn-primary" style={{justifyContent:'center'}} disabled={enviando}>
                  {enviando?<><span className="contato-spinner"/> Enviando...</>:'📧 Enviar mensagem'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .contato-layout{display:grid;grid-template-columns:1fr;gap:2rem;}
        @media(min-width:768px){.contato-layout{grid-template-columns:1fr 1.4fr;}}
        .contato-input{width:100%;padding:0.7rem 0.9rem;border:1.5px solid var(--cinza-borda);border-radius:var(--radius-md);font-family:var(--fonte-corpo);font-size:0.92rem;color:var(--texto-principal);background:var(--branco-puro);outline:none;transition:border-color var(--transicao);}
        .contato-input:focus{border-color:var(--laranja-manga);box-shadow:0 0 0 3px rgba(255,107,26,0.12);}
        .contato-input:disabled{opacity:0.6;cursor:not-allowed;}
        .contato-spinner{display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,0.4);border-top-color:white;border-radius:50%;animation:spin 0.7s linear infinite;margin-right:0.25rem;vertical-align:middle;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @media(max-width:520px){.contato-linha-dupla{grid-template-columns:1fr!important;}}
      `}</style>
    </div>
  );
}