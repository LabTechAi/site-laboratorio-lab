/**
 * ColaboradoresPage.tsx — LAB Cuidado Preventivo · Projeto Piloto Colaboradores
 *
 * Design system alinhado com LandingPage.tsx (/parceiros):
 * – Mesmo logo SVG (LOGO-HOR.svg / LOGO-HOR-DM.svg)
 * – Glassmorphism header com useScroll + scroll progress bar
 * – Paleta blue-900/blue-700/indigo como cor primária
 * – Cards: bg-white/90 backdrop-blur-sm (mesmo padrão FeatureCard)
 * – Footer com POWERED-ORIA-DM.png
 *
 * Stack: React 18 + TypeScript + Tailwind CSS (darkMode:'class') + Framer Motion 11 + lucide-react
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import {
  Eye,
  FlaskConical,
  Compass,
  ShieldCheck,
  Sun,
  Moon,
  Heart,
  Banknote,
  ArrowRight,
  CheckCircle,
  Users,
} from "lucide-react";
import AnamnesisModal from "./components/AnamnesisModal";

// ─── Animation Variants ───────────────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

// ─── Static Data ──────────────────────────────────────────────────────────

const PILLARS = [
  {
    icon: <Eye className="w-5 h-5" />,
    title: "Clareza e Prevenção",
    description:
      "Permite o claro entendimento da sua saúde e identifica pontos de melhora antes que se tornem problemas.",
    iconBg: "bg-blue-50 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: <FlaskConical className="w-5 h-5" />,
    title: "Análise Sob Medida",
    description:
      "Conhecemos melhor seu estado atual de saúde para oferecer uma avaliação totalmente personalizada.",
    iconBg: "bg-indigo-50 dark:bg-indigo-900/30",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
  {
    icon: <Compass className="w-5 h-5" />,
    title: "Acompanhamento Estratégico",
    description:
      "Direcionamento prático para melhores hábitos e, se necessário, encaminhamento a médicos especialistas.",
    iconBg: "bg-violet-50 dark:bg-violet-900/30",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
];

const PRIVACY_BADGES = [
  "Dados confidenciais",
  "Uso exclusivo interno",
  "Sem compartilhamento externo",
];

// ─── ThemeToggle (local) ──────────────────────────────────────────────────
// Idêntico ao LandingPage — hover blue family, Moon text-blue-400

const ThemeToggle: React.FC<{ isDark: boolean; toggle: () => void }> = ({
  isDark,
  toggle,
}) => (
  <button
    onClick={toggle}
    aria-label="Alternar tema claro/escuro"
    className="relative w-9 h-9 flex items-center justify-center rounded-xl
      hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300
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

// ─── CTA Button — blue gradient + shimmer (igual /parceiros) ─────────────

const CTAButton: React.FC<{ onClick: () => void; className?: string }> = ({
  onClick,
  className = "",
}) => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.button
      onClick={onClick}
      whileHover={shouldReduceMotion ? {} : { scale: 1.03, y: -2 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 24 }}
      className={`relative overflow-hidden inline-flex items-center gap-2.5
        px-7 py-3.5 rounded-xl
        bg-gradient-to-r from-blue-500 to-blue-600
        text-white font-bold text-sm
        shadow-md shadow-blue-500/30
        hover:from-blue-600 hover:to-blue-700
        hover:shadow-lg hover:shadow-blue-500/40
        transition-[box-shadow,background] duration-200 ${className}`}
    >
      <span className="relative z-10 flex items-center gap-2.5">
        Quero participar do projeto piloto
        <ArrowRight className="w-4 h-4" />
      </span>
      {/* Shimmer sweep — mesmo padrão do header CTA em /parceiros */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 -skew-x-12
          bg-gradient-to-r from-transparent via-white/25 to-transparent
          pointer-events-none"
        animate={{ x: ["-200%", "200%"] }}
        transition={{
          repeat: Infinity,
          duration: 2.4,
          ease: "linear",
          repeatDelay: 1.8,
        }}
      />
    </motion.button>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────

