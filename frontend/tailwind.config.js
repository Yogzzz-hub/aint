/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        ink: "#000000",
        paper: "#FFFFFF",
        smoke: "#A6A6A6",
        graphite: "#2A2A2A",
        surface: "#0A0A0A",
        surface2: "#111111",
      },
      fontFamily: {
        display: [
          "Cabinet Grotesk",
          "Neue Haas Grotesk Display Pro",
          "Helvetica Neue",
          "sans-serif",
        ],
        sans: ["Geist", "Inter", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "JetBrains Mono", "monospace"],
      },
      letterSpacing: {
        crush: "-0.055em",
        tight2: "-0.035em",
      },
      transitionTimingFunction: {
        cinema: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
