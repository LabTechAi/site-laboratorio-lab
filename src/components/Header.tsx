/**
 * Header.tsx — Global institutional header with glassmorphism, sticky scroll
 * behaviour, mobile drawer, dark-mode toggle and smooth-scroll anchor nav.
 *
 * Stack: Framer Motion 11 + Tailwind CSS (darkMode:'class') + lucide-react
 */

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Menu, X, Sun, Moon, ExternalLink, MessageSquare } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

// ─── Navigation links (anchor-based, all on the Home page) ──────────────────
const NAV_LINKS = [
  { label: "Sobre", href: "#sobre" },
  { label: "Corpo Clínico", href: "#corpo-clinico" },
  { label: "Especialidades", href: "#especialidades" },
  { label: "Exames", href: "#exames" },
  { label: "Convênios", href: "#convenios" },
  { label: "Unidades", href: "#unidades" },
  { label: "Contato", href: "#contato" },
];

// ─── Framer Motion variants ──────────────────────────────────────────────────
const mobileMenuVariants = {
  hidden: { opacity: 0, y: -12, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.22, ease: "easeOut", staggerChildren: 0.05 },
  },
  exit: { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.18, ease: "easeIn" } },
};

const mobileItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2, ease: "easeOut" } },
};

// ─── ThemeToggle sub-component ───────────────────────────────────────────────
const ThemeToggle: React.FC<{ isDark: boolean; toggle: () => void }> = ({ isDark, toggle }) => (
  <button
    onClick={toggle}
    aria-label="Alternar tema claro/escuro"
    className="relative w-9 h-9 flex items-center justify-center rounded-xl
      hover:bg-slate-100 dark:hover:bg-gray-700 transition-all duration-200
      focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
      dark:focus-visible:ring-offset-gray-900"
  >
    <Sun
      className={`absolute w-5 h-5 text-amber-500 transition-all duration-300 ${
        isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
      }`}
    />
    <Moon
      className={`absolute w-5 h-5 text-blue-400 transition-all duration-300 ${
        isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
      }`}
    />
  </button>
);

