// app/page.tsx — Home com HeroSlideshow usando imagens reais do banco
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import HeroSlideshow, { type SlideData } from '@/components/HeroSlideshow';
import Card3D from '@/components/Card3D';
import RotaRunner from '@/components/RotaRunner';
import MapaBrasil from '@/components/MapaBrasil';

export const metadata: Metadata = { title: 'ROTA — Descubra o Brasil' };

interface RotaDestaque {
  ID_ROTA:number;NOME:string;DESCRICAO:string|null;DURACAO:string|null;
  CATEGORIA:string|null;URL_IMAGEM_CAPA:string|null;CIDADE:string;ESTADO:string;
  RAZAO_SOCIAL:string;MEDIA_AVALIACAO:number|null;TOTAL_AVALIACOES:number;PRECO_MIN:number|null;
}
interface Stats {
  TOTAL_ROTAS:number;TOTAL_CIDADES:number;TOTAL_HOTEIS:number;MEDIA_GERAL:number|null;
}

const EMOJI:Record<string,string>={'Praias':'🏖️','Natureza':'🌿','Cultural':'🏛️','Aventura':'🏔️','Gastronomia':'🍽️','Urbano':'🌆'};

async function getDadosHome():Promise<{rotasDestaque:RotaDestaque[];stats:Stats|null}>{
  try{
    const base=process.env.NEXTAUTH_URL??'http://localhost:3000';
    const res=await fetch(`${base}/api/home`,{next:{revalidate:300}});
    if(!res.ok) return{rotasDestaque:[],stats:null};
    return res.json();
  }catch{return{rotasDestaque:[],stats:null};}
}

