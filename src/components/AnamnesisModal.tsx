/**
 * AnamnesisModal.tsx — Formulário iterativo de anamnese (3 etapas)
 *
 * Etapa 1: Identificação e Perfil  (e-mail, nome, data nasc., estado civil)
 * Etapa 2: Objetivos e Expectativas (objetivo de saúde, importância)
 * Etapa 3: Histórico e Métricas    (métricas corporais, condições, plano)
 *
 * Features:
 * – Floating labels premium em todos os campos
 * – Slide animations entre etapas (AnimatePresence + custom direction)
 * – Barra de progresso animada (gradient blue->indigo)
 * – Integração Supabase -> tabela collaborator_anamnesis
 * – Loading (Loader2) + tela de sucesso (spring pop CheckCircle)
 * – Bottom-sheet mobile / dialog desktop
 * – Body scroll lock, Esc close, a11y focus management
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  X,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { supabase } from "../supabaseClient";

// ─── Types & Constants ────────────────────────────────────────────────────

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface FormState {
  // Etapa 1
  email: string;
  nome: string;
  dataNascimento: string;
  estadoCivil: string;
  // Etapa 2
  objetivo: string;
  importancia: string;
  // Etapa 3
  peso: string;
  altura: string;
  gordura: string;
  condicoesSaude: string;
  hasPlano: boolean | null;
}

const INITIAL: FormState = {
  email: "",
  nome: "",
  dataNascimento: "",
  estadoCivil: "",
  objetivo: "",
  importancia: "",
  peso: "",
  altura: "",
  gordura: "",
  condicoesSaude: "",
  hasPlano: null,
};

const STEPS = [
  { label: "Identificação", heading: "Identificação e Perfil" },
  { label: "Objetivos",     heading: "Objetivos e Expectativas" },
  { label: "Histórico",     heading: "Histórico e Métricas" },
] as const;

const ESTADO_CIVIL_OPTIONS = [
  { value: "solteiro",   label: "Solteiro(a)" },
  { value: "casado",     label: "Casado(a) / União estável" },
  { value: "divorciado", label: "Divorciado(a) / Separado(a)" },
  { value: "viuvo",      label: "Viúvo(a)" },
];

const PLANO_OPTIONS: { label: string; value: boolean }[] = [
  { label: "Sim, possuo", value: true },
  { label: "Não possuo",  value: false },
];

// ─── Floating field helpers ────────────────────────────────────────────────

function fieldCls(focused: boolean, hasError: boolean) {
  return [
    "w-full px-4 pt-6 pb-2.5 rounded-xl border text-sm outline-none",
    "bg-white dark:bg-gray-800",
    "text-gray-900 dark:text-gray-100",
    "transition-all duration-200 caret-blue-500",
    hasError
      ? "border-red-400 dark:border-red-500 ring-1 ring-red-400/30"
      : focused
        ? "border-blue-400 dark:border-blue-500 ring-2 ring-blue-500/20"
        : "border-slate-200 dark:border-gray-600 hover:border-slate-300 dark:hover:border-gray-500",
  ].join(" ");
}

function floatLabelCls(floated: boolean) {
  return [
    "absolute left-4 pointer-events-none select-none transition-all duration-200 leading-none font-medium",
    floated
      ? "top-2.5 text-[10px] text-blue-600 dark:text-blue-400"
      : "top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500",
  ].join(" ");
}

// ─── FInput ───────────────────────────────────────────────────────────────

interface FInputProps {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  error?: string;
  inputRef?: React.RefObject<HTMLInputElement>;
}

const FInput: React.FC<FInputProps> = ({
  id, label, type = "text", required, value, onChange, autoComplete, error, inputRef,
}) => {
  const [focused, setFocused] = useState(false);
  // date inputs always show browser placeholder text -> always float label
  const floated = focused || value.length > 0 || type === "date";
  return (
    <div>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type={type}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={fieldCls(focused, !!error)}
        />
        <label htmlFor={id} className={floatLabelCls(floated)}>
          {label}{required && " *"}
        </label>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500 dark:text-red-400 pl-1">{error}</p>
      )}
    </div>
  );
};

// ─── FTextarea ────────────────────────────────────────────────────────────

interface FTextareaProps {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
  error?: string;
}

const FTextarea: React.FC<FTextareaProps> = ({
  id, label, required, value, onChange, rows = 3, hint, error,
}) => {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;
  return (
    <div>
      <div className="relative">
        <textarea
          id={id}
          required={required}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={[fieldCls(focused, !!error), "resize-none"].join(" ")}
        />
        <label
          htmlFor={id}
          className={[
            "absolute left-4 pointer-events-none select-none transition-all duration-200 leading-none font-medium",
            floated
              ? "top-2.5 text-[10px] text-blue-600 dark:text-blue-400"
              : "top-4 text-sm text-gray-400 dark:text-gray-500",
          ].join(" ")}
        >
          {label}{required && " *"}
        </label>
      </div>
      {hint && !error && (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 pl-1">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-500 dark:text-red-400 pl-1">{error}</p>
      )}
    </div>
  );
};

// ─── DateDropdown (Dia / Mês / Ano selects estilizados) ───────────────────

const MONTHS_PT = [
  { v: "01", l: "Janeiro" },  { v: "02", l: "Fevereiro" },
  { v: "03", l: "Março" },    { v: "04", l: "Abril" },
  { v: "05", l: "Maio" },     { v: "06", l: "Junho" },
  { v: "07", l: "Julho" },    { v: "08", l: "Agosto" },
  { v: "09", l: "Setembro" }, { v: "10", l: "Outubro" },
  { v: "11", l: "Novembro" }, { v: "12", l: "Dezembro" },
];

const CURRENT_YEAR = new Date().getFullYear();
const BIRTH_YEARS  = Array.from({ length: 85 }, (_, i) => CURRENT_YEAR - 15 - i);
const DAYS_LIST    = Array.from({ length: 31 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
);

interface DateDropdownProps {
  value: string;   // "YYYY-MM-DD" or ""
  onChange: (v: string) => void;
  required?: boolean;
  error?: string;
}

const DateDropdown: React.FC<DateDropdownProps> = ({ value, onChange, required, error }) => {
  const [day,   setDay]   = useState(value ? value.slice(8, 10) : "");
  const [month, setMonth] = useState(value ? value.slice(5, 7)  : "");
  const [year,  setYear]  = useState(value ? value.slice(0, 4)  : "");

  // Reset internal state when parent clears the value (e.g., form reset)
  useEffect(() => {
    if (!value) { setDay(""); setMonth(""); setYear(""); }
  }, [value]);

  const commit = (d: string, m: string, y: string) => {
    onChange(d && m && y ? `${y}-${m}-${d}` : "");
  };

  const selCls = (hasVal: boolean) =>
    [
      "w-full pl-3 pr-8 py-3 rounded-xl border text-sm outline-none appearance-none cursor-pointer",
      "bg-white dark:bg-gray-800",
      "transition-all duration-200",
      hasVal ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-500",
      error
        ? "border-red-400 dark:border-red-500 ring-1 ring-red-400/30"
        : "border-slate-200 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
    ].join(" ");

  return (
    <div>
      <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">
        Data de Nascimento{required && " *"}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {/* Dia */}
        <div className="relative">
          <select
            value={day}
            onChange={(e) => { const v = e.target.value; setDay(v); commit(v, month, year); }}
            aria-label="Dia de nascimento"
            className={selCls(!!day)}
          >
            <option value="">Dia</option>
            {DAYS_LIST.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>

        {/* Mês */}
        <div className="relative">
          <select
            value={month}
            onChange={(e) => { const v = e.target.value; setMonth(v); commit(day, v, year); }}
            aria-label="Mês de nascimento"
            className={selCls(!!month)}
          >
            <option value="">Mês</option>
            {MONTHS_PT.map(({ v, l }) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>

        {/* Ano */}
        <div className="relative">
          <select
            value={year}
            onChange={(e) => { const v = e.target.value; setYear(v); commit(day, month, v); }}
            aria-label="Ano de nascimento"
            className={selCls(!!year)}
          >
            <option value="">Ano</option>
            {BIRTH_YEARS.map((y) => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500 dark:text-red-400 pl-1">{error}</p>
      )}
    </div>
  );
};

// ─── Step slide variants ──────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? "-40%" : "40%",
    opacity: 0,
    transition: { duration: 0.22, ease: "easeIn" },
  }),
};

