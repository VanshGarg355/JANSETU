/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ATRIUM-style editorial palette: paper, ink, coral red, butter yellow, sky blue.
        // Every existing taupe / slate / blue / amber / red class remaps to it.
        taupe: {
          50: '#F5F4EF',   // paper (page background)
          100: '#EFEDE6',
          200: '#E4E2DA',
          300: '#D3D0C6',
          400: '#A09E96',
          500: '#7A7873',
          600: '#62615D',
          700: '#45443F',
          800: '#2A2927',
          850: '#151515',  // card-dark
          900: '#151515',
          950: '#0F0F0E',  // ink
          black: '#0F0F0E'
        },
        slate: {
          50: '#F5F4EF', 100: '#EFEDE6', 200: '#E4E2DA', 300: '#D3D0C6', 400: '#A09E96',
          500: '#7A7873', 600: '#62615D', 700: '#45443F', 800: '#2A2927', 900: '#151515', 950: '#0F0F0E'
        },
        // Sky blue accents; 800+ become ink so primary buttons read as black pills.
        blue: {
          50: '#F0F9FE', 100: '#DCEFFC', 200: '#BFE2F9', 300: '#9FD5F7', 400: '#6FBBE8',
          500: '#4A9FD1', 600: '#357FAE', 700: '#27607F', 800: '#1D1D1B', 900: '#151515', 950: '#0F0F0E'
        },
        // Butter yellow
        amber: {
          50: '#FFFAEB', 100: '#FEF1C2', 200: '#FDE79A', 300: '#FCDD71', 400: '#F6CB45',
          500: '#E0B020', 600: '#B88C0F', 700: '#8A6A0A', 800: '#5E4707', 900: '#443304', 950: '#2E2203'
        },
        // Coral red
        red: {
          50: '#FEF1EE', 100: '#FDE0DA', 200: '#FBC3B8', 300: '#F7A091', 400: '#F37F69',
          500: '#EF5D44', 600: '#D44630', 700: '#AE3624', 800: '#8A2D1F', 900: '#6F281D', 950: '#3E130C'
        },
        civic: {
          blue: '#0F0F0E',
          blueHover: '#2A2927',
          saffron: '#EF5D44',
          green: '#059669',
          amber: '#FCDD71',
          sky: '#9FD5F7'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
