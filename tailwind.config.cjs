/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wood-dark': '#3d2b1f',
        'wood-shelf': '#5d4037',
        'paper': '#f5f5dc',
      }
    },
  },
  plugins: [],
}

