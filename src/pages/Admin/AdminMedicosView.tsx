/**
 * AdminMedicosView.tsx
 *
 * Visão inicial para médicos — listagem geral de atendimentos realizados
 * com acesso ao prontuário médico de cada paciente.
 *
 * Features:
 * – Fetch de collaborator_anamnesis + patient_medical_profiles
 * – Cross-reference client-side para exibir apenas pacientes com perfil médico
 * – Summary cards com total de atendimentos
 * – Busca por nome ou e-mail (client-side)
 * – Data table com acesso direto ao prontuário via /admin/atendimento/:id
 * – RequireMedicalAuth (mesmo gate do prontuário)
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  RefreshCw,
  Search,
  X,
  AlertCircle,
  ChevronRight,
  ClipboardList,
  Calendar,
  Stethoscope,
  Users,
  Building2,
  Loader2,
  ShieldAlert,
  Lock,
} from "lucide-react";
import { supabase } from "../../supabaseClient";
import { supabaseDb } from "../../supabaseDbClient";
import RequireMedicalAuth from "../../components/RequireMedicalAuth";

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

interface PatientProfile {
  id: string;
  anamnesis_id: string;
  naturalidade: string | null;
  escolaridade: string | null;
  profissao: string | null;
  religiao: string | null;
  created_at: string;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<StatusValue, string> = {
  pendente:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  em_analise:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  contatado:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

const STATUS_LABELS: Record<StatusValue, string> = {
  pendente: "Pendente",
  em_analise: "Em Análise",
  contatado: "Contatado",
};

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

function calculateAge(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const today = new Date();
  const birth = new Date(y, m - 1, d);
  let age = today.getFullYear() - birth.getFullYear();
  const mDiff = today.getMonth() - birth.getMonth();
  if (mDiff < 0 || (mDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: StatusValue }> = ({ status }) => (
  <span
    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[status]}`}
  >
    {STATUS_LABELS[status]}
  </span>
);

// ─── MedicosContent (inner, after auth gate) ──────────────────────────────────

const MedicosContent: React.FC = () => {
  const navigate = useNavigate();

  const [anamnesisRows, setAnamnesisRows] = useState<AnamnesisRow[]>([]);
  const [profileIds, setProfileIds] = useState<Set<string>>(new Set());
  const [dbAvailable, setDbAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch anamnesis rows from public Supabase
      const { data: anamData, error: anamErr } = await supabase
        .from("collaborator_anamnesis")
        .select("*")
        .order("created_at", { ascending: false });

      if (anamErr) throw new Error(anamErr.message);

      const rows = (anamData ?? []) as AnamnesisRow[];
      setAnamnesisRows(rows);

      // Fetch patient profiles from medical DB
      try {
        const { data: profData, error: profErr } = await supabaseDb
          .from("patient_medical_profiles")
          .select("anamnesis_id");

        if (!profErr && profData) {
          const idSet = new Set<string>(
            (profData as { anamnesis_id: string }[]).map((p) => p.anamnesis_id),
          );
          setProfileIds(idSet);
          setDbAvailable(true);
        }
      } catch {
        // DB unavailable — will show all anamneses as fallback
        setDbAvailable(false);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar dados.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // ── Joined & filtered rows (client-side) ────────────────────────────────────

  const attendedRows = useMemo(
    () =>
      dbAvailable
        ? anamnesisRows.filter((r) => profileIds.has(r.id))
        : anamnesisRows,
    [anamnesisRows, profileIds, dbAvailable],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return attendedRows.filter((r) => {
      if (!q) return true;
      const fields = [
        r.nome_completo,
        r.email,
        r.data_nascimento,
        r.estado_civil,
        r.objetivo_saude,
        r.importancia_participacao,
        r.metricas_corporais,
        r.condicoes_saude,
        r.department,
        r.cpf,
        r.status === "pendente" ? "pendente" : r.status === "em_analise" ? "em analise" : "contatado",
      ];
      return fields.some((f) => f && f.toString().toLowerCase().includes(q));
    });
  }, [attendedRows, search]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl
            border border-gray-100 dark:border-gray-700 shadow-sm
            px-4 py-4 flex items-center gap-3"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center
              bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
          >
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">
              {dbAvailable ? "Atendimentos" : "Exibidos"}
            </p>
            <p className="text-xl font-extrabold text-gray-900 dark:text-gray-100 leading-none">
              {loading ? (
                <span className="inline-block w-6 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ) : (
                attendedRows.length
              )}
            </p>
          </div>
        </div>

        <div
          className="bg-white dark:bg-gray-800 rounded-2xl
            border border-gray-100 dark:border-gray-700 shadow-sm
            px-4 py-4 flex items-center gap-3"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center
              bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          >
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">
              Total Anamneses
            </p>
            <p className="text-xl font-extrabold text-gray-900 dark:text-gray-100 leading-none">
              {loading ? (
                <span className="inline-block w-6 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ) : (
                anamnesisRows.length
              )}
            </p>
          </div>
        </div>

        <div
          className="bg-white dark:bg-gray-800 rounded-2xl
            border border-gray-100 dark:border-gray-700 shadow-sm
            px-4 py-4 flex items-center gap-3"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center
              bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
          >
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">
              Com Perfil
            </p>
            <p className="text-xl font-extrabold text-gray-900 dark:text-gray-100 leading-none">
              {loading ? (
                <span className="inline-block w-6 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ) : dbAvailable ? (
                profileIds.size
              ) : (
                <span className="text-xs font-normal text-gray-400">—</span>
              )}
            </p>
          </div>
        </div>

        <div
          className="bg-white dark:bg-gray-800 rounded-2xl
            border border-gray-100 dark:border-gray-700 shadow-sm
            px-4 py-4 flex items-center gap-3"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center
              bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
          >
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">
              Exibidos
            </p>
            <p className="text-xl font-extrabold text-gray-900 dark:text-gray-100 leading-none">
              {filtered.length}
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 p-4 rounded-2xl text-sm
            bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40
            text-red-700 dark:text-red-400"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          Erro ao carregar dados: {error}
        </div>
      )}

      {/* Table card */}
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl
          border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b border-gray-100 dark:border-gray-700
            bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50
            dark:from-gray-800 dark:via-gray-800 dark:to-gray-800
            flex items-center justify-between flex-wrap gap-3"
        >
          <div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
              Atendimentos Realizados
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {dbAvailable
                ? "Pacientes com prontuário médico iniciado"
                : "Exibindo todas as anamneses (dados de prontuário indisponíveis no momento)"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search — visible when data is loaded */}
            {!loading && anamnesisRows.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome, e-mail, depto, objetivo..."
                  className="w-48 sm:w-64 pl-9 pr-8 py-2 text-sm rounded-xl
                    bg-white dark:bg-gray-700
                    border border-gray-200 dark:border-gray-600
                    text-gray-800 dark:text-gray-100
                    placeholder:text-gray-400 dark:placeholder:text-gray-500
                    focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40
                    transition-all duration-200"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2
                      text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                      transition-colors duration-150"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
            <button
              onClick={() => void fetchData()}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl
                text-gray-600 dark:text-gray-300
                border border-gray-200 dark:border-gray-600
                bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600
                disabled:opacity-50 transition-all duration-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
          </div>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-12 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse"
                style={{ opacity: 1 - i * 0.15 }}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && attendedRows.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center px-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center
                bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
            >
              <ClipboardList className="w-7 h-7" />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Nenhum atendimento realizado ainda
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs">
              Os atendimentos aparecerão aqui conforme os prontuários médicos
              forem iniciados na aba Colaboradores.
            </p>
          </div>
        )}

        {/* Empty filtered */}
        {!loading && !error && attendedRows.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center px-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center
                bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
            >
              <Search className="w-7 h-7" />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Nenhum resultado para "{search}"
            </p>
            <button
              onClick={() => setSearch("")}
              className="text-xs text-blue-500 dark:text-blue-400 hover:underline font-medium"
            >
              Limpar busca
            </button>
          </div>
        )}

        {/* Data table */}
        {!loading && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  {["Data", "Nome", "E-mail", "Depto", "Idade", "Status", "Ações"].map(
                    (col) => (
                      <th
                        key={col}
                        className={`px-4 py-3 text-xs font-semibold
                          text-gray-500 dark:text-gray-400 uppercase tracking-wide
                          first:pl-6 last:pr-6 whitespace-nowrap
                          ${col === "Ações" ? "text-right" : "text-left"}`}
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
                    className="hover:bg-slate-50 dark:hover:bg-gray-700/40
                      transition-colors duration-150 group"
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

                    {/* Idade */}
                    <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {row.data_nascimento ? `${calculateAge(row.data_nascimento)} anos` : "—"}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge status={row.status} />
                    </td>

                    {/* Ações */}
                    <td className="px-4 py-3.5 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/admin/atendimento/${row.id}`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold
                            text-emerald-600 dark:text-emerald-400
                            bg-emerald-50 dark:bg-emerald-900/20
                            hover:bg-emerald-100 dark:hover:bg-emerald-900/40
                            border border-emerald-100 dark:border-emerald-800/40
                            transition-all duration-150
                            opacity-0 group-hover:opacity-100"
                          title="Abrir prontuário médico"
                        >
                          <Stethoscope className="w-3 h-3" />
                          Prontuário
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {/* Footer count */}
            <div
              className="px-6 py-3 border-t border-gray-100 dark:border-gray-700
                bg-gray-50 dark:bg-gray-800/50
                text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between"
            >
              <span>
                {filtered.length} de {attendedRows.length} atendimento
                {attendedRows.length !== 1 ? "s" : ""}
                {search && " (filtrado)"}
              </span>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-blue-500 dark:text-blue-400 hover:underline font-medium"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Loading spinner overlay for refresh */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            Carregando atendimentos...
          </span>
        </div>
      )}
    </div>
  );
};

// ─── Denied fallback (fills admin content area, not full viewport) ──────────

const MedicosDeniedFallback: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className="flex items-center justify-center min-h-[55vh]"
  >
    <div
      className="max-w-md w-full
        backdrop-blur-xl bg-white/70 dark:bg-gray-900/70
        rounded-3xl border border-gray-200/60 dark:border-gray-800/60
        shadow-xl p-10 text-center"
    >
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.1 }}
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-red-500/25">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </motion.div>
      </div>

      {/* Title */}
      <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
        Acesso Restrito
      </h2>
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 mb-4">
        <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
        <span className="text-[11px] font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
          Área Médica
        </span>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
        Esta seção é reservada para profissionais de saúde autorizados.
        Entre em contato com o administrador se precisar de acesso.
      </p>
    </div>
  </motion.div>
);

// ─── Wrapper with medical auth gate ──────────────────────────────────────────

export default function AdminMedicosView() {
  return (
    <RequireMedicalAuth fallback={<MedicosDeniedFallback />}>
      <MedicosContent />
    </RequireMedicalAuth>
  );
}
