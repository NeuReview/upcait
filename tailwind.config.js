/** @type {import('tailwindcss').Config} */
module.exports = {
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
        'neural': '0 4px 20px -2px rgba(109, 40, 217, 0.1)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        'spin-slow': 'spin 15s linear infinite',
        'bounce-slow': 'bounce 3s ease-in-out infinite',
        'progress': 'progress 1.5s ease-in-out infinite',
        'ping': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'ping-delayed': 'ping 2s cubic-bezier(0, 0, 0.2, 1) 1s infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        progress: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        ping: {
          '75%, 100%': {
            transform: 'scale(2)',
            opacity: '0',
          },
        },
      },
      backgroundImage: {
        'neural-pattern': 'radial-gradient(#6B46C1 1px, transparent 1px), radial-gradient(#9F7AEA 1px, transparent 1px)',
      },
      backgroundSize: {
        'neural': '40px 40px',
      },
      clipPath: {
        'hexagon': 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.clip-hexagon': {
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        },
      };
      addUtilities(newUtilities);
    },
  ],
}