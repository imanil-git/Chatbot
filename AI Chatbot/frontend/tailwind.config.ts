import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6C63FF',
        'primary-dark': '#574fd6',
        surface: '#0f0f1a',
        card: '#1a1a2e',
        'border-subtle': '#2a2a45',
        muted: '#8888aa',
        danger: '#ff4d6d'
      }
    },
  },
  plugins: [],
} satisfies Config;
