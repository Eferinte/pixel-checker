/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 12px 30px -20px rgba(15, 23, 42, 0.35)',
      },
    },
  },
  plugins: [],
}
