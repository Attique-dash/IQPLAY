import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["selector", "[data-theme=\"dark\"]"],
  theme: {
    extend: {
      colors: {
        // Map to CSS variables for proper theming
        background: "var(--bg)",
        foreground: "var(--text)",
        surface: "var(--surface)",
        card: "var(--card)",
        "card-secondary": "var(--card2)",
        border: "var(--border)",
        "border-strong": "var(--border2)",
        text: "var(--text)",
        "text-secondary": "var(--text2)",
        muted: "var(--muted)",
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-h)",
          secondary: "var(--accent2)",
          danger: "var(--accent3)",
          success: "var(--accent4)",
        },
        glow: "var(--glow)",
        shadow: "var(--shadow)",
        "header-bg": "var(--header-bg)",
      },
      fontFamily: {
        display: ["Space Grotesk", "monospace"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
