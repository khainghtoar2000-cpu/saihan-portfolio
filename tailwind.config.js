/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./assets/js/**/*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'deep-black': '#070709',
        'glass-surface': 'rgba(18, 18, 24, 0.55)',
        'vibrant-red': '#ff2a3a',
        'crimson-red': '#d90429',
        'off-white': '#f4f4f0'
      },
      fontFamily: {
        'display': ['Manrope', 'sans-serif'],
        'body': ['Source Sans 3', 'sans-serif'],
        'label': ['Source Sans 3', 'sans-serif'],
        'sans': ['Source Sans 3', 'sans-serif']
      }
    }
  },
  plugins: []
};
