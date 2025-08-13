/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tier-s': '#FF7F7F',
        'tier-a': '#FFBF7F',
        'tier-b': '#FFDF7F',
        'tier-c': '#FFFF7F',
        'tier-d': '#BFFF7F',
        'tier-e': '#7FFF7F',
        'tier-f': '#7FBFFF',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}