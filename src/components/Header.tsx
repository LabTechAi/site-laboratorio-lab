/**
 * Header.tsx — Global institutional header with glassmorphism, sticky scroll
 * behaviour, mobile drawer, dark-mode toggle and smooth-scroll anchor nav.
 *
 * Stack: Framer Motion 11 + Tailwind CSS (darkMode:'class') + lucide-react
 */

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, ExternalLink, MessageSquare } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import PathologistConsultationModal from "./PathologistConsultationModal";

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
    transition: { type: "spring", stiffness: 400, damping: 25, staggerChildren: 0.04 },
  },
  exit: { opacity: 0, y: -8, scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 25 } },
};

const mobileItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 400, damping: 25 } },
};

// ─── ThemeToggle sub-component ───────────────────────────────────────────────
const ThemeToggle: React.FC<{ isDark: boolean; toggle: () => void }> = ({ isDark, toggle }) => (
  <motion.button
    onClick={toggle}
    aria-label="Alternar tema claro/escuro"
    className="relative w-9 h-9 flex items-center justify-center rounded-xl
      focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
      dark:focus-visible:ring-offset-gray-900"
    whileHover={{
      backgroundColor: isDark ? "rgba(55,65,81,0.8)" : "rgba(241,245,249,0.8)",
    }}
    whileTap={{ scale: 0.9 }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
  >
    <motion.div
      className="absolute"
      animate={{
        rotate: isDark ? 90 : 0,
        scale: isDark ? 0 : 1,
        opacity: isDark ? 0 : 1,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Sun className="w-5 h-5 text-amber-500" />
    </motion.div>
    <motion.div
      className="absolute"
      animate={{
        rotate: isDark ? 0 : -90,
        scale: isDark ? 1 : 0,
        opacity: isDark ? 1 : 0,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Moon className="w-5 h-5 text-blue-400" />
    </motion.div>
  </motion.button>
);

// ─── Main Header component ───────────────────────────────────────────────────
export default function Header() {
  const { isDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [patologistaOpen, setPatologistaOpen] = useState(false);

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

  // ── Close mobile menu on scroll (delta-based) ───────────────────────────
  // Uses scroll distance from the position when the menu opened, NOT absolute
  // position. This prevents the race condition where residual scroll momentum
  // at scrollY > 80 immediately re-closes a freshly opened menu.
  useEffect(() => {
    if (!mobileOpen) return;

    const openScrollY = window.scrollY;

    const handleScroll = () => {
      if (Math.abs(window.scrollY - openScrollY) > 60) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <motion.div
      initial={{ y: -100, opacity: 0, x: "-50%" }}
      animate={{ y: 0, opacity: 1, x: "-50%" }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-4 left-1/2 z-50
        flex items-center gap-2 sm:gap-3
        w-[calc(100%-2rem)] max-w-[1100px] md:max-w-[1280px] lg:max-w-[1400px]"
    >
      <div
        className="flex-1 min-w-0 p-[1px] rounded-full overflow-hidden
          bg-gradient-to-r from-blue-500/20 via-indigo-500/50 to-blue-500/20
          bg-[length:200%_auto] animate-shimmer
          shadow-[0_0_40px_-8px_rgba(59,130,246,0.35)]
          dark:shadow-[0_0_40px_-8px_rgba(59,130,246,0.2)]"
      >
        <header
          className="w-full rounded-full
            bg-white/80 dark:bg-gray-900/85
            backdrop-blur-xl
            shadow-sm
            px-6 sm:px-8 lg:px-10 py-3
            flex items-center justify-between
            gap-4"
        >

          {/* Logo */}
          <motion.a
            href="#home"
            aria-label="LAB – Laboratório e Medicina Diagnóstica — ir para o topo"
            className="flex-shrink-0 flex items-center gap-2 rounded-lg
              focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
              dark:focus-visible:ring-offset-gray-900"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
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
          </motion.a>
          {/* ── Desktop nav ─────────────────────────────────────────────── */}
          <nav className="hidden xl:flex items-center gap-1" aria-label="Navegação principal">
            {NAV_LINKS.map((link) => {
              const id = link.href.replace("#", "");
              const isActive = activeSection === id;
              return (
                <motion.a
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2 text-sm font-medium rounded-lg
                    whitespace-nowrap
                    focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1
                    dark:focus-visible:ring-offset-gray-900
                    transition-colors duration-300
                    ${
                      isActive
                        ? ""
                        : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                  style={
                    isActive
                      ? { color: isDark ? "#60a5fa" : "#2563eb" }
                      : undefined
                  }
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring" }}
                      className="absolute left-1/2 -translate-x-1/2 bottom-[-2px]
                        w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                    />
                  )}
                </motion.a>
              );
            })}
          </nav>

          {/* ── Desktop actions ─────────────────────────────────────────── */}
          <div className="hidden xl:flex items-center gap-2 flex-shrink-0">
            {/* Meu Espaço Saúde — results portal */}
            <motion.a
              href="https://lab.aplis.inf.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium
                rounded-lg border-2 border-blue-600 dark:border-blue-400
                focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1
                dark:focus-visible:ring-offset-gray-900"
              style={{ color: isDark ? "#60a5fa" : "#2563eb" }}
              aria-label="Acesse seus resultados"
              whileHover={{
                scale: 1.02,
                backgroundColor: isDark ? "rgba(30,58,138,0.2)" : "rgba(239,246,255,0.8)",
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <ExternalLink className="w-3 h-3 shrink-0" />
              <span className="hidden 2xl:inline">Acesse seus resultados</span>
              <span className="inline 2xl:hidden">Resultados</span>
            </motion.a>

            {/* Fale com o Patologista */}
            <motion.button
              onClick={() => setPatologistaOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold
                rounded-lg text-white
                bg-gradient-to-r from-blue-600 to-blue-700
                shadow-md shadow-blue-500/25
                focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
              aria-label="Fale com um Patologista"
              whileHover={{
                scale: 1.03,
                boxShadow: "0px 8px 20px rgba(59,130,246,0.3)",
              }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <MessageSquare className="w-3 h-3 shrink-0" />
              <span className="hidden 2xl:inline">Fale com um Patologista</span>
              <span className="inline 2xl:hidden">Patologista</span>
            </motion.button>
          </div>

          {/* ── Mobile: hamburger ─────────────────────────────────────────── */}
          <div className="flex xl:hidden items-center gap-1">
            <motion.button
              onClick={() => setMobileOpen((p) => !p)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
              className="w-11 h-11 flex items-center justify-center rounded-xl
                focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
              whileHover={{
                backgroundColor: isDark ? "rgba(55,65,81,0.8)" : "rgba(241,245,249,0.8)",
              }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <X style={{ color: isDark ? "#e5e7eb" : "#374151" }} className="w-5 h-5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Menu style={{ color: isDark ? "#e5e7eb" : "#374151" }} className="w-5 h-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
      </header>
      </div>

      {/* ── Theme sphere ──────────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 p-[1px] rounded-full
          bg-gradient-to-r from-blue-500/20 via-indigo-500/50 to-blue-500/20
          bg-[length:200%_auto] animate-shimmer
          shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]
          dark:shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)]"
      >
        <div
          className="rounded-full
            bg-white/80 dark:bg-gray-900/85
            backdrop-blur-xl
            shadow-sm
            p-[5px]"
        >
          <ThemeToggle isDark={isDark} toggle={toggleTheme} />
        </div>
      </div>

      {/* ── Mobile menu ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            key="mobile-menu"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            aria-label="Navegação mobile"
            className="absolute top-[calc(100%+0.5rem)] left-0 right-0
              xl:hidden
              rounded-2xl
              bg-white/85 dark:bg-gray-900/80
              backdrop-blur-2xl
              border border-white/50 dark:border-gray-700/50
              shadow-2xl shadow-slate-900/15
              overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((link) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={closeMobile}
                  variants={mobileItemVariants}
                  className="flex items-center px-3 py-2 rounded-lg text-xs font-medium"
                  style={{ color: isDark ? "#f3f4f6" : "#374151" }}
                  whileHover={{
                    color: isDark ? "#93c5fd" : "#2563eb",
                    backgroundColor: isDark ? "rgba(31,41,55,0.8)" : "rgba(239,246,255,0.8)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {link.label}
                </motion.a>
              ))}

              {/* Mobile action buttons */}
              <div className="pt-2 space-y-1.5 border-t border-slate-100 dark:border-gray-700/50">
                <motion.a
                  href="https://lab.aplis.inf.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMobile}
                  className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg
                    text-xs font-medium border-2 border-blue-600 dark:border-blue-400"
                  style={{ color: isDark ? "#60a5fa" : "#2563eb" }}
                  whileHover={{
                    backgroundColor: isDark ? "rgba(30,58,138,0.2)" : "rgba(239,246,255,0.8)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Acesse seus resultados
                </motion.a>
                <motion.button
                  onClick={() => { closeMobile(); setPatologistaOpen(true); }}
                  className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg
                    text-xs font-semibold text-white
                    bg-gradient-to-r from-blue-600 to-blue-700
                    shadow-md shadow-blue-500/20"
                  whileHover={{
                    boxShadow: "0 10px 15px -3px rgba(59,130,246,0.3)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Fale com um Patologista
                </motion.button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
      <PathologistConsultationModal
        isOpen={patologistaOpen}
        onClose={() => setPatologistaOpen(false)}
      />
    </motion.div>
  );
}
