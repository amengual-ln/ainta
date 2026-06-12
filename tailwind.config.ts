import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        bg2: "var(--bg2)",
        indigo: {
          DEFAULT: "var(--indigo)",
          soft: "var(--indigo-soft)",
          dim: "var(--indigo-dim)",
        },
        white: "var(--white)",
        muted: "var(--muted)",
        border: "var(--border)",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      maxWidth: {
        container: "1080px",
      },
    },
  },
  plugins: [],
};

export default config;
