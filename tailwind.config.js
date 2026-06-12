/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2d5a1b',
          light: '#3d6b47',
          pale: '#eaf3e8',
        },
        secondary: {
          DEFAULT: '#5b9bd5',
          light: '#a8d5f7',
        },
        accent: '#c5ddb8',
        surface: '#f5f2eb',
        sidebarGreen: '#2d5a1b',
      },
      fontFamily: {
        sans: ['Cairo', 'sans-serif'],
      },
      spacing: {
        sidebar: '14rem',
      },
    },
  },
  plugins: [],
};
