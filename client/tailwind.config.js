/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // The rest of the app already has a global design system in styles.css.
  // Preflight's reset would fight that everywhere else, so it's off here —
  // Tailwind is scoped to utility classes only, used for the new HeroSlider.
  corePlugins: { preflight: false },
  theme: {
    extend: {},
  },
  plugins: [],
};
