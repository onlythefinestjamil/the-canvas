/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#080612",
        bg2: "#0e0a1e",
        card: "#140e26",
        border: "#1f1538",
        accent: "#9146FF",
        accent2: "#38B6FF",
        success: "#28E5A0",
        danger: "#ff4466",
        muted: "#7a6b9a",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(145, 70, 255, 0.3)" },
          "100%": { boxShadow: "0 0 20px rgba(145, 70, 255, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};
