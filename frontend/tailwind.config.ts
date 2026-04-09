import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" },
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        brand: {
          50: "#fff7ec",
          100: "#ffe9ce",
          200: "#ffcf98",
          300: "#ffac5a",
          400: "#ff872e",
          500: "#ff6a0d",
          600: "#f04c02",
          700: "#c73704",
          800: "#9e2e0c",
          900: "#7f2a0d",
        },
        ink: { DEFAULT: "#1b1410", soft: "#4a3a33" },
        cream: "#fffaf3",
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(240, 76, 2, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
