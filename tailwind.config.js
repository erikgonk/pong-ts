/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pong': {
          'yellow': '#EDD24E',
          'dark': '#191A1A', 
          'light': '#D9D9D9',
        }
      },
      fontFamily: {
        'pong': ['Arial', 'Helvetica', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
