import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Search,
  X,
  Calendar,
  User,
  Stethoscope,
  Clock,
  Sparkles,
  ShieldCheck,
  FileText,
  ClipboardList,
  RefreshCw,
  Sun,
  Moon,
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
}

interface FirstConsultation {
  id: string;
  profile_id: string;
  comorbidades: string | null;
  medicacoes_uso_continuo: string | null;
  queixa_principal: string | null;
  historia_doenca_atual: string | null;
  historia_patologica_pregressa: string | null;
  historia_familiar: string | null;
  hipoteses_diagnosticas: string | null;
  conduta: string | null;
  created_at: string;
}

interface PatientProfile {
  id: string;
}

interface FormState {
  medicacoes_uso_continuo: string;
  evolucao_efeitos: string;
  evolucao_adesao: "total" | "parcial" | "nao_houve" | "";
  hipoteses_diagnosticas: string;
  conduta: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const INITIAL_FORM: FormState = {
  medicacoes_uso_continuo: "",
  evolucao_efeitos: "",
  evolucao_adesao: "",
  hipoteses_diagnosticas: "",
  conduta: "",
};

const EFEITOS_PREDEFINIDOS = [
  "Sem efeitos colaterais",
  "Náusea",
  "Cefaleia",
  "Tontura",
  "Fadiga",
  "Insônia",
  "Alterações gastrointestinais",
  "Reações cutâneas",
  "Sonolência",
  "Agitação",
  "Ganho de peso",
  "Perda de peso",
  "Outros",
];

const ADESAO_OPTIONS = [
  { value: "total", label: "Total", color: "emerald" },
  { value: "parcial", label: "Parcial", color: "amber" },
  { value: "nao_houve", label: "Não houve", color: "red" },
] as const;

const dayLabel = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
}).format(new Date());

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

// ─── AutoExpandTextarea ─────────────────────────────────────────────────────────

const AutoExpandTextarea: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}> = ({ id, label, value, onChange, rows = 3 }) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const adjust = () => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = `${ref.current.scrollHeight}px`;
  };
  useEffect(() => { adjust(); }, [value]);

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2 ml-1">
        {label}
      </label>
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => { onChange(e.target.value); adjust(); }}
        className="w-full px-4 py-3.5 rounded-xl border outline-none resize-none text-sm block bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 caret-blue-500 leading-relaxed border-slate-200 dark:border-gray-700 hover:border-slate-300 dark:hover:border-gray-600 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all duration-200"
      />
    </div>
  );
};

// ─── Custom Combobox ────────────────────────────────────────────────────────────

