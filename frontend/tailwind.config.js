/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50:  '#EAF4EC',
          100: '#C4E0CA',
          200: '#9ECBA8',
          300: '#77B585',
          400: '#51A063',
          500: '#2A8A41',
          600: '#1A5C2A',
          700: '#144820',
          800: '#0E3416',
          900: '#082009',
        },
        amber: {
          50:  '#FEF3E8',
          100: '#FCDDB8',
          200: '#FAC788',
          300: '#F7B058',
          400: '#F39A28',
          500: '#E07C24',
          600: '#C0671A',
          700: '#A05210',
        },
        ocean: {
          50:  '#E8F1FB',
          100: '#BDD4F3',
          200: '#92B7EB',
          300: '#679AE3',
          400: '#3C7DDB',
          500: '#185FA5',
          600: '#124A82',
          700: '#0C355F',
        },
        ink: '#1A1A2E',
      },
      fontFamily: {
        sans:    ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
