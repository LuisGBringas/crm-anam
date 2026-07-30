import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#7A1F3D",
          dark: "#5C1730",
          light: "#9A3358",
        },
        secondary: {
          DEFAULT: "#1C4F3F",
          dark: "#123529",
          light: "#2B7059",
        },
        neutral: {
          DEFAULT: "#75787B",
        },
        accent: {
          DEFAULT: "#C6A15B",
        },
        status: {
          ok: "#2E7D32",
          scheduled: "#F2A900",
          needed: "#C62828",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