const ComboBox: React.FC<{
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder: string;
  ariaLabel: string;
}> = ({ value, options, onChange, placeholder, ariaLabel }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const [highlighted, setHighlighted] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = search
    ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (wrapperRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  useEffect(() => { setSearch(value); }, [value]);

  const handleSelect = (opt: string) => {
    onChange(opt);
    setSearch(opt);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") { e.preventDefault(); setOpen(true); }
      return;
    }
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); setHighlighted((h) => Math.min(h + 1, filtered.length - 1)); break;
      case "ArrowUp": e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); break;
      case "Enter":
        e.preventDefault();
        if (highlighted >= 0 && filtered[highlighted]) handleSelect(filtered[highlighted]);
        else if (search.trim()) { onChange(search.trim()); setOpen(false); }
        break;
      case "Escape": e.preventDefault(); setOpen(false); break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          placeholder={placeholder}
          aria-label={ariaLabel}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
            setHighlighted(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-9 pr-10 py-3 rounded-xl border outline-none text-sm bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 caret-blue-500 border-slate-200 dark:border-gray-700 hover:border-slate-300 dark:hover:border-gray-600 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all duration-200"
        />
        {search && (
          <button
            type="button"
            onClick={() => { onChange(""); setSearch(""); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            role="listbox"
            className="absolute left-0 top-full mt-1.5 z-50 w-full max-h-52 overflow-y-auto rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 shadow-xl shadow-black/8 dark:shadow-black/30 py-1.5"
          >
            {filtered.map((opt, i) => {
              const isHighlighted = i === highlighted;
              return (
                <motion.li
                  key={opt}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.1, delay: Math.min(i * 0.012, 0.1) }}
                  role="option"
                  aria-selected={opt === value}
                  onClick={() => handleSelect(opt)}
                  onMouseEnter={() => setHighlighted(i)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 mx-1.5 rounded-lg cursor-pointer text-sm font-medium transition-colors duration-100 ${
                    opt === value
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : isHighlighted
                        ? "bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-gray-100"
                        : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span className="flex-1 truncate">{opt}</span>
                  {opt === value && <CheckCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Segmented Control ──────────────────────────────────────────────────────────

const SegmentedControl: React.FC<{
  value: string;
  options: readonly { readonly value: string; readonly label: string; readonly color: string }[];
  onChange: (v: string) => void;
}> = ({ value, options, onChange }) => (
  <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800 w-fit">
    {options.map((opt) => {
      const active = opt.value === value;
      const colorMap: Record<string, string> = {
        emerald: active ? "text-white" : "text-emerald-700 dark:text-emerald-400",
        amber: active ? "text-white" : "text-amber-700 dark:text-amber-400",
        red: active ? "text-white" : "text-red-700 dark:text-red-400",
      };
      const bgMap: Record<string, string> = {
        emerald: "bg-emerald-500",
        amber: "bg-amber-500",
        red: "bg-red-500",
      };
      return (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`relative px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-200 ${colorMap[opt.color]}`}
        >
          {active && (
            <motion.span
              layoutId="segmented-bg"
              className={`absolute inset-0 rounded-lg ${bgMap[opt.color]} shadow-sm`}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{opt.label}</span>
        </button>
      );
    })}
  </div>
);

// ─── Read-only field ────────────────────────────────────────────────────────────

const ROField: React.FC<{ label: string; value: React.ReactNode; prose?: boolean }> = ({ label, value, prose }) => (
  <div>
    <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">{label}</p>
    {prose ? (
      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50/80 dark:bg-gray-800/50 rounded-lg px-3 py-2.5 whitespace-pre-wrap">{value}</p>
    ) : (
      <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{value}</p>
    )}
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function FollowUpConsultationForm() {
  const { anamnesis_id } = useParams<{ anamnesis_id: string }>();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [anamnesis, setAnamnesis] = useState<AnamnesisRow | null>(null);
  const [firstConsult, setFirstConsult] = useState<FirstConsultation | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const leftPanelRef = useRef<HTMLDivElement>(null);

  // ── Fetch data ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!anamnesis_id) return;
    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        // Anamnesis
        const { data: anam, error: anamErr } = await supabase
          .from("collaborator_anamnesis")
          .select("id, nome_completo, data_nascimento, estado_civil, email")
          .eq("id", anamnesis_id)
          .single();
        if (anamErr) throw new Error("Anamnese não encontrada: " + anamErr.message);
        if (!anam) throw new Error("Anamnese não encontrada.");
        if (cancelled) return;
        setAnamnesis(anam as AnamnesisRow);

        // Profile
        const { data: prof, error: profErr } = await supabaseDb
          .from("patient_medical_profiles")
          .select("id")
          .eq("anamnesis_id", anamnesis_id)
          .maybeSingle();
        if (!profErr && prof) {
          if (cancelled) return;
          setProfileId((prof as PatientProfile).id);

          // First consultation
          const { data: consult, error: consultErr } = await supabaseDb
            .from("medical_consultations")
            .select("*")
            .eq("profile_id", (prof as PatientProfile).id)
            .eq("tipo_consulta", "primeira")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (!consultErr && consult) {
            if (cancelled) return;
            setFirstConsult(consult as FirstConsultation);
            // Pre-fill medication from first consult
            setForm((prev) => ({
              ...prev,
              medicacoes_uso_continuo: (consult as FirstConsultation).medicacoes_uso_continuo ?? "",
            }));
          }
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erro ao carregar.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchAll();
    return () => { cancelled = true; };
  }, [anamnesis_id]);

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) { setError("Perfil do paciente não encontrado."); return; }

    setSaving(true);
    setError(null);
    try {
      const { error: insertErr } = await supabaseDb
        .from("medical_consultations")
        .insert({
          profile_id: profileId,
          tipo_consulta: "retorno",
          medicacoes_uso_continuo: form.medicacoes_uso_continuo.trim() || null,
          evolucao_efeitos: form.evolucao_efeitos.trim() || null,
          evolucao_adesao: form.evolucao_adesao || null,
          hipoteses_diagnosticas: form.hipoteses_diagnosticas.trim() || null,
          conduta: form.conduta.trim() || null,
        });
      if (insertErr) throw new Error("Erro ao salvar: " + insertErr.message);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const patch = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#f8f9fb] dark:bg-gray-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent"
        />
        <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Carregando prontuário...</p>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────

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
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">Erro ao carregar</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">{error}</p>
            <button
              onClick={() => navigate(`/admin/atendimento/${anamnesis_id}`)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar ao prontuário
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────

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
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25"
            >
              <CheckCircle className="w-9 h-9 text-white" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-3">
                Retorno registrado!
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-2">
                A consulta de retorno de <strong>{anamnesis?.nome_completo}</strong> foi salva com sucesso.
              </p>
            </motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-8">
              <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
              Dados armazenados com segurança.
            </motion.p>
            <button
              onClick={() => navigate(`/admin/atendimento/${anamnesis_id}`)}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar ao prontuário
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Age ────────────────────────────────────────────────────────────────────

  const age = anamnesis ? calculateAge(anamnesis.data_nascimento) : 0;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-gray-950 flex flex-col">
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/85 dark:bg-gray-900/85 backdrop-blur-2xl saturate-150 border-b border-gray-200/50 dark:border-white/[0.06] shrink-0">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/admin/atendimento/${anamnesis_id}`)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
            >
              <ArrowLeft className="w-4 h-4" /> Prontuário
            </button>

            {/* Mobile toggle left panel */}
            {!showLeftPanel && (
              <button
                onClick={() => setShowLeftPanel(true)}
                className="sm:hidden inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/40"
              >
                <FileText className="w-3 h-3" /> Ver 1ª consulta
              </button>
            )}
          </div>

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
              Consulta de Retorno
            </span>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SPLIT-SCREEN BODY */}
      {/* ═══════════════════════════════════════════════════════════════ */}

      <div className="flex-1 flex flex-col lg:flex-row max-w-[1440px] mx-auto w-full">
        {/* ─── LEFT PANEL — Read-only First Consultation ────────────────── */}
        <AnimatePresence>
          {showLeftPanel && (
            <motion.aside
              ref={leftPanelRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, width: 0 }}
              className="
                shrink-0 lg:w-[420px] xl:w-[460px]
                border-r border-gray-200/60 dark:border-gray-800/60
                bg-white/40 dark:bg-gray-900/40
                backdrop-blur-sm
                overflow-y-auto
                max-h-[calc(100vh-60px)] lg:max-h-[calc(100vh-60px)]
              "
            >
              <div className="p-5 sm:p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm shadow-violet-500/20">
                      <ClipboardList className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">1ª Consulta</h3>
                      {firstConsult && (
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">
                          {formatDateTime(firstConsult.created_at)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Close button — mobile */}
                  <button
                    onClick={() => setShowLeftPanel(false)}
                    className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {!firstConsult ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Nenhuma primeira consulta registrada ainda.
                    </p>
                    <button
                      onClick={() => navigate(`/admin/atendimento/${anamnesis_id}/primeira-consulta`)}
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-200 dark:border-blue-800/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    >
                      <Stethoscope className="w-3 h-3" /> Registrar 1ª consulta
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Patient summary pill */}
                    <div className="px-4 py-3 rounded-xl bg-violet-50/60 dark:bg-violet-900/10 border border-violet-100/60 dark:border-violet-800/20">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                            {anamnesis?.nome_completo}
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">
                            {age} anos · {anamnesis ? formatDate(anamnesis.data_nascimento) : ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* First consultation fields — read-only */}
                    <div className="space-y-5">
                      {firstConsult.queixa_principal && (
                        <ROField label="Queixa Principal" value={firstConsult.queixa_principal} prose />
                      )}
                      {firstConsult.comorbidades && (
                        <ROField label="Comorbidades" value={firstConsult.comorbidades} prose />
                      )}
                      {firstConsult.medicacoes_uso_continuo && (
                        <ROField label="Medicações de Uso Contínuo" value={firstConsult.medicacoes_uso_continuo} prose />
                      )}
                      {firstConsult.historia_doenca_atual && (
                        <ROField label="História da Doença Atual (HDA)" value={firstConsult.historia_doenca_atual} prose />
                      )}
                      {firstConsult.historia_patologica_pregressa && (
                        <ROField label="História Patológica Pregressa" value={firstConsult.historia_patologica_pregressa} prose />
                      )}
                      {firstConsult.historia_familiar && (
                        <ROField label="História Familiar" value={firstConsult.historia_familiar} prose />
                      )}
                      {firstConsult.hipoteses_diagnosticas && (
                        <ROField label="Hipóteses Diagnósticas" value={firstConsult.hipoteses_diagnosticas} prose />
                      )}
                      {firstConsult.conduta && (
                        <ROField label="Conduta" value={firstConsult.conduta} prose />
                      )}
                    </div>

                    <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center pt-2 border-t border-gray-100 dark:border-gray-800">
                      Somente leitura — referência clínica
                    </p>
                  </>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ─── RIGHT PANEL — Follow-up Form ─────────────────────────────── */}
        <motion.main
          layout
          className="flex-1 overflow-y-auto max-h-[calc(100vh-60px)] lg:max-h-[calc(100vh-60px)]"
        >
          <form onSubmit={handleSave} noValidate className="p-5 sm:p-6 lg:p-8 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl space-y-8"
            >
              {/* Document header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30 w-fit">
                  <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                  <span className="text-[10px] font-bold text-violet-700 dark:text-violet-300 uppercase tracking-widest">
                    Documento de Retorno
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="capitalize">{dayLabel}</span>
                </div>
              </div>

              {/* Patient card */}
              <div className="rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/80 dark:border-gray-800/60 shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.15)] overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100/80 dark:border-gray-800/60 bg-gradient-to-r from-violet-50/60 to-transparent dark:from-violet-900/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm shadow-violet-500/20">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h1 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                        {anamnesis?.nome_completo}
                      </h1>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500">Anamnese #{anamnesis_id?.slice(0, 8)}</p>
                    </div>
                  </div>
                  <RefreshCw className="w-4 h-4 text-violet-400" />
                </div>
                <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Idade</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{age} anos</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Nascimento</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" /> {anamnesis ? formatDate(anamnesis.data_nascimento) : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">E-mail</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{anamnesis?.email ?? "—"}</p>
                  </div>
                </div>
              </div>

              {/* ═════════════════════════════════════════════════ */}
              {/* RETORNO FORM FIELDS */}
              {/* ═════════════════════════════════════════════════ */}

              <div className="rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/80 dark:border-gray-800/60 shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.15)] p-5 sm:p-7">
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-200/60 dark:border-gray-700/60">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 shrink-0">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">Evolução do Paciente</h2>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">Registro da consulta de retorno</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Medicações */}
                  <AutoExpandTextarea
                    id="fu-medicacoes"
                    label="Medicações de Uso Contínuo"
                    value={form.medicacoes_uso_continuo}
                    onChange={(v) => patch("medicacoes_uso_continuo", v)}
                    rows={3}
                  />

                  {/* Evolução — Efeitos (Combobox) */}
                  <div>
                    <label className="block text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2 ml-1">
                      Evolução Clínica — Efeitos Colaterais
                    </label>
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <ComboBox
                          value={form.evolucao_efeitos}
                          options={EFEITOS_PREDEFINIDOS}
                          onChange={(v) => patch("evolucao_efeitos", v)}
                          placeholder="Selecione ou digite os efeitos observados..."
                          ariaLabel="Efeitos colaterais observados"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 ml-1">
                      Você pode selecionar opções predefinidas ou digitar texto livre.
                    </p>
                  </div>

                  {/* Evolução — Adesão (Segmented Control) */}
                  <div>
                    <label className="block text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2 ml-1">
                      Evolução Clínica — Adesão ao Tratamento
                    </label>
                    <SegmentedControl
                      value={form.evolucao_adesao}
                      options={ADESAO_OPTIONS}
                      onChange={(v) => patch("evolucao_adesao", v as FormState["evolucao_adesao"])}
                    />
                  </div>

                  {/* Hipóteses Diagnósticas */}
                  <AutoExpandTextarea
                    id="fu-hd"
                    label="Hipóteses Diagnósticas (HD)"
                    value={form.hipoteses_diagnosticas}
                    onChange={(v) => patch("hipoteses_diagnosticas", v)}
                    rows={3}
                  />

                  {/* Conduta */}
                  <AutoExpandTextarea
                    id="fu-conduta"
                    label="Conduta"
                    value={form.conduta}
                    onChange={(v) => patch("conduta", v)}
                    rows={3}
                  />
                </div>
              </div>

              {/* Error banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    role="alert"
                    className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-sm text-red-700 dark:text-red-400"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Save button */}
              <div className="flex items-center justify-between gap-4 pt-2">
                <p className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-500 shrink-0" /> Confidencial
                </p>
                <motion.button
                  type="submit"
                  disabled={saving}
                  whileHover={saving ? {} : { scale: 1.02 }}
                  whileTap={saving ? {} : { scale: 0.97 }}
                  className="w-full sm:w-auto ml-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-violet-500/20 hover:from-violet-600 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                  ) : (
                    <><Save className="w-4 h-4" /> Salvar Consulta de Retorno</>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </form>
        </motion.main>
      </div>
    </div>
  );
}
