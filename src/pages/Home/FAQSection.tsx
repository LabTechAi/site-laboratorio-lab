/**
 * FAQSection.tsx — 4-item accordion frequently asked questions.
 * AnimatePresence handles smooth expand/collapse.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQ {
  q: string;
  a: string;
}

const FAQS: FAQ[] = [
  {
    q: "Preciso agendar para fazer exames?",
    a: "Sim, recomendamos o agendamento prévio para garantir seu atendimento no horário desejado e reduzir o tempo de espera. O agendamento pode ser feito por telefone ou WhatsApp. Em caso de urgência, entre em contato e verificaremos a disponibilidade para atendimento imediato.",
  },
  {
    q: "Qual o prazo para receber os resultados?",
    a: "O prazo varia de acordo com o tipo de exame. Exames de rotina de análises clínicas ficam prontos em 24 a 48 horas. Exames de anatomia patológica e biologia molecular podem levar de 3 a 10 dias úteis, dependendo da complexidade. Você será informado sobre o prazo no momento da coleta.",
  },
  {
    q: "Como faço para retirar os resultados?",
    a: "Os resultados podem ser retirados presencialmente em qualquer uma das nossas unidades mediante apresentação de documento com foto e protocolo do exame. Também disponibilizamos acesso online pelo Portal do Paciente (Meu Espaço Saúde), onde você pode visualizar e baixar seus laudos com segurança.",
  },
  {
    q: "Trabalham com todos os tipos de convênio?",
    a: "Trabalhamos com os principais convênios do mercado, incluindo planos do setor público, setor privado, GEAP, Bradesco Saúde e Notre Dame Intermédica. Consulte nossa lista completa de convênios na seção acima. Também atendemos por ordem de serviço e particular.",
  },
];

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
const FAQItem: React.FC<{ faq: FAQ; index: number }> = ({ faq, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 dark:border-gray-700/60 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
        id={`faq-btn-${index}`}
        aria-controls={`faq-panel-${index}`}
        className="w-full flex items-center justify-between px-5 py-4 text-left
          hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors duration-150"
      >
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 pr-4 leading-snug">
          {faq.q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-blue-500" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`faq-panel-${index}`}
            role="region"
            aria-labelledby={`faq-btn-${index}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 pt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed
              border-t border-gray-100 dark:border-gray-700/40">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function FAQSection() {
  return (
    <section
      id="faq"
      className="py-16 md:py-20
        bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/30
        dark:from-gray-900 dark:via-gray-900 dark:to-gray-900"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={stagger}
          className="text-center mb-10"
        >
          <motion.span
            variants={fadeInUp}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold
              text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-3
              border border-blue-100 dark:border-blue-800/40"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Dúvidas Frequentes
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight
              text-gray-900 dark:text-gray-100 mb-3"
          >
            Perguntas Frequentes
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-base text-gray-600 dark:text-gray-400">
            Respostas para as dúvidas mais comuns dos nossos pacientes.
          </motion.p>
        </motion.div>

        {/* FAQ accordion */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
          className="space-y-3"
        >
          {FAQS.map((faq, i) => (
            <motion.div key={i} variants={fadeInUp}>
              <FAQItem faq={faq} index={i} />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-10 text-center"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Tem outra dúvida? Entre em contato diretamente com a equipe LAB.
          </p>
          <a
            href="#contato"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
              text-white bg-gradient-to-r from-blue-600 to-blue-700
              hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-0.5
              shadow-md shadow-blue-500/20 transition-all duration-200
              focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Fale Conosco
          </a>
        </motion.div>
      </div>
    </section>
  );
}
