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
          aktive: '#06b6d4', // Vibrant Cyan
          local: '#f97316',  // Energetic Coral / Orange
          dark: '#0d1117',
          card: '#161b22',
          cardBorder: '#30363d',
          hover: '#21262d',
          accent: '#38bdf8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
