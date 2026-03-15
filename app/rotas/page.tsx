// app/rotas/page.tsx — wrapper Suspense (Next.js 16 producao)
import { Suspense } from 'react';
import RotasContent from './RotasContent';

function LoadingSpinner() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--creme-suave)' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid var(--cinza-borda)', borderTopColor: 'var(--laranja-manga)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RotasContent />
    </Suspense>
  );
}