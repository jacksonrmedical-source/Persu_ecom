/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Walmart-inspired palette, ASOS-style neutral/dense structure
        pink: "#0071CE",       // = Walmart Blue — primary CTA, links, active states
        purple: "#041E42",     // = Walmart Navy — header/footer dark blocks
        gold: "#FF6B1A",       // spark accent — All Categories pill, cart badge, category strip
        amber: "#0071CE",
        ink: "#1A1A1A",        // near-black, ASOS-style body/heading text
        muted: "#707070",      // cool gray meta text
        sand: "#FFFFFF",       // stark white canvas — ASOS is not warm/cream
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
