// components/SessionProvider.tsx
// Wrapper do SessionProvider do NextAuth.
// Necessário porque o SessionProvider usa contexto React (Client Component),
// mas queremos manter o app/layout.tsx como Server Component.
// Solução: extraímos o Provider para um Client Component separado.

'use client';

import { SessionProvider } from 'next-auth/react';

export default function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}