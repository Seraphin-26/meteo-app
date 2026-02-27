import type { Config } from "tailwindcss";

const config: Config = {
  // ⚠️ CRITIQUE : Tailwind scanne ces fichiers pour générer les classes CSS
  // Si un fichier est absent ici, ses classes ne sont PAS générées → tout est invisible
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "sans-serif"],
      },
      borderRadius: {
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        "card": "0 2px 16px 0 rgba(0,0,0,0.06), 0 1px 3px 0 rgba(0,0,0,0.04)",
        "card-hover": "0 8px 32px 0 rgba(0,0,0,0.10), 0 2px 8px 0 rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
