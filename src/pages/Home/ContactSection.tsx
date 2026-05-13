/**
 * ContactSection.tsx — Contact details with WhatsApp / Instagram / LinkedIn,
 * portal de resultados, and "Fale com o Patologista" button.
 */

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, ExternalLink, MessageCircle } from "lucide-react";

// WhatsApp and Instagram SVG icons
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

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
export default function ContactSection() {
  return (
    <section
      id="contato"
      className="py-16 md:py-20
        bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900
        dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

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
              text-blue-200 bg-white/10 rounded-full mb-3 border border-white/20"
          >
            Atendimento
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3"
          >
            Entre em Contato
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-blue-200 text-base max-w-xl mx-auto">
            Estamos prontos para atender você. Escolha o canal de sua preferência.
          </motion.p>
        </motion.div>

        {/* Content grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Contact info card */}
          <motion.div
            variants={fadeInUp}
            className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-7 space-y-5"
          >
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">
              Informações de Contato
            </h3>

            <div className="space-y-4">
              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-blue-300" />
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-300 mb-0.5">Endereço Principal</p>
                  <p className="text-sm text-white/90">BL E – SHLS 716 Sul, Brasília – DF</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-blue-300" />
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-300 mb-0.5">Telefone</p>
                  <a
                    href="tel:+556133455500"
                    className="text-sm text-white/90 hover:text-white transition-colors"
                  >
                    (61) 3345-5500
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-blue-300" />
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-300 mb-0.5">E-mail</p>
                  <a
                    href="mailto:contato@laboratoriolab.com.br"
                    className="text-sm text-white/90 hover:text-white transition-colors break-all"
                  >
                    contato@laboratoriolab.com.br
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-blue-300" />
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-300 mb-0.5">Horário de Atendimento</p>
                  <p className="text-sm text-white/90">Segunda a Sexta: 07h30 às 18h30</p>
                </div>
              </div>
            </div>

            {/* Social icons */}
            <div>
              <p className="text-xs font-medium text-blue-300 mb-3">Redes Sociais</p>
              <div className="flex gap-3">
                <a
                  href="https://wa.me/556133455500"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp LAB"
                  className="w-9 h-9 rounded-lg bg-green-500/80 hover:bg-green-500 text-white
                    flex items-center justify-center transition-colors duration-200"
                >
                  <WhatsAppIcon />
                </a>
                <a
                  href="https://www.instagram.com/laboratorioolab"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram LAB"
                  className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500 to-yellow-400 text-white
                    flex items-center justify-center hover:opacity-90 transition-opacity duration-200"
                >
                  <InstagramIcon />
                </a>
                <a
                  href="https://www.linkedin.com/company/laboratorio-lab"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn LAB"
                  className="w-9 h-9 rounded-lg bg-blue-600 hover:bg-blue-500 text-white
                    flex items-center justify-center transition-colors duration-200"
                >
                  <LinkedInIcon />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Actions card */}
          <motion.div
            variants={fadeInUp}
            className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-7 flex flex-col gap-4"
          >
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">
              Acesso Rápido
            </h3>

            {/* Meu Espaço Saúde */}
            <a
              href="https://lab.aplis.inf.br"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white/10 hover:bg-white/20 rounded-xl p-4
                border border-white/20 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/60 flex items-center justify-center shrink-0">
                <ExternalLink className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white group-hover:text-blue-200 transition-colors">
                  Meu Espaço Saúde
                </p>
                <p className="text-xs text-blue-200/70 mt-0.5">Portal de resultados online</p>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-300/60 group-hover:text-blue-300 transition-colors" />
            </a>

            {/* Fale com o Patologista */}
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSd_patologista_form/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white/10 hover:bg-white/20 rounded-xl p-4
                border border-white/20 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-500/60 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white group-hover:text-blue-200 transition-colors">
                  Fale com o Patologista
                </p>
                <p className="text-xs text-blue-200/70 mt-0.5">Dúvidas técnicas sobre laudos</p>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-300/60 group-hover:text-blue-300 transition-colors" />
            </a>

            {/* WhatsApp CTA button */}
            <a
              href="https://wa.me/556133455500"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto flex items-center justify-center gap-2 w-full py-3 rounded-xl
                text-sm font-semibold text-white
                bg-gradient-to-r from-green-500 to-green-600
                hover:from-green-600 hover:to-green-700 hover:-translate-y-0.5
                shadow-lg shadow-green-500/20 transition-all duration-200
                focus-visible:ring-2 focus-visible:ring-white"
            >
              <WhatsAppIcon />
              Falar pelo WhatsApp
            </a>

            {/* Agendamento CTA */}
            <a
              href="tel:+556133455500"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                text-sm font-semibold text-white
                border-2 border-white/50 hover:border-white hover:bg-white/10
                transition-all duration-200 hover:-translate-y-0.5
                focus-visible:ring-2 focus-visible:ring-white"
            >
              <Phone className="w-4 h-4" />
              Ligar para Agendar
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
