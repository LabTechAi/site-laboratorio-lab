/**
 * AdminColaboradoresView.tsx
 *
 * Painel administrativo para visualizar e gerenciar as anamneses enviadas
 * pelos colaboradores via /colaboradores.
 *
 * Features:
 * – Fetch paginado de collaborator_anamnesis (mais recentes primeiro)
 * – Busca por nome ou e-mail (client-side)
 * – Filtro por status
 * – Drawer lateral com resposta completa do colaborador (texto longo)
 * – Alteração inline de status: Pendente / Em Análise / Contatado
 * – Atualização otimista + reversão em caso de erro
 * – Skeletons de loading, empty state, error state
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Search,
  X,
  AlertCircle,
  Users,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  ClipboardList,
  Phone,
  Calendar,
  Heart,
  Activity,
  FileText,
  Loader2,
  Building2,
} from "lucide-react";
import { supabase } from "../../supabaseClient";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  StatusValue,
  { label: string; badgeCls: string; dotCls: string }
> = {
  pendente: {
    label: "Pendente",
    badgeCls:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    dotCls: "bg-yellow-400",
  },
  em_analise: {
    label: "Em Análise",
    badgeCls:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    dotCls: "bg-blue-500",
  },
  contatado: {
    label: "Contatado",
    badgeCls:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    dotCls: "bg-green-500",
  },
};

const STATUS_OPTIONS: StatusValue[] = ["pendente", "em_analise", "contatado"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  // dateStr is "YYYY-MM-DD"
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const ESTADO_CIVIL_LABEL: Record<string, string> = {
  solteiro:   "Solteiro(a)",
  casado:     "Casado(a) / União estável",
  divorciado: "Divorciado(a) / Separado(a)",
  viuvo:      "Viúvo(a)",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: StatusValue }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.badgeCls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotCls}`} />
      {cfg.label}
    </span>
  );
};

/** Loading skeleton row */
const SkeletonRow: React.FC<{ opacity: number }> = ({ opacity }) => (
  <tr style={{ opacity }}>
    {Array.from({ length: 7 }).map((_, i) => (
      <td key={i} className="px-4 py-3.5 first:pl-6 last:pr-6">
        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-md animate-pulse"
          style={{ width: `${60 + (i % 3) * 20}%` }} />
      </td>
    ))}
  </tr>
);

/** Section block inside the drawer */
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

/** Label + value pair */
const Field: React.FC<{ label: string; value: React.ReactNode; prose?: boolean }> = ({
  label,
  value,
  prose,
}) => (
  <div>
    <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
      {label}
    </p>
    {prose ? (
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed
        bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3 whitespace-pre-wrap">
        {value}
      </p>
    ) : (
      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{value}</p>
    )}
  </div>
);

// ─── FilterDropdown ───────────────────────────────────────────────────────────

interface DropdownOption {
  value: string;
  label: string;
  count?: number;
  dotCls?: string;
}

