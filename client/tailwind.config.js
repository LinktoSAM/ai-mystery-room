/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        detective: {
          950: '#0b0d13',
          900: '#111420',
          850: '#171b2b',
          800: '#1e2337',
          700: '#2b314c',
          600: '#3e466c',
          500: '#5c6699',
        },
        noir: {
          dark: '#0e1015',
          card: '#151922',
          border: '#262d3d',
          gold: '#e5b869',
          'gold-hover': '#f3c97d',
          blood: '#c93b3b',
          parchment: '#e2d9c8'
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
        mono: ['Courier New', 'Courier', 'monospace'],
      }
    },
  },
  plugins: [],
}

