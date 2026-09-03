/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef4ff",
          100: "#dbe6fe",
          200: "#bed0fd",
          300: "#91b1fb",
          400: "#5d87f7",
          500: "#3a63f0",
          600: "#2745e4",
          700: "#2035c9",
          800: "#212ea3",
          900: "#212b80",
        },
        status: {
          healthy: "#16a34a",
          low: "#d97706",
          critical: "#dc2626",
          out: "#7f1d1d",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
