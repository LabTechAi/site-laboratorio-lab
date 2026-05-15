import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, CheckCircle, AlertCircle, Microscope, Send,
  ShieldCheck, Clock,
} from "lucide-react";
import { supabase } from "../supabaseClient";

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  numero_exame: string;
  mensagem: string;
}

const INITIAL: FormData = {
  nome: "",
  email: "",
  telefone: "",
  numero_exame: "",
  mensagem: "",
};

// ── Floating Label Input ──────────────────────────────────────────────────────
interface FloatingInputProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  optional?: boolean;
  autoComplete?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function FloatingInput({
  id, name, label, type = "text", required, optional, autoComplete, value, onChange,
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="
          w-full px-4 pt-6 pb-2.5 rounded-xl text-sm
          border border-slate-200/80 dark:border-gray-600/60
          bg-white/60 dark:bg-gray-800/60
          text-slate-800 dark:text-gray-100
          focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/70
          hover:border-slate-300 dark:hover:border-gray-500
          transition-all duration-200
        "
      />
      <label
        htmlFor={id}
        className={`
          absolute left-4 pointer-events-none font-medium transition-all duration-200
          ${lifted
            ? "top-2 text-[10px] text-blue-600 dark:text-blue-400"
            : "top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-gray-500"
          }
        `}
      >
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
        {optional && (
          <span className="ml-1.5 text-[10px] font-normal text-slate-400 dark:text-gray-500">
            (opcional)
          </span>
        )}
      </label>
    </div>
  );
}

// ── Floating Label Textarea ───────────────────────────────────────────────────
interface FloatingTextareaProps {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

function FloatingTextarea({ id, name, label, required, value, onChange }: FloatingTextareaProps) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div className="relative">
      <textarea
        id={id}
        name={name}
        required={required}
        rows={4}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="
          w-full px-4 pt-7 pb-3 rounded-xl text-sm resize-none
          border border-slate-200/80 dark:border-gray-600/60
          bg-white/60 dark:bg-gray-800/60
          text-slate-800 dark:text-gray-100
          focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/70
          hover:border-slate-300 dark:hover:border-gray-500
          transition-all duration-200
        "
      />
      <label
        htmlFor={id}
        className={`
          absolute left-4 pointer-events-none font-medium transition-all duration-200
          ${lifted
            ? "top-2.5 text-[10px] text-blue-600 dark:text-blue-400"
            : "top-4 text-sm text-slate-400 dark:text-gray-500"
          }
        `}
      >
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
    </div>
  );
}

