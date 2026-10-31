import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light professional theme (default). Values mirror globals.css tokens
        // so utility classes and the CSS variable system stay in sync.
        nordic: {
          bg: "var(--bg-main)",
          surface: "var(--bg-card)",
          sidebar: "var(--bg-sidebar)",
          card: "var(--bg-hover)",
          hover: "var(--bg-hover)",
          border: "var(--border)",
          teal: "var(--accent)",
          tealHover: "var(--accent-hover)",
          soft: "var(--accent-soft)",
          blue: "var(--accent)",
          text: "var(--text-primary)",
          subtext: "var(--text-secondary)",
          muted: "var(--text-secondary)",
          subtle: "var(--text-muted)",
          success: "var(--success)",
          warning: "var(--warning)",
          danger: "var(--danger)",
        },
        // Dark studio variant, applied under the `.dark` class.
        zen: {
          bg: "var(--bg-main)",
          surface: "var(--bg-card)",
          sidebar: "var(--bg-sidebar)",
          card: "var(--bg-hover)",
          hover: "var(--bg-hover)",
          border: "var(--border)",
          mint: "var(--accent)",
          ice: "var(--accent)",
          soft: "var(--accent-soft)",
          text: "var(--text-primary)",
          subtext: "var(--text-secondary)",
          muted: "var(--text-secondary)",
          subtle: "var(--text-muted)",
          success: "var(--success)",
          warning: "var(--warning)",
          danger: "var(--danger)",
        },
      },
      // Extend the whole scale, not just the first four steps: overriding only
      // sm/md/lg/xl would leave rounded-2xl/3xl at Tailwind's 16px/24px
      // defaults, making 2xl render *smaller* than lg.
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "calc(var(--radius-xl) + 4px)",
        "3xl": "calc(var(--radius-xl) + 12px)",
        "4xl": "calc(var(--radius-xl) + 20px)",
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        soft: "var(--shadow-sm)",
        card: "var(--shadow-md)",
        lift: "var(--shadow-lg)",
      },
    },
  },
  plugins: [],
};

export default config;