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
        'deep-black': '#000000',
        'glass-surface': 'rgba(0, 0, 0, 0.55)',
        'burgundy': '#6D001A',
        'off-white': '#FFFFFF',
        zinc: { 50:'#fafafa', 100:'#f5f5f5', 200:'#e5e5e5', 300:'#d4d4d4', 400:'#a3a3a3', 500:'#737373', 600:'#525252', 700:'#404040', 800:'#262626', 900:'#171717', 950:'#0a0a0a' }
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
