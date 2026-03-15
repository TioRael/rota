// app/privacidade/page.tsx — Politica de Privacidade (LGPD)
import type { Metadata } from 'next';
import Link from 'next/link';
export const metadata: Metadata = { title: 'Politica de Privacidade | ROTA' };
const SECOES = [
  { t:'1. Informacoes que Coletamos',      items:['Dados de cadastro: nome, e-mail, telefone e senha (armazenada em hash bcrypt)','Para empresas: CNPJ e Razao Social','Dados de emergencia (opcionais): nome, telefone e parentesco do contato','Dados de uso: reservas, rotas visualizadas e avaliacoes publicadas','Dados tecnicos: logs de acesso e informacoes do navegador'] },
  { t:'2. Como Usamos seus Dados',          items:['Autenticacao e gerenciamento da sua conta','Processamento de reservas','Exibicao de conteudo personalizado','Comunicacao sobre reservas e atualizacoes','Melhoria dos nossos servicos','Cumprimento de obrigacoes legais'] },
  { t:'3. Base Legal (LGPD)',               items:['Execucao de contrato: para processar reservas e fornecer servicos','Consentimento: para comunicacoes de marketing (revogavel a qualquer momento)','Interesse legitimo: seguranca e prevencao de fraudes','Obrigacao legal: quando exigido por lei ou autoridade competente'] },
  { t:'4. Compartilhamento de Dados',       items:['Empresas parceiras: apenas dados necessarios para reservas','Provedores: Aiven (banco) e Vercel (hospedagem), sob contratos de confidencialidade','Autoridades: quando exigido por lei','Nao vendemos ou compartilhamos dados para fins publicitarios'] },
  { t:'5. Seguranca dos Dados',             items:['Senhas armazenadas exclusivamente como hash bcrypt','Comunicacao criptografada via HTTPS/TLS','Banco de dados com SSL obrigatorio e certificado CA','Acesso restrito via autenticacao JWT com expiracao de 7 dias','Sem armazenamento de dados de cartao de credito'] },
  { t:'6. Seus Direitos (LGPD)',             items:['Acesso: solicitar copia dos seus dados pessoais','Correcao: atualizar dados incorretos (via pagina de Perfil)','Exclusao: solicitar remocao dos dados, salvo obrigacoes legais','Portabilidade: receber dados em formato estruturado','Revogacao de consentimento a qualquer momento','Oposicao: contestar o uso dos dados para determinadas finalidades'] },
  { t:'7. Cookies e Tecnologias',           items:['Cookies de sessao: necessarios para autenticacao (JWT)','Nao utilizamos cookies de rastreamento ou publicidade','Nao utilizamos analytics de terceiros que coletam dados pessoais'] },
  { t:'8. Retencao de Dados',               items:['Dados de conta: mantidos enquanto a conta estiver ativa','Dados de reservas: mantidos por 5 anos para fins legais','Logs de acesso: mantidos por 90 dias','Apos exclusao: dados anonimizados ou excluidos em ate 30 dias'] },
];
export default function PrivacidadePage() {
  return (
    <div style={{minHeight:'100vh',paddingTop:'70px',background:'var(--creme-suave)'}}>
      <div style={{background:'linear-gradient(135deg,#1A2A3A,#1A1A1A)',padding:'3rem 0 2.5rem',textAlign:'center'}}>
        <div className="container">
          <div style={{fontSize:'2.5rem',marginBottom:'0.75rem'}}>🔒</div>
          <h1 style={{fontFamily:'var(--fonte-display)',fontSize:'clamp(1.8rem,4vw,2.5rem)',color:'white',marginBottom:'0.5rem'}}>Politica de Privacidade</h1>
          <p style={{color:'rgba(255,255,255,0.55)',fontSize:'0.88rem'}}>Ultima atualizacao: 01 de Janeiro de 2025 — Em conformidade com a LGPD</p>
        </div>
      </div>
      <div className="container" style={{padding:'3rem 1.5rem 5rem',maxWidth:'820px'}}>
        <div style={{background:'var(--branco-puro)',borderRadius:'var(--radius-xl)',padding:'2.5rem',boxShadow:'var(--sombra-md)'}}>
          <p style={{fontSize:'0.95rem',color:'var(--texto-secundario)',lineHeight:1.8,marginBottom:'2rem',padding:'1rem',background:'var(--azul-turquesa-light)',borderRadius:'var(--radius-md)',borderLeft:'4px solid var(--azul-turquesa)'}}>
            Esta Politica descreve como o ROTA coleta, usa e protege seus dados, em conformidade com a <strong>LGPD — Lei 13.709/2018</strong>.
          </p>
          <div style={{display:'flex',flexDirection:'column',gap:'2rem'}}>
            {SECOES.map(({t,items})=>(
              <div key={t}>
                <h2 style={{fontFamily:'var(--fonte-display)',fontSize:'1.05rem',marginBottom:'0.75rem'}}>{t}</h2>
                <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                  {items.map((item,i)=>(
                    <li key={i} style={{display:'flex',gap:'0.6rem',fontSize:'0.92rem',color:'var(--texto-secundario)',lineHeight:1.6}}>
                      <span style={{color:'var(--verde-palmeira)',flexShrink:0,marginTop:'2px'}}>✓</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{marginTop:'2rem',padding:'1.25rem',background:'var(--verde-palmeira-light)',borderRadius:'var(--radius-lg)',borderLeft:'4px solid var(--verde-palmeira)'}}>
            <h3 style={{fontFamily:'var(--fonte-display)',fontSize:'1rem',marginBottom:'0.5rem',color:'var(--verde-palmeira-dark)'}}>Exercer seus direitos</h3>
            <p style={{fontSize:'0.88rem',color:'var(--texto-secundario)',lineHeight:1.6}}>
              Acesse a pagina de Perfil na plataforma ou use nossa{' '}
              <Link href="/contato" style={{color:'var(--verde-palmeira-dark)',fontWeight:700,textDecoration:'none'}}>pagina de contato</Link>.
              Responderemos em ate 15 dias uteis.
            </p>
          </div>
          <div style={{marginTop:'2.5rem',paddingTop:'2rem',borderTop:'1px solid var(--cinza-borda)',display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:'1rem'}}>
            <p style={{fontSize:'0.82rem',color:'var(--texto-suave)'}}>© 2025 ROTA — Projeto Academico ADS Modulo 5</p>
            <div style={{display:'flex',gap:'1rem'}}>
              <Link href="/termos"  style={{fontSize:'0.82rem',color:'var(--azul-turquesa)',textDecoration:'none'}}>Termos de Uso</Link>
              <Link href="/contato" style={{fontSize:'0.82rem',color:'var(--azul-turquesa)',textDecoration:'none'}}>Contato</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}