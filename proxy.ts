// proxy.ts  ← era middleware.ts no Next.js ≤15; no Next.js 16 o arquivo chama-se proxy.ts
// Proteção de rotas: verifica sessão e redireciona por TIPO de usuário.
//
// Colocar na RAIZ do projeto (ao lado de package.json).

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const tipo  = token?.tipo;

    // Área exclusiva de administradores
    if (pathname.startsWith('/admin') && tipo !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/login?erro=acesso_negado', req.url));
    }

    // Área exclusiva de empresas (e admins)
    if (
      pathname.startsWith('/empresas/painel') &&
      tipo !== 'EMPRESA' &&
      tipo !== 'ADMIN'
    ) {
      return NextResponse.redirect(new URL('/auth/login?erro=acesso_negado', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        const rotasProtegidas = [
          '/dashboard',
          '/reservas',
          '/perfil',
          '/admin',
          '/empresas/painel',
        ];

        const precisaAutenticar = rotasProtegidas.some((rota) =>
          pathname.startsWith(rota)
        );

        if (precisaAutenticar && !token) return false;

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};