const FilterDropdown: React.FC<{
  value: string;
  options: DropdownOption[];
  onChange: (v: string) => void;
  icon?: React.ReactNode;
}> = ({ value, options, onChange, icon }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="
          flex items-center gap-1.5 py-2 pl-3 pr-2.5 text-sm rounded-xl
          border border-gray-200 dark:border-gray-600
          bg-white dark:bg-gray-700
          text-gray-700 dark:text-gray-200
          hover:border-gray-300 dark:hover:border-gray-500
          focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
          transition-all duration-200 whitespace-nowrap
        "
      >
        {icon}
        {selected.dotCls && <span className={`w-2 h-2 rounded-full ${selected.dotCls}`} />}
        <span>{selected.label}</span>
        {selected.count !== undefined && selected.value !== "all" && (
          <span className="text-xs font-semibold text-white bg-blue-500 rounded-full px-1.5 py-0.5 leading-none ml-0.5">
            {selected.count}
          </span>
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ml-0.5 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="dd"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.14 } }}
            exit={{ opacity: 0, y: -4, scale: 0.97, transition: { duration: 0.1 } }}
            className="
              absolute left-0 top-full mt-1.5 z-30 min-w-[175px]
              bg-white dark:bg-gray-800
              border border-gray-100 dark:border-gray-700
              rounded-xl shadow-xl shadow-black/10
              py-1.5 overflow-hidden
            "
          >
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={[
                    "w-full flex items-center gap-2 px-3.5 py-2 text-sm transition-colors duration-100",
                    active
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",
                  ].join(" ")}
                >
                  {opt.dotCls && <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dotCls}`} />}
                  <span className="flex-1 text-left">{opt.label}</span>
                  {opt.count !== undefined && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-md font-semibold ${
                      active
                        ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }`}>
                      {opt.count}
                    </span>
                  )}
                  {active && <CheckCircle className="w-3.5 h-3.5 shrink-0 ml-1" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Detail Drawer ────────────────────────────────────────────────────────────

interface DrawerProps {
  row: AnamnesisRow | null;
  onClose: () => void;
  onStatusChange: (id: string, status: StatusValue) => Promise<void>;
  updatingId: string | null;
}

const DetailDrawer: React.FC<DrawerProps> = ({
  row,
  onClose,
  onStatusChange,
  updatingId,
}) => {
  const closeRef = useRef<HTMLButtonElement>(null);
  const isUpdating = row ? updatingId === row.id : false;

  // Focus close button on open
  useEffect(() => {
    if (row) {
      const t = setTimeout(() => closeRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [row]);

  // Escape key
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <AnimatePresence>
      {row && (
        <>
          {/* Backdrop */}
          <motion.div
            key="drawer-bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.22 } }}
            exit={{ opacity: 0, transition: { duration: 0.18 } }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            key="drawer-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
            exit={{ x: "100%", transition: { duration: 0.22, ease: "easeIn" } }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
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
                  Anamnese completa
                </p>
                <h2
                  id="drawer-title"
                  className="text-lg font-extrabold text-gray-900 dark:text-gray-100 truncate"
                >
                  {row.nome_completo}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Enviado em {formatDate(row.created_at)}
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

            {/* Status selector */}
            <div className="shrink-0 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
                Status do atendimento
              </p>
              <div className="flex gap-2 flex-wrap">
                {STATUS_OPTIONS.map((s) => {
                  const cfg = STATUS_CONFIG[s];
                  const active = row.status === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={isUpdating}
                      onClick={() => void onStatusChange(row.id, s)}
                      aria-pressed={active}
                      className={[
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold",
                        "border transition-all duration-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        active
                          ? `${cfg.badgeCls} border-current shadow-sm`
                          : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600",
                      ].join(" ")}
                    >
                      {isUpdating && active ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : active ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <span className={`w-2 h-2 rounded-full ${cfg.dotCls} opacity-60`} />
                      )}
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
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
                        {formatBirthdate(row.data_nascimento)}
                      </span>
                    }
                  />
                  <Field
                    label="Estado Civil"
                    value={ESTADO_CIVIL_LABEL[row.estado_civil] ?? capitalize(row.estado_civil)}
                  />
                  {row.cpf && (
                    <Field
                      label="CPF"
                      value={row.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
                    />
                  )}
                  {row.department && (
                    <Field label="Departamento" value={row.department} />
                  )}
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

              {/* Objetivos */}
              <DrawerSection icon={<FileText className="w-4 h-4" />} title="Objetivos e Expectativas">
                <Field
                  label="Maior desejo ou objetivo de saúde"
                  value={row.objetivo_saude}
                  prose
                />
                <Field
                  label="Importância da participação no projeto"
                  value={row.importancia_participacao}
                  prose
                />
              </DrawerSection>

              {/* Histórico */}
              <DrawerSection icon={<Activity className="w-4 h-4" />} title="Histórico e Métricas">
                {row.metricas_corporais ? (
                  <Field
                    label="Métricas Corporais"
                    value={row.metricas_corporais}
                    prose
                  />
                ) : (
                  <Field label="Métricas Corporais" value={
                    <span className="text-gray-400 dark:text-gray-500 italic text-sm">Não informado</span>
                  } />
                )}
                {row.condicoes_saude ? (
                  <Field
                    label="Condições de Saúde"
                    value={row.condicoes_saude}
                    prose
                  />
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
              ID: {row.id}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminColaboradoresView() {
  const [rows, setRows]                     = useState<AnamnesisRow[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [search, setSearch]                 = useState("");
  const [statusFilter, setStatusFilter]     = useState<"all" | StatusValue>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [drawerRow, setDrawerRow]           = useState<AnamnesisRow | null>(null);
  const [updatingId, setUpdatingId]         = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("collaborator_anamnesis")
      .select("*")
      .order("created_at", { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setRows((data ?? []) as AnamnesisRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { void fetchRows(); }, [fetchRows]);

  // ── Filtered rows (client-side) ────────────────────────────────────────────

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.nome_completo.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchDept   = departmentFilter === "all" || r.department === departmentFilter;
    return matchSearch && matchStatus && matchDept;
  });

  // ── Department stats (derived from all rows, not filtered) ─────────────────

  const departments = useMemo(
    () =>
      Array.from(
        new Set(rows.map((r) => r.department).filter(Boolean) as string[]),
      ).sort(),
    [rows],
  );

  const deptCounts = useMemo(() => {
    const c: Record<string, number> = {};
    rows.forEach((r) => {
      if (r.department) c[r.department] = (c[r.department] ?? 0) + 1;
    });
    return c;
  }, [rows]);

  // ── Status update ──────────────────────────────────────────────────────────

  const handleStatusChange = useCallback(
    async (id: string, newStatus: StatusValue) => {
      // Optimistic update
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
      );
      if (drawerRow?.id === id) {
        setDrawerRow((prev) => prev ? { ...prev, status: newStatus } : prev);
      }

      setUpdatingId(id);
      const { error: err } = await supabase
        .from("collaborator_anamnesis")
        .update({ status: newStatus })
        .eq("id", id);

      if (err) {
        // Revert on error — refetch
        void fetchRows();
      }
      setUpdatingId(null);
    },
    [drawerRow, fetchRows],
  );

  // ── Counts ─────────────────────────────────────────────────────────────────

  const counts = {
    total:      rows.length,
    pendente:   rows.filter((r) => r.status === "pendente").length,
    em_analise: rows.filter((r) => r.status === "em_analise").length,
    contatado:  rows.filter((r) => r.status === "contatado").length,
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="space-y-5">

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",       value: counts.total,      icon: <ClipboardList className="w-4 h-4" />, color: "blue"   },
            { label: "Pendente",    value: counts.pendente,   icon: <Phone className="w-4 h-4" />,         color: "yellow" },
            { label: "Em Análise",  value: counts.em_analise, icon: <Activity className="w-4 h-4" />,      color: "blue"   },
            { label: "Contatado",   value: counts.contatado,  icon: <CheckCircle className="w-4 h-4" />,   color: "green"  },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-white dark:bg-gray-800 rounded-2xl
                border border-gray-100 dark:border-gray-700 shadow-sm
                px-4 py-4 flex items-center gap-3"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                ${card.color === "yellow"
                  ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
                  : card.color === "green"
                    ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                    : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                }`}>
                {card.icon}
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-none mb-1">
                  {card.label}
                </p>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 leading-none">
                  {loading
                    ? <span className="inline-block w-6 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    : card.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 p-4 rounded-2xl text-sm
              bg-red-50 dark:bg-red-900/20
              border border-red-200 dark:border-red-800/40
              text-red-700 dark:text-red-400"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            Erro ao carregar dados: {error}
          </div>
        )}

        {/* Table card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl
          border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700
            bg-gradient-to-r from-blue-50 via-indigo-50/50 to-transparent
            dark:from-gray-800 dark:via-gray-800 dark:to-gray-800">

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                  Anamneses dos Colaboradores
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Projeto piloto LAB · ordenadas por data
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  <input
                    type="search"
                    placeholder="Nome ou e-mail…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="
                      pl-8 pr-3 py-2 text-sm rounded-xl
                      border border-gray-200 dark:border-gray-600
                      bg-white dark:bg-gray-700
                      text-gray-700 dark:text-gray-200
                      placeholder:text-gray-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                      transition-all duration-200 w-44
                    "
                  />
                </div>

                {/* Status filter */}
                <FilterDropdown
                  value={statusFilter}
                  onChange={(v) => setStatusFilter(v as typeof statusFilter)}
                  options={[
                    { value: "all",        label: "Todos os status",  count: rows.length },
                    { value: "pendente",   label: "Pendente",         count: rows.filter((r) => r.status === "pendente").length,   dotCls: "bg-yellow-400" },
                    { value: "em_analise", label: "Em Análise",       count: rows.filter((r) => r.status === "em_analise").length, dotCls: "bg-blue-500"   },
                    { value: "contatado",  label: "Contatado",        count: rows.filter((r) => r.status === "contatado").length,  dotCls: "bg-green-500"  },
                  ]}
                />

                {/* Refresh */}
                <button
                  onClick={() => void fetchRows()}
                  disabled={loading}
                  aria-label="Atualizar dados"
                  className="
                    flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl
                    text-gray-600 dark:text-gray-300
                    border border-gray-200 dark:border-gray-600
                    bg-white dark:bg-gray-700
                    hover:bg-gray-50 dark:hover:bg-gray-600
                    disabled:opacity-50 transition-all duration-200
                  "
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">Atualizar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Department completion bar */}
          {!loading && departments.length > 0 && (
            <div className="
              px-6 py-3 border-b border-gray-100 dark:border-gray-700
              bg-gray-50/60 dark:bg-gray-800/60
            ">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest shrink-0">
                  Preencheram por depto
                </span>
                <button
                  type="button"
                  onClick={() => setDepartmentFilter("all")}
                  className={[
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-150",
                    departmentFilter === "all"
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/25"
                      : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700",
                  ].join(" ")}
                >
                  Todos
                  <span className={`text-[10px] font-bold px-1 py-0.5 rounded-full ${
                    departmentFilter === "all"
                      ? "bg-white/20 text-white"
                      : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  }`}>
                    {rows.length}
                  </span>
                </button>
                {departments.map((dept) => {
                  const active = departmentFilter === dept;
                  const count  = deptCounts[dept] ?? 0;
                  return (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => setDepartmentFilter(active ? "all" : dept)}
                      className={[
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-150",
                        active
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/25"
                          : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-700",
                      ].join(" ")}
                    >
                      <Building2 className="w-3 h-3 shrink-0" />
                      {dept}
                      <span className={`text-[10px] font-bold px-1 py-0.5 rounded-full ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} opacity={1 - i * 0.15} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

              {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center px-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center
                bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500">
                <ClipboardList className="w-7 h-7" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {search || statusFilter !== "all" || departmentFilter !== "all"
                  ? "Nenhuma anamnese encontrada com esses filtros."
                  : "Nenhuma anamnese recebida ainda."}
              </p>
              {(search || statusFilter !== "all" || departmentFilter !== "all") && (
                <button
                  onClick={() => { setSearch(""); setStatusFilter("all"); setDepartmentFilter("all"); }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          )}

          {/* Data table */}
          {!loading && filtered.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    {["Data", "Nome", "E-mail", "Depto", "Plano", "Status", ""].map(
                      (col) => (
                        <th
                          key={col}
                          className="
                            px-4 py-3 text-left text-xs font-semibold
                            text-gray-500 dark:text-gray-400 uppercase tracking-wide
                            first:pl-6 last:pr-6 last:text-right
                          "
                        >
                          {col}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/60">
                  {filtered.map((row) => (
                    <motion.tr
                      key={row.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="
                        hover:bg-slate-50 dark:hover:bg-gray-700/40
                        transition-colors duration-150 group
                      "
                    >
                      {/* Data */}
                      <td className="px-4 py-3.5 pl-6 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(row.created_at)}
                      </td>

                      {/* Nome */}
                      <td className="px-4 py-3.5 font-medium text-gray-800 dark:text-gray-100 max-w-[160px]">
                        <span className="truncate block" title={row.nome_completo}>
                          {row.nome_completo}
                        </span>
                      </td>

                      {/* E-mail */}
                      <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300 max-w-[200px]">
                        <span className="truncate block" title={row.email}>
                          {row.email}
                        </span>
                      </td>

                      {/* Depto */}
                      <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 max-w-[140px]">
                        <span className="truncate block" title={row.department ?? undefined}>
                          {row.department ?? "—"}
                        </span>
                      </td>

                      {/* Plano */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          row.possui_plano_saude
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                        }`}>
                          <Heart className="w-3 h-3" />
                          {row.possui_plano_saude ? "Sim" : "Não"}
                        </span>
                      </td>

                      {/* Status — inline quick-change */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="relative inline-block group/status">
                          <StatusBadge status={row.status} />
                          {/* Quick-change popover on hover */}
                          <div className="
                            absolute left-0 top-full mt-1 z-10 min-w-[140px]
                            bg-white dark:bg-gray-800
                            border border-gray-100 dark:border-gray-700
                            rounded-xl shadow-lg py-1
                            hidden group-hover/status:block
                          ">
                            {STATUS_OPTIONS.map((s) => (
                              <button
                                key={s}
                                type="button"
                                disabled={updatingId === row.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handleStatusChange(row.id, s);
                                }}
                                className={`
                                  w-full flex items-center gap-2 px-3 py-2 text-xs font-medium
                                  hover:bg-gray-50 dark:hover:bg-gray-700
                                  transition-colors duration-100
                                  ${row.status === s
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-gray-700 dark:text-gray-300"}
                                `}
                              >
                                <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s].dotCls}`} />
                                {STATUS_CONFIG[s].label}
                                {row.status === s && (
                                  <CheckCircle className="w-3 h-3 ml-auto" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Ações */}
                      <td className="px-4 py-3.5 pr-6 text-right">
                        <button
                          onClick={() => setDrawerRow(row)}
                          className="
                            inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold
                            text-blue-600 dark:text-blue-400
                            bg-blue-50 dark:bg-blue-900/20
                            hover:bg-blue-100 dark:hover:bg-blue-900/40
                            border border-blue-100 dark:border-blue-800/40
                            transition-all duration-150
                            opacity-0 group-hover:opacity-100
                          "
                        >
                          Ver detalhes
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {/* Footer count */}
              <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700
                bg-gray-50 dark:bg-gray-800/50
                text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                <span>
                  {filtered.length} de {rows.length} anamnese
                  {rows.length !== 1 ? "s" : ""}
                  {(search || statusFilter !== "all") && " (filtrado)"}
                </span>
                {(search || statusFilter !== "all") && (
                  <button
                    onClick={() => { setSearch(""); setStatusFilter("all"); }}
                    className="text-blue-500 dark:text-blue-400 hover:underline font-medium"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail drawer */}
      <DetailDrawer
        row={drawerRow}
        onClose={() => setDrawerRow(null)}
        onStatusChange={handleStatusChange}
        updatingId={updatingId}
      />
    </>
  );
}
