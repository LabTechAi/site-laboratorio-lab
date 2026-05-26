/**
 * LandingPage.tsx — LAB Cuidado Preventivo para Parceiros
 *
 * Premium Refinement: Parallax, Scroll Spy, Shimmer, Loading States, useReducedMotion
 *
 * Stack: React 18 + TypeScript + Tailwind CSS (darkMode:'class') + Framer Motion 11 + lucide-react
 *
 * If using Next.js App Router add "use client" as the first line.
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import {
  CheckCircle,
  FlaskConical,
  BarChart3,
  MessageCircle,
  Leaf,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  ArrowUp,
  Loader2,
  Search,
  ShieldAlert,
} from "lucide-react";
import { supabase } from "./supabaseClient";

const TOTAL_VAGAS = 50;

// ─────────────────────────────────────────────────────────────────────────────
// Animation Variants
// ─────────────────────────────────────────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

// Pop/spring — used for the success icon (celebratory entrance)
const popIn = {
  hidden: { opacity: 0, scale: 0.3 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", damping: 10, stiffness: 300 },
  },
};

// Stagger for success screen items
const successStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface FAQItemData {
  question: string;
  answer: string;
}

interface FeatureCardData {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface ExamGroupData {
  title: string;
  items: string[];
}

interface StepData {
  number: number;
  title: string;
  description: string;
}

interface PartnerCardData {
  title: string;
  description: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Static Data
// ─────────────────────────────────────────────────────────────────────────────

const FEATURES: FeatureCardData[] = [
  {
    icon: <FlaskConical className="w-5 h-5" />,
    title: "Laudo laboratorial",
    description:
      "Resultado dos exames realizados pelo LAB, com confiabilidade laboratorial.",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Relatório comentado ORIA",
    description:
      "Um guia em linguagem simples, com pontos de atenção, explicações e perguntas sugeridas para levar ao médico.",
  },
  {
    icon: <MessageCircle className="w-5 h-5" />,
    title: "Conversa educativa com o LAB",
    description:
      "O LAB conduz uma conversa para esclarecer dúvidas gerais sobre o laudo e o relatório, sem diagnóstico, prescrição ou substituição da consulta médica.",
  },
  {
    icon: <Leaf className="w-5 h-5" />,
    title: "Próximos passos com segurança",
    description:
      "Orientações gerais de hábitos e sugestões de assuntos para conversar com o médico responsável.",
  },
];

const EXAM_GROUPS: ExamGroupData[] = [
  {
    title: "Avaliação Geral e Inflamação",
    items: [
      "Hemograma Completo",
      "VHS (Velocidade de Hemossedimentação)",
      "PCR-US (Proteína C Reativa Ultra Sensível)",
      "EAS (Exame de Urina)",
    ],
  },
  {
    title: "Metabolismo e Diabetes",
    items: [
      "Glicemia de Jejum",
      "Hemoglobina Glicada",
      "Insulina",
      "Índice HOMA-IR",
      "HOMA-BETA",
    ],
  },
  {
    title: "Saúde Cardiovascular",
    items: [
      "Lipidograma Completo",
      "Apolipoproteínas A e B",
      "Fibrinogênio",
      "Homocisteína",
    ],
  },
  {
    title: "Função Hepática",
    items: [
      "TGO (AST)",
      "TGP (ALT)",
      "Gama GT",
    ],
  },
  {
    title: "Função Renal",
    items: [
      "Creatinina",
      "Ureia",
      "Ácido Úrico",
    ],
  },
  {
    title: "Tireoide",
    items: [
      "TSH",
      "T3 Livre",
      "T4 Livre",
      "Anti-TPO",
      "Antitireoglobulina",
    ],
  },
  {
    title: "Vitaminas e Metabolismo Ósseo",
    items: [
      "Vitamina B12",
      "Ácido Fólico",
      "25-Hidroxivitamina D",
      "Cálcio Total",
      "Paratormônio",
      "Magnésio Sérico",
    ],
  },
  {
    title: "Ferro e Oligoelementos",
    items: [
      "Ferritina",
      "Ferro Sérico",
      "Zinco Sanguíneo",
      "Selênio Sérico",
      "Cobre Sérico",
      "Cádmio Sérico",
      "Alumínio Sérico",
    ],
  },
  {
    title: "Hormônios — Masculino",
    items: [
      "Testosterona Livre e Total",
      "Estradiol",
      "PSA (≥ 50 anos; ou ≥ 45 anos com histórico familiar de câncer)",
      "Androstenediona",
    ],
  },
  {
    title: "Hormônios — Feminino",
    items: [
      "Estrogênio",
      "Progesterona",
      "Estradiol",
      "Hormônio Luteinizante (LH)",
      "Hormônio Folículo-Estimulante (FSH)",
      "Prolactina",
      "Androstenediona",
    ],
  },
];

const STEPS: StepData[] = [
  {
    number: 1,
    title: "Lista de espera",
    description:
      "O colaborador informa nome, telefone e parceiro vinculado para demonstrar interesse.",
  },
  {
    number: 2,
    title: "Confirmação",
    description:
      "A equipe do LAB entra em contato para confirmar disponibilidade, elegibilidade e próximos passos.",
  },
  {
    number: 3,
    title: "Coleta e laudo LAB",
    description:
      "O LAB é responsável pela coleta laboratorial e pela entrega do laudo laboratorial.",
  },
  {
    number: 4,
    title: "Relatório comentado",
    description:
      "A nossa empresa parceira ORIA gera o relatório comentado em linguagem simples, a partir dos resultados laboratoriais.",
  },
  {
    number: 5,
    title: "Conversa educativa",
    description:
      "O LAB realiza uma conversa educativa para esclarecimentos gerais sobre os resultados, sem caráter de consulta médica.",
  },
];

const PARTNER_CARDS: PartnerCardData[] = [
  {
    title: "Cuidado com a equipe",
    description:
      "O parceiro oferece aos colaboradores acesso facilitado a uma ação concreta de saúde preventiva.",
  },
  {
    title: "Benefício acessível",
    description:
      "O preço especial torna viável uma avaliação laboratorial ampla com mais de 50 marcadores.",
  },
  {
    title: "Prevenção valorizada",
    description:
      "A iniciativa reforça uma cultura de cuidado antes que problemas maiores apareçam.",
  },
  {
    title: "Próxima etapa",
    description:
      "Após a fase com colaboradores, o modelo poderá ser expandido para pacientes dos parceiros.",
  },
];

const FAQ_ITEMS: FAQItemData[] = [
  {
    question: "O pacote substitui uma consulta médica?",
    answer:
      "Não. O pacote oferece exames laboratoriais, laudo, relatório comentado ORIA e uma conversa educativa conduzida pelo LAB. Diagnóstico, prescrição e tratamento devem ser feitos por médico ou profissional de saúde habilitado.",
  },
  {
    question: "O que é o relatório comentado ORIA?",
    answer:
      "É um guia educativo que traduz os resultados laboratoriais em linguagem simples, destaca pontos de atenção e sugere perguntas para levar ao médico.",
  },
  {
    question: "A conversa educativa do LAB é uma consulta médica?",
    answer:
      "Não. É um momento conduzido pelo LAB para esclarecer o laudo e o relatório recebidos, auxiliando na preparação para a consulta com o médico. Não há diagnóstico, prescrição ou tratamento.",
  },
  {
    question: "Quanto custa?",
    answer:
      "O valor do pacote é de R$ 799,92 podendo ser dividido em até 8x de R$ 99,99.",
  },
  {
    question: "Quantas vagas estão disponíveis?",
    answer:
      `Esta primeira etapa terá ${TOTAL_VAGAS} vagas iniciais para colaboradores de parceiros LAB inscritos na lista de espera.`,
  },
];

const METRICS = [
  { label: "Metabolismo", value: 78 },
  { label: "Inflamação", value: 42 },
  { label: "Vitaminas e minerais", value: 64 },
  { label: "Tireoide", value: 88 },
];

const TRUST_ITEMS = [
  "Para colaboradores de parceiros LAB",
  "+50 marcadores laboratoriais",
  "Relatório comentado incluso",
];

// Color palette — one accent per exam group (cycles if > 10 groups)
const EXAM_CARD_COLORS = [
  { gradient: "from-blue-500 to-blue-600",    dot: "bg-blue-500",    badge: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",    glow: "hover:shadow-blue-100 dark:hover:shadow-blue-900/40",    ring: "hover:border-blue-200 dark:hover:border-blue-700" },
  { gradient: "from-indigo-500 to-indigo-600", dot: "bg-indigo-500",  badge: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300", glow: "hover:shadow-indigo-100 dark:hover:shadow-indigo-900/40", ring: "hover:border-indigo-200 dark:hover:border-indigo-700" },
  { gradient: "from-violet-500 to-violet-600", dot: "bg-violet-500",  badge: "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300", glow: "hover:shadow-violet-100 dark:hover:shadow-violet-900/40", ring: "hover:border-violet-200 dark:hover:border-violet-700" },
  { gradient: "from-cyan-500 to-cyan-600",    dot: "bg-cyan-500",    badge: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",    glow: "hover:shadow-cyan-100 dark:hover:shadow-cyan-900/40",    ring: "hover:border-cyan-200 dark:hover:border-cyan-700" },
  { gradient: "from-teal-500 to-teal-600",    dot: "bg-teal-500",    badge: "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",    glow: "hover:shadow-teal-100 dark:hover:shadow-teal-900/40",    ring: "hover:border-teal-200 dark:hover:border-teal-700" },
  { gradient: "from-emerald-500 to-emerald-600", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300", glow: "hover:shadow-emerald-100 dark:hover:shadow-emerald-900/40", ring: "hover:border-emerald-200 dark:hover:border-emerald-700" },
  { gradient: "from-sky-500 to-sky-600",      dot: "bg-sky-500",     badge: "bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",      glow: "hover:shadow-sky-100 dark:hover:shadow-sky-900/40",      ring: "hover:border-sky-200 dark:hover:border-sky-700" },
  { gradient: "from-rose-500 to-rose-600",    dot: "bg-rose-500",    badge: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",    glow: "hover:shadow-rose-100 dark:hover:shadow-rose-900/40",    ring: "hover:border-rose-200 dark:hover:border-rose-700" },
  { gradient: "from-amber-500 to-amber-600",  dot: "bg-amber-500",   badge: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",  glow: "hover:shadow-amber-100 dark:hover:shadow-amber-900/40",  ring: "hover:border-amber-200 dark:hover:border-amber-700" },
  { gradient: "from-pink-500 to-pink-600",    dot: "bg-pink-500",    badge: "bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",    glow: "hover:shadow-pink-100 dark:hover:shadow-pink-900/40",    ring: "hover:border-pink-200 dark:hover:border-pink-700" },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Shared input class (Design System – Input Padrão)
// ─────────────────────────────────────────────────────────────────────────────

const inputCls =
  "w-full px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl " +
  "focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 " +
  "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 " +
  "dark:focus-visible:ring-offset-gray-900 " +
  "transition-all duration-200 hover:border-slate-300 dark:hover:border-gray-500 " +
  "bg-white/70 dark:bg-gray-800/80 backdrop-blur-sm " +
  "text-slate-800 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 " +
  "text-sm outline-none";

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Components
// ─────────────────────────────────────────────────────────────────────────────

// ThemeToggle ─────────────────────────────────
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

// FeatureCard — whileHover + whileTap microinteractions ───────────────────────
const FeatureCard: React.FC<FeatureCardData> = ({ icon, title, description }) => {
  const shouldReduceMotion = useReducedMotion();
  return (
  <motion.article
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
        flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400"
    >
      {icon}
    </div>
    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 leading-snug">
      {title}
    </h3>
    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
      {description}
    </p>
  </motion.article>
  );
};

// MetricBar ───────────────────────────────────
const MetricBar: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="mb-4">
    <div className="flex justify-between text-sm mb-1.5">
      <span className="text-gray-600 dark:text-gray-300">{label}</span>
      <strong className="text-blue-700 dark:text-blue-400">{value}%</strong>
    </div>
    <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
      />
    </div>
  </div>
);

// ExamCard ────────────────────────────────────
// Highlights query match inside item text
function highlightText(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 dark:bg-yellow-500/40 text-inherit rounded px-0.5 not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

const itemStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.045, delayChildren: 0.1 } },
};
const itemFade = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

// Threshold = menor card da lista — garante altura uniforme para todos os cards colapsados
const COLLAPSE_THRESHOLD = Math.min(...EXAM_GROUPS.map((g) => g.items.length));

const ExamCard: React.FC<ExamGroupData & { colorIndex: number; query: string }> = ({
  title,
  items,
  colorIndex,
  query,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const color = EXAM_CARD_COLORS[colorIndex % EXAM_CARD_COLORS.length];

  // Expand logic: only active outside of search mode
  const isSearching = query.length > 0;
  const needsExpand = !isSearching && items.length > COLLAPSE_THRESHOLD;
  const [expanded, setExpanded] = useState(false);

  // Reset expansion whenever the search query changes
  useEffect(() => { setExpanded(false); }, [query]);

  const visibleItems = needsExpand && !expanded ? items.slice(0, COLLAPSE_THRESHOLD) : items;
  const extraCount = items.length - COLLAPSE_THRESHOLD;

  return (
    <motion.article
      variants={fadeInUp}
      whileHover={shouldReduceMotion ? {} : { y: -4, scale: 1.015 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 360, damping: 28 }}
      className={`relative bg-white dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl
        border border-gray-100 dark:border-gray-700/60 overflow-hidden
        shadow-sm hover:shadow-xl transition-shadow duration-300
        ${color.glow} ${color.ring} cursor-default flex flex-col`}
    >
      {/* Gradient accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${color.gradient} shrink-0`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug">
            {highlightText(title, query)}
          </h3>
          <span className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${color.badge}`}>
            {items.length}
          </span>
        </div>

        {/* Always-visible items */}
        <motion.ul
          variants={itemStagger}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          {visibleItems.map((item) => (
            <motion.li
              key={item}
              variants={itemFade}
              className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${color.dot} mt-[6px] shrink-0
                  ring-2 ring-white dark:ring-gray-800`}
              />
              <span className="leading-snug">{highlightText(item, query)}</span>
            </motion.li>
          ))}
        </motion.ul>

        {/* Overflow items — expand animation */}
        {needsExpand && (
          <div className="mt-auto pt-3">
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.ul
                  key="overflow"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: "easeOut" }}
                  className="overflow-hidden space-y-2 mb-3"
                >
                  {items.slice(COLLAPSE_THRESHOLD).map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${color.dot} mt-[6px] shrink-0
                          ring-2 ring-white dark:ring-gray-800`}
                      />
                      <span className="leading-snug">{highlightText(item, query)}</span>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>

            <button
              onClick={() => setExpanded((v) => !v)}
              className={`w-full flex items-center justify-center gap-1.5
                text-xs font-semibold py-1.5 rounded-lg
                transition-colors duration-200 ${color.badge} hover:opacity-80`}
            >
              <motion.span
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.span>
              {expanded ? "Ver menos" : `Ver mais ${extraCount}`}
            </button>
          </div>
        )}
      </div>
    </motion.article>
  );
};

