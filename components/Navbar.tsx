'use client';
// components/Navbar.tsx
// ATUALIZADO: icone do logo substituido pelo R estilizado (mesmo design do favicon)

import { useState, useEffect, useTransition } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/rotas',        label: 'Rotas'         },
  { href: '/hoteis',       label: 'Hotéis'        },
  { href: '/restaurantes', label: 'Restaurantes'  },
  { href: '/empresas',     label: 'Para Empresas' },
];

function IconMenu({ open }: { open: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      {open ? (
        <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
      ) : (
        <><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></>
      )}
    </svg>
  );
}

// Icone R estilizado — mesmo design do favicon.svg mas como componente inline
function IconRota({ fundo }: { fundo: boolean }) {
  return (
    <span style={{
      width: '38px', height: '38px',
      background: 'var(--laranja-manga)',
      borderRadius: '10px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: fundo ? 'var(--sombra-laranja)' : '0 2px 12px rgba(255,107,26,0.4)',
      flexShrink: 0,
      transition: 'box-shadow 0.3s ease',
    }}>
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        {/* Letra R */}
        <text
          x="7"
          y="24"
          fontFamily="'Segoe UI', 'Arial Black', Arial, sans-serif"
          fontSize="22"
          fontWeight="900"
          fill="white"
          letterSpacing="-1"
        >R</text>
        {/* Ponto de bussola decorativo */}
        <circle cx="26" cy="26" r="3"   fill="white" opacity="0.3"/>
        <circle cx="26" cy="26" r="1.5" fill="white" opacity="0.75"/>
      </svg>
    </span>
  );
}

