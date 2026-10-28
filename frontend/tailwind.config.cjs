/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        taupe: {
          50: '#F5F2EF',
          100: '#EBE5E0',
          200: '#D3C3B9', // Primary
          300: '#BDAFA6',
          400: '#A89C94',
          500: '#938881',
          600: '#7E756F',
          700: '#69615C',
          800: '#544E4A',
          850: '#3F3A37',
          900: '#2A2725',
          950: '#151312',
          black: '#000000'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
