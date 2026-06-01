import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  ClipboardList,
  Stethoscope,
  RefreshCw,
  X,
  Calendar,
  Heart,
  Activity,
  Users,
  Mail,
  Building2,
  ShieldCheck,
  AlertCircle,
  IdCard,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";
import { supabase } from "../../supabaseClient";
import { supabaseDb } from "../../supabaseDbClient";
import RequireMedicalAuth from "../../components/RequireMedicalAuth";
import { useTheme } from "../../context/ThemeContext";

// ─── Types ──────────────────────────────────────────────────────────────────────

type StatusValue = "pendente" | "em_analise" | "contatado";

interface AnamnesisRow {
  id: string;
  created_at: string;
  email: string;
  nome_completo: string;
  data_nascimento: string;
  estado_civil: string;
  objetivo_saude: string;
  importancia_participacao: string;
  metricas_corporais: string | null;
  condicoes_saude: string | null;
  possui_plano_saude: boolean;
  status: StatusValue;
  cpf: string | null;
  department: string | null;
}

interface PatientProfile {
  id: string;
  anamnesis_id: string;
  naturalidade: string | null;
  escolaridade: string | null;
  profissao: string | null;
  religiao: string | null;
  created_at: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatBirthdate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
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

const ESTADO_CIVIL_LABEL: Record<string, string> = {
  solteiro: "Solteiro(a)",
  casado: "Casado(a) / União estável",
  divorciado: "Divorciado(a) / Separado(a)",
  viuvo: "Viúvo(a)",
};

function maskCPF(raw: string): string {
  return raw.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

const Field: React.FC<{
  label: string;
  value: React.ReactNode;
  prose?: boolean;
}> = ({ label, value, prose }) => (
  <div>
    <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
      {label}
    </p>
    {prose ? (
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3 whitespace-pre-wrap">
        {value}
      </p>
    ) : (
      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{value}</p>
    )}
  </div>
);

const DrawerSection: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 pb-1 border-b border-gray-100 dark:border-gray-700">
      <span className="text-blue-500 dark:text-blue-400">{icon}</span>
      <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
        {title}
      </h3>
    </div>
    {children}
  </div>
);

// ─── Patient Detail Drawer ──────────────────────────────────────────────────────

interface DrawerProps {
  row: AnamnesisRow | null;
  profile: PatientProfile | null;
  onClose: () => void;
}

const PatientDrawer: React.FC<DrawerProps> = ({ row, profile, onClose }) => {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (row) {
      const t = setTimeout(() => closeRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [row]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <AnimatePresence>
      {row && (
        <>
          <motion.div
            key="profile-bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.22 } }}
            exit={{ opacity: 0, transition: { duration: 0.18 } }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
            onClick={onClose}
          />

          <motion.aside
            key="profile-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
            exit={{ x: "100%", transition: { duration: 0.22, ease: "easeIn" } }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-drawer-title"
            className="
              fixed right-0 top-0 h-full z-50
              w-full sm:w-[480px] lg:w-[520px]
              bg-white dark:bg-gray-900
              shadow-2xl shadow-black/20
              flex flex-col
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="
              shrink-0 flex items-start justify-between gap-4
              px-6 py-5
              border-b border-gray-100 dark:border-gray-700
              bg-gradient-to-r from-blue-50 via-indigo-50/50 to-transparent
              dark:from-blue-900/20 dark:via-transparent
            ">
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-0.5">
                  Perfil do Paciente
                </p>
                <h2
                  id="profile-drawer-title"
                  className="text-lg font-extrabold text-gray-900 dark:text-gray-100 truncate"
                >
                  {row.nome_completo}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Anamnese #{row.id.slice(0, 8)}
                </p>
              </div>
              <button
                ref={closeRef}
                onClick={onClose}
                aria-label="Fechar painel"
                className="
                  shrink-0 w-8 h-8 flex items-center justify-center rounded-full
                  bg-white dark:bg-gray-800
                  border border-gray-200 dark:border-gray-700
                  text-gray-500 dark:text-gray-400
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  transition-colors duration-150
                "
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">
              {/* Identificação */}
              <DrawerSection icon={<Users className="w-4 h-4" />} title="Identificação">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <Field label="E-mail" value={row.email} />
                  <Field
                    label="Data de Nascimento"
                    value={
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {formatBirthdate(row.data_nascimento)}{" "}
                        <span className="text-gray-400">({calculateAge(row.data_nascimento)} anos)</span>
                      </span>
                    }
                  />
                  <Field
                    label="Estado Civil"
                    value={ESTADO_CIVIL_LABEL[row.estado_civil] ?? capitalize(row.estado_civil)}
                  />
                  {row.cpf && <Field label="CPF" value={maskCPF(row.cpf)} />}
                  {row.department && <Field label="Departamento" value={row.department} />}
                  <Field
                    label="Plano de Saúde"
                    value={
                      <span className={`flex items-center gap-1 font-semibold ${
                        row.possui_plano_saude
                          ? "text-green-600 dark:text-green-400"
                          : "text-orange-600 dark:text-orange-400"
                      }`}>
                        <Heart className="w-3.5 h-3.5" />
                        {row.possui_plano_saude ? "Possui plano" : "Sem plano"}
                      </span>
                    }
                  />
                </div>
              </DrawerSection>

              {/* Dados complementares do prontuário */}
              {profile && (
                <DrawerSection icon={<IdCard className="w-4 h-4" />} title="Dados Complementares">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {profile.naturalidade && (
                      <Field label="Naturalidade" value={profile.naturalidade} />
                    )}
                    {profile.escolaridade && (
                      <Field label="Escolaridade" value={profile.escolaridade} />
                    )}
                    {profile.profissao && (
                      <Field label="Profissão" value={profile.profissao} />
                    )}
                    {profile.religiao && (
                      <Field label="Religião" value={profile.religiao} />
                    )}
                  </div>
                  {!profile.naturalidade && !profile.escolaridade && !profile.profissao && !profile.religiao && (
                    <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                      Nenhum dado complementar registrado ainda.
                    </p>
                  )}
                </DrawerSection>
              )}

              {/* Objetivos */}
              <DrawerSection icon={<FileText className="w-4 h-4" />} title="Objetivos e Expectativas">
                <Field label="Maior desejo ou objetivo de saúde" value={row.objetivo_saude} prose />
                <Field label="Importância da participação" value={row.importancia_participacao} prose />
              </DrawerSection>

              {/* Histórico */}
              <DrawerSection icon={<Activity className="w-4 h-4" />} title="Histórico e Métricas">
                {row.metricas_corporais ? (
                  <Field label="Métricas Corporais" value={row.metricas_corporais} prose />
                ) : (
                  <Field label="Métricas Corporais" value={
                    <span className="text-gray-400 dark:text-gray-500 italic text-sm">Não informado</span>
                  } />
                )}
                {row.condicoes_saude ? (
                  <Field label="Condições de Saúde" value={row.condicoes_saude} prose />
                ) : (
                  <Field label="Condições de Saúde" value={
                    <span className="text-gray-400 dark:text-gray-500 italic text-sm">Nenhuma informada</span>
                  } />
                )}
              </DrawerSection>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-4 border-t border-gray-100 dark:border-gray-700
              bg-gray-50/60 dark:bg-gray-800/60 text-xs text-gray-400 dark:text-gray-500 text-center">
              ID anamnese: {row.id}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Card Component ─────────────────────────────────────────────────────────────

interface HubCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  gradient: string;
  iconGradient: string;
  onClick: () => void;
  badge?: string;
  delay?: number;
}

const HubCard: React.FC<HubCardProps> = ({
  icon, title, subtitle, gradient, iconGradient, onClick, badge, delay = 0,
}) => (
  <motion.button
    onClick={onClick}
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ scale: 1.03, y: -4 }}
    whileTap={{ scale: 0.97 }}
    className="
      relative group w-full text-left
      rounded-3xl p-8 sm:p-10
      bg-white/70 dark:bg-gray-900/70
      backdrop-blur-2xl
      border border-white/50 dark:border-gray-800/60
      shadow-lg shadow-black/5 dark:shadow-black/20
      hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/30
      transition-shadow duration-300
      overflow-hidden
    "
  >
    {/* Background gradient blob */}
    <div
      className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}
    />

    {/* Animated orb */}
    <motion.div
      className={`absolute -top-10 -right-10 w-40 h-40 rounded-full ${iconGradient} opacity-[0.06] dark:opacity-[0.04] blur-2xl`}
      animate={{ scale: [1, 1.2, 1], rotate: [0, 15, 0] }}
      transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
    />

    {/* Content */}
    <div className="relative z-10 flex flex-col items-start gap-5">
      {/* Icon in gradient container */}
      <motion.div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center ${iconGradient} shadow-lg`}
        whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.5 } }}
      >
        <span className="text-white">{icon}</span>
      </motion.div>

      {/* Title + subtitle */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            {title}
          </h3>
          {badge && (
            <span className="
              px-2 py-0.5 rounded-full
              text-[10px] font-bold uppercase tracking-wider
              bg-emerald-100 dark:bg-emerald-900/30
              text-emerald-700 dark:text-emerald-300
            ">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* CTA arrow */}
      <motion.div
        className="
          mt-2 inline-flex items-center gap-1.5
          text-sm font-semibold
          text-blue-600 dark:text-blue-400
          opacity-0 group-hover:opacity-100
          translate-y-2 group-hover:translate-y-0
          transition-all duration-300
        "
      >
        <span>Acessar</span>
        <motion.span
          animate={{ x: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          →
        </motion.span>
      </motion.div>
    </div>
  </motion.button>
);

// ─── Main Workspace ─────────────────────────────────────────────────────────────

function MedicalWorkspaceContent() {
  const { anamnesis_id } = useParams<{ anamnesis_id: string }>();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [anamnesis, setAnamnesis] = useState<AnamnesisRow | null>(null);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  const fetchData = useCallback(async () => {
    if (!anamnesis_id) return;
    setLoading(true);
    setError(null);

    try {
      const { data: anamData, error: anamErr } = await supabase
        .from("collaborator_anamnesis")
        .select("*")
        .eq("id", anamnesis_id)
        .single();

      if (anamErr) throw new Error(anamErr.message);
      if (!anamData) throw new Error("Anamnese não encontrada.");

      setAnamnesis(anamData as AnamnesisRow);

      // Fetch patient profile from medical DB
      try {
        const { data: profData, error: profErr } = await supabaseDb
          .from("patient_medical_profiles")
          .select("*")
          .eq("anamnesis_id", anamnesis_id)
          .maybeSingle();

        if (!profErr && profData) {
          setProfile(profData as PatientProfile);
        }
      } catch {
        // Profile may not exist yet — that's fine
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, [anamnesis_id]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  // ── Loading ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-50 dark:bg-gray-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-gray-400 dark:text-gray-500 font-medium"
        >
          Carregando prontuário...
        </motion.p>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────────

  if (error || !anamnesis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="
            backdrop-blur-xl bg-white/70 dark:bg-gray-900/70
            rounded-3xl border border-gray-200 dark:border-gray-800
            shadow-2xl p-10
          ">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
              Paciente não encontrado
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              {error || "A anamnese solicitada não existe ou foi removida."}
            </p>
            <button
              onClick={() => navigate("/admin")}
              className="
                inline-flex items-center gap-2 px-6 py-3 rounded-2xl
                bg-gradient-to-r from-blue-500 to-blue-600
                text-white font-bold text-sm
                hover:from-blue-600 hover:to-blue-700
                transition-colors duration-200
              "
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao painel
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Main content ──────────────────────────────────────────────────────────────

  const age = calculateAge(anamnesis.data_nascimento);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">

        {/* ── Top navigation bar ──────────────────────────────────────────────── */}
        <header className="
          sticky top-0 z-30
          bg-white/80 dark:bg-gray-900/80
          backdrop-blur-2xl saturate-150
          border-b border-gray-200/50 dark:border-white/[0.06]
        ">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-[60px] flex items-center justify-between">
            <button
              onClick={() => navigate("/admin")}
              className="
                inline-flex items-center gap-2 px-3 py-2 rounded-xl
                text-sm font-medium text-gray-600 dark:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-800
                transition-colors duration-150
              "
            >
              <ArrowLeft className="w-4 h-4" />
              Painel Admin
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
                Atendimento Médico
              </span>
            </div>
          </div>
        </header>

        {/* ── Content ─────────────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

          {/* Patient summary header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="
              relative overflow-hidden
              rounded-3xl
              bg-white/70 dark:bg-gray-900/70
              backdrop-blur-2xl
              border border-white/60 dark:border-gray-800/60
              shadow-xl shadow-black/5 dark:shadow-black/20
              p-6 sm:p-8 mb-8
            "
          >
            {/* Decorative gradient blob */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-indigo-500/5 dark:from-blue-400/5 dark:to-indigo-500/3 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Super-title */}
              <div className="inline-flex items-center gap-1.5 mb-4 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/40">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                  Prontuário Médico
                </span>
              </div>

              {/* Name + status */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                    {anamnesis.nome_completo}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                    <IdCard className="w-3.5 h-3.5" />
                    Anamnese #{anamnesis.id.slice(0, 8)} · {formatDate(anamnesis.created_at)}
                  </p>
                </div>

                <span className={`
                  self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider
                  ${anamnesis.status === "pendente"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                    : anamnesis.status === "em_analise"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  }
                `}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    anamnesis.status === "pendente"
                      ? "bg-yellow-400"
                      : anamnesis.status === "em_analise"
                        ? "bg-blue-500"
                        : "bg-green-500"
                  }`} />
                  {anamnesis.status === "pendente" ? "Pendente" : anamnesis.status === "em_analise" ? "Em Análise" : "Contatado"}
                </span>
              </div>

              {/* Info pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 ring-1 ring-black/[0.03] dark:ring-white/[0.04]">
                  <Calendar className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide">Idade</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{age} anos</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 ring-1 ring-black/[0.03] dark:ring-white/[0.04]">
                  <Calendar className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide">Nascimento</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{formatBirthdate(anamnesis.data_nascimento)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 ring-1 ring-black/[0.03] dark:ring-white/[0.04]">
                  <Users className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide">Estado Civil</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{ESTADO_CIVIL_LABEL[anamnesis.estado_civil] ?? capitalize(anamnesis.estado_civil)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 ring-1 ring-black/[0.03] dark:ring-white/[0.04]">
                  <Mail className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide">E-mail</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{anamnesis.email}</p>
                  </div>
                </div>
                {anamnesis.department && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 ring-1 ring-black/[0.03] dark:ring-white/[0.04]">
                    <Building2 className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide">Depto</p>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{anamnesis.department}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Objective highlight */}
              <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/40 dark:from-blue-900/10 dark:to-indigo-900/5 border border-blue-100/60 dark:border-blue-800/20">
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
                  Objetivo de Saúde
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                  {anamnesis.objetivo_saude}
                </p>
              </div>
            </div>
          </motion.div>

          {/* ── 3 Hub Cards ────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <HubCard
              icon={<ClipboardList className="w-7 h-7" />}
              title="Perfil do Paciente"
              subtitle="Visualize os dados completos da anamnese, histórico de saúde e métricas corporais."
              gradient="bg-gradient-to-br from-blue-50/40 to-cyan-50/20 dark:from-blue-900/10 dark:to-cyan-900/5"
              iconGradient="bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-500/30"
              onClick={() => setShowDrawer(true)}
              delay={0.05}
            />

            <HubCard
              icon={<Stethoscope className="w-7 h-7" />}
              title="Primeira Consulta"
              subtitle="Registre a consulta inicial: queixa principal, histórico, diagnóstico e conduta."
              gradient="bg-gradient-to-br from-emerald-50/40 to-teal-50/20 dark:from-emerald-900/10 dark:to-teal-900/5"
              iconGradient="bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30"
              onClick={() => navigate(`/admin/atendimento/${anamnesis_id}/primeira-consulta`)}
              badge="novo"
              delay={0.15}
            />

            <HubCard
              icon={<RefreshCw className="w-7 h-7" />}
              title="Consulta de Retorno"
              subtitle="Acompanhe a evolução do paciente, efeitos do tratamento e adesão à conduta."
              gradient="bg-gradient-to-br from-violet-50/40 to-purple-50/20 dark:from-violet-900/10 dark:to-purple-900/5"
              iconGradient="bg-gradient-to-br from-violet-500 to-purple-600 shadow-violet-500/30"
              onClick={() => navigate(`/admin/atendimento/${anamnesis_id}/consulta-retorno`)}
              delay={0.25}
            />
          </div>

          {/* Footer privacy note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="
              mt-10 flex items-center justify-center gap-1.5
              text-xs text-gray-400 dark:text-gray-500
            "
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-green-500" />
            Os dados deste prontuário são estritamente confidenciais.
          </motion.p>
        </div>

        {/* Patient detail drawer */}
        <PatientDrawer
          row={showDrawer ? anamnesis : null}
          profile={profile}
          onClose={() => setShowDrawer(false)}
        />
      </div>
  );
}

// ─── Export ─────────────────────────────────────────────────────────────────────

export default function MedicalWorkspace() {
  return (
    <RequireMedicalAuth>
      <MedicalWorkspaceContent />
    </RequireMedicalAuth>
  );
}
