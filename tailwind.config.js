/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neural-purple': '#6B46C1',
        'tech-lavender': '#9F7AEA',
        'success-gold': '#F6E05E',
        'smart-black': '#2D3748',
        'focus-blue': '#4299E1',
        'growth-green': '#48BB78',
        'energy-orange': '#ED8936',
        'alert-red': '#E53E3E',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['SF Pro Display', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'neural': '0 4px 6px rgba(107, 70, 193, 0.1)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: .5 },
        },
      },
      backgroundImage: {
        'neural-pattern': 'radial-gradient(#6B46C1 1px, transparent 1px), radial-gradient(#9F7AEA 1px, transparent 1px)',
      },
      backgroundSize: {
        'neural': '40px 40px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}