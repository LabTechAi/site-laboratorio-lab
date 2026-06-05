import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Check,
  Calendar,
  FileText,
  User,
  Stethoscope,
  Clock,
  FileHeart,
  ShieldCheck,
  Sun,
  Moon,
  HeartPulse,
  Activity,
} from "lucide-react";
import { supabase } from "../../supabaseClient";
import { supabaseDb } from "../../supabaseDbClient";
import { useTheme } from "../../context/ThemeContext";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface AnamnesisRow {
  id: string;
  nome_completo: string;
  data_nascimento: string;
  estado_civil: string;
  email: string;
  department: string | null;
  cpf: string | null;
}

interface PatientProfile {
  id: string;
  anamnesis_id: string;
  naturalidade: string | null;
  escolaridade: string | null;
  profissao: string | null;
  religiao: string | null;
}

interface FormState {
  naturalidade: string;
  escolaridade: string;
  profissao: string;
  religiao: string;
  onde_mora: string;
  com_mora: string;
  pa_sistolica: string;
  pa_diastolica: string;
  fc: string;
  saturacao: string;
  sono: string;
  apetite: string;
  tabagismo: string;
  etilismo: string;
  atividade_fisica: string;
  comorbidades: string;
  medicacoes_uso_continuo: string;
  queixa_principal: string;
  historia_doenca_atual: string;
  historia_patologica_pregressa: string;
  historia_familiar: string;
  hipoteses_diagnosticas: string;
  conduta: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const INITIAL_FORM: FormState = {
  naturalidade: "",
  escolaridade: "",
  profissao: "",
  religiao: "",
  onde_mora: "",
  com_mora: "",
  pa_sistolica: "",
  pa_diastolica: "",
  fc: "",
  saturacao: "",
  sono: "",
  apetite: "",
  tabagismo: "",
  etilismo: "",
  atividade_fisica: "",
  comorbidades: "",
  medicacoes_uso_continuo: "",
  queixa_principal: "",
  historia_doenca_atual: "",
  historia_patologica_pregressa: "",
  historia_familiar: "",
  hipoteses_diagnosticas: "",
  conduta: "",
};

const ESCOLARIDADE_OPTIONS = [
  { value: "", label: "Selecione..." },
  { value: "fund_inc", label: "Ensino Fundamental Incompleto" },
  { value: "fund_comp", label: "Ensino Fundamental Completo" },
  { value: "med_inc", label: "Ensino Médio Incompleto" },
  { value: "med_comp", label: "Ensino Médio Completo" },
  { value: "sup_inc", label: "Ensino Superior Incompleto" },
  { value: "sup_comp", label: "Ensino Superior Completo" },
  { value: "pos_grad", label: "Pós-graduação" },
  { value: "mestrado", label: "Mestrado" },
  { value: "doutorado", label: "Doutorado" },
];

const ESTADO_CIVIL_LABEL: Record<string, string> = {
  solteiro: "Solteiro(a)",
  casado: "Casado(a) / União estável",
  divorciado: "Divorciado(a) / Separado(a)",
  viuvo: "Viúvo(a)",
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

function calculateAge(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const birth = new Date(y, m - 1, d);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const mDiff = now.getMonth() - birth.getMonth();
  if (mDiff < 0 || (mDiff === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const todayStr = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
}).format(new Date());

// ─── CustomSelect ───────────────────────────────────────────────────────────────

interface SelectOption {
  value: string;
  label: string;
}

const CustomSelect: React.FC<{
  value: string;
  options: SelectOption[];
  onChange: (v: string) => void;
  placeholder: string;
  ariaLabel: string;
}> = ({ value, options, onChange, placeholder, ariaLabel }) => {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);

  const handleOpen = () => {
    setOpen(true);
    const idx = options.findIndex((o) => o.value === value);
    setHighlighted(idx >= 1 ? idx : 1);
  };

  const handleClose = () => {
    setOpen(false);
    setHighlighted(-1);
  };

  const handleSelect = (v: string) => {
    onChange(v);
    handleClose();
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (triggerRef.current?.contains(e.target as Node)) return;
      if (listRef.current?.contains(e.target as Node)) return;
      handleClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  useEffect(() => {
    if (open && highlighted >= 0 && listRef.current) {
      const item = listRef.current.children[highlighted - 0] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlighted, open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        handleOpen();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlighted((h) => Math.min(h + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlighted((h) => Math.max(h - 1, 0));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (highlighted >= 0) handleSelect(options[highlighted].value);
        break;
      case "Escape":
        e.preventDefault();
        handleClose();
        break;
    }
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? handleClose() : handleOpen())}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={[
          "w-full px-3.5 py-3 rounded-xl border outline-none cursor-pointer",
          "flex items-center justify-between gap-2",
          "bg-white/80 dark:bg-gray-800/80",
          "transition-all duration-200",
          selected && selected.value
            ? "text-gray-900 dark:text-gray-100"
            : "text-gray-400 dark:text-gray-500",
          open
            ? "border-blue-400 dark:border-blue-500 ring-2 ring-blue-500/15"
            : "border-slate-200 dark:border-gray-700 hover:border-slate-300 dark:hover:border-gray-600",
        ].join(" ")}
      >
        <span className="text-sm text-left truncate">
          {selected && selected.value ? selected.label : placeholder}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown className={`w-3.5 h-3.5 ${open ? "text-blue-500" : "text-gray-400"}`} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 top-full mt-1.5 z-50 w-full"
          >
            <ul
              ref={listRef}
              role="listbox"
              aria-label={ariaLabel}
              className="
                max-h-56 overflow-y-auto rounded-xl
                bg-white dark:bg-gray-800
                border border-slate-200 dark:border-gray-700
                shadow-xl shadow-black/8 dark:shadow-black/30
                py-1.5
              "
            >
              {options.map((opt, i) => {
                const isSelected = opt.value === value;
                const isHighlighted = i === highlighted;
                return (
                  <motion.li
                    key={opt.value}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.1, delay: Math.min(i * 0.012, 0.1) }}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setHighlighted(i)}
                    className={[
                      "flex items-center gap-2.5 px-3.5 py-2.5 mx-1.5 rounded-lg cursor-pointer",
                      "text-sm font-medium transition-colors duration-100",
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : isHighlighted
                          ? "bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-gray-100"
                          : "text-gray-700 dark:text-gray-300",
                    ].join(" ")}
                  >
                    <span className="flex-1 truncate">{opt.label}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    )}
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── FloatingInput ──────────────────────────────────────────────────────────────

const FloatingInput: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ id, label, value, onChange }) => {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={[
          "w-full px-4 pt-6 pb-2.5 rounded-xl border outline-none text-sm block",
          "bg-white/80 dark:bg-gray-800/80",
          "text-gray-900 dark:text-gray-100 caret-blue-500",
          "transition-all duration-200",
          focused
            ? "border-blue-400 dark:border-blue-500 ring-2 ring-blue-500/15"
            : "border-slate-200 dark:border-gray-700 hover:border-slate-300 dark:hover:border-gray-600",
        ].join(" ")}
      />
      <label
        htmlFor={id}
        className={[
          "absolute left-4 pointer-events-none select-none transition-all duration-200 leading-none font-medium",
          floated
            ? "top-2.5 text-[10px] text-blue-600 dark:text-blue-400"
            : "top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500",
        ].join(" ")}
      >
        {label}
      </label>
    </div>
  );
};

// ─── AutoExpandTextarea ─────────────────────────────────────────────────────────

const AutoExpandTextarea: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}> = ({ id, label, value, onChange, rows = 3 }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 0)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="
          block text-xs font-bold text-blue-600 dark:text-blue-400
          uppercase tracking-wide mb-2 ml-1
        "
      >
        {label}
      </label>
      <textarea
        ref={textareaRef}
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          adjustHeight();
        }}
        className={[
          "w-full px-4 py-3.5 rounded-xl border outline-none resize-none text-sm block",
          "bg-white/80 dark:bg-gray-800/80",
          "text-gray-900 dark:text-gray-100 caret-blue-500",
          "transition-all duration-200",
          "border-slate-200 dark:border-gray-700",
          "hover:border-slate-300 dark:hover:border-gray-600",
          "focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15",
          "leading-relaxed",
        ].join(" ")}
      />
    </div>
  );
};

