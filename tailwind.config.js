/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-green': '#1F5C34',
        'primary-green': '#38D27A',
        'light-green': '#4CAF70',
        'bg-cream': '#F6F6F1',
        'text-dark': '#1D1D1D',
        'text-gray': '#707070',
        'badge-green': '#2A7A47',
      },
      fontFamily: {
        arabic: ['Cairo', 'Tajawal', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
