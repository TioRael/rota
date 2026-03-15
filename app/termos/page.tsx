// app/termos/page.tsx — Termos de Uso
import type { Metadata } from 'next';
import Link from 'next/link';
export const metadata: Metadata = { title: 'Termos de Uso | ROTA' };
const SECOES = [
  { t:'1. Aceitacao dos Termos',         r:'Ao acessar e usar a plataforma ROTA, voce concorda com estes Termos de Uso. Se nao concordar, nao utilize a plataforma. O uso continuado apos alteracoes implica aceitacao das modificacoes.' },
  { t:'2. Descricao do Servico',         r:'O ROTA e uma plataforma digital de turismo que conecta turistas a empresas de turismo, hoteis e restaurantes no Brasil. Oferecemos busca de rotas, reservas, avaliacoes e gestao para empresas. A plataforma e um projeto academico e pode ter interrupcoes.' },
  { t:'3. Cadastro e Conta',             r:'Para usar funcionalidades completas, e necessario criar uma conta com informacoes verdadeiras. Voce e responsavel por manter a confidencialidade de sua senha e por todas as atividades em sua conta. O cadastro e permitido apenas para maiores de 18 anos.' },
  { t:'4. Uso Aceitavel',                r:'E proibido: usar a plataforma para fins ilegais; publicar conteudo falso ou enganoso; tentar acessar sistemas sem autorizacao; realizar reservas fraudulentas; fazer uso comercial nao autorizado dos dados; prejudicar a experiencia de outros usuarios.' },
  { t:'5. Reservas e Pagamentos',        r:'As reservas estao sujeitas a disponibilidade e confirmacao das empresas parceiras. Os valores exibidos sao estimativas. O ROTA e um intermediario e nao e responsavel diretamente pelos servicos das empresas parceiras.' },
  { t:'6. Avaliacoes',                   r:'As avaliacoes devem ser honestas e baseadas em experiencias reais. E proibido publicar avaliacoes falsas ou pagas. Reservamo-nos o direito de remover avaliacoes que violem estas diretrizes.' },
  { t:'7. Propriedade Intelectual',      r:'Todo o conteudo da plataforma — codigo, design, textos e logotipos — e propriedade do projeto ROTA. E proibida a reproducao ou uso comercial sem autorizacao previa.' },
  { t:'8. Limitacao de Responsabilidade',r:'O ROTA nao se responsabiliza por danos decorrentes do uso da plataforma, interrupcoes de servico, erros de informacao das empresas parceiras ou problemas em reservas. A plataforma e fornecida "como esta", sem garantias expressas.' },
  { t:'9. Privacidade',                  r:'O tratamento de dados pessoais e regido pela nossa Politica de Privacidade, em conformidade com a LGPD (Lei 13.709/2018).' },
  { t:'10. Alteracoes nos Termos',       r:'Podemos atualizar estes Termos periodicamente. O uso continuado apos publicacao de alteracoes constitui aceitacao.' },
  { t:'11. Lei Aplicavel',               r:'Estes Termos sao regidos pelas leis brasileiras. Disputas serao resolvidas no foro do domicilio do usuario, conforme o Codigo de Defesa do Consumidor.' },
];
export default function TermosPage() {
  return (
    <div style={{minHeight:'100vh',paddingTop:'70px',background:'var(--creme-suave)'}}>
      <div style={{background:'linear-gradient(135deg,#1A1A1A,#2D3A2E)',padding:'3rem 0 2.5rem',textAlign:'center'}}>
        <div className="container">
          <div style={{fontSize:'2.5rem',marginBottom:'0.75rem'}}>📋</div>
          <h1 style={{fontFamily:'var(--fonte-display)',fontSize:'clamp(1.8rem,4vw,2.5rem)',color:'white',marginBottom:'0.5rem'}}>Termos de Uso</h1>
          <p style={{color:'rgba(255,255,255,0.55)',fontSize:'0.88rem'}}>Ultima atualizacao: 01 de Janeiro de 2025</p>
        </div>
      </div>
      <div className="container" style={{padding:'3rem 1.5rem 5rem',maxWidth:'820px'}}>
        <div style={{background:'var(--branco-puro)',borderRadius:'var(--radius-xl)',padding:'2.5rem',boxShadow:'var(--sombra-md)'}}>
          <p style={{fontSize:'0.95rem',color:'var(--texto-secundario)',lineHeight:1.8,marginBottom:'2rem',padding:'1rem',background:'var(--laranja-manga-light)',borderRadius:'var(--radius-md)',borderLeft:'4px solid var(--laranja-manga)'}}>
            Bem-vindo ao ROTA. Leia atentamente estes Termos de Uso antes de utilizar nossa plataforma.
          </p>
          <div style={{display:'flex',flexDirection:'column',gap:'2rem'}}>
            {SECOES.map(({t,r})=>(
              <div key={t}>
                <h2 style={{fontFamily:'var(--fonte-display)',fontSize:'1.05rem',marginBottom:'0.6rem'}}>{t}</h2>
                <p style={{fontSize:'0.92rem',color:'var(--texto-secundario)',lineHeight:1.8}}>{r}</p>
              </div>
            ))}
          </div>
          <div style={{marginTop:'2.5rem',paddingTop:'2rem',borderTop:'1px solid var(--cinza-borda)',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
            <p style={{fontSize:'0.82rem',color:'var(--texto-suave)'}}>© 2025 ROTA — Projeto Academico ADS Modulo 5</p>
            <div style={{display:'flex',gap:'1rem'}}>
              <Link href="/privacidade" style={{fontSize:'0.82rem',color:'var(--azul-turquesa)',textDecoration:'none'}}>Politica de Privacidade</Link>
              <Link href="/contato"     style={{fontSize:'0.82rem',color:'var(--azul-turquesa)',textDecoration:'none'}}>Contato</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}