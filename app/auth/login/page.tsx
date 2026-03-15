// app/auth/login/page.tsx
// CORRIGIDO: useSearchParams envolto em Suspense (obrigatorio em producao Next.js 16)

import { Suspense } from 'react';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--creme-suave)' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--cinza-borda)', borderTopColor: 'var(--laranja-manga)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}