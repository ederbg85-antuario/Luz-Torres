import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Familia verde
        sombra: "#163838",
        petroleo: "#1F4D4D",
        vivo: "#0F7A7A",
        bruma: "#B4C2BD",
        // Familia almendra
        nogal: "#6F4E37",
        almendra: "#B08968",
        "almendra-claro": "#C8A285",
        // Neutros cálidos
        papel: "#FFFFFF",
        nieve: "#FBFAF6",
        hueso: "#F4F1EB",
        lino: "#E8E3D8",
        arena: "#C9BFAE",
        humo: "#6B6B6B",
        carbon: "#1A1A1A",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "10px",
        md: "16px",
        lg: "22px",
        xl: "28px",
        "2xl": "36px",
      },
      boxShadow: {
        soft: "0 2px 12px -4px rgba(22, 56, 56, 0.10)",
        card: "0 8px 28px -10px rgba(22, 56, 56, 0.16)",
        elevated: "0 18px 48px -16px rgba(22, 56, 56, 0.22)",
        floating: "0 28px 70px -20px rgba(22, 56, 56, 0.30)",
      },
      letterSpacing: {
        eyebrow: "0.22em",
      },
      maxWidth: {
        container: "1200px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
