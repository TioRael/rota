// app/sobre/page.tsx — Sobre o projeto ROTA
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre | ROTA',
  description: 'Conheca o projeto ROTA — plataforma de turismo desenvolvida por estudantes de ADS Modulo 5.',
};

const EQUIPE = [
  { nome: 'Israel Menezes', github: 'TioRael', papel: 'Desenvolvedor Full-Stack', descricao: 'Responsavel pela arquitetura do sistema, banco de dados MySQL, APIs e deploy na Vercel.', emoji: '👨‍💻', cor: 'var(--laranja-manga)' },
  { nome: 'Felipe',         github: '',         papel: 'Desenvolvedor Front-End',  descricao: 'Responsavel pela identidade visual, componentes de interface e experiencia do usuario.',  emoji: '🎨',   cor: 'var(--verde-palmeira)' },
  { nome: 'Roberta',        github: '',         papel: 'Analista e Documentacao',  descricao: 'Responsavel pela modelagem de dados, requisitos e documentacao do projeto.',               emoji: '📋',   cor: 'var(--azul-turquesa)' },
];

const FAQ = [
  { q: 'O que e o ROTA?',                    r: 'ROTA e uma plataforma de turismo brasileira que conecta turistas, empresas de turismo, hoteis e restaurantes em um unico lugar.' },
  { q: 'Como cadastrar minha empresa?',       r: 'Acesse o cadastro, selecione "Sou Empresa" e preencha CNPJ e Razao Social. Apos isso voce acessa o painel de gestao.' },
  { q: 'Como funciona o sistema de reservas?',r: 'Turistas criam conta, escolhem rota ou hospedagem, selecionam datas e confirmam. Tudo fica disponivel no painel.' },
  { q: 'Posso avaliar rotas e hoteis?',       r: 'Sim! Turistas autenticados podem avaliar de 1 a 5 estrelas com comentarios.' },
  { q: 'O uso e gratuito?',                  r: 'O cadastro e uso para turistas e gratuito. Os valores indicados sao dos servicos das empresas parceiras.' },
  { q: 'Quais tecnologias foram usadas?',     r: 'Next.js 16, TypeScript, MySQL/Aiven, NextAuth.js e deploy na Vercel. Projeto academico do Modulo 5 de ADS.' },
];

