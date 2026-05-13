/**
 * ThemeContext — single source of truth for dark/light mode across the app.
 *
 * Reads the initial preference from localStorage (key: "theme") and falls back
 * to the OS preference via `prefers-color-scheme`. Syncs the `dark` class on
 * <html> and persists the choice to localStorage on every toggle.
 */

import React, { createContext, useContext, useState, useEffect } from "react";

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  setDark: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
  setDark: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);
  const setDark = (value: boolean) => setIsDark(value);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
