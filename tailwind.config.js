/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        kanata: {
          DEFAULT: "#3b82f6",
          bg: "#1e3a8a20",
        },
        yusuke: {
          DEFAULT: "#10b981",
          bg: "#06402420",
        },
        leo: {
          DEFAULT: "#a855f7",
          bg: "#3b0a5f20",
        },
      },
    },
  },
  plugins: [],
};
