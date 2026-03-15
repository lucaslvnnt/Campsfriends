export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        night: "#0f172a",
        forest: "#0f3d2e",
        sand: "#fef3c7",
        coral: "#fb7185",
        lake: "#0ea5e9"
      },
      fontFamily: {
        display: ["\"Avenir Next\"", "\"Futura PT\"", "Futura", "\"Trebuchet MS\"", "sans-serif"],
        body: ["\"Avenir Next\"", "\"Gill Sans\"", "Helvetica", "sans-serif"]
      }
    }
  },
  plugins: []
};
