/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './index.ts', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#F4F5F8',
        mutedbg: '#E9ECF1',
        ink: '#0F172A',
        muted: '#64748B',
        faint: '#94A3B8',
        border: '#E2E6EC',
        soft: '#E9ECF1',
        hair: '#F1F3F6',
        input: '#F8FAFC',
        brand: {
          DEFAULT: '#1D4ED8',
          dark: '#1E40AF',
          soft: '#EEF3FF',
        },
        amber: {
          DEFAULT: '#E9A23B',
          soft: '#FFF4E0',
          text: '#B45309',
          bg: '#FFFBEB',
        },
        success: {
          DEFAULT: '#059669',
          soft: '#ECFDF5',
        },
        danger: {
          DEFAULT: '#DC2626',
          soft: '#FEF2F2',
        },
      },
      borderRadius: {
        sm: '11px',
        md: '14px',
        lg: '16px',
        xl: '18px',
        '2xl': '20px',
        card: '24px',
      },
    },
  },
  plugins: [],
};
