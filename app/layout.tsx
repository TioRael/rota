// app/layout.tsx — com SessionProvider, favicon SVG e fonte Google
import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthSessionProvider from '@/components/SessionProvider';

export const metadata: Metadata = {
  title: {
    template: '%s | ROTA',
    default:  'ROTA — Registro Organizado de Trajetos e Acomodações',
  },
  description:
    'Descubra as melhores rotas turísticas do Brasil. ' +
    'Conectamos turistas, empresas de turismo, hotéis e restaurantes em uma só plataforma.',
  keywords: ['turismo', 'Brasil', 'rotas', 'hotéis', 'viagem', 'ROTA'],
  authors: [{ name: 'Israel Menezes', url: 'https://github.com/TioRael' }],
  icons: {
    icon:     '/favicon.svg',
    shortcut: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthSessionProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </AuthSessionProvider>
      </body>
    </html>
  );
}