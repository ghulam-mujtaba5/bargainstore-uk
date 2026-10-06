import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#00205c",
          navyDark: "#00143a",
          navyLight: "#1D3D72",
          slate: "#3A4F66",
          heading: "#192a3d",
          red: "#D00303",
          redHover: "#b00202",
          yellow: "#ffd100",
          yellowHover: "#e6bd00",
          green: "#7AB800",
          greenDark: "#699E00",
          softBlue: "#ebf3fb",
          softGray: "#f2f5f7",
          border: "#e2e8f0",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
