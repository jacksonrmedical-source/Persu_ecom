/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pink: "#FF3F6C",      // primary CTA, discount tags, sale price
        purple: "#7C3AED",    // gradient partner for pink, premium accents
        gold: "#C99A3B",      // ratings, premium badges
        amber: "#F59E0B",     // header/footer solid background
        ink: "#282C3F",       // primary text
        muted: "#94969F",     // secondary text, product subtitles
        sand: "#FFFDF9",      // page background — warm off-white, not stark white
        panel: "#F5F5F6",     // card/section backgrounds
        border: "#E9E9EB",
        teal: "#14958F",      // ratings badge
        lime: "#14958F",      // kept alias so existing "in stock" usages still resolve
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["Inter", "sans-serif"],
      },
      borderRadius: {
        card: "4px",
      },
    },
  },
  plugins: [],
};
