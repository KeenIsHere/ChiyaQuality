/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FBF6F0',
          100: '#F5E9DA',
          200: '#EBD3B6',
          300: '#DDB68C',
          400: '#C9935E',
          500: '#B6763C',
          600: '#9C5E2D',
          700: '#7D4824',
          800: '#5F3820',
          900: '#4A2D1A',
        },
        neutral: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
        status: {
          available: '#16A34A',
          'available-bg': '#DCFCE7',
          'available-border': '#86EFAC',
          occupied: '#D97706',
          'occupied-bg': '#FEF3C7',
          'occupied-border': '#FCD34D',
          ready: '#2563EB',
          'ready-bg': '#DBEAFE',
          'ready-border': '#93C5FD',
          cancelled: '#DC2626',
          'cancelled-bg': '#FEE2E2',
          'cancelled-border': '#FCA5A5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'page-title': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '600' }],
        'section-header': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '500' }],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.04)',
        elevated: '0 8px 24px -4px rgba(0,0,0,0.12), 0 4px 8px -2px rgba(0,0,0,0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
        'pulse-ring': 'pulseRing 2s ease-out infinite',
        'bounce-subtle': 'bounceSubtle 1s ease-in-out infinite',
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
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(37, 99, 235, 0.4)' },
          '70%': { boxShadow: '0 0 0 10px rgba(37, 99, 235, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(37, 99, 235, 0)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
      },
    },
  },
  plugins: [],
};
