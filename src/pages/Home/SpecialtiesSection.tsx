/**
 * SpecialtiesSection.tsx — 4 expandable specialty cards.
 *
 * Clicking a card expands it inline with AnimatePresence. Other cards collapse.
 * Uses whileHover microinteractions and the Design System card glass treatment.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, Microscope, Activity, BarChart3, X, ChevronDown } from "lucide-react";

interface Specialty {
  id: string;
  icon: React.ReactNode;
  title: string;
  shortDesc: string;
  longDesc: string;
  items: string[];
  color: string;
  iconBg: string;
}

const SPECIALTIES: Specialty[] = [
  {
    id: "biomol",
    icon: <FlaskConical className="w-6 h-6" />,
    title: "Biologia Molecular",
    shortDesc: "PCR em tempo real, diagnóstico de vírus, bactérias e mutações genéticas",
    longDesc:
      "Utilizamos técnicas de ponta em PCR em tempo real para diagnóstico preciso de doenças infecciosas, ISTs, mutações genéticas e rastreio oncológico.",
    items: [
      "Painéis HPV (Alto Risco, Baixo Risco, 21 e 28 tipos)",
      "Painéis IST (4 e 7 patógenos)",
      "Úlcera Genital, Cândida e Vaginose Bacteriana",
      "Microbioma Vaginal e Painel Lactobacillus",
      "Painel de Risco de Trombose (6 mutações)",
    ],
    color: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-50 dark:bg-blue-900/30",
  },
  {
    id: "cito",
    icon: <Microscope className="w-6 h-6" />,
    title: "Citopatologia",
    shortDesc: "Análise citológica, Papanicolau, citologia com base líquida",
    longDesc:
      "Realizamos análise morfológica celular para rastreio e diagnóstico de lesões pré-malignas e malignas, utilizando metodologias convencionais e de base líquida.",
    items: [
      "Citologia Anal",
      "Citologia Convencional",
      "Citologia com Base Líquida",
      "Citologia Geral e Hormonal",
      "Bacterioscopia (coloração de Gram)",
    ],
    color: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-50 dark:bg-indigo-900/30",
  },
  {
    id: "anapat",
    icon: <Activity className="w-6 h-6" />,
    title: "Anatomia Patológica",
    shortDesc: "Biópsias, peças cirúrgicas, dermatopatologia, uropatologia e ginecopatologia",
    longDesc:
      "Somos pioneiros em anatomia patológica no Distrito Federal. Analisamos tecidos para diagnóstico preciso de doenças, desde biópsias simples a peças cirúrgicas complexas.",
    items: [
      "Biópsias simples e complexas",
      "Peças cirúrgicas e ginecológicas",
      "Dermatopatologia",
      "Uropatologia",
      "Ginecopatologia",
    ],
    color: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-50 dark:bg-purple-900/30",
  },
  {
    id: "analises",
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Análises Clínicas",
    shortDesc: "Hematologia, bioquímica, imunologia, microbiologia, hormônios e marcadores tumorais",
    longDesc:
      "Mais de 200 exames de análises clínicas para monitoramento da saúde, diagnóstico de doenças e acompanhamento de tratamentos.",
    items: [
      "Bioquímica Clínica (26 exames)",
      "Hormônios (27 exames)",
      "Marcadores Tumorais (7 exames)",
      "Hematologia e Coagulação",
      "Sorologias e Imunologia (25 exames)",
      "Vitaminas, Minerais e Exames Especiais",
    ],
    color: "text-teal-600 dark:text-teal-400",
    iconBg: "bg-teal-50 dark:bg-teal-900/30",
  },
];

// ─── Variants ────────────────────────────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const expandVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: "auto", opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.22, ease: "easeIn" } },
};

// ─── Main component ──────────────────────────────────────────────────────────
export default function SpecialtiesSection() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section
      id="especialidades"
      className="py-16 md:py-20 bg-white dark:bg-gray-900"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={stagger}
          className="text-center mb-12"
        >
          <motion.span
            variants={fadeInUp}
            className="inline-block px-4 py-1.5 text-xs font-semibold
              text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-3
              border border-blue-100 dark:border-blue-800/40"
          >
            Nossa Expertise
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight
              text-gray-900 dark:text-gray-100 mb-3"
          >
            Especialidades
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Clique em uma especialidade para conhecer os exames disponíveis.
          </motion.p>
        </motion.div>

        {/* Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start"
        >
          {SPECIALTIES.map((sp) => {
            const isActive = activeId === sp.id;
            return (
              <motion.article
                key={sp.id}
                variants={fadeInUp}
                layout
                whileHover={isActive ? {} : { scale: 1.01, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className={`bg-white/90 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-sm
                  border transition-all duration-200 cursor-pointer overflow-hidden
                  ${
                    isActive
                      ? "border-blue-300 dark:border-blue-600 shadow-md shadow-blue-500/10"
                      : "border-gray-100 dark:border-gray-700/60 hover:shadow-md dark:hover:bg-gray-800/80"
                  }`}
                onClick={() => setActiveId(isActive ? null : sp.id)}
              >
                <div className="p-6">
                  {/* Icon + close */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${sp.iconBg} ${sp.color}
                      flex items-center justify-center shrink-0`}>
                      {sp.icon}
                    </div>
                    <motion.div
                      animate={{ rotate: isActive ? 180 : 0 }}
                      transition={{ duration: 0.22, ease: "easeInOut" }}
                      className="text-gray-400 dark:text-gray-500 mt-1"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </motion.div>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {sp.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {sp.shortDesc}
                  </p>
                </div>

                {/* Expanded content */}
                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.div
                      variants={expandVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-700/50 pt-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                          {sp.longDesc}
                        </p>
                        <ul className="space-y-2">
                          {sp.items.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200">
                              <span className={`w-1.5 h-1.5 rounded-full mt-[7px] flex-shrink-0 bg-current ${sp.color}`} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
