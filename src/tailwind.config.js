// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx,scss}'],
  theme: {
    extend: {
      // You can map Quasar colors to Tailwind
      colors: {
        primary: 'var(--q-primary)',
        secondary: 'var(--q-secondary)',
        accent: 'var(--q-accent)',
        dark: 'var(--q-dark)',
        'dark-page': 'var(--q-dark-page)',
        positive: 'var(--q-positive)',
        negative: 'var(--q-negative)',
        info: 'var(--q-info)',
        warning: 'var(--q-warning)',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Crucial for Quasar compatibility
  },
};