export default function Navbar() {
  const [menuAberto,        setMenuAberto]        = useState(false);
  const [menuUsuarioAberto, setMenuUsuarioAberto] = useState(false);
  const [scrollado,         setScrollado]         = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [, startTransition] = useTransition();

  useEffect(() => {
    const onScroll = () => setScrollado(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    startTransition(() => {
      setMenuAberto(false);
      setMenuUsuarioAberto(false);
    });
  }, [pathname]);

  const isHome   = pathname === '/';
  const fundo    = scrollado || !isHome;
  const corTexto = fundo ? 'var(--texto-secundario)' : 'rgba(255,255,255,0.9)';
  const primeiroNome = session?.user?.name?.split(' ')[0] ?? '';

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        transition: 'all 0.3s ease',
        backgroundColor: fundo ? 'rgba(255,253,247,0.96)' : 'transparent',
        backdropFilter:  fundo ? 'blur(12px)' : 'none',
        borderBottom:    fundo ? '1px solid var(--cinza-borda)' : 'none',
        boxShadow:       scrollado ? 'var(--sombra-sm)' : 'none',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IconRota fundo={fundo} />
            <span style={{
              fontFamily: 'var(--fonte-display)', fontWeight: 800, fontSize: '1.5rem',
              color: fundo ? 'var(--texto-principal)' : 'white',
              letterSpacing: '-0.02em',
            }}>
              ROTA
            </span>
          </Link>

          {/* Links desktop */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="nav-links-desktop">
            {NAV_LINKS.map(({ href, label }) => {
              const ativo = pathname.startsWith(href);
              return (
                <Link key={href} href={href} style={{
                  fontFamily: 'var(--fonte-corpo)', fontWeight: ativo ? 700 : 600,
                  fontSize: '0.95rem', padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  color: ativo ? 'var(--laranja-manga)' : corTexto,
                  background: ativo ? 'var(--laranja-manga-light)' : 'transparent',
                  transition: 'all var(--transicao)', textDecoration: 'none',
                }}>
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Area de usuario desktop */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="nav-actions-desktop">

            {status === 'loading' && (
              <div style={{ width: '80px', height: '36px', background: 'rgba(128,128,128,0.15)', borderRadius: 'var(--radius-full)' }} />
            )}

            {status === 'unauthenticated' && (
              <>
                <Link href="/auth/login" style={{ fontFamily: 'var(--fonte-corpo)', fontWeight: 700, fontSize: '0.9rem', color: corTexto, textDecoration: 'none', padding: '0.5rem 1rem', transition: 'color var(--transicao)' }}>
                  Entrar
                </Link>
                <Link href="/auth/cadastro" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '0.6rem 1.4rem' }}>
                  Cadastrar
                </Link>
              </>
            )}

            {status === 'authenticated' && session && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuUsuarioAberto(!menuUsuarioAberto)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: fundo ? 'var(--laranja-manga-light)' : 'rgba(255,255,255,0.15)',
                    border: fundo ? '1.5px solid var(--laranja-manga)' : '1.5px solid rgba(255,255,255,0.3)',
                    borderRadius: 'var(--radius-full)', padding: '0.45rem 1rem',
                    cursor: 'pointer', transition: 'all var(--transicao)',
                    fontFamily: 'var(--fonte-corpo)', fontWeight: 700, fontSize: '0.9rem',
                    color: fundo ? 'var(--laranja-manga)' : 'white',
                  }}
                >
                  <span style={{ width: '26px', height: '26px', background: 'var(--laranja-manga)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'white', fontWeight: 800 }}>
                    {primeiroNome[0]?.toUpperCase()}
                  </span>
                  {primeiroNome}
                  <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>▼</span>
                </button>

                {menuUsuarioAberto && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: 'var(--branco-puro)', borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--sombra-lg)', border: '1px solid var(--cinza-borda)',
                    minWidth: '180px', overflow: 'hidden', zIndex: 1001,
                  }}>
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--cinza-borda)' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--texto-principal)' }}>{session.user.name}</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--texto-suave)' }}>{session.user.email}</p>
                    </div>
                    {[
                      { href: '/dashboard', label: '🏠 Painel'          },
                      { href: '/perfil',    label: '👤 Meu Perfil'      },
                      ...(session.user.tipo === 'ADMIN' ? [{ href: '/admin', label: '⚙️ Admin' }] : []),
                    ].map(({ href, label }) => (
                      <Link key={href} href={href} className="nav-dropdown-link">
                        {label}
                      </Link>
                    ))}
                    <div style={{ borderTop: '1px solid var(--cinza-borda)' }}>
                      <button onClick={() => signOut({ callbackUrl: '/' })} className="nav-dropdown-sair">
                        🚪 Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hamburguer mobile */}
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="nav-hamburger"
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: fundo ? 'var(--texto-principal)' : 'white', padding: '0.5rem', borderRadius: 'var(--radius-sm)', display: 'none' }}
          >
            <IconMenu open={menuAberto} />
          </button>
        </div>

        {/* Menu mobile */}
        {menuAberto && (
          <div style={{ background: 'var(--branco-puro)', borderTop: '1px solid var(--cinza-borda)', padding: '1rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', boxShadow: 'var(--sombra-md)' }}>
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} style={{
                fontFamily: 'var(--fonte-corpo)', fontWeight: 600, fontSize: '1rem',
                color: pathname.startsWith(href) ? 'var(--laranja-manga)' : 'var(--texto-principal)',
                padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                background: pathname.startsWith(href) ? 'var(--laranja-manga-light)' : 'transparent',
                textDecoration: 'none',
              }}>
                {label}
              </Link>
            ))}
            <div style={{ height: '1px', background: 'var(--cinza-borda)', margin: '0.5rem 0' }} />
            {status === 'authenticated' ? (
              <>
                <Link href="/dashboard" className="btn btn-outline" style={{ justifyContent: 'center' }}>Painel</Link>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="btn" style={{ justifyContent: 'center', background: '#FEF2F2', color: '#B91C1C', border: 'none' }}>Sair</button>
              </>
            ) : (
              <>
                <Link href="/auth/login"    className="btn btn-outline" style={{ justifyContent: 'center' }}>Entrar</Link>
                <Link href="/auth/cadastro" className="btn btn-primary" style={{ justifyContent: 'center' }}>Cadastrar grátis</Link>
              </>
            )}
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop   { display: none !important; }
          .nav-actions-desktop { display: none !important; }
          .nav-hamburger       { display: flex !important; }
        }
        .nav-dropdown-link {
          display: block; padding: 0.65rem 1rem; font-size: 0.88rem;
          color: var(--texto-principal); text-decoration: none;
          transition: background var(--transicao);
        }
        .nav-dropdown-link:hover { background: var(--creme-medio); }
        .nav-dropdown-sair {
          display: block; width: 100%; text-align: left;
          padding: 0.65rem 1rem; font-size: 0.88rem;
          color: #B91C1C; background: none; border: none;
          cursor: pointer; font-family: var(--fonte-corpo);
          transition: background var(--transicao);
        }
        .nav-dropdown-sair:hover { background: #FEF2F2; }
      `}</style>
    </>
  );
}