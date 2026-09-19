import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#171713',
        paper: '#f4f1e8',
        acid: '#f1ff48',
        coral: '#ff6b57',
        lilac: '#b5a2ff',
        mint: '#74e3b1',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Arial Black', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        brutal: '4px 4px 0 #171713',
        'brutal-lg': '8px 8px 0 #171713',
      },
    },
  },
  plugins: [],
} satisfies Config
