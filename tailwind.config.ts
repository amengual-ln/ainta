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
        accent: {
          DEFAULT: "var(--accent)",
          soft: "var(--accent-soft)",
          dim: "var(--accent-dim)",
          dimmer: "var(--accent-dimmer)",
        },
        white: "var(--white)",
        muted: "var(--muted)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        body: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        "pixel-square": ["var(--font-geist-pixel-square)", "monospace"],
        "pixel-grid": ["var(--font-geist-pixel-grid)", "monospace"],
        "pixel-circle": ["var(--font-geist-pixel-circle)", "monospace"],
        "pixel-triangle": ["var(--font-geist-pixel-triangle)", "monospace"],
        "pixel-line": ["var(--font-geist-pixel-line)", "monospace"],
      },
      maxWidth: {
        container: "1080px",
      },
    },
  },
  plugins: [],
};

export default config;
