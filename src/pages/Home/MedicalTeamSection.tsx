/**
 * MedicalTeamSection.tsx
 * Dr. Gorini: card em destaque com foto real, glassmorphism e badge RT.
 * Demais médicos: cards simples compactos em grid 3-col.
 */

import React from "react";
import { motion } from "framer-motion";
import { Stethoscope, ShieldCheck } from "lucide-react";

interface Doctor {
  name: string;
  role: string;
  crm: string;
  rqe: string;
  initials: string;
}

const FEATURED: Doctor = {
  name: "Décio Fausto Gorini",
  role: "Responsável Técnico",
  crm: "1768",
  rqe: "925",
  initials: "DG",
};

const DOCTORS: Doctor[] = [
  { name: "Aline Marques dos Santos", role: "Patologista", crm: "15109", rqe: "12803", initials: "AM" },
  { name: "Aline de Fátima Filha Santos", role: "Patologista", crm: "22785", rqe: "17678", initials: "AF" },
  { name: "Kelson Rodrigues Carvalho", role: "Patologista", crm: "18516", rqe: "14345", initials: "KC" },
  { name: "Larissa Sena Teixeira Mendes", role: "Patologista", crm: "15750", rqe: "25354", initials: "LM" },
  { name: "Thiago José Fernandes", role: "Patologista", crm: "17911", rqe: "9729", initials: "TF" },
  { name: "Vinicius Barros Figueiredo", role: "Patologista", crm: "33722", rqe: "24508", initials: "VF" },
];

const GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-indigo-500 to-purple-600",
  "from-blue-600 to-cyan-500",
  "from-cyan-500 to-blue-600",
  "from-purple-500 to-indigo-600",
  "from-blue-700 to-indigo-500",
];

const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function MedicalTeamSection() {
  return (
    <section
      id="corpo-clinico"
      className="py-16 md:py-20
        bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30
        dark:from-gray-900 dark:via-gray-900 dark:to-gray-900"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={stagger}
          className="text-center mb-12"
        >
          <motion.span
            variants={fadeInUp}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold
              text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-3
              border border-blue-100 dark:border-blue-800/40"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            Equipe Especializada
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight
              text-gray-900 dark:text-gray-100 mb-3"
          >
            Nosso Corpo Clínico
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Profissionais altamente qualificados dedicados ao seu cuidado
          </motion.p>
        </motion.div>

        {/* ── Card em destaque: Dr. Gorini ─────────────────────────────── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="mb-8"
        >
          <motion.article
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="group relative max-w-2xl mx-auto rounded-3xl overflow-hidden
              bg-white/70 dark:bg-gray-800/60 backdrop-blur-[14px]
              border border-white/80 dark:border-white/10
              shadow-xl shadow-blue-900/8 dark:shadow-black/30
              hover:shadow-2xl hover:shadow-blue-500/12
              hover:border-blue-300/60 dark:hover:border-blue-500/40
              transition-all duration-300"
          >
            {/* Glow de fundo */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-500/0
              group-hover:from-blue-500/5 group-hover:to-indigo-500/5
              dark:group-hover:from-blue-500/8 dark:group-hover:to-indigo-500/8
              transition-all duration-500 pointer-events-none rounded-3xl" />

            <div className="relative flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8">
              {/* Foto */}
              <div className="relative shrink-0">
                <div className="w-48 sm:w-56 rounded-2xl overflow-hidden
                  ring-4 ring-blue-100 dark:ring-blue-900/60
                  shadow-lg shadow-blue-500/15">
                  <img
                    src="/assets/medicos/DR-GORINI-GOAT.jpg"
                    alt="Dr. Décio Fausto Gorini"
                    className="w-full h-auto object-cover block"
                  />
                </div>

              </div>

              {/* Info */}
              <div className="text-center sm:text-left">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
                  Responsável Técnico
                </p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">
                  Dr. {FEATURED.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Medicina Diagnóstica · Anatomia Patológica
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  <span className="px-3 py-1 rounded-lg text-xs font-medium
                    bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300
                    border border-blue-100 dark:border-blue-800/40">
                    CRM-DF {FEATURED.crm}
                  </span>
                  <span className="px-3 py-1 rounded-lg text-xs font-medium
                    bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300
                    border border-indigo-100 dark:border-indigo-800/40">
                    RQE {FEATURED.rqe}
                  </span>
                </div>
              </div>
            </div>
          </motion.article>
        </motion.div>

        {/* ── Grid dos demais patologistas ─────────────────────────────── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {DOCTORS.map((doc, idx) => (
            <motion.article
              key={doc.name}
              variants={fadeInUp}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="flex items-center gap-4 px-4 py-4 rounded-2xl cursor-default
                bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm
                border border-white/70 dark:border-white/8
                shadow-sm hover:shadow-md hover:border-blue-200/60 dark:hover:border-blue-800/40
                transition-all duration-200"
            >
              {/* Avatar iniciais */}
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]}
                  flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm`}
                aria-hidden="true"
              >
                {doc.initials}
              </div>

              {/* Info */}
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug">
                  {doc.name}
                </h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5 mb-1.5">{doc.role}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">
                  CRM-DF {doc.crm} · RQE {doc.rqe}
                </p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
