/**
 * HeroSection.tsx — Full-screen auto-playing image slider.
 *
 * Framer Motion AnimatePresence handles cross-fade between slides.
 * Autoplay pauses on hover and resumes on mouse leave.
 * Keyboard navigation via Prev/Next buttons.
 * Dot indicators with click-to-slide.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ─── Slide data ──────────────────────────────────────────────────────────────
interface Slide {
  bg: string;
  title: string;
  subtitle: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
}

const SLIDES: Slide[] = [
  {
    bg: "/assets/background/fundo titulo.png",
    title: "Saúde Vista de Perto",
    subtitle: "50 anos de excelência em medicina diagnóstica",
    ctaPrimary: { label: "Nossos Exames", href: "#exames" },
    ctaSecondary: { label: "Entre em Contato", href: "#contato" },
  },
  {
    bg: "/assets/fundos home/tecnologia de ponta.png",
    title: "Tecnologia de Ponta",
    subtitle: "Equipamentos modernos para diagnósticos precisos",
    ctaPrimary: { label: "Especialidades", href: "#especialidades" },
    ctaSecondary: { label: "Entre em Contato", href: "#contato" },
  },
  {
    bg: "/assets/fundos home/cuidada-se.png",
    title: "Cuide-se",
    subtitle: "Sua saúde merece toda atenção e cuidado",
    ctaPrimary: { label: "Saiba Mais", href: "#sobre" },
    ctaSecondary: { label: "Entre em Contato", href: "#contato" },
  },
  {
    bg: "/assets/fundos home/novembro azul.png",
    title: "Novembro Azul",
    subtitle: "Cuidar da saúde é um ato de coragem",
    ctaPrimary: { label: "Saiba Mais", href: "#exames" },
    ctaSecondary: { label: "Entre em Contato", href: "#contato" },
  },
];

const AUTOPLAY_MS = 5000;

// ─── Framer Motion variants ──────────────────────────────────────────────────
// Cross-fade: incoming slide fades in while outgoing fades out simultaneously.
const slideVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 1, ease: "easeInOut" } },
  exit: { opacity: 0, transition: { duration: 1, ease: "easeInOut" } },
};

// Content text — fades in from below with a slight delay after the image.
const contentVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut", delay },
  }),
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number) => {
    setCurrent(((index % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // ── Autoplay ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(next, AUTOPLAY_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [next, paused]);

  return (
    <section
      id="home"
      aria-label="Slider principal"
      className="relative w-full overflow-hidden"
      style={{ height: "min(100vh, 700px)", minHeight: "480px" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Background image slides ─────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.48), rgba(0,0,0,0.48)), url("${SLIDES[current].bg}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-hidden="true"
        />
      </AnimatePresence>

      {/* ── Slide content ──────────────────────────────────────────────── */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={current} className="max-w-2xl">
              {/* Title */}
              <motion.h1
                custom={0.1}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white
                  leading-tight tracking-tight mb-4"
              >
                {SLIDES[current].title}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                custom={0.25}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                className="text-lg sm:text-xl text-white/85 mb-8 leading-relaxed"
              >
                {SLIDES[current].subtitle}
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                custom={0.4}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-wrap gap-4"
              >
                <a
                  href={SLIDES[current].ctaPrimary.href}
                  className="inline-flex items-center px-6 py-3 rounded-xl font-semibold text-sm
                    bg-gradient-to-r from-blue-600 to-blue-700 text-white
                    shadow-lg shadow-blue-600/30
                    hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-0.5
                    transition-all duration-200 focus-visible:ring-2 focus-visible:ring-white"
                >
                  {SLIDES[current].ctaPrimary.label}
                </a>
                <a
                  href={SLIDES[current].ctaSecondary.href}
                  className="inline-flex items-center px-6 py-3 rounded-xl font-semibold text-sm
                    border-2 border-white/80 text-white
                    hover:bg-white/10 hover:-translate-y-0.5
                    transition-all duration-200 focus-visible:ring-2 focus-visible:ring-white"
                >
                  {SLIDES[current].ctaSecondary.label}
                </a>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Prev / Next controls ───────────────────────────────────────── */}
      <button
        onClick={prev}
        aria-label="Slide anterior"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10
          w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white
          flex items-center justify-center
          hover:bg-black/50 transition-colors duration-200
          focus-visible:ring-2 focus-visible:ring-white"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        aria-label="Próximo slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10
          w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white
          flex items-center justify-center
          hover:bg-black/50 transition-colors duration-200
          focus-visible:ring-2 focus-visible:ring-white"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* ── Dot indicators ──────────────────────────────────────────────── */}
      <div
        role="tablist"
        aria-label="Slides do hero"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10"
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === current}
            aria-label={`Slide ${i + 1}`}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-white
              ${i === current ? "w-8 h-2.5 bg-white" : "w-2.5 h-2.5 bg-white/50 hover:bg-white/75"}`}
          />
        ))}
      </div>
    </section>
  );
}
