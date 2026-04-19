/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Poppins', 'system-ui', 'sans-serif'],
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          purple: '#1E1B4B',
          blue: '#3B82F6',
          yellow: '#FACC15',
          soft: '#F9FAFB',
        },
      },
      boxShadow: {
        glow: '0 18px 50px -20px rgba(59,130,246,0.55)',
        soft: '0 30px 60px -30px rgba(0,0,0,0.55), 0 12px 24px -18px rgba(59,130,246,0.16)',
      },
    },
  },
  plugins: [],
}
