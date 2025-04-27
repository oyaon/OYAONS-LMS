/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        aurora: {
          primary: '#7C3AED',
          secondary: '#EC4899',
          accent: '#FCD34D',
        },
        oceanic: {
          primary: '#0891B2',
          secondary: '#0EA5E9',
          accent: '#22D3EE',
        },
        forest: {
          primary: '#059669',
          secondary: '#10B981',
          accent: '#34D399',
        },
        sunset: {
          primary: '#F97316',
          secondary: '#FB923C',
          accent: '#FDBA74',
        },
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'bounce-slow': 'bounce 3s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      backgroundImage: {
        'aurora-gradient': 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
        'oceanic-gradient': 'linear-gradient(135deg, #0891B2 0%, #0EA5E9 100%)',
        'forest-gradient': 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
        'sunset-gradient': 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
      },
    },
  },
  plugins: [],
} 