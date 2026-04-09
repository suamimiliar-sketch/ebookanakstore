import type { Config } from "tailwindcss";

/**
 * Pelangi Pintar brand palette
 * See: PELANGI PINTAR — Brand Visual Knowledge Base (v1.0)
 *
 * - brand   = sunshine-gold system (primary CTA, accent, highlights)
 * - sky     = Huto mascot blue system (secondary, surfaces, shadows)
 * - cream   = warm neutral background
 * - amber   = warm accent / rim light / secondary CTA
 * - blush   = soft playful accent
 * - ink     = deep navy for text and rich shadows (NOT pure black)
 */
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
        // Sunshine gold (primary)
        brand: {
          50: "#FFF8E0",
          100: "#FFEFB8",
          200: "#FFE184",
          300: "#FFD04C",
          400: "#FFC41F",
          500: "#FFBB00", // sunshine-gold (signature)
          600: "#E6A800",
          700: "#C78F00",
          800: "#9E7200",
          900: "#7A5700",
        },
        // Huto mascot blue system
        sky: {
          50: "#F4FAFD",
          100: "#E8F4FB", // cloud-blue
          200: "#D6EEF8", // sky-light
          300: "#AFD8EA",
          400: "#8BBFD4", // sky-feather (main mascot blue)
          500: "#4D8FAA", // deep-wing
          600: "#2B4F6E", // owl-navy
          700: "#1A2E40", // navy-deep
        },
        // Warm neutrals
        cream: "#F5EFE0", // cream-belly (default cream)
        "cream-warm": "#C8B899",
        // Warm accents
        amber: {
          DEFAULT: "#F5A030", // amber-beak
          deep: "#C8782A",
          soft: "#FFDD80", // gold-soft (key light tone)
        },
        blush: "#FFB8B8", // blush-pink
        // Ink: deep navy for text and shadows (brand rule: NEVER pure black)
        ink: {
          DEFAULT: "#1A2E40", // navy-deep
          soft: "#2B4F6E", // owl-navy
        },
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        // Warm gold glow (replaces the old orange-tinted shadow)
        soft: "0 10px 30px -12px rgba(255, 187, 0, 0.28)",
        sky: "0 10px 30px -12px rgba(43, 79, 110, 0.22)",
        // Glassmorphism floating card
        float: "0 20px 60px -20px rgba(43, 79, 110, 0.25), 0 8px 24px -12px rgba(255, 187, 0, 0.18)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-16px)" },
        },
        bob: {
          "0%, 100%": { transform: "translateY(0px) rotate(-1deg)" },
          "50%": { transform: "translateY(-14px) rotate(2deg)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.4", transform: "scale(0.9)" },
          "50%": { opacity: "1", transform: "scale(1.15)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        "float-slow": "float-slow 4.5s ease-in-out infinite",
        bob: "bob 5s ease-in-out infinite",
        twinkle: "twinkle 2.5s ease-in-out infinite",
        "pulse-soft": "pulse-soft 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