// ─── Main Component ───────────────────────────────────────────────────────

export default function AnamnesisModal({ isOpen, onClose }: Props) {
  const shouldReduceMotion = useReducedMotion();

  const [step, setStep]               = useState(0);
  const [dir, setDir]                 = useState(1);
  const [form, setForm]               = useState<FormState>(INITIAL);
  const [errors, setErrors]           = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);
  const firstRef   = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const patch = useCallback(
    <K extends keyof FormState>(k: K, v: FormState[K]) =>
      setForm((p) => ({ ...p, [k]: v })),
    [],
  );

  const clearErr = useCallback(
    (k: keyof FormState) =>
      setErrors((p) => { const n = { ...p }; delete n[k]; return n; }),
    [],
  );

  // Focus: first input on open
  useEffect(() => {
    if (isOpen && !submitted) {
      const t = setTimeout(() => firstRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [isOpen, submitted]);

  // Focus: success area
  useEffect(() => {
    if (submitted) {
      const t = setTimeout(() => successRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [submitted]);

  // Scroll content to top on step change
  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [step]);

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  // Reset state after close animation finishes
  useEffect(() => {
    if (isOpen) return;
    const t = setTimeout(() => {
      setStep(0); setDir(1); setForm(INITIAL);
      setErrors({}); setSubmitted(false); setSubmitting(false); setSubmitError(null);
    }, 320);
    return () => clearTimeout(t);
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  // ── Validation ──────────────────────────────────────────────────────────

  const validate = (s: number): Partial<Record<keyof FormState, string>> => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (s === 0) {
      if (!form.email.trim())
        e.email = "E-mail obrigatório.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        e.email = "E-mail inválido.";
      if (!form.nome.trim())     e.nome = "Nome completo obrigatório.";
      if (!form.dataNascimento) {
        e.dataNascimento = "Data de nascimento obrigatória.";
      } else {
        const [y, m, d] = form.dataNascimento.split("-").map(Number);
        const dt = new Date(y, m - 1, d);
        if (dt.getFullYear() !== y || dt.getMonth() + 1 !== m || dt.getDate() !== d) {
          e.dataNascimento = "Data inválida. Verifique o dia e mês informados.";
        }
      }
      if (!form.estadoCivil)     e.estadoCivil = "Selecione seu estado civil.";
    }
    if (s === 1) {
      if (!form.objetivo.trim())    e.objetivo = "Por favor, descreva seu objetivo.";
      if (!form.importancia.trim()) e.importancia = "Por favor, preencha este campo.";
    }
    if (s === 2) {
      if (form.hasPlano === null) e.hasPlano = "Por favor, selecione uma opção.";
    }
    return e;
  };

  const goNext = () => {
    const e = validate(step);
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setDir(1); setStep((s) => s + 1);
  };

  const goPrev = () => {
    setErrors({}); setDir(-1); setStep((s) => s - 1);
  };

  // ── Submit ──────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(2);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const metricasParts = [
        form.peso.trim()    ? `Peso: ${form.peso.trim()} kg`      : null,
        form.altura.trim()  ? `Altura: ${form.altura.trim()} cm`  : null,
        form.gordura.trim() ? `Gordura: ${form.gordura.trim()}%`  : null,
      ].filter(Boolean);
      const metricasStr = metricasParts.length > 0 ? metricasParts.join(" | ") : null;
      const { error } = await supabase.from("collaborator_anamnesis").insert([
        {
          email:                    form.email.trim(),
          nome_completo:            form.nome.trim(),
          data_nascimento:          form.dataNascimento,
          estado_civil:             form.estadoCivil,
          objetivo_saude:           form.objetivo.trim(),
          importancia_participacao: form.importancia.trim(),
          metricas_corporais:       metricasStr,
          condicoes_saude:          form.condicoesSaude.trim() || null,
          possui_plano_saude:       form.hasPlano,
        },
      ]);
      if (error) throw new Error(error.message);
      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : "Erro ao enviar. Tente novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Animation variants ──────────────────────────────────────────────────

  const backdropV = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.22 } },
    exit:    { opacity: 0, transition: { duration: 0.2 } },
  };

  const panelV = shouldReduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        hidden:  { opacity: 0, y: 32, scale: 0.97 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] } },
        exit:    { opacity: 0, y: 18, scale: 0.97, transition: { duration: 0.2, ease: "easeIn" } },
      };

  const popIn = {
    hidden:  { scale: 0.3, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: "spring", damping: 9, stiffness: 280 } },
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="anamnesis-bd"
            variants={backdropV}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm"
            aria-hidden="true"
            onClick={onClose}
          />

          {/* Panel wrapper */}
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
            <motion.div
              key="anamnesis-panel"
              variants={panelV}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="dialog"
              aria-modal="true"
              aria-labelledby="anamnesis-title"
              onClick={(e) => e.stopPropagation()}
              className="
                pointer-events-auto relative
                w-full sm:max-w-xl
                bg-white dark:bg-gray-900
                rounded-t-3xl sm:rounded-2xl
                shadow-2xl shadow-black/25
                max-h-[94dvh] flex flex-col
              "
            >
              {/* Drag handle - mobile only */}
              <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                aria-label="Fechar modal"
                className="
                  absolute top-4 right-4 z-20
                  w-8 h-8 flex items-center justify-center rounded-full
                  bg-gray-100 dark:bg-gray-800
                  text-gray-500 dark:text-gray-400
                  hover:bg-gray-200 dark:hover:bg-gray-700
                  transition-colors duration-150
                "
              >
                <X className="w-4 h-4" />
              </button>

              {/* ── Success overlay ────────────────────────────────────── */}
              <AnimatePresence>
                {submitted && (
                  <motion.div
                    key="success"
                    ref={successRef}
                    tabIndex={-1}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="
                      absolute inset-0 z-10
                      rounded-t-3xl sm:rounded-2xl
                      bg-white dark:bg-gray-900
                      flex flex-col items-center justify-center
                      gap-5 p-8 text-center outline-none
                    "
                  >
                    <motion.div
                      variants={popIn}
                      initial="hidden"
                      animate="visible"
                      className="
                        w-20 h-20 rounded-full
                        bg-green-100 dark:bg-green-900/30
                        flex items-center justify-center
                      "
                    >
                      <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
                        Respostas enviadas!
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
                        Nossa equipe analisará sua anamnese e entrará em contato em breve
                        para confirmar sua participação no projeto piloto.
                      </p>
                    </motion.div>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.35 }}
                      className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                      Seus dados são estritamente confidenciais.
                    </motion.p>

                    <motion.button
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 }}
                      onClick={onClose}
                      className="
                        px-8 py-2.5 rounded-xl
                        bg-gradient-to-r from-blue-500 to-blue-600
                        text-white font-semibold text-sm
                        hover:from-blue-600 hover:to-blue-700
                        transition-colors duration-200
                      "
                    >
                      Concluir
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Form ──────────────────────────────────────────────── */}
              <form
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-col flex-1 overflow-hidden"
              >
                {/* Scrollable content */}
                <div
                  ref={contentRef}
                  className="flex-1 overflow-y-auto px-6 sm:px-8 pt-5 pb-4 sm:pt-7"
                >
                  {/* Header */}
                  <div className="mb-1 pr-8">
                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-0.5">
                      Etapa {step + 1} de {STEPS.length}
                    </p>
                    <h2
                      id="anamnesis-title"
                      className="text-xl font-extrabold text-gray-900 dark:text-gray-100"
                    >
                      {STEPS[step].heading}
                    </h2>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-4 mb-5">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                      animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.45, ease: "easeOut" }}
                    />
                  </div>

                  {/* Step tabs */}
                  <div className="flex gap-1 mb-6">
                    {STEPS.map((s, i) => (
                      <div
                        key={s.label}
                        className={[
                          "flex-1 flex items-center justify-center py-1.5 rounded-lg",
                          "text-[10px] font-semibold transition-all duration-300",
                          i < step
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                            : i === step
                              ? "bg-blue-500 text-white shadow-sm"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600",
                        ].join(" ")}
                      >
                        {i + 1} · {s.label}
                      </div>
                    ))}
                  </div>

                  {/* Sliding step content */}
                  <div className="overflow-hidden">
                    <AnimatePresence mode="wait" custom={dir}>
                      <motion.div
                        key={step}
                        custom={dir}
                        variants={shouldReduceMotion ? {} : slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="space-y-4"
                      >

                        {/* ─── Etapa 1 ──────────────────────────────── */}
                        {step === 0 && (
                          <>
                            <FInput
                              id="an-email"
                              label="E-mail"
                              type="email"
                              required
                              autoComplete="email"
                              value={form.email}
                              error={errors.email}
                              inputRef={firstRef}
                              onChange={(v) => { patch("email", v); clearErr("email"); }}
                            />
                            <FInput
                              id="an-nome"
                              label="Nome completo"
                              required
                              autoComplete="name"
                              value={form.nome}
                              error={errors.nome}
                              onChange={(v) => { patch("nome", v); clearErr("nome"); }}
                            />
                            <DateDropdown
                              required
                              value={form.dataNascimento}
                              error={errors.dataNascimento}
                              onChange={(v) => { patch("dataNascimento", v); clearErr("dataNascimento"); }}
                            />

                            {/* Estado Civil */}
                            <div>
                              <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">
                                Estado Civil *
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                {ESTADO_CIVIL_OPTIONS.map(({ value, label }) => (
                                  <button
                                    key={value}
                                    type="button"
                                    onClick={() => { patch("estadoCivil", value); clearErr("estadoCivil"); }}
                                    aria-pressed={form.estadoCivil === value}
                                    className={[
                                      "py-2.5 px-3 rounded-xl border text-xs font-medium text-left leading-snug",
                                      "transition-all duration-200",
                                      form.estadoCivil === value
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm"
                                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-300 dark:hover:border-blue-700",
                                    ].join(" ")}
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>
                              {errors.estadoCivil && (
                                <p className="mt-1 text-xs text-red-500 dark:text-red-400 pl-1">
                                  {errors.estadoCivil}
                                </p>
                              )}
                            </div>
                          </>
                        )}

                        {/* ─── Etapa 2 ──────────────────────────────── */}
                        {step === 1 && (
                          <>
                            <FTextarea
                              id="an-obj"
                              label="Qual o seu maior desejo ou objetivo relacionado à sua saúde?"
                              required
                              rows={4}
                              value={form.objetivo}
                              error={errors.objetivo}
                              onChange={(v) => { patch("objetivo", v); clearErr("objetivo"); }}
                            />
                            <FTextarea
                              id="an-imp"
                              label="Por que sua participação neste projeto é importante?"
                              required
                              rows={4}
                              hint="Conte o que espera aprender, melhorar ou alcançar com o programa."
                              value={form.importancia}
                              error={errors.importancia}
                              onChange={(v) => { patch("importancia", v); clearErr("importancia"); }}
                            />
                          </>
                        )}

                        {/* ─── Etapa 3 ──────────────────────────────── */}
                        {step === 2 && (
                          <>
                            <div>
                              <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">
                                Métricas Corporais{" "}
                                <span className="text-gray-400 dark:text-gray-500 normal-case tracking-normal font-normal">
                                  (opcional)
                                </span>
                              </p>
                              <div className="grid grid-cols-3 gap-2">
                                <FInput
                                  id="an-peso"
                                  label="Peso (kg)"
                                  value={form.peso}
                                  onChange={(v) => patch("peso", v)}
                                />
                                <FInput
                                  id="an-altura"
                                  label="Altura (cm)"
                                  value={form.altura}
                                  onChange={(v) => patch("altura", v)}
                                />
                                <FInput
                                  id="an-gordura"
                                  label="Gordura (%)"
                                  value={form.gordura}
                                  onChange={(v) => patch("gordura", v)}
                                />
                              </div>
                              <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500 pl-1">
                                Informe apenas os valores numéricos.
                              </p>
                            </div>
                            <FTextarea
                              id="an-cond"
                              label="Condições de Saúde"
                              rows={3}
                              hint="Existe alguma condição ou diagnóstico que devemos saber? Ex.: hipertensão, diabetes, ansiedade..."
                              value={form.condicoesSaude}
                              onChange={(v) => patch("condicoesSaude", v)}
                            />

                            {/* Plano de saúde */}
                            <div>
                              <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">
                                Você possui plano de saúde? *
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                {PLANO_OPTIONS.map(({ label, value }) => (
                                  <button
                                    key={String(value)}
                                    type="button"
                                    onClick={() => { patch("hasPlano", value); clearErr("hasPlano"); }}
                                    aria-pressed={form.hasPlano === value}
                                    className={[
                                      "py-2.5 px-3 rounded-xl border text-sm font-medium",
                                      "transition-all duration-200",
                                      form.hasPlano === value
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm"
                                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-300 dark:hover:border-blue-700",
                                    ].join(" ")}
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>

                              {/* Conditional hints based on plan selection */}
                              <AnimatePresence>
                                {form.hasPlano === true && (
                                  <motion.div
                                    key="plan-yes"
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="
                                      overflow-hidden flex items-start gap-2 text-xs
                                      text-green-700 dark:text-green-400
                                      bg-green-50 dark:bg-green-900/20
                                      border border-green-100 dark:border-green-800/40
                                      rounded-lg px-3 py-2.5
                                    "
                                  >
                                    <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-green-500" />
                                    <span>
                                      A realização dos exames será feita através da{" "}
                                      <strong>cobertura do próprio plano do colaborador</strong>.
                                    </span>
                                  </motion.div>
                                )}
                                {form.hasPlano === false && (
                                  <motion.p
                                    key="plan-no"
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="
                                      overflow-hidden text-xs
                                      text-indigo-700 dark:text-indigo-400
                                      bg-indigo-50 dark:bg-indigo-900/20
                                      border border-indigo-100 dark:border-indigo-800/40
                                      rounded-lg px-3 py-2
                                    "
                                  >
                                    Sem plano: investimento de{" "}
                                    <strong>R$ 300,00</strong> em até{" "}
                                    <strong>10x de R$ 30,00</strong>.
                                  </motion.p>
                                )}
                              </AnimatePresence>

                              {errors.hasPlano && (
                                <p className="mt-1 text-xs text-red-500 dark:text-red-400 pl-1">
                                  {errors.hasPlano}
                                </p>
                              )}
                            </div>
                          </>
                        )}

                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Submit error */}
                  <AnimatePresence>
                    {submitError && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        role="alert"
                        className="
                          mt-4 text-xs text-red-600 dark:text-red-400 text-center
                          bg-red-50 dark:bg-red-900/20
                          border border-red-200 dark:border-red-800/40
                          rounded-lg px-3 py-2
                        "
                      >
                        {submitError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Sticky footer - navigation */}
                <div className="shrink-0 border-t border-gray-100 dark:border-gray-800 px-6 sm:px-8 py-4">
                  <div className="flex items-center justify-between gap-3">

                    {/* Back */}
                    {step > 0 ? (
                      <motion.button
                        type="button"
                        onClick={goPrev}
                        whileHover={shouldReduceMotion ? {} : { x: -2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 24 }}
                        className="
                          flex items-center gap-2 px-4 py-2.5 rounded-xl
                          text-sm font-semibold
                          text-gray-600 dark:text-gray-300
                          hover:bg-gray-100 dark:hover:bg-gray-800
                          transition-colors duration-150
                        "
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Anterior
                      </motion.button>
                    ) : (
                      <div />
                    )}

                    {/* Next or Submit */}
                    {step < STEPS.length - 1 ? (
                      <motion.button
                        type="button"
                        onClick={goNext}
                        whileHover={shouldReduceMotion ? {} : { scale: 1.02, x: 2 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 400, damping: 24 }}
                        className="
                          flex items-center gap-2 px-6 py-2.5 rounded-xl
                          bg-gradient-to-r from-blue-500 to-blue-600
                          text-white font-bold text-sm
                          shadow-md shadow-blue-500/25
                          hover:from-blue-600 hover:to-blue-700
                          transition-colors duration-200
                        "
                      >
                        Próximo
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    ) : (
                      <motion.button
                        type="submit"
                        disabled={submitting}
                        whileHover={submitting || shouldReduceMotion ? {} : { scale: 1.02 }}
                        whileTap={submitting ? {} : { scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 400, damping: 24 }}
                        className="
                          flex items-center gap-2 px-6 py-2.5 rounded-xl
                          bg-gradient-to-r from-blue-500 to-blue-600
                          text-white font-bold text-sm
                          shadow-md shadow-blue-500/25
                          hover:from-blue-600 hover:to-blue-700
                          disabled:opacity-60 disabled:cursor-not-allowed
                          transition-colors duration-200
                        "
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            Enviar minhas respostas
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>

                  {/* Privacy note */}
                  <p className="flex items-center justify-center gap-1.5 mt-3 text-xs text-gray-400 dark:text-gray-500">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-green-500" />
                    Suas respostas são estritamente confidenciais.
                  </p>
                </div>
              </form>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}