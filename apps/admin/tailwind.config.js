/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}'
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
          500: '#3E4F30',
          600: '#344328',
          700: '#2A3620',
          800: '#212A19',
          900: '#171D11',
        },
        krem: {
          DEFAULT: '#F5EEDC',
          surface: '#FBF7EE',
          border: '#E8DCC2',
          dark: '#E0D4BA',
          light: '#FCF9F2',
        },
        terakota: {
          DEFAULT: '#B4532A',
          light: '#CE6C41',
          dark: '#93401E',
          hover: '#9E4520',
          50: '#FDF4F0',
          100: '#FCE7DF',
        },
        mustard: {
          DEFAULT: '#D4A24C',
          light: '#E2BA70',
          dark: '#B88632',
          50: '#FBF7EE',
          100: '#F8EECF',
        },
        kopi: {
          DEFAULT: '#2B2625',
          light: '#3B2A1E',
          muted: '#634E3F',
          subtle: '#8C7767',
        },
        sage: {
          DEFAULT: '#8A8F5F',
          light: '#A5AA7E',
          dark: '#6E7247',
          50: '#F5F6F0',
        },
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Fraunces', 'Georgia', 'serif'],
        sans: ['var(--font-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
        handwriting: ['var(--font-caveat)', 'Caveat', 'cursive'],
      },
    },
  },
  plugins: [],
};
