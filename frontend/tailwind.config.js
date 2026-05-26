/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1e40af",
        secondary: "#7c3aed",
        accent: "#f59e0b",
        'ey-yellow': '#FFD400',
        'ey-black': '#000000',
        'ey': '#ffd400'
      }
    },
  },
  plugins: [],
}
