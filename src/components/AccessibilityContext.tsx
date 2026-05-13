/**
 * AccessibilityContext.tsx
 * Manages font-size scaling and high-contrast mode.
 * Theme (dark/light) is intentionally delegated to the existing ThemeContext.
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export const FONT_SIZES = {
  SMALL: "small",
  MEDIUM: "medium",
  LARGE: "large",
  EXTRA_LARGE: "extra-large",
} as const;

export type FontSize = (typeof FONT_SIZES)[keyof typeof FONT_SIZES];

interface A11yContextType {
  fontSize: FontSize;
  highContrast: boolean;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  toggleHighContrast: () => void;
}

const A11yCtx = createContext<A11yContextType | null>(null);

function readStorage<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore */ }
}

const SIZES = Object.values(FONT_SIZES) as FontSize[];

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSize] = useState<FontSize>(() =>
    readStorage("lab-font-size", FONT_SIZES.MEDIUM)
  );
  const [highContrast, setHighContrast] = useState<boolean>(() =>
    readStorage("lab-high-contrast", false)
  );

  // Apply font-size attribute to <html>
  useEffect(() => {
    const html = document.documentElement;
    if (fontSize === FONT_SIZES.MEDIUM) {
      html.removeAttribute("data-font-size");
    } else {
      html.setAttribute("data-font-size", fontSize);
    }
  }, [fontSize]);

  // Apply high-contrast attribute to <html>
  useEffect(() => {
    const html = document.documentElement;
    if (highContrast) {
      html.setAttribute("data-high-contrast", "true");
    } else {
      html.removeAttribute("data-high-contrast");
    }
  }, [highContrast]);

  const increaseFontSize = useCallback(() => {
    setFontSize((cur) => {
      const i = SIZES.indexOf(cur);
      if (i < SIZES.length - 1) {
        const next = SIZES[i + 1];
        writeStorage("lab-font-size", next);
        return next;
      }
      return cur;
    });
  }, []);

  const decreaseFontSize = useCallback(() => {
    setFontSize((cur) => {
      const i = SIZES.indexOf(cur);
      if (i > 0) {
        const prev = SIZES[i - 1];
        writeStorage("lab-font-size", prev);
        return prev;
      }
      return cur;
    });
  }, []);

  const resetFontSize = useCallback(() => {
    setFontSize(FONT_SIZES.MEDIUM);
    writeStorage("lab-font-size", FONT_SIZES.MEDIUM);
  }, []);

  const toggleHighContrast = useCallback(() => {
    setHighContrast((cur) => {
      writeStorage("lab-high-contrast", !cur);
      return !cur;
    });
  }, []);

  return (
    <A11yCtx.Provider
      value={{ fontSize, highContrast, increaseFontSize, decreaseFontSize, resetFontSize, toggleHighContrast }}
    >
      {children}
    </A11yCtx.Provider>
  );
}

export function useAccessibility(): A11yContextType {
  const ctx = useContext(A11yCtx);
  if (!ctx) throw new Error("useAccessibility must be used inside <AccessibilityProvider>");
  return ctx;
}
