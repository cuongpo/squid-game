/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'squid-pink': '#F7418F',
        'squid-green': '#00A86B',
        'squid-dark': '#1a1a1a',
        'squid-gray': '#2d2d2d',
      },
      fontFamily: {
        'korean': ['Noto Sans KR', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
