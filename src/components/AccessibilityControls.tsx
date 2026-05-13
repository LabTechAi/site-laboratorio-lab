/**
 * AccessibilityControls.tsx
 * Floating accessibility panel — bottom-left corner.
 * Manages: theme (via ThemeContext), font size and high contrast (via AccessibilityContext).
 * Keyboard: Ctrl+Shift+A to open/close · Esc to close.
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  Type,
  Eye,
  Plus,
  Minus,
  RotateCcw,
  X,
} from "lucide-react";
import { useAccessibility, FONT_SIZES } from "./AccessibilityContext";
import { useTheme } from "../context/ThemeContext";
import { useHideNearFooter } from "../hooks/useHideNearFooter";

type ThemeMode = "light" | "dark" | "system";

const FONT_LABEL: Record<string, string> = {
  small: "Pequeno",
  medium: "Médio",
  large: "Grande",
  "extra-large": "Extra Grande",
};

export function AccessibilityControls() {
  const {
    fontSize,
    highContrast,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    toggleHighContrast,
  } = useAccessibility();
  const { isDark, setDark } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const nearFooter = useHideNearFooter();
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      return (localStorage.getItem("lab-theme-mode") as ThemeMode) || "system";
    } catch {
      return "system";
    }
  });

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((p) => !p), []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) close();
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close, toggle]);

  function handleThemeChange(mode: ThemeMode) {
    setThemeMode(mode);
    try { localStorage.setItem("lab-theme-mode", mode); } catch { /* ignore */ }
    if (mode === "system") {
      setDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    } else {
      setDark(mode === "dark");
    }
  }

  const themeButtons: { mode: ThemeMode; label: string; Icon: typeof Sun }[] = [
    { mode: "light", label: "Claro", Icon: Sun },
    { mode: "dark", label: "Escuro", Icon: Moon },
    { mode: "system", label: "Sistema", Icon: Monitor },
  ];

  return (
    <div
      className={`fixed bottom-6 left-6 z-50
        transition-all duration-300
        ${nearFooter ? "opacity-0 pointer-events-none translate-y-2" : "opacity-100 translate-y-0"}`}
    >
      {/* Floating trigger */}
      <button
        onClick={toggle}
        aria-label="Abrir controles de acessibilidade"
        aria-expanded={isOpen}
        title="Acessibilidade (Ctrl+Shift+A)"
        className="group relative w-14 h-14 rounded-full
          bg-gradient-to-br from-blue-600 to-indigo-700
          text-white shadow-lg shadow-blue-600/30
          flex items-center justify-center
          hover:scale-110 hover:shadow-xl hover:shadow-blue-600/40
          transition-all duration-300
          focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        <Settings className="w-6 h-6 transition-transform duration-700 group-hover:rotate-90" />
        <span className="sr-only">Acessibilidade</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Invisible backdrop to close on click-outside */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[-1]"
              onClick={close}
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              role="dialog"
              aria-modal="true"
              aria-label="Painel de Acessibilidade"
              className="absolute bottom-16 left-0
                w-80 max-w-[calc(100vw-3rem)]
                bg-white dark:bg-gray-800
                border border-gray-200 dark:border-gray-700
                rounded-2xl shadow-2xl shadow-gray-900/20
                overflow-hidden flex flex-col
                max-h-[min(520px,calc(100svh-6rem)])"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4
                border-b border-gray-100 dark:border-gray-700
                bg-gradient-to-r from-blue-50 to-indigo-50
                dark:from-blue-900/20 dark:to-indigo-900/10">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Acessibilidade
                </h2>
                <button
                  onClick={close}
                  aria-label="Fechar painel"
                  className="w-7 h-7 rounded-lg flex items-center justify-center
                    text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    transition-colors duration-150"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">

                {/* — Theme — */}
                <section>
                  <p className="flex items-center gap-1.5 mb-3
                    text-xs font-semibold uppercase tracking-wide
                    text-gray-500 dark:text-gray-400">
                    {isDark
                      ? <Moon className="w-3.5 h-3.5" />
                      : <Sun className="w-3.5 h-3.5" />}
                    Tema
                  </p>
                  <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Selecionar tema">
                    {themeButtons.map(({ mode, label, Icon }) => {
                      const active = themeMode === mode;
                      return (
                        <button
                          key={mode}
                          onClick={() => handleThemeChange(mode)}
                          aria-pressed={active}
                          className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg
                            border-2 text-[11px] font-semibold
                            transition-all duration-200
                            focus-visible:ring-2 focus-visible:ring-blue-500
                            ${active
                              ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/25"
                              : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300"
                            }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* — Font Size — */}
                <section>
                  <p className="flex items-center gap-1.5 mb-3
                    text-xs font-semibold uppercase tracking-wide
                    text-gray-500 dark:text-gray-400">
                    <Type className="w-3.5 h-3.5" />
                    Tamanho da Fonte
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={decreaseFontSize}
                      disabled={fontSize === FONT_SIZES.SMALL}
                      aria-label="Diminuir fonte"
                      className="w-9 h-9 flex items-center justify-center rounded-xl
                        border-2 border-gray-200 dark:border-gray-600
                        bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300
                        hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400
                        transition-all duration-150
                        disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={resetFontSize}
                      aria-label="Resetar fonte para padrão"
                      className="flex-1 flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl
                        border-2 border-gray-200 dark:border-gray-600
                        bg-white dark:bg-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300
                        hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400
                        transition-all duration-150"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {FONT_LABEL[fontSize]}
                    </button>

                    <button
                      onClick={increaseFontSize}
                      disabled={fontSize === FONT_SIZES.EXTRA_LARGE}
                      aria-label="Aumentar fonte"
                      className="w-9 h-9 flex items-center justify-center rounded-xl
                        border-2 border-gray-200 dark:border-gray-600
                        bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300
                        hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400
                        transition-all duration-150
                        disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </section>

                {/* — High Contrast — */}
                <section>
                  <p className="flex items-center gap-1.5 mb-3
                    text-xs font-semibold uppercase tracking-wide
                    text-gray-500 dark:text-gray-400">
                    <Eye className="w-3.5 h-3.5" />
                    Alto Contraste
                  </p>
                  <button
                    role="switch"
                    aria-checked={highContrast}
                    onClick={toggleHighContrast}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2
                      transition-all duration-200
                      focus-visible:ring-2 focus-visible:ring-blue-500
                      ${highContrast
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                        : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-400"
                      }`}
                  >
                    {/* Toggle pill */}
                    <div
                      className={`relative shrink-0 w-10 h-5 rounded-full transition-colors duration-300
                        ${highContrast ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"}`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300
                          ${highContrast ? "left-5" : "left-0.5"}`}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-semibold leading-tight">
                        {highContrast ? "Ativado" : "Desativado"}
                      </p>
                      <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500">
                        Ideal para baixa visão e daltonismo
                      </p>
                    </div>
                  </button>
                </section>

                {/* Keyboard hint */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60 space-y-1 text-center">
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">
                    <kbd className="px-1.5 py-0.5 text-[10px] rounded border
                      bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600
                      font-mono">Ctrl+Shift+A</kbd>
                    {" "}abrir · {" "}
                    <kbd className="px-1.5 py-0.5 text-[10px] rounded border
                      bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600
                      font-mono">Esc</kbd>
                    {" "}fechar
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">
                    Configurações salvas automaticamente
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
