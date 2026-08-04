/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#1A1A2E',
          dark: '#16213E',
          mid: '#0F3C6B',
          accent: '#00A8E8'
        }
      }
    },
  },
  plugins: [],
}
