/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#4ccce6",
        "background-light": "#fbfaf8",
        "background-dark": "#111e21",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        serif: ["Playfair Display", "serif"]
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px"
      },
    },
  },
  plugins: [],
}
