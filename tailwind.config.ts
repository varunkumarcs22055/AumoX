import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          base:     "rgb(var(--bg-base) / <alpha-value>)",
          surface:  "rgb(var(--bg-surface) / <alpha-value>)",
          elevated: "rgb(var(--bg-elevated) / <alpha-value>)",
          panel:    "rgb(var(--bg-panel) / <alpha-value>)",
        },
        gold: {
          100: "#FAF1D6",
          200: "#F0DDA0",
          300: "#E5C76B",
          400: "#D4AF37",
          500: "#C9A961",
          600: "#B8941F",
          700: "#967514",
        },
        ink: {
          0:   "rgb(var(--ink-0) / <alpha-value>)",
          100: "rgb(var(--ink-100) / <alpha-value>)",
          200: "rgb(var(--ink-200) / <alpha-value>)",
          300: "rgb(var(--ink-300) / <alpha-value>)",
          400: "rgb(var(--ink-400) / <alpha-value>)",
          500: "rgb(var(--ink-500) / <alpha-value>)",
        },
        line: {
          DEFAULT: "rgb(var(--line) / <alpha-value>)",
          strong:  "rgb(var(--line-strong) / <alpha-value>)",
          subtle:  "rgb(var(--line-subtle) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        "widest-x": "0.3em",
      },
      maxWidth: {
        "8xl": "88rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%,100%": { boxShadow: "0 0 0 0 rgba(212,175,55,0.5)" },
          "50%": { boxShadow: "0 0 0 12px rgba(212,175,55,0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "ping-slow": {
          "0%": { transform: "scale(1)", opacity: "0.5" },
          "75%,100%": { transform: "scale(1.6)", opacity: "0" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "gradient-x": {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out forwards",
        "fade-in": "fade-in 0.6s ease-out forwards",
        shimmer: "shimmer 3s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
        "ping-slow": "ping-slow 2.4s cubic-bezier(0,0,0.2,1) infinite",
        float: "float 6s ease-in-out infinite",
        "gradient-x": "gradient-x 6s ease infinite",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #E5C76B 0%, #D4AF37 50%, #B8941F 100%)",
        "gold-text": "linear-gradient(135deg, #F0DDA0 0%, #D4AF37 50%, #B8941F 100%)",
        "radial-gold": "radial-gradient(circle at center, rgba(212,175,55,0.18), transparent 70%)",
      },
    },
  },
  plugins: [],
};

export default config;
