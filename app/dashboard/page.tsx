// app/dashboard/page.tsx
// Roteador do dashboard: redireciona para o painel correto
// conforme o TIPO do usuário logado (TURISTA, EMPRESA ou ADMIN).

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect('/auth/login');

  // Redireciona para o painel específico do tipo de usuário
  switch (session.user.tipo) {
    case 'EMPRESA':
      redirect('/dashboard/empresa');
    case 'ADMIN':
      redirect('/admin'); // futuro painel admin
    case 'TURISTA':
    default:
      redirect('/dashboard/turista');
  }
}