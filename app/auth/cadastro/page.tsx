// app/auth/cadastro/page.tsx
// CORRIGIDO: useSearchParams envolto em Suspense (obrigatorio em producao)
import { Suspense } from 'react';
import CadastroForm from './CadastroForm';

export default function CadastroPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--creme-suave)' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--cinza-borda)', borderTopColor: 'var(--laranja-manga)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <CadastroForm />
    </Suspense>
  );
}