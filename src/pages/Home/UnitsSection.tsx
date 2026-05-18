/**
 * UnitsSection.tsx — 4 LAB unit cards each with address, hours and an embedded
 * Google Maps iframe.
 *
 * Cards are displayed in a 2-column grid (1-col on mobile).
 * Framer Motion stagger fade-in on viewport entry.
 */

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Phone } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
interface Unit {
  id: string;
  name: string;
  subtitle: string;
  address: string;
  hours: string;
  phone?: string;
  mapSrc: string;
}

const UNITS: Unit[] = [
  {
    id: "matriz",
    name: "Brasília Matriz",
    subtitle: "Unidade principal",
    address: "BL E – SHLS 716 Sul, Brasília – DF",
    hours: "Seg–Sex: 07h30 às 18h30",
    phone: "(61) 3345-3766",
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3839.471569847362!2d-47.92820708493872!3d-15.827589137828377!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x935bcca4c04be2b9%3A0x6c7aa4f39bfab54f!2sSHLS%20Ql%20716%2C%20Bras%C3%ADlia%20-%20DF!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr",
  },
  {
    id: "ecomed",
    name: "ECOMED – Dra. Vânia Daher",
    subtitle: "Lago Sul",
    address: "QI 3, Edifício Medical Plaza — Lago Sul, Brasília – DF",
    hours: "Seg–Sex: 07h30 às 17h00",
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3838.7914469485625!2d-47.917772324937946!3d-15.843089937804598!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x935bcc14debb1b1b%3A0x4a2af6a2c5e2c5d3!2sQI%203%20-%20Lago%20Sul%2C%20Bras%C3%ADlia%20-%20DF!5e0!3m2!1spt-BR!2sbr!4v1700000000001!5m2!1spt-BR!2sbr",
  },
  {
    id: "claf-taguatinga",
    name: "CLAF Taguatinga / Águas Claras",
    subtitle: "Taguatinga",
    address: "QS 03, Edifício Pátio Capital — Taguatinga, Brasília – DF",
    hours: "Seg–Sex: 07h00 às 17h00",
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3839.370667961846!2d-48.04665032493856!3d-15.829843637826766!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x935ec2f3c01bc123%3A0xb3bcb7e3d4e1a6c8!2sQS%2003%20-%20Taguatinga%2C%20Bras%C3%ADlia%20-%20DF!5e0!3m2!1spt-BR!2sbr!4v1700000000002!5m2!1spt-BR!2sbr",
  },
  {
    id: "claf-asa-sul",
    name: "Clínica CLAF Asa Sul",
    subtitle: "Asa Sul",
    address: "SHLS Quadra Conjunto L, Torre 1 — Asa Sul, Brasília – DF",
    hours: "Seg–Sex: 07h00 às 17h00",
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3839.482516775645!2d-47.930963724938726!3d-15.827384537828617!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x935bcca23ff84f91%3A0x3cba5daa1aee3f76!2sSHLS%20Asa%20Sul%2C%20Bras%C3%ADlia%20-%20DF!5e0!3m2!1spt-BR!2sbr!4v1700000000003!5m2!1spt-BR!2sbr",
  },
];

// ─── Variants ─────────────────────────────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function UnitsSection() {
  return (
    <section
      id="unidades"
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
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold
              text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-3
              border border-blue-100 dark:border-blue-800/40"
          >
            <MapPin className="w-3.5 h-3.5" />
            Localização
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight
              text-gray-900 dark:text-gray-100 mb-3"
          >
            Nossas Unidades
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Atendemos em 4 unidades estratégicas em Brasília para oferecer conveniência e acessibilidade.
          </motion.p>
        </motion.div>

        {/* Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {UNITS.map((unit) => (
            <motion.article
              key={unit.id}
              variants={fadeInUp}
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm
                border border-gray-100 dark:border-gray-700/60
                hover:shadow-lg transition-shadow duration-200"
            >
              {/* Map embed */}
              <div className="w-full h-52 bg-gray-100 dark:bg-gray-700 relative">
                <iframe
                  src={unit.mapSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Mapa da unidade ${unit.name}`}
                  className="absolute inset-0"
                />
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="mb-3">
                  <span className="inline-block px-2.5 py-0.5 text-xs font-medium
                    bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300
                    rounded-full mb-2">
                    {unit.subtitle}
                  </span>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {unit.name}
                  </h3>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                    <MapPin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <span>{unit.address}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>{unit.hours}</span>
                  </div>
                  {unit.phone && (
                    <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                      <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                      <a
                        href={`tel:${unit.phone.replace(/\D/g, "")}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {unit.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
