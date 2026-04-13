/** @type {import('tailwindcss').Config} */
import flyonui from "flyonui";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [flyonui],
}
