/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html"],
  darkMode: false,
  theme: {
    extend: {},
    safelist: [
      {
        pattern: /bg-(red|green|blue|amber|gray)-(100|200|300|400|500)/,
      },
    ],
    screens: {
      'sm': '641px',
      'md': '769px',
      'lg': '1025px',
      'xl': '1281px',
    },
  },
  plugins: [],
}

