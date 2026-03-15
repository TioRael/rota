// app/api/auth/[...nextauth]/route.ts
// Handler padrão do NextAuth para o App Router do Next.js 14.
// Este arquivo expõe os endpoints GET e POST que o NextAuth precisa:
//   GET  /api/auth/session
//   GET  /api/auth/csrf
//   POST /api/auth/signin/credentials
//   POST /api/auth/signout
//   etc.

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Cria o handler com as opções definidas em lib/auth.ts
const handler = NextAuth(authOptions);

// O App Router exige exportar os métodos HTTP explicitamente
export { handler as GET, handler as POST };