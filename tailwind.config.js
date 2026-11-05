/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      /**
       * Paleta "Night & Lime"
       *  night   #0F0F0F  fundo principal escuro
       *  surface #202020  cards e seções escuras secundárias
       *  brand   #5DD62C  destaque (botões, ícones) — usar com texto escuro
       *  brand-dark #337418  verde floresta — texto/ícones verdes sobre fundo claro (AA)
       *  paper   #F8F8F8  fundo claro e texto sobre escuro
       */
      colors: {
        night: '#0F0F0F',
        surface: {
          DEFAULT: '#202020',
          2: '#2A2A2A',
        },
        brand: {
          DEFAULT: '#5DD62C',
          light: '#7FE352',
          dark: '#337418',
        },
        paper: '#F8F8F8',
        mint: '#EDF7E7',
        ink: '#0F0F0F',
      },
      fontFamily: {
        display: ['Unbounded', 'system-ui', 'sans-serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15,15,15,0.04), 0 8px 24px -8px rgba(15,15,15,0.10)',
        lifted: '0 24px 60px -16px rgba(0,0,0,0.55)',
        'brand-glow': '0 0 0 1px rgba(93,214,44,0.6), 0 10px 32px -6px rgba(93,214,44,0.55)',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-120%) skewX(-20deg)' },
          '100%': { transform: 'translateX(220%) skewX(-20deg)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.1s ease-out',
      },
    },
  },
  plugins: [],
}
