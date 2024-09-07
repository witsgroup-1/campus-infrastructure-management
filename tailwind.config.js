/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,js}', 
    './ui-elements/**/*.{html,js}',
  ],
  theme: {
    extend: {
      colors: {
        'button-bg': '#1c44ac',
        'button-border': '#b0b5fa',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

