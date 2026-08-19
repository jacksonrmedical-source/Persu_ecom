/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Uniform system C: black structure, single red accent everywhere —
        // pink/gold intentionally share the same red value so every
        // accent usage (buttons, links, badges, active states, the logo's Z)
        // stays in sync from one change, instead of drifting independently.
        pink: "#E23B3B",       // THE single accent — CTAs, links, active states, badges
        purple: "#141414",     // structure — not directly used by most components
        gold: "#E23B3B",       // alias to the same accent (was a separate orange/gold before)
        amber: "#141414",
        ink: "#141414",        // black structure color
        muted: "#707070",      // cool gray meta text
        sand: "#FFFFFF",       // stark white canvas
        panel: "#F5F5F5",
        border: "#E5E5E5",
        teal: "#2E7D32",       // = success/delivered
        lime: "#2E7D32",
      },
      fontFamily: {
        // One neutral grotesk at varying weight, ASOS-style — not a
        // display/body pairing. Uniformity is the point here.
        display: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["Inter", "sans-serif"],
      },
      borderRadius: {
        card: "0px",
      },
    },
  },
  plugins: [],
};
