/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './public/**/*.html'
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          DEFAULT: '#3E4F30',
          50: '#F4F6F2',
          100: '#E4EADF',
          200: '#C7D4BF',
          300: '#A4BC98',
          400: '#6C885B',
          500: '#3E4F30', // Official Logo Background
          600: '#344328',
          700: '#2A3620',
          800: '#212A19',
          900: '#171D11',
        },
        krem: {
          DEFAULT: '#F5EEDC', // Background Kertas Utama
          surface: '#FBF7EE', // Surface Card
          border: '#E8DCC2',
          dark: '#E0D4BA',
        },
        terakota: {
          DEFAULT: '#B4532A', // CTA & Action
          light: '#CE6C41',
          dark: '#93401E',
          hover: '#9E4520',
        },
        mustard: {
          DEFAULT: '#D4A24C', // Poin & Badge
          light: '#E2BA70',
          dark: '#B88632',
        },
        cokelat: {
          DEFAULT: '#3B2A1E', // Teks Utama
          muted: '#634E3F',
          subtle: '#8C7767',
        },
        sage: {
          DEFAULT: '#8A8F5F', // Status Positif & Chart
          light: '#A5AA7E',
          dark: '#6E7247',
        }
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Fraunces', 'Georgia', 'serif'],
        sans: ['var(--font-jakarta)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        handwriting: ['var(--font-caveat)', 'Caveat', 'cursive'],
      },
      borderRadius: {
        'vintage': '1.25rem',
        'vintage-asym': '1.75rem 0.5rem 1.75rem 0.5rem',
      },
      boxShadow: {
        'warm': '0 4px 20px -2px rgba(59, 42, 30, 0.08), 0 2px 6px -1px rgba(59, 42, 30, 0.04)',
        'warm-lg': '0 10px 30px -4px rgba(59, 42, 30, 0.12), 0 4px 12px -2px rgba(59, 42, 30, 0.06)',
      }
    },
  },
  plugins: [],
};
