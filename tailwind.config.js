/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wisdom: '#2C3E50',
        gold: '#D4A843',
        ivory: '#FAF8F5'
      },
      animation: {
        'pulse-dot': 'pulseDot 2s infinite',
        'wave': 'wave 1.5s ease-in-out infinite'
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(44,62,80,0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(44,62,80,0)' }
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(0.3)' }
        }
      }
    }
  },
  plugins: []
}
