/**
 * FloatingHelpButton.tsx — Botão flutuante de Central de Ajuda (bottom-right).
 * Aparece após 200px de scroll. Abre o modal com HelpCenter.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X } from "lucide-react";
import { HelpCenter } from "./HelpCenter";
import { useHideNearFooter } from "../hooks/useHideNearFooter";

export function FloatingHelpButton() {
  const [isOpen, setIsOpen] = useState(false);
  const nearFooter = useHideNearFooter();

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <>
      {/* ── Floating trigger — always visible ───────────────────────── */}
      <div
        className={`fixed bottom-6 right-6 z-40
          transition-all duration-300
          ${nearFooter ? "opacity-0 pointer-events-none translate-y-2" : "opacity-100 translate-y-0"}`}
      >
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label="Abrir Central de Ajuda"
              className="group relative w-14 h-14 rounded-full
                bg-gradient-to-br from-blue-600 to-blue-700
                text-white shadow-lg shadow-blue-600/35
                flex items-center justify-center
                hover:scale-110 hover:shadow-xl hover:shadow-blue-600/45
                transition-all duration-300
                focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <HelpCircle className="w-7 h-7" />
              {/* Ping badge */}
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500" />
              </span>
            </button>

            {/* Tooltip */}
            <div className="pointer-events-none absolute bottom-full right-0 mb-2
              bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium
              px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap
              opacity-0 group-hover:opacity-100 transition-opacity duration-200
              after:content-[''] after:absolute after:top-full after:right-4
              after:border-4 after:border-transparent after:border-t-gray-900 dark:after:border-t-gray-700">
              Central de Ajuda
            </div>
          </div>

      {/* ── Modal ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4
              bg-black/50 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
            role="dialog"
            aria-modal="true"
            aria-label="Central de Ajuda LAB"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-5xl max-h-[90vh]
                rounded-2xl bg-white dark:bg-gray-900
                shadow-2xl shadow-gray-900/30 ring-1 ring-gray-200 dark:ring-gray-700
                overflow-clip flex flex-col"
            >
              {/* Close button — fixed inside the card, above scroll */}
              <div className="absolute top-4 right-4 z-20">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Fechar Central de Ajuda"
                  className="w-9 h-9 rounded-xl flex items-center justify-center
                    bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm
                    text-gray-500 dark:text-gray-400
                    hover:bg-blue-600 hover:text-white
                    border border-gray-200 dark:border-gray-700
                    shadow-sm transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable content — isolated inside rounded container */}
              <div className="help-modal-scroll overflow-y-auto overscroll-contain flex-1">
                <HelpCenter onClose={() => setIsOpen(false)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
