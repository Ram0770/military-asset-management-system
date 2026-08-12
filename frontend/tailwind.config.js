/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        essex: {
          bg: "#080c14",
          surface: "#0f172a",
          card: "#172033",
          border: "#26334d",
          accent: "#38bdf8", // Fluid sky blue
          gold: "#e2b857",   // Warm champagne gold
          silver: "#94a3b8",
          emerald: "#10b981",
          rose: "#f43f5e"
        }
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "sans-serif"],
        display: ["Cinzel", "Playfair Display", "serif"],
        mono: ["JetBrains Mono", "monospace"]
      }
    },
  },
  plugins: [],
}
