/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          dark: '#1d4ed8',
          light: '#3b82f6',
        },
        accent: '#dbeafe',
        // Cores de fundo - modo claro com tom azulado suave
        bg: {
          DEFAULT: '#f0f5ff',
          secondary: '#e8f0fe',
          tertiary: '#dbeafe',
          card: '#f8faff',
        },
        // Cores de texto com ALTO CONTRASTE para modo claro
        text: {
          DEFAULT: '#0f172a',
          secondary: '#334155',
          muted: '#475569',
          light: '#64748b',
        },
        // Cores semânticas - mais escuras para melhor contraste
        success: {
          DEFAULT: '#15803d',
          bg: '#dcfce7',
        },
        danger: {
          DEFAULT: '#b91c1c',
          bg: '#fee2e2',
        },
        warning: {
          DEFAULT: '#b45309',
          bg: '#fef3c7',
        },
        info: {
          DEFAULT: '#0369a1',
          bg: '#e0f2fe',
        },
        // Bordas - mais visíveis
        border: {
          DEFAULT: '#cbd5e1',
          light: '#e2e8f0',
        },
      },
      screens: {
        'xs': '480px',
        'notebook': '1024px',
        'desktop': '1280px',
        'wide': '1536px',
      },
    },
  },
  plugins: [],
} 