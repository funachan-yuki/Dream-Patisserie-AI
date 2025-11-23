/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Noto Serif JP"', 'serif'],
        sans: ['"Zen Maru Gothic"', 'sans-serif'],
        display: ['"Bodoni Moda"', 'serif'],
      },
    },
  },
  plugins: [],
}