// StepCard — whileHover + whileTap microinteractions ─────────────────────────
const StepCard: React.FC<StepData> = ({ number, title, description }) => {
  const shouldReduceMotion = useReducedMotion();
  return (
  <motion.article
    variants={fadeInUp}
    whileHover={shouldReduceMotion ? {} : { scale: 1.02, y: -3 }}
    whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
    transition={{ type: "spring", stiffness: 400, damping: 28 }}
    className="bg-white/90 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-sm
      border border-gray-100 dark:border-gray-700/60 p-6 cursor-default
      hover:shadow-md dark:hover:bg-gray-800/80 transition-all duration-200"
  >
    <div
      className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600
        flex items-center justify-center text-white font-bold text-sm mb-4
        shadow-md shadow-blue-500/25"
    >
      {number}
    </div>
    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
      {title}
    </h3>
    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
      {description}
    </p>
  </motion.article>
  );
};

// PartnerCard ─────────────────────────────────
const PartnerCard: React.FC<PartnerCardData> = ({ title, description }) => (
  <motion.article
    variants={fadeInUp}
    className="bg-white/10 dark:bg-white/5 rounded-2xl border border-white/20 p-6
      hover:-translate-y-0.5 transition-transform duration-200"
  >
    <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
    <p className="text-sm text-blue-100/80 leading-relaxed">{description}</p>
  </motion.article>
);

