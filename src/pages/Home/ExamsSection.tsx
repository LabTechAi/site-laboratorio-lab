/**
 * ExamsSection.tsx — 5 exam-category cards that expand into a centered modal
 * overlay with the complete exam list, matching the old vanilla JS behaviour.
 *
 * Framer Motion AnimatePresence handles the modal mount/unmount.
 * Dismiss: click outside, ✕ button, or Escape key.
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, Microscope, Activity, ShieldPlus, BarChart3, X, ChevronRight } from "lucide-react";

// ─── Exam data ────────────────────────────────────────────────────────────────
interface ExamCategory {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  image?: string;
  exams: string[];
  accent: string;
}

const EXAM_CATEGORIES: ExamCategory[] = [
  {
    id: "biomol",
    icon: <FlaskConical className="w-7 h-7" />,
    title: "Biologia Molecular",
    subtitle: "PCR em tempo real — vírus, bactérias e mutações genéticas",
    image: "/assets/icones/biomol.png",
    accent: "blue",
    exams: [
      "HPV Alto Risco (14 tipos)",
      "HPV Baixo Risco",
      "HPV 21 Tipos",
      "HPV 28 Tipos",
      "IST 4 Patógenos",
      "IST 7 Patógenos",
      "Úlcera Genital",
      "Cândida",
      "Vaginose Bacteriana",
      "Microbioma Vaginal",
      "Painel Lactobacillus",
      "Painel de Risco de Trombose (6 mutações)",
    ],
  },
  {
    id: "cito",
    icon: <Microscope className="w-7 h-7" />,
    title: "Citopatologia",
    subtitle: "Análise citológica, Papanicolau, base líquida",
    image: "/assets/icones/citopatologia.png",
    accent: "indigo",
    exams: [
      "Citologia Anal",
      "Citologia Convencional",
      "Citologia com Base Líquida",
      "Citologia Geral",
      "Citologia Hormonal",
      "Bacterioscopia (Coloração de Gram)",
    ],
  },
  {
    id: "anapat",
    icon: <Activity className="w-7 h-7" />,
    title: "Anatomia Patológica",
    subtitle: "Biópsias, peças cirúrgicas e patologias específicas",
    image: "/assets/icones/anatomia patológica.png",
    accent: "purple",
    exams: [
      "Biópsia Simples",
      "Biópsia Complexa",
      "Peça Cirúrgica Simples",
      "Peça Cirúrgica Complexa",
      "Peça Ginecológica",
      "Dermatopatologia",
      "Uropatologia",
      "Ginecopatologia",
    ],
  },
  {
    id: "imuno",
    icon: <ShieldPlus className="w-7 h-7" />,
    title: "Imuno-histoquímica",
    subtitle: "Painéis diagnósticos para tumores e linfomas",
    image: "/assets/icones/imuno-histoquímica.png",
    accent: "rose",
    exams: [
      "Determinação de Sítio Primário",
      "GIST",
      "Mesotelioma vs Adenocarcinoma",
      "HER-2 (Mama / Gástrico)",
      "PD-L1",
      "NTRK",
      "Ki-67",
      "Imunofenotipagem de Linfomas",
      "Imunofenotipagem de Sarcomas",
      "Proficiência MMR (MLH1, MSH2, MSH6, PMS2)",
      "+ 15 painéis adicionais",
    ],
  },
  {
    id: "analises",
    icon: <BarChart3 className="w-7 h-7" />,
    title: "Análises Clínicas",
    subtitle: "+200 exames em 13 categorias",
    image: "/assets/icones/análises clínicas.png",
    accent: "teal",
    exams: [
      "Bioquímica Clínica (26 exames)",
      "Hormônios (27 exames)",
      "Marcadores Tumorais (7 exames)",
      "Hematologia (11 exames)",
      "Coagulação (8 exames)",
      "Sorologias e Imunologia (25 exames)",
      "Exames de Urina (7 exames)",
      "Vitaminas e Minerais (8 exames)",
      "Marcadores Cardíacos (5 exames)",
      "Exames Especiais (22 exames)",
      "Testes Alergológicos (5 exames)",
      "Parasitológicos e Microbiológicos (9 exames)",
      "Monitoramento Terapêutico (4 exames)",
    ],
  },
];

// Tailwind accent class maps — must be complete strings for PurgeCSS
const ACCENT = {
  blue: {
    badge: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    icon: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30",
    dot: "bg-blue-500",
    border: "border-blue-500",
  },
  indigo: {
    badge: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
    icon: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30",
    dot: "bg-indigo-500",
    border: "border-indigo-500",
  },
  purple: {
    badge: "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    icon: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30",
    dot: "bg-purple-500",
    border: "border-purple-500",
  },
  rose: {
    badge: "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300",
    icon: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30",
    dot: "bg-rose-500",
    border: "border-rose-500",
  },
  teal: {
    badge: "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300",
    icon: "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30",
    dot: "bg-teal-500",
    border: "border-teal-500",
  },
};

// ─── Variants ─────────────────────────────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

// Modal entrance: scale up from center
const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", damping: 20, stiffness: 300 },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    y: 10,
    transition: { duration: 0.18, ease: "easeIn" },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function ExamsSection() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeCategory = EXAM_CATEGORIES.find((c) => c.id === activeId) ?? null;

  // Close on Escape key
  useEffect(() => {
    if (!activeId) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveId(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeId]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = activeId ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [activeId]);

  return (
    <>
      <section
        id="exames"
        className="py-16 md:py-20
          bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900
          dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Hero com vídeo de fundo + título sobreposto */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative mb-10 rounded-2xl overflow-hidden shadow-xl min-h-[200px]"
          >
            {/* Vídeo de fundo */}
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/assets/videos_gifs/Site LAB.mp4" type="video/mp4" />
            </video>

            {/* Overlay escuro para legibilidade */}
            <div className="absolute inset-0 bg-blue-950/60" />

            {/* Título e subtítulo sobrepostos */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={stagger}
              className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-14"
            >
              <motion.span
                variants={fadeInUp}
                className="inline-block px-4 py-1.5 text-xs font-semibold
                  text-blue-200 bg-white/10 rounded-full mb-3 border border-white/20"
              >
                Nossos Exames
              </motion.span>
              <motion.h2
                variants={fadeInUp}
                className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3"
              >
                Exames e Diagnósticos
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-blue-200 text-base max-w-xl">
                Clique em uma categoria para ver a lista completa de exames disponíveis.
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Exam category cards */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
          >
            {EXAM_CATEGORIES.map((cat) => {
              const accent = ACCENT[cat.accent as keyof typeof ACCENT];
              return (
                <motion.button
                  key={cat.id}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.03, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  onClick={() => setActiveId(cat.id)}
                  className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl
                    border border-white/20 p-5 text-left
                    hover:bg-white/15 transition-all duration-200
                    focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                  aria-label={`Ver exames de ${cat.title}`}
                >
                  <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${accent.icon}`}>
                    {cat.icon}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{cat.title}</h3>
                  <p className="text-xs text-blue-200/80 mb-3 leading-relaxed">{cat.subtitle}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-300">
                    Ver lista <ChevronRight className="w-3 h-3" />
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Modal overlay ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeCategory && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setActiveId(null)}
              aria-hidden="true"
            />

            {/* Modal */}
            <motion.div
              key="modal"
              role="dialog"
              aria-modal="true"
              aria-label={`Exames de ${activeCategory.title}`}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl
                  max-w-lg w-full max-h-[85vh] flex flex-col
                  border border-gray-100 dark:border-gray-700"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal header */}
                <div className="flex items-center justify-between px-6 py-5
                  border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                      ${ACCENT[activeCategory.accent as keyof typeof ACCENT].icon}`}>
                      {activeCategory.icon}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                        {activeCategory.title}
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activeCategory.exams.length} exames disponíveis
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveId(null)}
                    aria-label="Fechar"
                    className="w-8 h-8 rounded-lg flex items-center justify-center
                      text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                      hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Exam list */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <ul className="space-y-2">
                    {activeCategory.exams.map((exam) => (
                      <li key={exam} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-200">
                        <span className={`w-1.5 h-1.5 rounded-full mt-[7px] shrink-0
                          ${ACCENT[activeCategory.accent as keyof typeof ACCENT].dot}`} />
                        {exam}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Modal footer */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700
                  bg-gray-50 dark:bg-gray-700/50 rounded-b-3xl">
                  <a
                    href="#contato"
                    onClick={() => setActiveId(null)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                      text-sm font-semibold text-white
                      bg-gradient-to-r from-blue-600 to-blue-700
                      hover:from-blue-700 hover:to-indigo-700
                      shadow-md shadow-blue-500/20 transition-all duration-200"
                  >
                    Solicitar informações
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
