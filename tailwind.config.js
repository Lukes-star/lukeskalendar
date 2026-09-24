/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: '400px',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: {
          base: '#111214',
          card: '#1A1B1F',
          secondary: '#24262B',
          hover: '#303238',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.13)',
          subtle: 'rgba(255,255,255,0.08)',
          focus: 'rgba(225,29,45,0.55)',
        },
        primary: {
          DEFAULT: '#E11D2E',
          hover: '#BE1230',
          muted: 'rgba(225,29,45,0.18)',
        },
        success: {
          DEFAULT: '#22C55E',
          muted: 'rgba(34,197,94,0.15)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          muted: 'rgba(245,158,11,0.15)',
        },
        danger: {
          DEFAULT: '#EF4444',
          muted: 'rgba(239,68,68,0.15)',
        },
        text: {
          primary: '#F5F5F4',
          secondary: '#B8BBC2',
          tertiary: '#858993',
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)',
        'modal': '0 25px 60px rgba(0,0,0,0.6), 0 10px 20px rgba(0,0,0,0.4)',
        'dropdown': '0 8px 24px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3)',
        'pill': '0 2px 6px rgba(0,0,0,0.3)',
        'btn': '0 1px 2px rgba(0,0,0,0.3)',
        'btn-hover': '0 4px 12px rgba(225,29,45,0.28)',
      },
      borderRadius: {
        'pill': '10px',
      },
      animation: {
        'fade-in': 'fadeIn 180ms ease-out',
        'slide-up': 'slideUp 220ms ease-out',
        'slide-right': 'slideRight 250ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
