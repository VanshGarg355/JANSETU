/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern Civic Tech Palette (Replaces dull muddy taupe with crisp slate & royal civic navy)
        taupe: {
          50: '#F8FAFC',   // Clean ultra-light slate
          100: '#F1F5F9',  // Soft cool surface fill
          200: '#E2E8F0',  // Crisp border & pill background
          300: '#CBD5E1',  // Defined card borders
          400: '#94A3B8',  // Soft slate muted icons & placeholders
          500: '#64748B',  // Clean secondary slate
          600: '#475569',  // Readable description text
          700: '#334155',  // High-contrast slate typography
          800: '#1E293B',  // Rich dark slate
          850: '#0F274A',  // Signature Civic Royal Navy (Executive & Authoritative)
          900: '#0B1E38',  // Deep Midnight Navy (Footer & Hero Card backgrounds)
          950: '#061224',  // Midnight Black-Navy (Maximum contrast)
          black: '#020617'
        },
        civic: {
          blue: '#1E40AF',
          blueHover: '#1D4ED8',
          saffron: '#EA580C',
          green: '#059669',
          amber: '#D97706',
          sky: '#0284C7'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