export default function ColaboradoresPage() {
  const shouldReduceMotion = useReducedMotion();

  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggleTheme = useCallback(() => setIsDark((p) => !p), []);
  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  // ── Glassmorphism header — mesmo padrão do LandingPage ─────────────────
  const { scrollY, scrollYProgress } = useScroll();

  const springProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    restDelta: 0.001,
  });

  const glassOpacity   = useTransform(scrollY, [0, 72], [0, 1]);
  const borderOpacity  = useTransform(scrollY, [0, 72], [0, 1]);
  const shadowOpacity  = useTransform(scrollY, [0, 72], [0, 1]);
  const logoBadgeScale = useTransform(
    scrollY,
    [0, 80],
    shouldReduceMotion ? [1, 1] : [1, 0.92]
  );

  // ── Hero parallax orbs ─────────────────────────────────────────────────
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const orb1Y = useTransform(heroProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, -100]);
  const orb2Y = useTransform(heroProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, 70]);
  const heroOpacity = useTransform(heroProgress, [0, 0.55], shouldReduceMotion ? [1, 1] : [1, 0]);
  const heroTextY   = useTransform(heroProgress, [0, 0.55], shouldReduceMotion ? [0, 0] : [0, -32]);

  return (
    <div className="bg-slate-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">

      {/* ── Topbar — mesmo gradiente do /parceiros ───────────────────────── */}
      <div
        className="bg-gradient-to-r from-blue-900 via-blue-700 to-indigo-800
          text-white text-xs sm:text-sm py-2.5 px-4 text-center font-medium"
      >
        Projeto Piloto · Fase Inicial · Vagas limitadas para colaboradores
      </div>

      {/*
       * ── Navbar — glassmorphism com MotionValues (idêntico ao /parceiros)
       * Glass, border e shadow surgem progressivamente nos primeiros 72px de scroll.
       */}
      <motion.header
        className="sticky top-0 z-30 overflow-visible"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Glass background */}
        <motion.div
          style={{
            opacity: glassOpacity,
            backgroundColor: isDark ? "rgba(17, 24, 39, 0.88)" : "rgba(255, 255, 255, 0.85)",
          }}
          className="absolute inset-0 backdrop-blur-[14px] pointer-events-none"
        />
        {/* Gradient border-bottom */}
        <motion.div
          style={{ opacity: borderOpacity }}
          className="absolute bottom-0 left-0 right-0 h-px
            bg-gradient-to-r from-transparent via-blue-200/70 dark:via-blue-600/40 to-transparent
            pointer-events-none"
        />
        {/* Drop-shadow */}
        <motion.div
          style={{ opacity: shadowOpacity }}
          className="absolute inset-0
            shadow-[0_4px_28px_-4px_rgba(15,23,42,0.10)]
            dark:shadow-[0_4px_28px_-4px_rgba(0,0,0,0.40)]
            pointer-events-none"
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16
          flex items-center justify-between gap-4">

          {/* Logo SVG — light/dark swap, igual ao /parceiros */}
          <motion.a
            href="#top"
            aria-label="LAB Cuidado Preventivo"
            style={{ scale: logoBadgeScale }}
            className="flex items-center shrink-0"
          >
            <img
              src="/assets/LOGO-HOR.svg"
              alt="LAB Cuidado Preventivo"
              className="h-12 w-auto dark:hidden select-none"
              draggable={false}
            />
            <img
              src="/assets/LOGO-HOR-DM.svg"
              alt="LAB Cuidado Preventivo"
              className="h-12 w-auto hidden dark:block select-none"
              draggable={false}
            />
          </motion.a>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <span
              className="hidden sm:inline-flex items-center gap-1.5
                text-[11px] text-blue-700 dark:text-blue-400 font-semibold
                px-2.5 py-1 rounded-full
                bg-blue-50 dark:bg-blue-900/30
                border border-blue-200 dark:border-blue-700/50"
            >
              powered by Oria
            </span>
            <ThemeToggle isDark={isDark} toggle={toggleTheme} />
          </div>
        </div>

        {/* Scroll progress bar — mesmo padrão /parceiros */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none
          bg-transparent dark:bg-gray-700/40" />
        <motion.div
          style={{ scaleX: springProgress, originX: 0 }}
          className="absolute bottom-0 left-0 right-0 h-[2px] z-10
            bg-gradient-to-r from-blue-500 via-indigo-400 to-violet-500
            dark:from-blue-400 dark:via-indigo-300 dark:to-violet-400
            dark:[filter:drop-shadow(0_0_4px_rgba(129,140,248,0.7))]
            pointer-events-none"
        />
      </motion.header>

      <main id="top">

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section
          ref={heroRef}
          className="relative pt-16 pb-14 md:pt-20 md:pb-20 overflow-hidden"
        >
          {/* Parallax orbs — mesmas cores blue/indigo do /parceiros */}
          <motion.div
            style={{ y: orb1Y }}
            className="pointer-events-none absolute top-1/4 -right-28 w-96 h-96 rounded-full
              bg-gradient-to-r from-blue-200/50 to-indigo-200/50
              dark:from-blue-500/10 dark:to-indigo-500/10
              blur-3xl -z-10"
          />
          <motion.div
            style={{ y: orb2Y }}
            className="pointer-events-none absolute -bottom-20 -left-20 w-72 h-72 rounded-full
              bg-gradient-to-r from-indigo-200/40 to-blue-200/40
              dark:from-indigo-500/10 dark:to-blue-500/10
              blur-3xl -z-10"
          />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              style={{ opacity: heroOpacity, y: heroTextY }}
              className="text-center"
            >
              {/* Eyebrow — mesmo padrão do /parceiros */}
              <motion.div variants={fadeInUp}>
                <div
                  className="inline-flex items-center gap-2
                    bg-blue-50 dark:bg-blue-900/30
                    text-blue-800 dark:text-blue-300
                    border border-blue-200 dark:border-blue-700
                    rounded-full px-3.5 py-1.5 text-xs font-bold mb-5"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  Uma oportunidade exclusiva para você
                </div>
              </motion.div>

              {/* H1 — mesmo gradiente do /parceiros */}
              <motion.h1
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold
                  leading-[1.0] tracking-tight mb-5 max-w-4xl mx-auto"
              >
                <span
                  className="bg-gradient-to-r from-blue-900 via-blue-700 to-indigo-800
                    dark:from-blue-400 dark:via-blue-300 dark:to-indigo-400
                    bg-clip-text text-transparent"
                >
                  O objetivo não é meramente tratar doenças, mas potencializar sua
                  saúde, promover o bem-estar e maximizar a qualidade de vida.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-base sm:text-lg text-gray-600 dark:text-gray-300
                  max-w-2xl mx-auto mb-7 leading-relaxed"
              >
                Estamos selecionando colaboradores para integrar nosso projeto piloto.
                Dê o primeiro passo em direção a uma saúde mais clara e estratégica.
              </motion.p>

              {/* CTA row */}
              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap items-center justify-center gap-4"
              >
                <CTAButton onClick={openModal} />
              </motion.div>

              {/* Trust items — mesmo padrão /parceiros */}
              <motion.div
                variants={fadeInUp}
                className="mt-6 flex flex-wrap items-center justify-center gap-4
                  text-xs text-gray-500 dark:text-gray-400"
              >
                {["Projeto piloto", "Vagas limitadas", "Dados confidenciais"].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                    {item}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── Oportunidade Exclusiva ───────────────────────────────────────── */}
        <section className="py-10 md:py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={scaleIn}
              className="relative overflow-hidden rounded-3xl
                bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900
                p-8 md:p-10 text-white"
            >
              {/* Background glow */}
              <div
                className="pointer-events-none absolute top-0 right-0 w-72 h-72 rounded-full
                  bg-white/5 blur-3xl -translate-y-1/3 translate-x-1/4"
              />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                <div
                  className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm
                    flex items-center justify-center shrink-0"
                >
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold mb-2">
                    Uma oportunidade exclusiva
                  </h2>
                  <p className="text-blue-100/90 leading-relaxed text-sm sm:text-base max-w-2xl">
                    Os colaboradores terão a oportunidade de participar da fase inicial
                    deste projeto de cuidados com a saúde. Estamos selecionando os interessados
                    em integrar o nosso projeto piloto — uma experiência completa de avaliação
                    e acompanhamento preventivo de saúde.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Pilares — mesmo estilo FeatureCard do /parceiros ────────────── */}
        <section className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeInUp}
              className="text-center mb-10"
            >
              <h2
                className="text-2xl sm:text-3xl font-extrabold tracking-tight
                  text-gray-900 dark:text-gray-100 mb-3"
              >
                Como o programa transforma sua rotina?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                Desenhado para ser simples e aplicável no dia a dia.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className="grid sm:grid-cols-3 gap-5"
            >
              {PILLARS.map((pillar) => (
                <motion.article
                  key={pillar.title}
                  variants={fadeInUp}
                  whileHover={shouldReduceMotion ? {} : { scale: 1.02, y: -3 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className="bg-white/90 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-sm
                    border border-gray-100 dark:border-gray-700/60 p-6 cursor-default
                    hover:shadow-lg dark:hover:bg-gray-800/80 transition-all duration-200"
                >
                  <div
                    className={`w-11 h-11 rounded-xl ${pillar.iconBg}
                      flex items-center justify-center mb-4 ${pillar.iconColor}`}
                  >
                    {pillar.icon}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 leading-snug">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {pillar.description}
                  </p>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Segurança e Privacidade ──────────────────────────────────────── */}
        <section className="py-10 md:py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeInUp}
              className="bg-white/90 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl
                border border-gray-100 dark:border-gray-700/60 shadow-sm
                p-7 md:p-9 flex flex-col sm:flex-row gap-6 items-start"
            >
              <div
                className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20
                  flex items-center justify-center shrink-0"
              >
                <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Segurança e Privacidade
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  Para entendermos o seu cenário, nossa anamnese mapeia seus objetivos e
                  condições de saúde. Garantimos que todas as suas respostas são{" "}
                  <strong className="text-gray-800 dark:text-gray-200">
                    estritamente confidenciais
                  </strong>{" "}
                  e utilizadas exclusivamente para uma avaliação precisa.
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRIVACY_BADGES.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1.5 text-xs font-medium
                        px-3 py-1 rounded-full
                        bg-green-50 dark:bg-green-900/20
                        text-green-700 dark:text-green-400
                        border border-green-100 dark:border-green-800/40"
                    >
                      <CheckCircle className="w-3 h-3" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Investimento ────────────────────────────────────────────────── */}
        <section className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeInUp}
              className="text-center mb-8"
            >
              <h2
                className="text-2xl sm:text-3xl font-extrabold tracking-tight
                  text-gray-900 dark:text-gray-100 mb-2"
              >
                Investimento e Condições
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Condições facilitadas para garantir o seu acesso ao projeto piloto.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto"
            >
              {/* Com plano */}
              <motion.div
                variants={fadeInUp}
                whileHover={shouldReduceMotion ? {} : { scale: 1.02, y: -3 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="bg-white/90 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-sm
                  border border-gray-100 dark:border-gray-700/60 p-6 cursor-default
                  hover:shadow-lg dark:hover:bg-gray-800/80 transition-all duration-200"
              >
                <div
                  className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/30
                    flex items-center justify-center mb-4"
                >
                  <Heart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span
                  className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full
                    bg-blue-50 dark:bg-blue-900/30
                    text-blue-700 dark:text-blue-300
                    border border-blue-200 dark:border-blue-700/50 mb-4"
                >
                  Com plano de saúde
                </span>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Cobertura pelo plano
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  A realização dos exames será feita através da cobertura do próprio
                  plano de saúde do colaborador, sem custo adicional.
                </p>
              </motion.div>

              {/* Sem plano */}
              <motion.div
                variants={fadeInUp}
                whileHover={shouldReduceMotion ? {} : { scale: 1.02, y: -3 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="bg-white/90 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-sm
                  border border-gray-100 dark:border-gray-700/60 p-6 cursor-default
                  hover:shadow-lg dark:hover:bg-gray-800/80 transition-all duration-200"
              >
                <div
                  className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-900/30
                    flex items-center justify-center mb-4"
                >
                  <Banknote className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span
                  className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full
                    bg-indigo-50 dark:bg-indigo-900/30
                    text-indigo-700 dark:text-indigo-300
                    border border-indigo-200 dark:border-indigo-700/50 mb-4"
                >
                  Sem plano de saúde
                </span>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  R$ 300,00 facilitados
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  Valor total de{" "}
                  <strong className="text-gray-800 dark:text-gray-200">R$ 300,00</strong>,
                  com parcelamento em até{" "}
                  <strong className="text-gray-800 dark:text-gray-200">10x</strong> sem
                  acréscimo.
                </p>
                <div
                  className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3.5
                    flex items-center justify-center gap-2
                    border border-indigo-100 dark:border-indigo-800/40"
                >
                  <span className="text-3xl font-extrabold text-indigo-700 dark:text-indigo-300 leading-none">
                    10x
                  </span>
                  <div className="text-left leading-tight">
                    <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                      R$ 30,00
                    </span>
                    <span className="text-[11px] text-indigo-500/70 dark:text-indigo-400/60 block">
                      sem juros
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── Final CTA — mesmo padrão de /parceiros ──────────────────────── */}
        <section
          className="py-20 text-center
            bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.h2
                variants={fadeInUp}
                className="text-3xl sm:text-4xl font-extrabold tracking-tight
                  text-white mb-4"
              >
                Dê o primeiro passo hoje mesmo
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-base text-blue-200 mb-8 leading-relaxed"
              >
                Responda nossa avaliação inicial e demonstre seu interesse em participar
                do projeto piloto. As vagas são limitadas.
              </motion.p>
              <motion.div variants={fadeInUp}>
                <motion.button
                  onClick={openModal}
                  whileHover={shouldReduceMotion ? {} : { scale: 1.03, y: -2 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 24 }}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white
                    text-blue-900 font-bold rounded-xl
                    hover:bg-blue-50 hover:-translate-y-0.5
                    transition-all duration-200 shadow-lg shadow-blue-900/25 text-sm"
                >
                  Quero participar do projeto piloto
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </section>

      </main>

      {/* ── Footer — mesmo layout e assets do /parceiros ────────────────── */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-8">
        <div
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8
            flex flex-wrap justify-between gap-4 text-sm"
        >
          <span>© LAB Cuidado Preventivo · Projeto Piloto Colaboradores</span>
          <span>powered by Oria</span>
        </div>
        <div
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pt-5
            border-t border-gray-800 dark:border-gray-800
            flex items-center justify-center"
        >
          <img
            src="/assets/POWERED-ORIA-WM.png"
            alt="Powered by ORIA"
            className="h-6 w-auto opacity-90 transition-opacity duration-200 dark:hidden select-none"
            draggable={false}
          />
          <img
            src="/assets/POWERED-ORIA-DM.png"
            alt="Powered by ORIA"
            className="h-6 w-auto opacity-90 transition-opacity duration-200 hidden dark:block select-none"
            draggable={false}
          />
        </div>
      </footer>

      {/* ── Anamnesis Modal ─────────────────────────────────────────────── */}
      <AnamnesisModal isOpen={modalOpen} onClose={closeModal} />

    </div>
  );
}
