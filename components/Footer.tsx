// components/Footer.tsx
// Footer global — sem event handlers inline (compatível com Server Components)
// Hovers via classes CSS definidas no globals.css

import Link from 'next/link';

const COLUNAS = [
  {
    titulo: 'Explorar',
    links: [
      { href: '/rotas',        label: 'Rotas Turísticas'  },
      { href: '/hoteis',       label: 'Hotéis & Pousadas' },
      { href: '/restaurantes', label: 'Restaurantes'      },
      { href: '/regioes',      label: 'Regiões do Brasil' },
    ],
  },
  {
    titulo: 'Para Empresas',
    links: [
      { href: '/empresas',         label: 'Cadastre sua Empresa' },
      { href: '/empresas/rotas',   label: 'Gerenciar Rotas'      },
      { href: '/empresas/guias',   label: 'Cadastrar Guias'      },
      { href: '/empresas/pricing', label: 'Planos'               },
    ],
  },
  {
    titulo: 'Conta',
    links: [
      { href: '/auth/cadastro', label: 'Criar Conta'    },
      { href: '/auth/login',    label: 'Entrar'          },
      { href: '/dashboard',     label: 'Painel'          },
      { href: '/reservas',      label: 'Minhas Reservas' },
    ],
  },
];

function IconGithub() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
    </svg>
  );
}

export default function Footer() {
  const anoAtual = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">

        {/* Grid principal */}
        <div className="footer-grid">

          {/* Coluna da marca */}
          <div>
            <Link href="/" className="footer-logo">
              <span className="footer-logo-icone">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.8"/>
                  <circle cx="12" cy="12" r="2" fill="white"/>
                  <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M9 9l6 3-3 6-6-3z" fill="white" opacity="0.9"/>
                </svg>
              </span>
              <span className="footer-logo-texto">ROTA</span>
            </Link>

            <p className="footer-descricao">
              Descubra o Brasil de um jeito novo. Rotas incríveis, hotéis selecionados
              e restaurantes autênticos — tudo em um só lugar.
            </p>

            <div className="footer-social">
              <a
                href="https://github.com/TioRael"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="GitHub"
              >
                <IconGithub />
              </a>
            </div>
          </div>

          {/* Colunas de links */}
          {COLUNAS.map((coluna) => (
            <div key={coluna.titulo}>
              <h4 className="footer-col-titulo">{coluna.titulo}</h4>
              <ul className="footer-col-lista">
                {coluna.links.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="footer-link">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Rodapé inferior */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {anoAtual} ROTA — Registro Organizado de Trajetos e Acomodações.
            Projeto acadêmico desenvolvido por{' '}
            <a href="https://github.com/TioRael" target="_blank" rel="noopener noreferrer" className="footer-copyright-link">
              Israel Menezes
            </a>.
          </p>
          <div className="footer-bottom-links">
            <Link href="/privacidade" className="footer-bottom-link">Privacidade</Link>
            <Link href="/termos"      className="footer-bottom-link">Termos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}