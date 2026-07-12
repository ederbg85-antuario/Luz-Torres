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
        // Familia almendra (cafés del brandbook)
        nogal: "#6F4E37",
        almendra: "#B08968",
        "almendra-claro": "#C8A285",
        // Cafés profundos — sombras de la familia almendra
        cacao: "#4A3426",
        "cacao-oscuro": "#2E2117",
        // Neutros cálidos
        papel: "#FFFFFF",
        nieve: "#FBFAF6",
        hueso: "#F4F1EB",
        lino: "#E8E3D8",
        arena: "#C9BFAE",
        humo: "#6B6B6B",
        carbon: "#1A1A1A",
        // WhatsApp oficial
        whatsapp: "#25D366",
        "whatsapp-oscuro": "#1DA851",
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
        soft: "0 2px 12px -4px rgba(74, 52, 38, 0.10)",
        card: "0 8px 28px -10px rgba(74, 52, 38, 0.16)",
        elevated: "0 18px 48px -16px rgba(74, 52, 38, 0.24)",
        floating: "0 28px 70px -20px rgba(46, 33, 23, 0.32)",
        "glow-almendra": "0 0 0 1px rgba(176, 137, 104, 0.25), 0 12px 40px -12px rgba(111, 78, 55, 0.35)",
      },
      letterSpacing: {
        eyebrow: "0.22em",
      },
      maxWidth: {
        container: "1200px",
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
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.45" },
          "80%, 100%": { transform: "scale(1.7)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.8s ease-out both",
        "scale-in": "scale-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        float: "float 6s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
