/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        nexus: {
          bg: "#0b0f17",
          panel: "#101722",
          surface: "#141c29",
          elevated: "#192334",
          border: "#243044",
          muted: "#8f9bb3",
          text: "#edf2ff",
          accent: "#4f8cff",
          accentSoft: "#17315f"
        }
      },
      boxShadow: {
        soft: "0 18px 60px rgba(0, 0, 0, 0.28)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
};