function CardRota({rota}:{rota:RotaDestaque}){
  const emoji=EMOJI[rota.CATEGORIA??'']??'🗺️';
  return(
    <Link href={`/rotas/${rota.ID_ROTA}`} className="card card-rota">
      <div className="card-rota-imagem">
        {rota.URL_IMAGEM_CAPA
          ?<Image src={rota.URL_IMAGEM_CAPA} alt={rota.NOME} fill sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw" style={{objectFit:'cover'}}/>
          :<span className="card-rota-emoji">{emoji}</span>}
        {rota.CATEGORIA&&<span className="badge badge-verde card-rota-badge">{rota.CATEGORIA}</span>}
      </div>
      <div className="card-rota-corpo">
        <div className="card-rota-header">
          <div>
            <h3 className="card-rota-titulo">{rota.NOME}</h3>
            <p className="card-rota-regiao">📍 {rota.CIDADE}, {rota.ESTADO}</p>
          </div>
          {rota.PRECO_MIN&&(
            <div className="card-rota-preco-bloco">
              <p className="card-rota-preco">{rota.PRECO_MIN.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</p>
              <p className="card-rota-preco-label">por pessoa</p>
            </div>
          )}
        </div>
        {rota.DESCRICAO&&<p className="card-rota-desc">{rota.DESCRICAO.slice(0,85)}{rota.DESCRICAO.length>85?'…':''}</p>}
        <div className="card-rota-footer">
          <div className="card-rota-meta">
            {rota.DURACAO&&<span>⏱ {rota.DURACAO}</span>}
            {rota.MEDIA_AVALIACAO
              ?<span>⭐ {rota.MEDIA_AVALIACAO} <span className="meta-count">({rota.TOTAL_AVALIACOES})</span></span>
              :<span style={{opacity:.5,fontSize:'.78rem'}}>Sem avaliações</span>}
          </div>
          <span className="btn btn-primary btn-sm">Ver rota</span>
        </div>
      </div>
    </Link>
  );
}

const CATEGORIAS=[
  {emoji:'🏖️',nome:'Praias',      descricao:'Litoral brasileiro',   classe:'cat-azul'},
  {emoji:'🌿',nome:'Natureza',    descricao:'Trilhas e ecoturismo', classe:'cat-verde'},
  {emoji:'🏛️',nome:'Cultural',    descricao:'História e arte',      classe:'cat-laranja'},
  {emoji:'🏔️',nome:'Aventura',    descricao:'Adrenalina e esporte', classe:'cat-laranja'},
  {emoji:'🍽️',nome:'Gastronomia', descricao:'Sabores do Brasil',    classe:'cat-rosa'},
  {emoji:'🌆',nome:'Urbano',      descricao:'Capitais e metrópoles',classe:'cat-roxo'},
];

export default async function HomePage(){
  const{rotasDestaque,stats}=await getDadosHome();

  const slides:SlideData[]=[
    ...rotasDestaque.filter(r=>r.URL_IMAGEM_CAPA),
    ...rotasDestaque.filter(r=>!r.URL_IMAGEM_CAPA),
  ].slice(0,6).map(r=>({
    id:r.ID_ROTA,nome:r.NOME,cidade:r.CIDADE,estado:r.ESTADO,
    duracao:r.DURACAO,categoria:r.CATEGORIA,imagem:r.URL_IMAGEM_CAPA,
    preco:r.PRECO_MIN?r.PRECO_MIN.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}):null,
  }));

  const STATS=[
    {numero:stats?.TOTAL_ROTAS  ?`${stats.TOTAL_ROTAS}+`  :'10+', label:'Rotas cadastradas',cor:'laranja'},
    {numero:stats?.TOTAL_CIDADES?`${stats.TOTAL_CIDADES}+`:'10+', label:'Cidades cobertas',  cor:'verde'},
    {numero:stats?.TOTAL_HOTEIS ?`${stats.TOTAL_HOTEIS}+` :'20+', label:'Hotéis parceiros',  cor:'turquesa'},
    {numero:stats?.MEDIA_GERAL  ?`${stats.MEDIA_GERAL}★`  :'4.8★',label:'Avaliação média',  cor:'laranja'},
  ];

  return(
    <>
      <HeroSlideshow slides={slides}/>

      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {STATS.map(({numero,label,cor},i)=>(
              <div key={label} className={`stat-card stat-${cor} animate-fade-in-up delay-${(i+1)*100}`}>
                <p className="stat-numero">{numero}</p>
                <p className="stat-label">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-header text-center">
            <span className="badge badge-verde">Explore por tema</span>
            <h2>Qual tipo de viagem é a sua?</h2>
            <div className="divisor-tropical"/>
          </div>
          <div className="categorias-grid">
            {CATEGORIAS.map(({emoji,nome,descricao,classe})=>(
              <Link key={nome} href={`/rotas?categoria=${encodeURIComponent(nome)}`} className={`card-categoria ${classe}`}>
                <span className="card-categoria-emoji">{emoji}</span>
                <span className="card-categoria-nome">{nome}</span>
                <span className="card-categoria-desc">{descricao}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
{/* ══ MAPA INTERATIVO ══ */}
<section className="section">
  <div className="container">
    <div className="section-header text-center">
      <span className="badge badge-verde">Explore por região</span>
      <h2>Onde você quer ir?</h2>
      <div className="divisor-tropical"/>
      <p style={{ color:'var(--texto-suave)', fontSize:'0.9rem', marginTop:'0.5rem' }}>
        Clique em qualquer estado para ver as rotas disponíveis
      </p>
    </div>
    <MapaBrasil />
  </div>
</section>
      <section className="section">
        <div className="container">
          <div className="section-header-row">
            <div>
              <span className="badge badge-laranja">Do nosso banco de dados</span>
              <h2>Rotas em destaque</h2>
              <div className="divisor-tropical"/>
            </div>
            <Link href="/rotas" className="btn btn-outline">Ver todas →</Link>
          </div>
          {rotasDestaque.length>0?(
            <>
              <div className="rotas-grid">
                {rotasDestaque.slice(0,3).map(rota=>(
                  <Card3D key={rota.ID_ROTA}><CardRota rota={rota}/></Card3D>
                ))}
              </div>
              {rotasDestaque.length>3&&(
                <div className="rotas-grid" style={{marginTop:'1.5rem'}}>
                  {rotasDestaque.slice(3,6).map(rota=>(
                    <Card3D key={rota.ID_ROTA}><CardRota rota={rota}/></Card3D>
                  ))}
                </div>
              )}
            </>
          ):(
            <div style={{textAlign:'center',padding:'3rem',color:'var(--texto-suave)'}}>
              <p style={{fontSize:'2.5rem'}}>🗺️</p>
              <p style={{marginTop:'.75rem'}}>Em breve rotas incríveis aqui!</p>
              <Link href="/rotas" className="btn btn-primary" style={{marginTop:'1rem'}}>Explorar rotas</Link>
            </div>
          )}
        </div>
      </section>

      {rotasDestaque.some(r=>r.URL_IMAGEM_CAPA)&&(
        <section className="section section-alt">
          <div className="container">
            <div className="section-header text-center">
              <span className="badge badge-azul">Galeria</span>
              <h2>O Brasil que te espera</h2>
              <div className="divisor-tropical"/>
            </div>
            <div className="mosaico-grid">
              {rotasDestaque.filter(r=>r.URL_IMAGEM_CAPA).slice(0,5).map((rota,i)=>(
                <Link key={rota.ID_ROTA} href={`/rotas/${rota.ID_ROTA}`}
                  className={`mosaico-item ${i===0?'mosaico-grande':''}`}>
                  <Image src={rota.URL_IMAGEM_CAPA!} alt={rota.NOME} fill
                    sizes="(max-width:640px) 100vw,50vw" style={{objectFit:'cover'}}/>
                  <div className="mosaico-overlay">
                    <p className="mosaico-nome">{rota.NOME}</p>
                    <p className="mosaico-local">📍 {rota.CIDADE}, {rota.ESTADO}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="empresa-section">
        <div className="container">
          <div className="empresa-grid">
            <div>
              <span className="badge badge-verde-dark">Para empresas de turismo</span>
              <h2 className="empresa-titulo">Cadastre sua empresa e alcance mais viajantes</h2>
              <p className="empresa-sub">Publique suas rotas, registre seus guias e gerencie reservas em um painel completo.</p>
              <div className="empresa-botoes">
                <Link href="/empresas" className="btn btn-secondary">Cadastrar minha empresa</Link>
                <Link href="/sobre"    className="btn btn-ghost">Saiba mais</Link>
              </div>
            </div>
            <div className="empresa-beneficios">
              {[
                {icon:'🗺️',titulo:'Publique suas rotas',  texto:'Cadastre itinerários com pontos turísticos, guias e serviços.'},
                {icon:'📅',titulo:'Gerencie reservas',    texto:'Controle reservas e pagamentos em um painel centralizado.'},
                {icon:'⭐',titulo:'Receba avaliações',    texto:'Construa reputação com avaliações verificadas dos seus clientes.'},
              ].map(({icon,titulo,texto})=>(
                <div key={titulo} className="beneficio-card">
                  <span className="beneficio-icon">{icon}</span>
                  <div>
                    <h4 className="beneficio-titulo">{titulo}</h4>
                    <p className="beneficio-texto">{texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section text-center">
        <div className="container">
          <div className="cta-emoji">🌴</div>
          <h2>Pronto para a sua próxima aventura?</h2>
          <p className="cta-sub">Crie sua conta gratuita e explore as melhores rotas do Brasil.</p>
          <div className="cta-botoes">
            <Link href="/auth/cadastro" className="btn btn-primary btn-lg">Criar conta grátis</Link>
            <Link href="/rotas"         className="btn btn-outline">Explorar rotas</Link>
          </div>
        </div>
      </section>

      <RotaRunner/>

      <style>{`
        .card-rota-imagem{height:200px;position:relative;overflow:hidden;background:linear-gradient(135deg,var(--laranja-manga-light),var(--verde-palmeira-light));display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .card-rota-badge{position:absolute;top:.65rem;right:.65rem;z-index:1;}
        .mosaico-grid{display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:200px 200px;gap:.75rem;}
        @media(max-width:768px){.mosaico-grid{grid-template-columns:repeat(2,1fr);grid-template-rows:auto;}}
        .mosaico-item{position:relative;border-radius:var(--radius-lg);overflow:hidden;display:block;text-decoration:none;transition:transform var(--transicao),box-shadow var(--transicao);}
        .mosaico-item:hover{transform:scale(1.02);box-shadow:var(--sombra-lg);}
        .mosaico-grande{grid-column:span 2;grid-row:span 2;}
        @media(max-width:768px){.mosaico-grande{grid-column:span 2;grid-row:span 1;}}
        .mosaico-overlay{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 100%);padding:1.25rem 1rem .85rem;}
        .mosaico-nome{color:white;font-family:var(--fonte-display);font-weight:700;font-size:.95rem;margin-bottom:.15rem;}
        .mosaico-local{color:rgba(255,255,255,.75);font-size:.78rem;}
      `}</style>
    </>
  );
}