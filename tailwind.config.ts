// tailwind.config.ts
// Extensão do Tailwind com a paleta "Tropicália Vibrante" do ROTA
// Permite usar classes como: bg-manga, text-palmeira, border-turquesa

import type { Config } from 'tailwindcss';

const config: Config = {
  // Quais arquivos o Tailwind deve escanear para purge
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // ── Paleta Tropicália ────────────────────────────────
      colors: {
        manga: {
          DEFAULT: '#FF6B1A',
          hover:   '#E55C0E',
          light:   '#FFF0E6',
        },
        palmeira: {
          DEFAULT: '#2ECC71',
          hover:   '#25B360',
          dark:    '#1A8A4A',
          light:   '#E8FAF1',
        },
        turquesa: {
          DEFAULT: '#00BCD4',
          hover:   '#0097A7',
          light:   '#E0F7FA',
        },
        creme: {
          suave:  '#FFFDF7',
          medio:  '#FFF8ED',
        },
        borda: '#E8E4DC',
      },

      // ── Tipografia ───────────────────────────────────────
      fontFamily: {
        display: ['"Baloo 2"', 'cursive'],
        corpo:   ['Nunito', 'sans-serif'],
      },

      // ── Border radius ────────────────────────────────────
      borderRadius: {
        xl2: '20px',
        xl3: '32px',
      },

      // ── Animações ────────────────────────────────────────
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)'    },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)'   },
          '50%':       { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease forwards',
        'float':      'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;