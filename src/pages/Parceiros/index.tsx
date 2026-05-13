/**
 * Parceiros/index.tsx — Re-exports LandingPage as the /parceiros route.
 * LandingPage manages its own dark mode locally but reads the initial state
 * from document.documentElement to stay in sync with ThemeContext.
 */
export { default } from "../../LandingPage";