// FAQItem ─────────────────────────────────────
const FAQItem: React.FC<{
  item: FAQItemData;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ item, isOpen, onToggle }) => (
  <div
    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100
      dark:border-gray-700 overflow-hidden"
  >
    <button
      onClick={onToggle}
      aria-expanded={isOpen}
      className="w-full flex items-center justify-between px-5 py-4 text-left
        hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
    >
      <span className="font-semibold text-blue-900 dark:text-blue-300 text-sm pr-4">
        {item.question}
      </span>
      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
        <ChevronDown className="w-4 h-4 text-blue-500 flex-shrink-0" />
      </motion.div>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <p className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {item.answer}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// WaitlistForm — Supabase insert + loading state + staggered success + shimmer
const WaitlistForm: React.FC<{
  onSuccess?: () => void;
  disabled?: boolean;
}> = ({ onSuccess, disabled = false }) => {
  const [form, setForm] = useState({ nome: "", telefone: "", parceiro: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const { error } = await supabase
        .from("waitlist")
        .insert([{ nome: form.nome, telefone: form.telefone, parceiro: form.parceiro }]);

      if (error) throw error;

      setSubmitted(true);
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Erro ao registrar interesse. Tente novamente.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Move focus to success message so screen readers announce it
  useEffect(() => {
    if (submitted) {
      successRef.current?.focus();
    }
  }, [submitted]);

  // ── Staggered success screen with spring pop ─────────────────────────────
  if (submitted) {
    return (
      <motion.div
        ref={successRef}
        tabIndex={-1}
        aria-live="polite"
        aria-atomic="true"
        initial="hidden"
        animate="visible"
        variants={successStagger}
        className="flex flex-col items-center gap-3 py-8 text-center outline-none"
      >
        {/* Icon: spring pop entrance */}
        <motion.div
          variants={popIn}
          className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30
            flex items-center justify-center"
        >
          <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
        </motion.div>
        <motion.p
          variants={fadeInUp}
          className="font-bold text-gray-900 dark:text-gray-100 text-base"
        >
          Interesse registrado!
        </motion.p>
        <motion.p
          variants={fadeInUp}
          className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed"
        >
          Entraremos em contato em breve para confirmar sua vaga.
        </motion.p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Nome completo
          </label>
          <input
            type="text"
            name="nome"
            placeholder="Digite seu nome"
            required
            autoComplete="name"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Telefone / WhatsApp
          </label>
          <input
            type="tel"
            name="telefone"
            placeholder="(00) 00000-0000"
            required
            autoComplete="tel"
            value={form.telefone}
            onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Parceiro vinculado
          </label>
          <input
            type="text"
            name="parceiro"
            placeholder="Empresa, clínica ou parceiro LAB"
            required
            autoComplete="organization"
            value={form.parceiro}
            onChange={(e) => setForm({ ...form, parceiro: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>

      {/*
       * Submit button with:
       * – Loader2 spinner during submission
       * – Continuous shimmer sweep when idle
       * – whileHover scale / whileTap press feedback
       */}
      <motion.button
        type="submit"
        disabled={submitting || disabled}
        whileHover={submitting || disabled ? {} : { scale: 1.015, y: -1 }}
        whileTap={submitting || disabled ? {} : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
        className={`relative overflow-hidden w-full px-4 py-3
          text-white font-semibold rounded-xl shadow-md
          transition-colors duration-200 text-sm
          disabled:opacity-70 disabled:cursor-not-allowed
          ${
            disabled
              ? "bg-gray-400 dark:bg-gray-600 shadow-gray-400/25"
              : "bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-500/25 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:shadow-blue-500/30"
          }`}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Aguarde...
          </span>
        ) : disabled ? (
          <span className="relative z-10">Lista de espera lotada</span>
        ) : (
          <>
            <span className="relative z-10">Garantir prioridade nas vagas</span>
            {/* Shimmer sweep — continuous light reflection over the button */}
            <motion.span
              aria-hidden="true"
              className="absolute inset-0 -skew-x-12
                bg-gradient-to-r from-transparent via-white/25 to-transparent
                pointer-events-none"
              animate={{ x: ["-200%", "200%"] }}
              transition={{
                repeat: Infinity,
                duration: 2.6,
                ease: "linear",
                repeatDelay: 1.8,
              }}
            />
          </>
        )}
      </motion.button>

      {/* Inline error feedback */}
      {submitError && (
        <p
          role="alert"
          className="text-xs text-red-600 dark:text-red-400 text-center
            bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40
            rounded-lg px-3 py-2"
        >
          {submitError}
        </p>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Cadastro de interesse. Não garante vaga imediata nem confirma pagamento.
      </p>
    </form>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  /*
   * useReducedMotion — respects the OS "prefers-reduced-motion" setting.
   * When true, all scroll-driven transforms (parallax, hero fade) are skipped.
   */
  const shouldReduceMotion = useReducedMotion();

  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [examSearch, setExamSearch] = useState("");

  // ── Vagas dinâmicas — consulta o count real da tabela waitlist ─────────────
  const [vagasDisponiveis, setVagasDisponiveis] = useState<number>(TOTAL_VAGAS);

  useEffect(() => {
    const fetchCount = async () => {
      const { count, error } = await supabase
        .from("waitlist")
        .select("*", { count: "exact", head: true });

      if (!error && count !== null) {
        setVagasDisponiveis(Math.max(0, TOTAL_VAGAS - count));
      }
    };

    void fetchCount();
  }, []);

  const vagasEsgotadas = vagasDisponiveis === 0;

  // ── Scroll Spy: tracks which section is currently in the viewport ──────────
  const [activeSection, setActiveSection] = useState<string>("");

  // ── useScroll (global) — drives header glass + hero parallax + progress bar ─
  const { scrollY, scrollYProgress } = useScroll();

  // Spring-smoothed progress (avoids the jittery feel of raw scrollYProgress)
  const springProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    restDelta: 0.001,
  });

  /*
   * Header glassmorphism: all driven directly by the scrollY MotionValue.
   * This avoids the binary class-swap and gives a continuous smooth transition.
   * Glass/border/shadow fade in over the first 72px of scroll.
   */
  const glassOpacity = useTransform(scrollY, [0, 72], [0, 1]);
  const borderOpacity = useTransform(scrollY, [0, 72], [0, 1]);
  const shadowOpacity = useTransform(scrollY, [0, 72], [0, 1]);
  // Logo badge subtly shrinks as the header compacts on scroll
  const logoBadgeScale = useTransform(
    scrollY,
    [0, 80],
    shouldReduceMotion ? [1, 1] : [1, 0.88]
  );

  // ── Hero section ref — target for the parallax scroll progress ────────────
  const heroRef = useRef<HTMLElement>(null);

  /*
   * useScroll with target: heroRef tracks progress relative to the hero section
   * (0 = hero top at viewport top, 1 = hero bottom exits viewport top).
   */
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  /*
   * Parallax transforms for the decorative orbs.
   * Output range [0, 0] when shouldReduceMotion is true → no movement.
   */
  const orb1Y = useTransform(
    heroProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [0, -110]
  );
  const orb2Y = useTransform(
    heroProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [0, 80]
  );

  /*
   * Hero text scroll fade: copy smoothly fades out and drifts upward as
   * the hero section exits the viewport. Disabled when prefers-reduced-motion.
   */
  const heroOpacity = useTransform(
    heroProgress,
    [0, 0.55],
    shouldReduceMotion ? [1, 1] : [1, 0]
  );
  const heroTextY = useTransform(
    heroProgress,
    [0, 0.55],
    shouldReduceMotion ? [0, 0] : [0, -36]
  );

  // Sync dark class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggleTheme = useCallback(() => setIsDark((prev) => !prev), []);

  // Close mobile menu when user scrolls past 80px
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const unsubscribe = scrollY.on("change", (v) => {
      if (v > 80) setMobileMenuOpen(false);
    });
    return unsubscribe;
  }, [mobileMenuOpen, scrollY]);

  /*
   * Scroll Spy — IntersectionObserver watches each named section.
   * rootMargin fires when the section occupies the middle ~10% of the viewport.
   */
  useEffect(() => {
    const sectionIds = ["incluido", "exames", "como-funciona", "faq"];
    const observers = sectionIds.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: "-40% 0px -50% 0px" }
      );
      observer.observe(el);
      return observer;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  // Nav links with section ids for scroll spy matching
  const navLinks = [
    { label: "Como funciona", href: "#como-funciona", id: "como-funciona" },
    { label: "O que recebe", href: "#incluido", id: "incluido" },
    { label: "Exames", href: "#exames", id: "exames" },
    { label: "FAQ", href: "#faq", id: "faq" },
  ];

  return (
    <div className="bg-slate-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">

      {/* ── Topbar ────────────────────────────────────────────────────────── */}
      <div
        className="bg-gradient-to-r from-blue-900 via-blue-700 to-indigo-800
          text-white text-xs sm:text-sm py-2.5 px-4 text-center font-medium"
      >
        {vagasEsgotadas
          ? "Lista de espera encerrada · Todas as vagas foram preenchidas"
          : `Lista de espera aberta · Iniciativa especial para colaboradores de parceiros LAB · ${vagasDisponiveis} vagas`}
      </div>

      {/*
       * ── Navbar ─────────────────────────────────────────────────────────────
       * Full Framer Motion glassmorphism header.
       * Architecture:
       * – Glass layer: absolutely-positioned div with backdrop-blur-[14px]
       *   whose opacity is a MotionValue (0 → 1 over 72px of scroll). This
       *   means blur is only active once the element is visible, preventing
       *   the "blurring air" effect at the top of the page.
       * – Gradient border-bottom: a 1px gradient line that fades in on scroll.
       * – Shadow layer: a softbox shadow that fades in independently.
       * – Logo badge: shrinks subtly via logoBadgeScale MotionValue.
       * – Nav links: motion.a with staggered mount entrance + hover underline
       *   that grows from center (scaleX: 0 → 1) + spring layoutId for active.
       * – Mobile toggle: AnimatePresence spin-swap between Menu and X icons.
       * – Mobile menu: staggered spring children with its own glass layer.
       */}
      <motion.header className="sticky top-0 z-30">
        {/* Glass background layer — bg driven via isDark state to avoid Tailwind
            dark-variant specificity issues with Framer Motion MotionValues. */}
        <motion.div
          style={{
            opacity: glassOpacity,
            backgroundColor: isDark ? "rgba(17, 24, 39, 0.88)" : "rgba(255, 255, 255, 0.85)",
          }}
          className="absolute inset-0 backdrop-blur-[14px] pointer-events-none"
        />
        {/* Gradient border line at the bottom */}
        <motion.div
          style={{ opacity: borderOpacity }}
          className="absolute bottom-0 left-0 right-0 h-px
            bg-gradient-to-r from-transparent via-blue-200/70 dark:via-blue-600/40 to-transparent
            pointer-events-none"
        />
        {/* Drop-shadow layer */}
        <motion.div
          style={{ opacity: shadowOpacity }}
          className="absolute inset-0
            shadow-[0_4px_28px_-4px_rgba(15,23,42,0.10)]
            dark:shadow-[0_4px_28px_-4px_rgba(0,0,0,0.40)]
            pointer-events-none"
        />

        <div
          className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16
            flex items-center justify-between gap-4"
        >
          {/* Brand — SVG logo, light/dark swap */}
          {/* Brand + context badge */}
          <motion.div
            style={{ scale: logoBadgeScale }}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex items-center gap-2 shrink-0"
          >
            <a
              href="#top"
              aria-label="LAB Cuidado Preventivo"
              className="flex items-center"
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
            </a>
            <span className="
              inline-flex items-center px-2 py-[3px] rounded-md
              text-[10px] font-bold tracking-[0.08em] uppercase
              bg-indigo-50 dark:bg-indigo-900/25
              border border-indigo-200/70 dark:border-indigo-700/40
              text-indigo-600 dark:text-indigo-300
              select-none
            ">
              Parceiros
            </span>
          </motion.div>

          {/* Desktop nav — staggered entrance + per-link hover effects */}
          <motion.nav
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.07, delayChildren: 0.12 },
              },
            }}
            className="hidden md:flex items-center gap-1 text-sm font-medium
              text-gray-600 dark:text-gray-300"
          >
            {navLinks.map(({ label, href, id }) => (
              <motion.a
                key={href}
                href={href}
                variants={{
                  hidden: { opacity: 0, y: -8 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.32, ease: "easeOut" },
                  },
                }}
                whileHover={{ y: -1 }}
                transition={{ type: "spring", stiffness: 420, damping: 26 }}
                className="relative px-3 py-2 rounded-lg
                  hover:bg-blue-50/80 dark:hover:bg-blue-900/20
                  hover:text-blue-700 dark:hover:text-blue-400
                  transition-colors duration-150"
              >
                {label}
                {/*
                 * Hover underline — scaleX: 0 → 1 from center on hover.
                 * Uses CSS group/peer trick via Framer's whileHover on parent.
                 */}
                <motion.span
                  aria-hidden="true"
                  className="absolute bottom-1.5 left-3 right-3 h-0.5
                    bg-blue-400/50 dark:bg-blue-500/50 rounded-full"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  style={{ originX: 0.5 }}
                />
                {/* Active section spring indicator */}
                {activeSection === id && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute bottom-1.5 left-3 right-3 h-0.5
                      bg-blue-500 dark:bg-blue-400 rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </motion.a>
            ))}
          </motion.nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle isDark={isDark} toggle={toggleTheme} />

            {/* CTA — shimmer + spring + glow shadow on hover */}
            <motion.a
              href="#contato"
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
              className="relative overflow-hidden hidden sm:inline-flex items-center
                px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600
                text-white font-semibold rounded-xl
                shadow-md shadow-blue-500/30
                hover:shadow-lg hover:shadow-blue-500/45
                hover:from-blue-600 hover:to-blue-700
                transition-[box-shadow,background] duration-200 text-sm"
            >
              <span className="relative z-10">Entre na listagem de vagas</span>
              <motion.span
                aria-hidden="true"
                className="absolute inset-0 -skew-x-12
                  bg-gradient-to-r from-transparent via-white/30 to-transparent
                  pointer-events-none"
                animate={{ x: ["-200%", "200%"] }}
                transition={{
                  repeat: Infinity,
                  duration: 2.4,
                  ease: "linear",
                  repeatDelay: 1.6,
                }}
              />
            </motion.a>

            {/* Mobile toggle — icon morphs with AnimatePresence spin */}
            <motion.button
              onClick={() => setMobileMenuOpen((p) => !p)}
              aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              whileTap={{ scale: 0.88 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="md:hidden p-2 rounded-xl
                hover:bg-gray-100 dark:hover:bg-gray-700/60
                transition-colors duration-150"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileMenuOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -60, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 60, opacity: 0 }}
                    transition={{ duration: 0.16 }}
                    className="block"
                  >
                    <X className="w-5 h-5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 60, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -60, opacity: 0 }}
                    transition={{ duration: 0.16 }}
                    className="block"
                  >
                    <Menu className="w-5 h-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile menu — glass background + staggered spring children */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative md:hidden border-t
                border-gray-100/80 dark:border-gray-700/60 overflow-hidden"
            >
              {/* Glass background for the dropdown */}
              <div
                className="absolute inset-0
                  bg-white/92 dark:bg-gray-900/92 backdrop-blur-[14px]
                  pointer-events-none"
              />
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: { staggerChildren: 0.055, delayChildren: 0.06 },
                  },
                }}
                className="relative flex flex-col p-3 gap-0.5 text-sm font-medium"
              >
                {navLinks.map(({ label, href }) => (
                  <motion.a
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    variants={{
                      hidden: { opacity: 0, x: -14 },
                      visible: {
                        opacity: 1,
                        x: 0,
                        transition: {
                          type: "spring",
                          stiffness: 340,
                          damping: 26,
                        },
                      },
                    }}
                    className="px-3 py-2.5 rounded-xl
                      text-gray-700 dark:text-gray-300
                      hover:bg-blue-50/80 dark:hover:bg-blue-900/20
                      hover:text-blue-700 dark:hover:text-blue-400
                      transition-colors duration-150"
                  >
                    {label}
                  </motion.a>
                ))}
                <motion.a
                  href="#contato"
                  onClick={() => setMobileMenuOpen(false)}
                  variants={{
                    hidden: { opacity: 0, y: 10, scale: 0.97 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        type: "spring",
                        stiffness: 340,
                        damping: 26,
                      },
                    },
                  }}
                  className="mt-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600
                    text-white font-semibold rounded-xl text-center
                    shadow-md shadow-blue-500/20"
                >
                  Entrar na lista de espera
                </motion.a>
              </motion.div>
            </motion.nav>
          )}
        </AnimatePresence>

        {/*
         * Scroll progress bar — spring-smoothed, gradient, 2px, scaleX from left.
         * Track (dark-only) + bright gradient with dark mode boost + glow.
         */}
        {/* Track */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none
          bg-transparent dark:bg-gray-700/40" />
        {/* Fill */}
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

        {/*
         * ── Hero ─────────────────────────────────────────────────────────────
         * heroRef: passed to useScroll as `target` to compute scroll progress
         * relative to this section only.
         */}
        <section
          ref={heroRef}
          className="relative pt-16 pb-14 md:pt-20 md:pb-20 overflow-hidden"
        >
          {/*
           * Parallax Orbs: driven by orb1Y / orb2Y transforms.
           * They move in opposite directions on scroll, creating depth.
           * Both transforms output [0,0] when shouldReduceMotion is true.
           */}
          <motion.div
            style={{ y: orb1Y }}
            className="pointer-events-none absolute top-1/4 -right-28 w-96 h-96 rounded-full
              bg-gradient-to-r from-blue-200/50 to-cyan-200/50
              dark:from-blue-500/10 dark:to-cyan-500/10
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
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-start">

              {/* Left – copy with scroll fade + parallax drift */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={stagger}
                style={{ opacity: heroOpacity, y: heroTextY }}
              >
                {/* Eyebrow */}
                <motion.div
                  variants={fadeInUp}
                  className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30
                    text-blue-800 dark:text-blue-300
                    border border-blue-200 dark:border-blue-700
                    rounded-full px-3.5 py-1.5 text-xs font-bold mb-5"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  Sua saúde preventiva em um só lugar
                </motion.div>

                {/* H1 with gradient */}
                <motion.h1
                  variants={fadeInUp}
                  className="text-4xl sm:text-5xl lg:text-[3.6rem] font-extrabold
                    leading-[0.97] tracking-tight mb-5"
                >
                  <span
                    className="bg-gradient-to-r from-blue-900 via-blue-700 to-indigo-800
                      dark:from-blue-400 dark:via-blue-300 dark:to-indigo-400
                      bg-clip-text text-transparent"
                  >
                    Antes de cuidar dos outros, cuide de quem faz parte da sua
                    equipe.
                  </span>
                </motion.h1>

                <motion.p
                  variants={fadeInUp}
                  className="text-base sm:text-lg text-gray-600 dark:text-gray-300
                    max-w-xl mb-7 leading-relaxed"
                >
                  Uma condição especial do LAB para colaboradores de parceiros
                  realizarem um check-up laboratorial amplo, com laudo laboratorial,
                  relatório comentado em linguagem simples e uma conversa educativa com
                  o LAB para esclarecer os resultados antes da consulta com
                  seu médico.
                </motion.p>

                {/* CTA row */}
                <motion.div variants={fadeInUp} className="flex flex-wrap gap-3 mb-7">
                  <motion.a
                    href="#incluido"
                    whileHover={shouldReduceMotion ? {} : { scale: 1.02, y: -2 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 24 }}
                    className="inline-flex items-center px-5 py-2.5
                      text-gray-700 dark:text-gray-200
                      bg-white dark:bg-gray-800
                      border border-gray-200 dark:border-gray-700
                      rounded-xl font-medium
                      hover:bg-gray-50 dark:hover:bg-gray-700
                      hover:border-gray-300
                      transition-colors duration-200"
                  >
                    Ver o que está incluído
                  </motion.a>
                </motion.div>

                {/* Trust badges */}
                <motion.div
                  variants={fadeInUp}
                  className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400"
                >
                  {/* Dynamic vagas badge */}
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30
                        flex items-center justify-center shrink-0"
                    >
                      <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </span>
                    {vagasEsgotadas ? "Vagas esgotadas" : `${vagasDisponiveis} vagas`}
                  </span>
                  {TRUST_ITEMS.map((item) => (
                    <span key={item} className="flex items-center gap-1.5">
                      <span
                        className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30
                          flex items-center justify-center shrink-0"
                      >
                        <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                      </span>
                      {item}
                    </span>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right – Price card */}
              <motion.aside
                initial={{ opacity: 0, y: 36 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: "easeOut", delay: 0.25 }}
                aria-label="Lista de espera e preço do pacote"
                className="relative"
              >
                {/* Glow behind card */}
                <div
                  className="absolute -inset-2 bg-gradient-to-r
                    from-blue-500/10 via-indigo-500/10 to-blue-500/10
                    rounded-3xl blur-xl -z-10"
                />

                <div
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl
                    rounded-3xl shadow-2xl shadow-slate-900/10 dark:shadow-black/30
                    p-6 sm:p-8 border border-slate-200/50 dark:border-gray-700/50"
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                      Pré-inscrição aberta
                    </span>
                    <span
                      className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        vagasEsgotadas
                          ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                          : "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300"
                      }`}
                    >
                      {vagasEsgotadas ? "Vagas esgotadas" : `${vagasDisponiveis} vagas disponiveis`}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-blue-900 dark:text-blue-100 mb-4">
                    Check-up Alta Performance
                  </h2>

                  {/* Description */}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    +50 marcadores laboratoriais com condição exclusiva.
                  </p>

                  {/* Price container with visual highlight */}
                  <div
                    className="bg-gray-100 dark:bg-gray-700/50
                      border-l-4 border-blue-500 dark:border-blue-400
                      rounded-r-xl p-5 mb-4"
                  >
                    {/* Market price comparison */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Valor estimado no mercado
                      </p>
                      <strong
                        className="text-lg font-bold text-gray-700 dark:text-gray-300
                          line-through opacity-60"
                      >
                        R$ 2.500
                      </strong>
                    </div>

                    {/* Main price */}
                    <div className="mb-3">
                      <span
                        className="text-4xl font-extrabold tracking-tight leading-none
                          text-blue-900 dark:text-blue-300"
                      >
                        R$&nbsp;799,92
                      </span>
                    </div>

                    {/* Installment */}
                    <div
                      className="bg-green-50 dark:bg-green-900/30
                        border border-green-200 dark:border-green-800/50
                        rounded-lg p-3"
                    >
                      <strong
                        className="block text-lg font-extrabold
                          text-green-800 dark:text-green-400"
                      >
                        Ou 8x de R$ 99,99 sem juros
                      </strong>
                    </div>
                  </div>

                  {/* Economy microcopy */}
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-6 text-center font-medium">
                    Economia real de 68% garantida nesta oferta.
                  </p>

                  {/* Available slots info */}
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Vagas iniciais
                      </p>
                      <strong
                        className={`text-lg font-bold ${
                          vagasEsgotadas
                            ? "text-red-600 dark:text-red-400"
                            : "text-blue-900 dark:text-blue-300"
                        }`}
                      >
                        {vagasEsgotadas ? "Esgotado" : `${vagasDisponiveis} vagas`}
                      </strong>
                    </div>
                  </div>

                  <WaitlistForm
                    disabled={vagasEsgotadas}
                    onSuccess={() =>
                      setVagasDisponiveis((v) => Math.max(0, v - 1))
                    }
                  />
                </div>
              </motion.aside>
            </div>
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────────────── */}
        <section
          id="como-funciona"
          className="py-16 md:py-20
            bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30
            dark:from-gray-900 dark:via-gray-900 dark:to-gray-900"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-10"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-4
                text-xs font-bold rounded-full
                bg-white/70 dark:bg-white/5 backdrop-blur-md
                border border-blue-100 dark:border-blue-700/40
                text-blue-700 dark:text-blue-400 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 flex-shrink-0" />
                Jornada passo a passo
              </span>
              <h2
                className="text-3xl sm:text-4xl font-extrabold tracking-tight
                  text-blue-900 dark:text-blue-100 mb-3"
              >
                Como funciona
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-200">
                Uma etapa inicial de lista de espera para colaboradores de parceiros
                LAB.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4"
            >
              {STEPS.map((step) => (
                <StepCard key={step.number} {...step} />
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── What you receive ──────────────────────────────────────────── */}
        <section id="incluido" className="py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">

              {/* Left */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={stagger}
              >
                <motion.div variants={fadeInUp} className="mb-7">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-4
                    text-xs font-bold rounded-full
                    bg-white/70 dark:bg-white/5 backdrop-blur-md
                    border border-blue-100 dark:border-blue-700/40
                    text-blue-700 dark:text-blue-400 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 flex-shrink-0" />
                    O que está incluso
                  </span>
                  <h2
                    className="text-3xl sm:text-4xl font-extrabold tracking-tight
                      text-blue-900 dark:text-blue-100 mb-3"
                  >
                    O que você vai receber
                  </h2>
                  <p className="text-base text-gray-600 dark:text-gray-200 leading-relaxed">
                    Uma entrega integrada: coleta e laudo laboratorial pelo LAB,
                    relatório comentado gerado pela empresa parceira Oria.
                  </p>
                </motion.div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {FEATURES.map((f) => (
                    <FeatureCard key={f.title} {...f} />
                  ))}
                </div>
              </motion.div>

              {/* Right – ORIA Mockup with glassmorphism + glow */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                aria-label="Simulação do relatório ORIA"
                className="relative"
              >
                {/* Glow */}
                <div
                  className="absolute -inset-4 bg-gradient-to-r from-blue-500/10
                    to-indigo-500/10 rounded-3xl blur-2xl -z-10"
                />

                <div
                  className="bg-gradient-to-br from-white to-blue-50/60
                    dark:from-gray-800 dark:to-gray-800/80
                    rounded-3xl border border-blue-100/50 dark:border-gray-700
                    p-6 sm:p-8 min-h-80 relative overflow-hidden"
                >
                  {/* Decorative blob */}
                  <div
                    className="absolute -bottom-16 -right-16 w-52 h-52
                      bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-2xl
                      pointer-events-none"
                  />

                  {/* Glass card */}
                  <div
                    className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl
                      rounded-2xl p-5 border border-slate-200/50 dark:border-gray-700/50
                      shadow-xl shadow-slate-900/8 dark:shadow-black/20"
                  >
                    <div
                      className="flex items-center justify-between border-b border-gray-100
                        dark:border-gray-700 pb-4 mb-4"
                    >
                      <strong className="text-sm font-bold text-blue-900 dark:text-blue-300">
                        Relatório comentado
                      </strong>
                      <span
                        className="px-2 py-1 text-xs font-bold
                          bg-green-100 dark:bg-green-900/30
                          text-green-800 dark:text-green-400 rounded-full"
                      >
                        Preventivo
                      </span>
                    </div>

                    {METRICS.map((m) => (
                      <MetricBar key={m.label} label={m.label} value={m.value} />
                    ))}

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
                      Um guia educativo para ajudar o participante a compreender os
                      exames e chegar mais preparado à consulta médica.
                    </p>

                    {/* Powered by ORIA */}
                    <div className="flex justify-end mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60">
                      <img
                        src="/assets/POWERED-ORIA-WM.png"
                        alt="Powered by ORIA"
                        className="h-6 w-auto opacity-90 dark:hidden select-none"
                        draggable={false}
                      />
                      <img
                        src="/assets/POWERED-ORIA-DM.png"
                        alt="Powered by ORIA"
                        className="h-6 w-auto opacity-90 hidden dark:block select-none"
                        draggable={false}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Value Comparison Box ──────────────────────────────────────── */}
        <section className="py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
              className="bg-gradient-to-r from-blue-900 via-blue-700 to-indigo-800
                rounded-3xl p-8 grid sm:grid-cols-3 gap-6 sm:gap-0
                divide-y sm:divide-y-0 sm:divide-x divide-blue-800/40"
            >
              {[
                {
                  label: "Preço estimado no mercado",
                  value: "R$ 2.500",
                  striked: true,
                },
                { label: "Condição LAB para parceiros", value: "R$ 799,92" },
                { label: "Pagamento facilitado", value: "8x R$ 99,99" },
              ].map(({ label, value, striked }) => (
                <div key={label} className="text-center py-4 sm:py-0 px-6">
                  <small className="block text-blue-200 text-xs mb-2">{label}</small>
                  <strong
                    className={`text-4xl sm:text-5xl font-extrabold tracking-tight
                      leading-none text-white ${striked ? "line-through opacity-60" : ""}`}
                  >
                    {value}
                  </strong>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Exams ─────────────────────────────────────────────────────── */}
        <section id="exames" className="py-16 md:py-20
          bg-gradient-to-b from-white via-slate-50/60 to-white
          dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Section header */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeInUp}
              className="max-w-2xl mx-auto text-center mb-10"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-4
                text-xs font-bold rounded-full
                bg-white/70 dark:bg-white/5 backdrop-blur-md
                border border-blue-100 dark:border-blue-700/40
                text-blue-700 dark:text-blue-400 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 flex-shrink-0" />
                Painel laboratorial completo
              </span>
              <h2
                className="text-3xl sm:text-4xl font-extrabold tracking-tight
                  text-blue-900 dark:text-blue-100 mb-3"
              >
                +50 marcadores laboratoriais incluídos no pacote
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-200 leading-relaxed">
                O pacote contempla uma seleção ampla de exames de fácil coleta, com
                foco em prevenção e acompanhamento geral. Foram retirados exames de
                coleta prolongada para manter a experiência simples para o participante.
              </p>
            </motion.div>

            {/* ── Search bar ──────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
              className="max-w-xl mx-auto mb-8"
            >
              <div className="relative group">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4
                    text-gray-400 dark:text-gray-500
                    group-focus-within:text-blue-500 transition-colors duration-200"
                />
                <input
                  type="search"
                  value={examSearch}
                  onChange={(e) => setExamSearch(e.target.value)}
                  placeholder="Pesquisar exame ou categoria…"
                  aria-label="Pesquisar exames"
                  className="w-full pl-11 pr-10 py-3
                    bg-white dark:bg-gray-800
                    border border-gray-200 dark:border-gray-700
                    rounded-2xl shadow-sm
                    text-sm text-gray-800 dark:text-gray-100
                    placeholder:text-gray-400 dark:placeholder:text-gray-500
                    focus:outline-none focus:ring-2 focus:ring-blue-500/30
                    focus:border-blue-400 dark:focus:border-blue-500
                    transition-all duration-200"
                />
                <AnimatePresence>
                  {examSearch && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => setExamSearch("")}
                      aria-label="Limpar pesquisa"
                      className="absolute right-3 top-1/2 -translate-y-1/2
                        w-6 h-6 flex items-center justify-center rounded-full
                        bg-gray-100 dark:bg-gray-700
                        hover:bg-gray-200 dark:hover:bg-gray-600
                        text-gray-500 dark:text-gray-400 transition-colors duration-150"
                    >
                      <X className="w-3 h-3" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Results count */}
              <AnimatePresence mode="wait">
                {examSearch && (
                  <motion.p
                    key="results"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2.5"
                  >
                    {(() => {
                      const q = examSearch.toLowerCase().trim();
                      const totalItems = EXAM_GROUPS.flatMap((g) => g.items).filter(
                        (item) => item.toLowerCase().includes(q)
                      ).length;
                      const totalGroups = EXAM_GROUPS.filter(
                        (g) =>
                          g.title.toLowerCase().includes(q) ||
                          g.items.some((i) => i.toLowerCase().includes(q))
                      ).length;
                      return totalItems === 0
                        ? "Nenhum exame encontrado."
                        : `${totalItems} exame${totalItems !== 1 ? "s" : ""} em ${totalGroups} categoria${totalGroups !== 1 ? "s" : ""}`;
                    })()}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ── Cards grid ──────────────────────────────────────────────── */}
            {(() => {
              const q = examSearch.toLowerCase().trim();
              const filtered = EXAM_GROUPS.map((g, i) => ({
                ...g,
                colorIndex: i,
                items: q
                  ? g.items.filter(
                      (item) =>
                        item.toLowerCase().includes(q) ||
                        g.title.toLowerCase().includes(q)
                    )
                  : g.items,
              })).filter((g) => g.items.length > 0);

              return (
                <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
                  <AnimatePresence mode="popLayout">
                    {filtered.length > 0 ? (
                      filtered.map((group) => (
                        <motion.div
                          key={group.title}
                          layout
                          initial={{ opacity: 0, scale: 0.94 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.22, ease: "easeOut" }}
                        >
                          <ExamCard
                            title={group.title}
                            items={group.items}
                            colorIndex={group.colorIndex}
                            query={q}
                          />
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="col-span-full flex flex-col items-center gap-3 py-16
                          text-gray-400 dark:text-gray-500"
                      >
                        <Search className="w-10 h-10 opacity-30" />
                        <p className="text-sm">Nenhum exame encontrado para <strong className="text-gray-600 dark:text-gray-300">&ldquo;{examSearch}&rdquo;</strong></p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })()}
          </div>
        </section>

        {/* ── Partners ──────────────────────────────────────────────────── */}
        <section
          className="py-16 md:py-20
            bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-10"
            >
              <h2
                className="text-3xl sm:text-4xl font-extrabold tracking-tight
                  text-white mb-3"
              >
                Primeiro, um cuidado especial para os colaboradores dos parceiros.
              </h2>
              <p className="text-base text-blue-200 max-w-2xl mx-auto leading-relaxed">
                Esta etapa inicial foi criada para beneficiar quem faz parte da equipe
                dos nossos parceiros. Depois da validação do modelo, a iniciativa poderá
                ser aberta aos pacientes desses parceiros.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {PARTNER_CARDS.map((card) => (
                <PartnerCard key={card.title} {...card} />
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Disclaimer ────────────────────────────────────────────────── */}
        <section className="py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="relative overflow-hidden rounded-2xl
                bg-white/60 dark:bg-white/[0.03]
                backdrop-blur-xl
                border border-white/80 dark:border-white/10
                shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]
                p-6 sm:p-8"
            >
              {/* Subtle ambient glow */}
              <div className="pointer-events-none absolute -top-12 -right-12 w-40 h-40
                rounded-full bg-amber-300/20 dark:bg-amber-500/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-8 -left-8 w-28 h-28
                rounded-full bg-orange-200/20 dark:bg-orange-500/10 blur-2xl" />

              <div className="relative flex items-start gap-4">
                {/* Icon chip */}
                <div className="shrink-0 mt-0.5 flex items-center justify-center w-10 h-10 rounded-xl
                  bg-amber-100/80 dark:bg-amber-900/40
                  border border-amber-200/60 dark:border-amber-700/30
                  shadow-sm">
                  <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Label pill */}
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 mb-2
                    rounded-full text-[10px] font-bold tracking-widest uppercase
                    bg-amber-100/70 dark:bg-amber-900/40
                    border border-amber-200/60 dark:border-amber-700/30
                    text-amber-700 dark:text-amber-400">
                    <span className="w-1 h-1 rounded-full bg-amber-500 dark:bg-amber-400" />
                    Aviso importante
                  </span>

                  <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100
                    leading-snug tracking-tight mb-2">
                    Este serviço não substitui consulta médica.
                  </h2>

                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    O LAB Cuidado Preventivo para Parceiros tem finalidade informativa,
                    educativa e de apoio à organização dos resultados laboratoriais. A
                    conversa conduzida pelo LAB&nbsp;
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      não é consulta médica
                    </span>
                    &nbsp;e não substitui diagnóstico, prescrição, tratamento ou
                    acompanhamento individualizado por profissional habilitado.
                    Em caso de sintomas ou dúvidas clínicas, procure seu médico.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        <section id="faq" className="py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-10"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-4
                text-xs font-bold rounded-full
                bg-white/70 dark:bg-white/5 backdrop-blur-md
                border border-blue-100 dark:border-blue-700/40
                text-blue-700 dark:text-blue-400 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 flex-shrink-0" />
                Dúvidas comuns
              </span>
              <h2
                className="text-3xl sm:text-4xl font-extrabold tracking-tight
                  text-blue-900 dark:text-blue-100"
              >
                Perguntas frequentes
              </h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="space-y-3"
            >
              {FAQ_ITEMS.map((item, i) => (
                <motion.div key={i} variants={fadeInUp}>
                  <FAQItem
                    item={item}
                    isOpen={openFAQ === i}
                    onToggle={() => setOpenFAQ(openFAQ === i ? null : i)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────────────── */}
        <section
          id="contato"
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
                Entre na lista de espera
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-base text-blue-200 mb-8 leading-relaxed"
              >
                {vagasEsgotadas
                  ? "Todas as vagas foram preenchidas. Acompanhe nossas redes para novidades."
                  : "Garanta agora uma das 50 vagas com essa condição especial. Suba até o topo da página, preencha o formulário e dê o primeiro passo."}
              </motion.p>
              <motion.a
                variants={fadeInUp}
                href="#top"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white
                  text-blue-900 font-bold rounded-xl
                  hover:bg-blue-50 hover:-translate-y-0.5
                  transition-all duration-200 shadow-lg shadow-blue-900/25"
              >
                <ArrowUp className="w-4 h-4" />
                Voltar ao formulário
              </motion.a>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-8">
        <div
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8
            flex flex-wrap justify-between gap-4 text-sm"
        >
          <span>© LAB Cuidado Preventivo para Parceiros</span>
          <span>
            Lista de espera · {TOTAL_VAGAS} vagas iniciais para colaboradores de parceiros LAB
          </span>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pt-5
          border-t border-gray-800 dark:border-gray-800
          flex items-center justify-center">
          <img
            src="/assets/POWERED-ORIA-DM.png"
            alt="Powered by ORIA"
            className="h-6 w-auto opacity-90 hover:opacity-90 transition-opacity duration-200 dark:hidden select-none"
            draggable={false}
          />
          <img
            src="/assets/POWERED-ORIA-DM.png"
            alt="Powered by ORIA"
            className="h-6 w-auto opacity-90 hover:opacity-90 transition-opacity duration-200 hidden dark:block select-none"
            draggable={false}
          />
        </div>
      </footer>
    </div>
  );
}