export default function SobrePage() {
  return (
    <div className="sobre-page">
      <div className="sobre-hero">
        <div className="container sobre-hero-inner">
          <div style={{fontSize:'4rem',marginBottom:'1rem'}}>🗺️</div>
          <h1 className="sobre-h1">Sobre o ROTA</h1>
          <p className="sobre-label">Registro Organizado de Trajetos e Acomodacoes</p>
          <p className="sobre-hero-desc">Uma plataforma de turismo 100% brasileira, desenvolvida por estudantes de Analise e Desenvolvimento de Sistemas — Modulo 5.</p>
        </div>
      </div>

      <section className="sobre-section">
        <div className="container">
          <div className="missao-grid">
            {[
              {emoji:'🎯',titulo:'Missao', texto:'Conectar turistas brasileiros as melhores experiencias de viagem, facilitando o acesso a rotas, hospedagens e gastronomia local.'},
              {emoji:'👁️',titulo:'Visao',  texto:'Ser a principal plataforma de turismo interno do Brasil, valorizando o turismo nacional e impulsionando empresas locais.'},
              {emoji:'💚',titulo:'Valores',texto:'Autenticidade, sustentabilidade, inclusao e valorizacao da cultura brasileira em cada rota e cada destino da plataforma.'},
            ].map(({emoji,titulo,texto})=>(
              <div key={titulo} className="missao-card">
                <span style={{fontSize:'2.5rem',display:'block',marginBottom:'1rem'}}>{emoji}</span>
                <h3 style={{fontFamily:'var(--fonte-display)',fontSize:'1.2rem',marginBottom:'0.75rem'}}>{titulo}</h3>
                <p style={{fontSize:'0.92rem',color:'var(--texto-secundario)',lineHeight:1.7}}>{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sobre-section sobre-section-alt">
        <div className="container">
          <div className="sobre-secao-header">
            <span className="badge badge-laranja">Nossa historia</span>
            <h2>Como o ROTA nasceu</h2>
            <div className="divisor-tropical"/>
          </div>
          <div className="historia-texto">
            <p>O ROTA nasceu como projeto academico do <strong>Modulo 5</strong> do curso de <strong>Analise e Desenvolvimento de Sistemas</strong>. A proposta era construir uma plataforma completa aplicando os conceitos aprendidos: banco de dados relacional, full-stack web, autenticacao e deploy em nuvem.</p>
            <p>Escolhemos turismo por sua riqueza e diversidade. O Brasil tem destinos incriveis — da Chapada Diamantina as Cataratas, de Noronha a Amazonia — mas carecia de uma plataforma nacional que conectasse turistas as empresas locais.</p>
            <p>O resultado e uma aplicacao completa com cadastro, sistema de rotas com pontos turisticos, reservas de hospedagem e passeios, avaliacoes verificadas e paineis por tipo de usuario.</p>
          </div>
          <div className="tech-card">
            <h3 style={{fontFamily:'var(--fonte-display)',fontSize:'1.1rem',marginBottom:'1.5rem',textAlign:'center'}}>Stack tecnologica</h3>
            <div className="tech-grade">
              {[
                {nome:'Next.js 16', desc:'Framework full-stack',emoji:'⚡'},
                {nome:'TypeScript', desc:'Tipagem estatica',    emoji:'🔷'},
                {nome:'MySQL/Aiven',desc:'Banco em nuvem',      emoji:'🗄️'},
                {nome:'NextAuth.js',desc:'Autenticacao JWT',    emoji:'🔐'},
                {nome:'Tailwind',   desc:'Estilizacao',         emoji:'🎨'},
                {nome:'Vercel',     desc:'Deploy producao',     emoji:'🚀'},
              ].map(({nome,desc,emoji})=>(
                <div key={nome} className="tech-item">
                  <span style={{fontSize:'1.75rem',display:'block',marginBottom:'0.4rem'}}>{emoji}</span>
                  <p style={{fontWeight:700,fontSize:'0.82rem'}}>{nome}</p>
                  <p style={{fontSize:'0.72rem',color:'var(--texto-suave)',marginTop:'0.15rem'}}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="sobre-section">
        <div className="container">
          <div className="sobre-secao-header">
            <span className="badge badge-verde">Quem fez</span>
            <h2>Nossa equipe</h2>
            <div className="divisor-tropical"/>
          </div>
          <div className="equipe-grade">
            {EQUIPE.map(m=>(
              <div key={m.nome} className="membro-card">
                <div style={{width:'80px',height:'80px',borderRadius:'50%',background:m.cor,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem'}}>{m.emoji}</div>
                <h3 style={{fontFamily:'var(--fonte-display)',fontSize:'1.1rem'}}>{m.nome}</h3>
                <p style={{fontSize:'0.82rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',color:m.cor}}>{m.papel}</p>
                <p style={{fontSize:'0.85rem',color:'var(--texto-suave)',lineHeight:1.5,textAlign:'center'}}>{m.descricao}</p>
                {m.github&&(
                  <a href={`https://github.com/${m.github}`} target="_blank" rel="noopener noreferrer"
                    style={{display:'inline-flex',alignItems:'center',gap:'0.35rem',fontSize:'0.82rem',color:'var(--azul-turquesa)',textDecoration:'none'}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                    @{m.github}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sobre-section sobre-section-alt">
        <div className="container">
          <div className="sobre-secao-header">
            <span className="badge badge-azul">Duvidas</span>
            <h2>Perguntas frequentes</h2>
            <div className="divisor-tropical"/>
          </div>
          <div className="faq-lista">
            {FAQ.map(({q,r})=>(
              <div key={q} className="faq-item">
                <h3 style={{fontFamily:'var(--fonte-display)',fontSize:'1rem',display:'flex',gap:'0.6rem',marginBottom:'0.6rem'}}><span>❓</span>{q}</h3>
                <p style={{fontSize:'0.9rem',color:'var(--texto-secundario)',lineHeight:1.7,paddingLeft:'1.6rem'}}>{r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{padding:'5rem 0',background:'linear-gradient(135deg,#1A3A2A 0%,#1A1A1A 100%)',textAlign:'center'}}>
        <div className="container" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'1rem'}}>
          <h2 style={{color:'white',fontSize:'clamp(1.5rem,3vw,2rem)'}}>Pronto para explorar o Brasil?</h2>
          <p style={{color:'rgba(255,255,255,0.65)',fontSize:'0.95rem'}}>Crie sua conta gratuita e descubra rotas incriveis.</p>
          <div style={{display:'flex',gap:'1rem',flexWrap:'wrap',justifyContent:'center',marginTop:'0.5rem'}}>
            <Link href="/auth/cadastro" className="btn btn-primary">Criar conta gratis</Link>
            <Link href="/rotas" className="btn btn-ghost">Ver rotas</Link>
          </div>
        </div>
      </section>

      <style>{`
        .sobre-page{min-height:100vh;padding-top:70px;background:var(--creme-suave);}
        .sobre-hero{background:linear-gradient(160deg,#1A1A1A 0%,#2D3A2E 60%,#1A2A3A 100%);padding:5rem 0 4rem;text-align:center;}
        .sobre-hero-inner{display:flex;flex-direction:column;align-items:center;}
        .sobre-h1{font-family:var(--fonte-display);font-size:clamp(2rem,5vw,3rem);color:white;margin-bottom:0.5rem;}
        .sobre-label{font-size:0.9rem;color:var(--laranja-manga);font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:1.25rem;}
        .sobre-hero-desc{color:rgba(255,255,255,0.65);max-width:540px;line-height:1.7;}
        .sobre-section{padding:5rem 0;}
        .sobre-section-alt{background:var(--creme-medio);}
        .sobre-secao-header{text-align:center;margin-bottom:3rem;display:flex;flex-direction:column;align-items:center;gap:0.5rem;}
        .missao-grid{display:grid;grid-template-columns:1fr;gap:1.5rem;}
        @media(min-width:768px){.missao-grid{grid-template-columns:repeat(3,1fr);}}
        .missao-card{background:var(--branco-puro);border-radius:var(--radius-lg);padding:2rem;box-shadow:var(--sombra-sm);text-align:center;}
        .historia-texto{max-width:720px;margin:0 auto 3rem;display:flex;flex-direction:column;gap:1rem;}
        .historia-texto p{font-size:0.95rem;color:var(--texto-secundario);line-height:1.8;}
        .historia-texto strong{color:var(--texto-principal);font-weight:700;}
        .tech-card{background:var(--branco-puro);border-radius:var(--radius-lg);padding:2rem;box-shadow:var(--sombra-sm);}
        .tech-grade{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;}
        @media(min-width:640px){.tech-grade{grid-template-columns:repeat(6,1fr);}}
        .tech-item{text-align:center;padding:1rem 0.5rem;border-radius:var(--radius-md);background:var(--creme-suave);}
        .equipe-grade{display:grid;grid-template-columns:1fr;gap:1.5rem;}
        @media(min-width:640px){.equipe-grade{grid-template-columns:repeat(3,1fr);}}
        .membro-card{background:var(--branco-puro);border-radius:var(--radius-lg);padding:2rem;box-shadow:var(--sombra-sm);display:flex;flex-direction:column;align-items:center;gap:0.75rem;transition:all var(--transicao);}
        .membro-card:hover{box-shadow:var(--sombra-md);transform:translateY(-4px);}
        .faq-lista{max-width:720px;margin:0 auto;display:flex;flex-direction:column;gap:1rem;}
        .faq-item{background:var(--branco-puro);border-radius:var(--radius-lg);padding:1.5rem;box-shadow:var(--sombra-sm);border-left:4px solid var(--azul-turquesa);}
      `}</style>
    </div>
  );
}