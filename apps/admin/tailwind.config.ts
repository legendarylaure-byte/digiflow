import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F5F3FF', 100: '#EDE9FE', 200: '#DDD6FE', 300: '#C4B5FD',
          400: '#A78BFA', 500: '#7C3FED', 600: '#6D28D9', 700: '#5B21B6',
          800: '#4C1D95', 900: '#3B0764',
        },
        coral: { 500: '#EC5E3A', 600: '#D94B28' },
        status: { draft: '#6B7280', 'in-progress': '#F59E0B', approved: '#10B981', returned: '#EF4444' },
      },
    },
  },
  plugins: [],
};

export default config;
