/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)"],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        // Warm, gentle palette for a cat rescue nonprofit: rose pink, soft
        // teal accent, cream. Swap these hex values per client to reuse
        // this template elsewhere.
        prettykitty: {
          primary: "#d1638a",
          "primary-content": "#fff7f9",
          secondary: "#4d9a94",
          "secondary-content": "#f2fbfa",
          accent: "#d1638a",
          "accent-content": "#fff7f9",
          neutral: "#fdf3f6",
          "neutral-content": "#3a2a30",
          "base-100": "#ffffff",
          "base-200": "#fdf3f6",
          "base-300": "#f6dfe6",
          "base-content": "#3a2a30",
          info: "#3abff8",
          success: "#36d399",
          warning: "#fbbd23",
          error: "#e35d5d",
        },
      },
    ],
  },
};