// ─── Main Header component ───────────────────────────────────────────────────
export default function Header() {
  const { isDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const { scrollY } = useScroll();
  // Glass layer fades in over the first 60px of scroll
  const glassOpacity = useTransform(scrollY, [0, 60], [0, 1]);
  const shadowOpacity = useTransform(scrollY, [0, 60], [0, 1]);

  // ── Scroll spy: highlights the current section in the nav ────────────────
  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href.replace("#", ""));
    const observers = ids.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: "-40% 0px -50% 0px" }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  // ── Close mobile menu on scroll ──────────────────────────────────────────
  useEffect(() => {
    if (!mobileOpen) return;
    const unsub = scrollY.on("change", (v) => { if (v > 80) setMobileOpen(false); });
    return unsub;
  }, [mobileOpen, scrollY]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <motion.header className="sticky top-0 z-30 w-full">
      {/*
       * Glass background layer — opacity is driven by a MotionValue so the
       * blur/tint only activates after the user has scrolled, preventing the
       * "blurring air at the top" artefact.
       */}
      <motion.div
        style={{
          opacity: glassOpacity,
          backgroundColor: isDark ? "rgba(17, 24, 39, 0.92)" : "rgba(255, 255, 255, 0.92)",
        }}
        className="absolute inset-0 backdrop-blur-[14px] pointer-events-none"
      />

      {/* Border-bottom glow that fades in on scroll */}
      <motion.div
        style={{ opacity: glassOpacity }}
        className="absolute bottom-0 inset-x-0 h-px
          bg-gradient-to-r from-transparent via-blue-200/60 dark:via-blue-500/20 to-transparent
          pointer-events-none"
      />

      {/* Drop shadow layer */}
      <motion.div
        style={{ opacity: shadowOpacity }}
        className="absolute inset-0 pointer-events-none
          shadow-[0_2px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)]"
      />

      {/* ── Main bar ───────────────────────────────────────────────────────── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">

          {/* Logo */}
          <a
            href="#home"
            aria-label="LAB – Laboratório e Medicina Diagnóstica — ir para o topo"
            className="flex-shrink-0 flex items-center gap-2 rounded-lg
              focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
              dark:focus-visible:ring-offset-gray-900"
          >
            <img
              src="/assets/logo/LOGO-HOR.svg"
              alt="LAB Laboratório e Medicina Diagnóstica"
              className="h-11 w-auto object-contain dark:hidden select-none"
              draggable={false}
            />
            <img
              src="/assets/logo/LOGO-HOR-DM.svg"
              alt="LAB Laboratório e Medicina Diagnóstica"
              className="h-11 w-auto object-contain hidden dark:block select-none"
              draggable={false}
            />
          </a>

          {/* ── Desktop nav ─────────────────────────────────────────────── */}
          <nav className="hidden xl:flex items-center gap-1" aria-label="Navegação principal">
            {NAV_LINKS.map((link) => {
              const id = link.href.replace("#", "");
              const isActive = activeSection === id;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2 text-sm font-medium rounded-lg
                    transition-colors duration-200 whitespace-nowrap
                    focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1
                    dark:focus-visible:ring-offset-gray-900
                    ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800"
                    }`}
                >
                  {link.label}
                  {/* Active underline — slides in from center */}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavUnderline"
                      className="absolute bottom-1 left-3 right-3 h-0.5 rounded-full
                        bg-gradient-to-r from-blue-500 to-blue-600"
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* ── Desktop actions ─────────────────────────────────────────── */}
          <div className="hidden xl:flex items-center gap-2 flex-shrink-0">
            {/* Meu Espaço Saúde — results portal */}
            <a
              href="https://lab.aplis.inf.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium
                rounded-xl border-2 border-blue-600 text-blue-600
                hover:bg-blue-50 dark:hover:bg-blue-900/20
                transition-all duration-200 hover:-translate-y-px
                focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1
                dark:focus-visible:ring-offset-gray-900"
              aria-label="Acesse seus resultados"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden 2xl:inline">Acesse seus resultados</span>
              <span className="inline 2xl:hidden">Resultados</span>
            </a>

            {/* Fale com o Patologista */}
            <a
              href="https://forms.gle/peKeAhqLPvPvdCoy8"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold
                rounded-xl text-white
                bg-gradient-to-r from-blue-600 to-blue-700
                hover:from-blue-700 hover:to-indigo-700
                shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30
                transition-all duration-200 hover:-translate-y-px
                focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
              aria-label="Fale com um Patologista"
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden 2xl:inline">Fale com um Patologista</span>
              <span className="inline 2xl:hidden">Patologista</span>
            </a>

            <ThemeToggle isDark={isDark} toggle={toggleTheme} />
          </div>

          {/* ── Mobile: theme toggle + hamburger ────────────────────────── */}
          <div className="flex xl:hidden items-center gap-1">
            <ThemeToggle isDark={isDark} toggle={toggleTheme} />
            <button
              onClick={() => setMobileOpen((p) => !p)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
              className="w-9 h-9 flex items-center justify-center rounded-xl
                hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors duration-200
                focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu drawer ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            key="mobile-menu"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            aria-label="Navegação mobile"
            className="lg:hidden relative overflow-hidden"
            style={{
              backgroundColor: isDark ? "rgba(17,24,39,0.97)" : "rgba(255,255,255,0.97)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1 border-t
              border-slate-100 dark:border-gray-700/50">
              {NAV_LINKS.map((link) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={closeMobile}
                  variants={mobileItemVariants}
                  className="flex items-center px-4 py-3 rounded-xl text-sm font-medium
                    text-gray-700 dark:text-gray-200
                    hover:bg-blue-50 dark:hover:bg-gray-800
                    hover:text-blue-600 dark:hover:text-blue-400
                    transition-colors duration-150"
                >
                  {link.label}
                </motion.a>
              ))}

              {/* Mobile action buttons */}
              <div className="pt-3 space-y-2 border-t border-slate-100 dark:border-gray-700/50">
                <a
                  href="https://lab.aplis.inf.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMobile}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                    text-sm font-medium border-2 border-blue-600 text-blue-600
                    hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-150"
                >
                  <ExternalLink className="w-4 h-4" />
                  Acesse seus resultados
                </a>
                <a
                  href="https://forms.gle/peKeAhqLPvPvdCoy8"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMobile}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                    text-sm font-semibold text-white
                    bg-gradient-to-r from-blue-600 to-blue-700
                    shadow-md shadow-blue-500/20 transition-all duration-150"
                >
                  <MessageSquare className="w-4 h-4" />
                  Fale com um Patologista
                </a>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
