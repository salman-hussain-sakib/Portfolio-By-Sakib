/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          green: "#00FF00",
          dark: "#0d1117",
          gray: "#161b22",
        }
      },
      boxShadow: {
        'neon': '0 0 5px #00FF00, 0 0 20px #00FF00',
        'neon-strong': '0 0 10px #00FF00, 0 0 40px #00FF00',
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        cyberpunk: {
          "primary": "#00FF00",
          "secondary": "#00FF00",
          "accent": "#00FF00",
          "neutral": "#161b22",
          "base-100": "#0d1117",
          "info": "#00FF00",
          "success": "#00FF00",
          "warning": "#00FF00",
          "error": "#ff0000",
        },
      },
    ],
  },
}
