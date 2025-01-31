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
  },
  plugins: [],
}

