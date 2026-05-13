/**
 * HelpCenter.tsx — Central de ajuda do LAB com busca, categorias e FAQ accordion.
 * Renderizado dentro do modal do FloatingHelpButton.
 * Design system: Tailwind + paleta blue/indigo do projeto.
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  Search,
  X,
  ChevronDown,
  Calendar,
  FileText,
  Activity,
  CreditCard,
  MapPin,
  Filter,
  MessageCircle,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { helpCategories, helpFaqs, type HelpCategory, type HelpFAQ } from "./helpData";

// ── Icon map ─────────────────────────────────────────────────────────────────
const ICON_MAP: Record<HelpCategory["icon"], LucideIcon> = {
  calendar: Calendar,
  "file-text": FileText,
  activity: Activity,
  "credit-card": CreditCard,
  "map-pin": MapPin,
};

// ── Category Card ─────────────────────────────────────────────────────────────
function CategoryCard({
  category,
  isActive,
  onClick,
}: {
  category: HelpCategory;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = ICON_MAP[category.icon];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`relative group flex flex-col items-center gap-2.5 rounded-2xl border-2 p-4
        transition-all duration-300 text-center w-full
        focus-visible:ring-2 focus-visible:ring-blue-500
        ${isActive
          ? "border-blue-600 bg-blue-600/5 dark:bg-blue-600/10 shadow-lg shadow-blue-600/15"
          : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/60 hover:border-blue-400 hover:shadow-md"
        }`}
    >
      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center
          transition-all duration-300
          ${isActive
            ? "bg-blue-600 text-white"
            : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50"
          }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className={`text-xs font-semibold leading-tight transition-colors duration-200
          ${isActive
            ? "text-blue-700 dark:text-blue-300"
            : "text-gray-800 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300"
          }`}>
          {category.title}
        </p>
        <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
          {category.description}
        </p>
      </div>
      {isActive && (
        <div className="absolute -bottom-px left-1/2 -translate-x-1/2 h-0.5 w-10 rounded-full bg-blue-600" />
      )}
    </button>
  );
}

// ── FAQ Accordion Item ────────────────────────────────────────────────────────
function FaqItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: HelpFAQ;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-700/60 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`hc-faq-${faq.id}`}
        className="w-full flex items-center justify-between px-5 py-4 text-left
          hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors duration-150"
      >
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 pr-4 leading-snug">
          {faq.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-blue-500" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`hc-faq-${faq.id}`}
            role="region"
            aria-label={faq.question}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 pt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed
              border-t border-gray-100 dark:border-gray-700/40">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main HelpCenter ───────────────────────────────────────────────────────────
interface HelpCenterProps {
  onClose?: () => void;
}

export function HelpCenter({ onClose }: HelpCenterProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    let list = helpFaqs;
    if (activeCategory) list = list.filter((f) => f.category === activeCategory);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
      );
    }
    return list;
  }, [query, activeCategory]);

  function handleCategoryClick(id: string) {
    setActiveCategory((prev) => (prev === id ? null : id));
    setQuery("");
    setOpenFaqId(null);
  }

  function handleSearch(val: string) {
    setQuery(val);
    setActiveCategory(null);
    setOpenFaqId(null);
  }

  function clearFilters() {
    setQuery("");
    setActiveCategory(null);
    setOpenFaqId(null);
  }

  const activeCat = helpCategories.find((c) => c.id === activeCategory);

  const sectionTitle = activeCategory
    ? `Perguntas sobre ${activeCat?.title}`
    : query
    ? "Resultados da busca"
    : "Perguntas Frequentes";

  return (
    <div className="w-full bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/30
      dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 mb-4
            text-xs font-semibold rounded-full
            text-blue-700 dark:text-blue-300
            bg-blue-50 dark:bg-blue-900/30
            border border-blue-100 dark:border-blue-800/40">
            <HelpCircle className="w-3.5 h-3.5" />
            Central de Ajuda
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight
            text-gray-900 dark:text-gray-100 mb-3">
            Como podemos ajudar?
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Encontre respostas sobre agendamentos, resultados, exames, convênios e nossas unidades.
          </p>
        </div>

        {/* ── Search ─────────────────────────────────────────────────────── */}
        <div className="mb-8 relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5
            text-gray-400 dark:text-gray-500 pointer-events-none" aria-hidden />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar perguntas..."
            aria-label="Buscar perguntas"
            className="w-full pl-12 pr-12 py-3.5 rounded-2xl
              border-2 border-gray-200 dark:border-gray-600
              bg-white dark:bg-gray-800 shadow-sm
              text-sm text-gray-700 dark:text-gray-100
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
              transition-all duration-200"
          />
          {query && (
            <button
              type="button"
              onClick={() => handleSearch("")}
              aria-label="Limpar busca"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full
                flex items-center justify-center
                text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30
                transition-all duration-150"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Active filter bar ───────────────────────────────────────────── */}
        {(query || activeCategory) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 max-w-2xl mx-auto flex items-center justify-between gap-3
              rounded-xl px-4 py-3
              bg-blue-50 dark:bg-blue-900/20
              border border-blue-100 dark:border-blue-800/40"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-800 dark:text-blue-200">
              <Filter className="w-4 h-4 shrink-0" />
              {filtered.length}{" "}
              {filtered.length === 1 ? "resultado encontrado" : "resultados encontrados"}
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400
                hover:text-blue-800 dark:hover:text-blue-200
                underline underline-offset-2 transition-colors duration-150"
            >
              Limpar filtros
            </button>
          </motion.div>
        )}

        {/* ── Category Cards ──────────────────────────────────────────────── */}
        {!query && (
          <div className="mb-10">
            <p className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">
              Ou filtre por categoria
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {helpCategories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  isActive={activeCategory === cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── FAQ List ────────────────────────────────────────────────────── */}
        <div>
          <p className="text-center text-lg font-bold text-gray-800 dark:text-gray-100 mb-6">
            {sectionTitle}
          </p>

          {filtered.length > 0 ? (
            <div className="max-w-3xl mx-auto space-y-3">
              {filtered.map((faq) => (
                <FaqItem
                  key={faq.id}
                  faq={faq}
                  isOpen={openFaqId === faq.id}
                  onToggle={() => setOpenFaqId((prev) => (prev === faq.id ? null : faq.id))}
                />
              ))}
            </div>
          ) : (
            <div className="max-w-xl mx-auto rounded-2xl border-2 border-dashed
              border-gray-200 dark:border-gray-600
              bg-white dark:bg-gray-800/60 p-10 text-center">
              <HelpCircle className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                Nenhuma pergunta encontrada para &ldquo;{query}&rdquo;
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Tente outros termos ou navegue pelas categorias
              </p>
            </div>
          )}
        </div>

        {/* ── Support CTA ─────────────────────────────────────────────────── */}
        <div className="mt-10 max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-5 rounded-2xl
            border-2 border-dashed border-blue-200 dark:border-blue-800/40
            bg-blue-50/60 dark:bg-blue-900/10 p-6 text-center sm:text-left">
            <div className="w-14 h-14 shrink-0 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700
              flex items-center justify-center shadow-md shadow-blue-600/20">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Ainda tem dúvidas?
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                Nossa equipe está pronta para ajudar
              </p>
            </div>
            <a
              href="/#contato"
              onClick={onClose}
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                text-sm font-semibold text-white
                bg-gradient-to-r from-blue-600 to-blue-700
                hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-0.5
                shadow-md shadow-blue-500/20 transition-all duration-200
                focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Fale Conosco
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