// ─── Section Header ─────────────────────────────────────────────────────────────

const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}> = ({ icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-200/60 dark:border-gray-700/60">
    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">
      {icon}
    </div>
    <div>
      <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
          {subtitle}
        </p>
      )}
    </div>
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function FirstConsultationForm() {
  const { anamnesis_id } = useParams<{ anamnesis_id: string }>();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [anamnesis, setAnamnesis] = useState<AnamnesisRow | null>(null);
  const [existingProfile, setExistingProfile] = useState<PatientProfile | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const diastolicRef = useRef<HTMLInputElement>(null);

  // ── Fetch anamnesis + existing profile ──────────────────────────────────────

  useEffect(() => {
    if (!anamnesis_id) return;
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const { data: anamData, error: anamErr } = await supabase
          .from("collaborator_anamnesis")
          .select("id, nome_completo, data_nascimento, estado_civil, email, department, cpf")
          .eq("id", anamnesis_id)
          .single();

        if (anamErr) throw new Error("Anamnese não encontrada: " + anamErr.message);
        if (!anamData) throw new Error("Anamnese não encontrada.");
        if (cancelled) return;
        setAnamnesis(anamData as AnamnesisRow);

        // Fetch existing profile from medical DB
        try {
          const { data: profData, error: profErr } = await supabaseDb
            .from("patient_medical_profiles")
            .select("*")
            .eq("anamnesis_id", anamnesis_id)
            .maybeSingle();

          if (!profErr && profData) {
            if (cancelled) return;
            setExistingProfile(profData as PatientProfile);
            setForm((prev) => ({
              ...prev,
              naturalidade: profData.naturalidade ?? "",
              escolaridade: profData.escolaridade ?? "",
              profissao: profData.profissao ?? "",
              religiao: profData.religiao ?? "",
              onde_mora: profData.onde_mora ?? "",
              com_mora: profData.com_mora ?? "",
            }));
          }
        } catch {
          // Profile may not exist yet
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar dados.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchData();
    return () => { cancelled = true; };
  }, [anamnesis_id]);

  // ── Save handler ────────────────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anamnesis_id) return;

    setSaving(true);
    setError(null);

    try {
      let profileId: string;

      if (existingProfile?.id) {
        // Update existing profile
        const { error: updateErr } = await supabaseDb
          .from("patient_medical_profiles")
          .update({
            naturalidade: form.naturalidade.trim() || null,
            escolaridade: form.escolaridade || null,
            profissao: form.profissao.trim() || null,
            religiao: form.religiao.trim() || null,
            onde_mora: form.onde_mora.trim() || null,
            com_mora: form.com_mora.trim() || null,
          })
          .eq("id", existingProfile.id);

        if (updateErr) throw new Error("Erro ao atualizar perfil: " + updateErr.message);
        profileId = existingProfile.id;
      } else {
        // Create new profile
        const { data: newProfile, error: insertErr } = await supabaseDb
          .from("patient_medical_profiles")
          .insert({
            anamnesis_id,
            naturalidade: form.naturalidade.trim() || null,
            escolaridade: form.escolaridade || null,
            profissao: form.profissao.trim() || null,
            religiao: form.religiao.trim() || null,
            onde_mora: form.onde_mora.trim() || null,
            com_mora: form.com_mora.trim() || null,
          })
          .select("id")
          .single();

        if (insertErr) throw new Error("Erro ao criar perfil: " + insertErr.message);
        profileId = (newProfile as { id: string }).id;
      }

      // Insert first consultation
      const { error: consultErr } = await supabaseDb
        .from("medical_consultations")
        .insert({
          profile_id: profileId,
          tipo_consulta: "primeira",
          pa_sistolica: form.pa_sistolica.trim() || null,
          pa_diastolica: form.pa_diastolica.trim() || null,
          fc: form.fc.trim() || null,
          saturacao: form.saturacao.trim() || null,
          sono: form.sono.trim() || null,
          apetite: form.apetite.trim() || null,
          tabagismo: form.tabagismo.trim() || null,
          etilismo: form.etilismo.trim() || null,
          atividade_fisica: form.atividade_fisica.trim() || null,
          comorbidades: form.comorbidades.trim() || null,
          medicacoes_uso_continuo: form.medicacoes_uso_continuo.trim() || null,
          queixa_principal: form.queixa_principal.trim() || null,
          historia_doenca_atual: form.historia_doenca_atual.trim() || null,
          historia_patologica_pregressa: form.historia_patologica_pregressa.trim() || null,
          historia_familiar: form.historia_familiar.trim() || null,
          hipoteses_diagnosticas: form.hipoteses_diagnosticas.trim() || null,
          conduta: form.conduta.trim() || null,
        });

      if (consultErr) throw new Error("Erro ao salvar consulta: " + consultErr.message);

      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  // ── Helper: set form field ──────────────────────────────────────────────────

  const patch = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#f8f9fb] dark:bg-gray-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent"
        />
        <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
          Carregando dados do paciente...
        </p>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────

  if (error && !anamnesis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb] dark:bg-gray-950 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl p-10">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
              Erro ao carregar
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">{error}</p>
            <button
              onClick={() => navigate(`/admin/atendimento/${anamnesis_id}`)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao prontuário
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Success screen ──────────────────────────────────────────────────────────

  if (saved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb] dark:bg-gray-950 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl p-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 16 }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25"
            >
              <CheckCircle className="w-9 h-9 text-white" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-3">
                Consulta registrada!
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-2">
                Os dados da primeira consulta de <strong>{anamnesis?.nome_completo}</strong> foram salvos com sucesso.
              </p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-8"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
              Dados armazenados com segurança.
            </motion.p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate(`/admin/atendimento/${anamnesis_id}`)}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao prontuário
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────

  const age = anamnesis ? calculateAge(anamnesis.data_nascimento) : 0;

  return (
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-gray-950">
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header className="
        sticky top-0 z-30
        bg-white/85 dark:bg-gray-900/85
        backdrop-blur-2xl saturate-150
        border-b border-gray-200/50 dark:border-white/[0.06]
      ">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-[60px] flex items-center justify-between">
          <button
            onClick={() => navigate(`/admin/atendimento/${anamnesis_id}`)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            <ArrowLeft className="w-4 h-4" />
            Prontuário
          </button>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              onClick={toggleTheme}
              aria-label={isDark ? "Alternar para modo claro" : "Alternar para modo escuro"}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100/80 dark:bg-white/[0.08] text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/[0.14] transition-colors duration-150"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isDark ? "moon" : "sun"}
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
            <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              Primeira Consulta
            </span>
          </div>
        </div>
      </header>

      {/* ── Form body ───────────────────────────────────────────────────────── */}
      <form onSubmit={handleSave} noValidate className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* DOCUMENT HEADER */}
          {/* ═══════════════════════════════════════════════════════════════ */}

          {/* Date + document title */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 w-fit">
              <FileHeart className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-widest">
                Documento Clínico
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              <span className="capitalize">{todayStr}</span>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* PATIENT ID CARD */}
          {/* ═══════════════════════════════════════════════════════════════ */}

          <div className="
            rounded-2xl
            bg-white/60 dark:bg-gray-900/60
            backdrop-blur-xl
            border border-white/80 dark:border-gray-800/60
            shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.15)]
            overflow-hidden
          ">
            <div className="px-5 py-4 border-b border-gray-100/80 dark:border-gray-800/60 bg-gradient-to-r from-blue-50/60 to-transparent dark:from-blue-900/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-blue-500/20">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                    {anamnesis?.nome_completo}
                  </h1>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">
                    Anamnese #{anamnesis_id?.slice(0, 8)}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">
                  Idade
                </p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{age} anos</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">
                  Nascimento
                </p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  {anamnesis ? formatDate(anamnesis.data_nascimento) : ""}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">
                  Estado Civil
                </p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                  {anamnesis ? (ESTADO_CIVIL_LABEL[anamnesis.estado_civil] ?? capitalize(anamnesis.estado_civil)) : ""}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">
                  E-mail
                </p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                  {anamnesis?.email ?? "—"}
                </p>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* IDENTIFICAÇÃO */}
          {/* ═══════════════════════════════════════════════════════════════ */}

          <div className="
            rounded-2xl
            bg-white/60 dark:bg-gray-900/60
            backdrop-blur-xl
            border border-white/80 dark:border-gray-800/60
            shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.15)]
            p-5 sm:p-7
          ">
            <SectionHeader
              icon={<FileText className="w-4 h-4" />}
              title="Identificação"
              subtitle="Dados complementares do paciente"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FloatingInput
                id="fc-naturalidade"
                label="Naturalidade"
                value={form.naturalidade}
                onChange={(v) => patch("naturalidade", v)}
              />
              <CustomSelect
                value={form.escolaridade}
                options={ESCOLARIDADE_OPTIONS}
                onChange={(v) => patch("escolaridade", v)}
                placeholder="Escolaridade"
                ariaLabel="Nível de escolaridade"
              />
              <FloatingInput
                id="fc-profissao"
                label="Profissão"
                value={form.profissao}
                onChange={(v) => patch("profissao", v)}
              />
              <FloatingInput
                id="fc-religiao"
                label="Religião"
                value={form.religiao}
                onChange={(v) => patch("religiao", v)}
              />
              <FloatingInput
                id="fc-onde-mora"
                label="Onde mora"
                value={form.onde_mora}
                onChange={(v) => patch("onde_mora", v)}
              />
              <FloatingInput
                id="fc-com-mora"
                label="Com quem mora"
                value={form.com_mora}
                onChange={(v) => patch("com_mora", v)}
              />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* SINAIS VITAIS E EXAME FÍSICO */}
          {/* ═══════════════════════════════════════════════════════════════ */}

          <div className="
            rounded-2xl
            bg-white/60 dark:bg-gray-900/60
            backdrop-blur-xl
            border border-white/80 dark:border-gray-800/60
            shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.15)]
            p-5 sm:p-7
          ">
            <SectionHeader
              icon={<HeartPulse className="w-4 h-4" />}
              title="Sinais Vitais e Exame Físico"
              subtitle="Aferições do atendimento"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* PA — campo duplo */}
              <div>
                <label className="block text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2 ml-1">
                  PA (mmHg)
                </label>
                <div className="flex items-stretch rounded-xl border border-slate-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 overflow-hidden hover:border-slate-300 dark:hover:border-gray-600 focus-within:border-blue-400 dark:focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/15 transition-all duration-200">
                  <div className="flex-1 flex flex-col justify-center px-3 py-1.5">
                    <span className="text-[9px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide leading-none">sistólica</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={3}
                      id="fc-pa-sistolica"
                      value={form.pa_sistolica}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 3);
                        patch("pa_sistolica", v);
                        if (v.length === 3) diastolicRef.current?.focus();
                      }}
                      placeholder="120"
                      className="w-full text-sm border-none outline-none bg-transparent text-gray-900 dark:text-gray-100 caret-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500 py-0"
                    />
                  </div>
                  <span className="shrink-0 w-px bg-slate-200 dark:bg-gray-700" />
                  <div className="flex-1 flex flex-col justify-center px-3 py-1.5">
                    <span className="text-[9px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide leading-none">diastólica</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={3}
                      ref={diastolicRef}
                      id="fc-pa-diastolica"
                      value={form.pa_diastolica}
                      onChange={(e) => patch("pa_diastolica", e.target.value.replace(/\D/g, "").slice(0, 3))}
                      placeholder="80"
                      className="w-full text-sm border-none outline-none bg-transparent text-gray-900 dark:text-gray-100 caret-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500 py-0"
                    />
                  </div>
                </div>
              </div>
              {/* FC */}
              <div>
                <label htmlFor="fc-fc" className="block text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2 ml-1">
                  FC (bpm)
                </label>
                <input
                  type="text"
                  id="fc-fc"
                  value={form.fc}
                  onChange={(e) => patch("fc", e.target.value)}
                  placeholder="Ex: 72"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border outline-none bg-white/80 dark:bg-gray-800/80 border-slate-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 caret-blue-500 hover:border-slate-300 dark:hover:border-gray-600 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all duration-200"
                />
              </div>
              {/* Saturação */}
              <div>
                <label htmlFor="fc-saturacao" className="block text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2 ml-1">
                  Saturação (%)
                </label>
                <input
                  type="text"
                  id="fc-saturacao"
                  value={form.saturacao}
                  onChange={(e) => patch("saturacao", e.target.value)}
                  placeholder="Ex: 98"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border outline-none bg-white/80 dark:bg-gray-800/80 border-slate-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 caret-blue-500 hover:border-slate-300 dark:hover:border-gray-600 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* HÁBITOS */}
          {/* ═══════════════════════════════════════════════════════════════ */}

          <div className="
            rounded-2xl
            bg-white/60 dark:bg-gray-900/60
            backdrop-blur-xl
            border border-white/80 dark:border-gray-800/60
            shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.15)]
            p-5 sm:p-7
          ">
            <SectionHeader
              icon={<Activity className="w-4 h-4" />}
              title="Hábitos"
              subtitle="Estilo de vida do paciente"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AutoExpandTextarea
                id="fc-sono"
                label="Sono"
                value={form.sono}
                onChange={(v) => patch("sono", v)}
                rows={2}
              />
              <AutoExpandTextarea
                id="fc-apetite"
                label="Apetite"
                value={form.apetite}
                onChange={(v) => patch("apetite", v)}
                rows={2}
              />
              <AutoExpandTextarea
                id="fc-tabagismo"
                label="Tabagismo"
                value={form.tabagismo}
                onChange={(v) => patch("tabagismo", v)}
                rows={2}
              />
              <AutoExpandTextarea
                id="fc-etilismo"
                label="Etilismo"
                value={form.etilismo}
                onChange={(v) => patch("etilismo", v)}
                rows={2}
              />
              <div className="sm:col-span-2">
                <AutoExpandTextarea
                  id="fc-atividade-fisica"
                  label="Atividade Física"
                  value={form.atividade_fisica}
                  onChange={(v) => patch("atividade_fisica", v)}
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* CAMPOS CLÍNICOS */}
          {/* ═══════════════════════════════════════════════════════════════ */}

          <div className="
            rounded-2xl
            bg-white/60 dark:bg-gray-900/60
            backdrop-blur-xl
            border border-white/80 dark:border-gray-800/60
            shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.15)]
            p-5 sm:p-7
          ">
            <SectionHeader
              icon={<Stethoscope className="w-4 h-4" />}
              title="Avaliação Clínica"
              subtitle="Registro da primeira consulta"
            />

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <AutoExpandTextarea
                  id="fc-comorbidades"
                  label="Comorbidades"
                  value={form.comorbidades}
                  onChange={(v) => patch("comorbidades", v)}
                  rows={2}
                />
                <AutoExpandTextarea
                  id="fc-medicacoes"
                  label="Medicações de Uso Contínuo"
                  value={form.medicacoes_uso_continuo}
                  onChange={(v) => patch("medicacoes_uso_continuo", v)}
                  rows={2}
                />
              </div>

              <AutoExpandTextarea
                id="fc-queixa"
                label="Queixa Principal"
                value={form.queixa_principal}
                onChange={(v) => patch("queixa_principal", v)}
                rows={3}
              />

              <AutoExpandTextarea
                id="fc-hda"
                label="História da Doença Atual (HDA)"
                value={form.historia_doenca_atual}
                onChange={(v) => patch("historia_doenca_atual", v)}
                rows={3}
              />

              <AutoExpandTextarea
                id="fc-hpp"
                label="História Patológica Pregressa (HPP)"
                value={form.historia_patologica_pregressa}
                onChange={(v) => patch("historia_patologica_pregressa", v)}
                rows={3}
              />

              <AutoExpandTextarea
                id="fc-hf"
                label="História Familiar (HF)"
                value={form.historia_familiar}
                onChange={(v) => patch("historia_familiar", v)}
                rows={3}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <AutoExpandTextarea
                  id="fc-hd"
                  label="Hipóteses Diagnósticas (HD)"
                  value={form.hipoteses_diagnosticas}
                  onChange={(v) => patch("hipoteses_diagnosticas", v)}
                  rows={3}
                />
                <AutoExpandTextarea
                  id="fc-conduta"
                  label="Conduta"
                  value={form.conduta}
                  onChange={(v) => patch("conduta", v)}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ERROR BANNER */}
          {/* ═══════════════════════════════════════════════════════════════ */}

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                role="alert"
                className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-sm text-red-700 dark:text-red-400"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* SAVE BUTTON */}
          {/* ═══════════════════════════════════════════════════════════════ */}

          <div className="flex items-center justify-between gap-4 pt-2">
            <p className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
              <ShieldCheck className="w-3.5 h-3.5 text-green-500 shrink-0" />
              Todos os campos são confidenciais
            </p>

            <motion.button
              type="submit"
              disabled={saving}
              whileHover={saving ? {} : { scale: 1.02 }}
              whileTap={saving ? {} : { scale: 0.97 }}
              className="
                w-full sm:w-auto ml-auto
                inline-flex items-center justify-center gap-2
                px-8 py-3.5 rounded-2xl
                bg-gradient-to-r from-emerald-500 to-teal-600
                text-white font-bold text-sm
                shadow-lg shadow-emerald-500/20
                hover:from-emerald-600 hover:to-teal-700
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-colors duration-200
              "
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Primeira Consulta
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </form>
    </div>
  );
}