// ── Animation variants ────────────────────────────────────────────────────────
const panelVariants = {
  hidden: { opacity: 0, scale: 0.97, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit:   { opacity: 0, scale: 0.97, y: -6, transition: { duration: 0.2 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const fieldVariants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length > 6) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length > 2) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length > 0) return `(${d}`;
  return "";
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PathologistConsultationForm() {
  const [form, setForm]         = useState<FormData>(INITIAL);
  const [sending, setSending]   = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  }

  function handlePhone(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, telefone: formatPhone(e.target.value) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);

    const { error: dbError } = await supabase
      .from("pathologist_consultations")
      .insert({
        nome:         form.nome.trim(),
        email:        form.email.trim().toLowerCase(),
        telefone:     form.telefone.trim(),
        numero_exame: form.numero_exame.trim() || null,
        mensagem:     form.mensagem.trim(),
      });

    setSending(false);

    if (dbError) {
      setError("Não foi possível enviar sua solicitação. Tente novamente em instantes.");
      return;
    }

    setIsSubmitted(true);
    setForm(INITIAL);
  }

  return (
    <div className="w-full">
      {/* ── Glassmorphism Card ── */}
      <div className="
        bg-white/80 dark:bg-gray-900/80
        backdrop-blur-2xl
        rounded-2xl
        shadow-2xl shadow-blue-900/15
        border border-white/20 dark:border-gray-700/50
        overflow-hidden
      ">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 ring-1 ring-white/20">
            <Microscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight tracking-tight">
              Fale com um Patologista
            </h2>
            <p className="text-xs text-blue-100/80 mt-0.5">
              Envie sua dúvida com segurança e sigilo absoluto.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <AnimatePresence mode="wait">

            {/* ── Success State ── */}
            {isSubmitted ? (
              <motion.div
                key="success"
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-col items-center justify-center gap-5 py-10 text-center"
              >
                {/* Spring-pop CheckCircle */}
                <motion.div
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
                  className="
                    w-20 h-20 rounded-full
                    bg-gradient-to-br from-green-50 to-emerald-100
                    dark:from-green-900/30 dark:to-emerald-900/20
                    flex items-center justify-center
                    ring-4 ring-green-200/60 dark:ring-green-700/30
                    shadow-lg shadow-green-500/20
                  "
                >
                  <CheckCircle className="w-10 h-10 text-green-500 dark:text-green-400" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                >
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                    Solicitação enviada com sucesso!
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
                    Nossa equipe médica recebeu sua dúvida e entrará em contato em até 24h úteis.
                  </p>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => setIsSubmitted(false)}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline transition-colors"
                >
                  Enviar outra solicitação
                </motion.button>
              </motion.div>

            ) : (
              /* ── Form State ── */
              <motion.form
                key="form"
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={handleSubmit}
                noValidate
              >
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {/* Row 1: Nome + Email */}
                  <motion.div variants={fieldVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FloatingInput
                      id="pc-nome"
                      name="nome"
                      label="Nome Completo"
                      required
                      autoComplete="name"
                      value={form.nome}
                      onChange={handleChange}
                    />
                    <FloatingInput
                      id="pc-email"
                      name="email"
                      label="E-mail"
                      type="email"
                      required
                      autoComplete="email"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </motion.div>

                  {/* Row 2: Telefone + Número do Exame */}
                  <motion.div variants={fieldVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FloatingInput
                      id="pc-telefone"
                      name="telefone"
                      label="Telefone"
                      type="tel"
                      required
                      autoComplete="tel"
                      value={form.telefone}
                      onChange={handlePhone}
                    />
                    <FloatingInput
                      id="pc-numero-exame"
                      name="numero_exame"
                      label="Número do Exame"
                      optional
                      value={form.numero_exame}
                      onChange={handleChange}
                    />
                  </motion.div>

                  {/* Row 3: Mensagem */}
                  <motion.div variants={fieldVariants}>
                    <FloatingTextarea
                      id="pc-mensagem"
                      name="mensagem"
                      label="Sua dúvida"
                      required
                      value={form.mensagem}
                      onChange={handleChange}
                    />
                  </motion.div>

                  {/* Trust Badges */}
                  <motion.div variants={fieldVariants} className="flex flex-col sm:flex-row gap-2 pt-0.5">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                      <ShieldCheck className="w-3.5 h-3.5 text-green-500/80 shrink-0" />
                      Ambiente seguro e confidencial
                    </span>
                    <span className="hidden sm:block text-gray-200 dark:text-gray-700 select-none">·</span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                      <Clock className="w-3.5 h-3.5 text-blue-500/80 shrink-0" />
                      Retorno prioritário.
                    </span>
                  </motion.div>

                  {/* Error banner */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="
                          flex items-center gap-2.5 px-4 py-3 rounded-xl
                          bg-red-50 dark:bg-red-900/20
                          border border-red-200/60 dark:border-red-800/40
                          text-red-600 dark:text-red-400 text-sm
                        "
                      >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit button with shimmer */}
                  <motion.div variants={fieldVariants} className="pt-1">
                    <motion.button
                      type="submit"
                      disabled={sending}
                      whileHover={sending ? {} : { scale: 1.015 }}
                      whileTap={sending ? {} : { scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="
                        relative w-full overflow-hidden
                        px-5 py-3.5 rounded-xl
                        font-semibold text-sm text-white
                        disabled:opacity-60 disabled:cursor-not-allowed
                        shadow-lg shadow-blue-600/30
                      "
                    >
                      {/* Gradient base */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-700 to-indigo-800" />

                      {/* Perpetual shimmer sweep */}
                      {!sending && (
                        <motion.div
                          className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12"
                          style={{
                            background:
                              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%)",
                          }}
                          animate={{ left: ["-40%", "140%"] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1.4,
                            ease: "easeInOut",
                          }}
                        />
                      )}

                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {sending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Enviar Dúvida
                          </>
                        )}
                      </span>
                    </motion.button>
                  </motion.div>
                </motion.div>
              </motion.form>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
