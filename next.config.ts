// next.config.ts
// CORRIGIDO: adiciona dominios externos permitidos para next/image
// Adicione aqui qualquer outro dominio de imagem que usar no banco

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Imgur
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
      // Blogspot / Blogger (Google)
      {
        protocol: 'https',
        hostname: '*.bp.blogspot.com',
      },
      // Google user content / fotos
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      // Unsplash (banco de imagens gratuito — otimo para testes)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Pexels
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      // Wikipedia / Wikimedia
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      // AWS S3 (para quando migrar para armazenamento profissional)
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
      // Cloudinary (outra opcao popular de CDN de imagens)
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;