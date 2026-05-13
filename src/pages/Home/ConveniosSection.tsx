/**
 * ConveniosSection.tsx — Insurance/convenio directory with:
 *   - Search input that filters logos (by alt text) or plan names
 *   - 5 accordion categories
 *   - Logo grid (Setor Público, Setor Privado) + text lists (GEAP, Bradesco, Notre Dame)
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, X } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

// Logos served from /assets/convenios/N.png
interface LogoItem { id: number; name: string }
interface TextItem { name: string }

interface CategoryLogo {
  type: "logos";
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  logos: LogoItem[];
}

interface CategoryText {
  type: "text";
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  logo?: number; // representative logo image number
  items: TextItem[];
}

type Category = CategoryLogo | CategoryText;

const CATEGORIES: Category[] = [
  {
    type: "logos",
    id: "publico",
    emoji: "🏛️",
    title: "Setor Público",
    subtitle: "18 convênios",
    logos: [
      { id: 6, name: "Convênio Público 6" },
      { id: 8, name: "Convênio Público 8" },
      { id: 18, name: "Convênio Público 18" },
      { id: 19, name: "Convênio Público 19" },
      { id: 15, name: "Convênio Público 15" },
      { id: 16, name: "Convênio Público 16" },
      { id: 7, name: "Convênio Público 7" },
      { id: 45, name: "GEAP" },
      { id: 24, name: "Convênio Público 24" },
      { id: 37, name: "Convênio Público 37" },
      { id: 38, name: "Convênio Público 38" },
      { id: 29, name: "Convênio Público 29" },
      { id: 32, name: "Convênio Público 32" },
      { id: 33, name: "Convênio Público 33" },
      { id: 34, name: "Convênio Público 34" },
      { id: 40, name: "Convênio Público 40" },
      { id: 41, name: "Convênio Público 41" },
      { id: 44, name: "Convênio Público 44" },
    ],
  },
  {
    type: "logos",
    id: "privado",
    emoji: "💼",
    title: "Setor Privado",
    subtitle: "22 convênios",
    logos: [
      { id: 1, name: "Convênio Privado 1" },
      { id: 2, name: "Convênio Privado 2" },
      { id: 3, name: "Convênio Privado 3" },
      { id: 4, name: "Convênio Privado 4" },
      { id: 5, name: "Convênio Privado 5" },
      { id: 9, name: "Bradesco Saúde" },
      { id: 10, name: "Convênio Privado 10" },
      { id: 11, name: "Convênio Privado 11" },
      { id: 12, name: "Convênio Privado 12" },
      { id: 13, name: "Convênio Privado 13" },
      { id: 17, name: "Convênio Privado 17" },
      { id: 20, name: "Convênio Privado 20" },
      { id: 21, name: "Convênio Privado 21" },
      { id: 22, name: "Convênio Privado 22" },
      { id: 23, name: "Convênio Privado 23" },
      { id: 25, name: "Convênio Privado 25" },
      { id: 26, name: "Convênio Privado 26" },
      { id: 27, name: "Convênio Privado 27" },
      { id: 28, name: "Convênio Privado 28" },
      { id: 30, name: "Convênio Privado 30" },
      { id: 31, name: "Convênio Privado 31" },
      { id: 46, name: "Notre Dame" },
    ],
  },
  {
    type: "text",
    id: "geap",
    emoji: "🏥",
    title: "Planos GEAP",
    subtitle: "7 planos",
    logo: 45,
    items: [
      { name: "GEAPESSENCIAL" },
      { name: "GEAPREFERÊNCIA" },
      { name: "GEAPCLÁSSICO" },
      { name: "GEAPSAÚDE E" },
      { name: "GEAPSAÚDE VIDA" },
      { name: "GEAP REFERÊNCIA VIDA" },
      { name: "GEAP REFERÊNCIA VIDA II" },
    ],
  },
  {
    type: "text",
    id: "bradesco",
    emoji: "💳",
    title: "Planos Bradesco Saúde",
    subtitle: "16 planos",
    logo: 9,
    items: [
      { name: "ADVANCE GPA" },
      { name: "PREMIUM PLUS" },
      { name: "ADVANCE 600" },
      { name: "ADVANCE 700" },
      { name: "ADVANCE PLUS" },
      { name: "NATIONAL PLUS" },
      { name: "NATIONAL FLEX" },
      { name: "NATIONAL PLUS MED" },
      { name: "NATIONAL PLUS PLUS" },
      { name: "REDE NACIONAL" },
      { name: "REDE NACIONAL PLUS" },
      { name: "EMPRESARIAL MASTER" },
      { name: "EMPRESARIAL PLUS" },
      { name: "PERSONAL MASTER" },
      { name: "PERSONAL PLUS" },
      { name: "TOP NACIONAL" },
    ],
  },
  {
    type: "text",
    id: "notredame",
    emoji: "🩺",
    title: "Planos Notre Dame",
    subtitle: "22 planos",
    logo: 46,
    items: [
      { name: "NDS 115" },
      { name: "NDS 125" },
      { name: "NDS 135" },
      { name: "NDS 145" },
      { name: "NDS 155" },
      { name: "NDS 165" },
      { name: "NDS 170" },
      { name: "NDS 175" },
      { name: "NDS 180" },
      { name: "NDS 185" },
      { name: "NDS 190" },
      { name: "NDS STANDART" },
      { name: "NDS ESPECIAL" },
      { name: "NDS ESPECIAL PLUS" },
      { name: "NDS PREMIUM" },
      { name: "NDS PREMIUM PLUS" },
      { name: "NDS PLATINUM" },
      { name: "NDS PLATINUM PLUS" },
      { name: "NDS DIAMOND" },
      { name: "NDS DIAMOND PLUS" },
      { name: "NDS MASTER" },
      { name: "NDS MASTER PLUS" },
    ],
  },
];

// ─── Variants ─────────────────────────────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

// ─── Accordion item ───────────────────────────────────────────────────────────
const AccordionItem: React.FC<{ cat: Category; query: string }> = ({ cat, query }) => {
  const [open, setOpen] = useState(false);

  // Apply search filter
  const filteredLogos =
    cat.type === "logos"
      ? cat.logos.filter((l) => l.name.toLowerCase().includes(query.toLowerCase()))
      : [];
  const filteredItems =
    cat.type === "text"
      ? cat.items.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()))
      : [];

  const hasResults = cat.type === "logos" ? filteredLogos.length > 0 : filteredItems.length > 0;

  // Auto-open when search has results
  const shouldOpen = query.length > 0 ? hasResults : open;

  return (
    <div className="border border-gray-100 dark:border-gray-700/60 rounded-2xl overflow-hidden">
      <button
        onClick={() => !query && setOpen((p) => !p)}
        aria-expanded={shouldOpen}
        className="w-full flex items-center justify-between px-5 py-4 text-left
          hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors duration-150"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">{cat.emoji}</span>
          <div>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100 block">
              {cat.title}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{cat.subtitle}</span>
          </div>
        </div>
        <motion.div animate={{ rotate: shouldOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-blue-500" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {shouldOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-3 border-t border-gray-100 dark:border-gray-700/40">
              {/* Logo grid */}
              {cat.type === "logos" && (
                filteredLogos.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                    {filteredLogos.map((logo) => (
                      <div
                        key={logo.id}
                        className="aspect-[3/2] rounded-lg bg-gray-50 dark:bg-gray-700/40
                          flex items-center justify-center p-1.5
                          border border-gray-100 dark:border-gray-700/60"
                      >
                        <img
                          src={`/assets/convenios/${logo.id}.png`}
                          alt={logo.name}
                          className="max-h-full max-w-full object-contain"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500 py-2">
                    Nenhum convênio encontrado para "{query}".
                  </p>
                )
              )}

              {/* Text + representative logo */}
              {cat.type === "text" && (
                <div className="flex gap-6 items-start">
                  {cat.logo && (
                    <div className="hidden sm:flex w-16 h-16 rounded-xl bg-gray-50 dark:bg-gray-700/40
                      items-center justify-center border border-gray-100 dark:border-gray-700/60 shrink-0 p-1.5">
                      <img
                        src={`/assets/convenios/${cat.logo}.png`}
                        alt={cat.title}
                        className="max-h-full max-w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    {filteredItems.length > 0 ? (
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {filteredItems.map((item) => (
                          <li key={item.name} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                            {item.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-400 dark:text-gray-500 py-2">
                        Nenhum plano encontrado para "{query}".
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function ConveniosSection() {
  const [query, setQuery] = useState("");
  const trimmed = query.trim();

  // Show total match count when searching
  const matchCount = useMemo(() => {
    if (!trimmed) return 0;
    let total = 0;
    for (const cat of CATEGORIES) {
      if (cat.type === "logos") {
        total += cat.logos.filter((l) => l.name.toLowerCase().includes(trimmed.toLowerCase())).length;
      } else {
        total += cat.items.filter((i) => i.name.toLowerCase().includes(trimmed.toLowerCase())).length;
      }
    }
    return total;
  }, [trimmed]);

  return (
    <section
      id="convenios"
      className="py-16 md:py-20
        bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20
        dark:from-gray-900 dark:via-gray-900 dark:to-gray-900"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

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
            className="inline-block px-4 py-1.5 text-xs font-semibold
              text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-3
              border border-blue-100 dark:border-blue-800/40"
          >
            Parcerias
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight
              text-gray-900 dark:text-gray-100 mb-3"
          >
            Convênios Aceitos
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Trabalhamos com os principais convênios e planos de saúde do mercado.
          </motion.p>
        </motion.div>

        {/* Search input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="relative max-w-md mx-auto mb-8"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar convênio ou plano..."
            aria-label="Buscar convênio"
            className="w-full pl-10 pr-10 py-3 rounded-xl text-sm
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              text-gray-900 dark:text-gray-100
              placeholder-gray-400 dark:placeholder-gray-500
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
              focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-900
              shadow-sm"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Limpar busca"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600
                dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {trimmed && (
            <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
              {matchCount} resultado{matchCount !== 1 ? "s" : ""} para "{trimmed}"
            </p>
          )}
        </motion.div>

        {/* Accordion categories */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
          className="space-y-3"
        >
          {CATEGORIES.map((cat) => (
            <motion.div key={cat.id} variants={fadeInUp}>
              <AccordionItem cat={cat} query={trimmed} />
            </motion.div>
          ))}
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400"
        >
          Lista sujeita a alterações. Em caso de dúvidas, entre em{" "}
          <a href="#contato" className="text-blue-600 dark:text-blue-400 underline underline-offset-2">
            contato
          </a>{" "}
          conosco.
        </motion.p>
      </div>
    </section>
  );
}
