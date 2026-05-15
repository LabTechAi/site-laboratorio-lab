import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw, Search, X, CheckCircle, RotateCcw,
  MessageCircle, AlertCircle, Loader2, Users, Filter,
} from "lucide-react";
import { supabase } from "../../supabaseClient";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ConsultationRow {
  id: string;
  created_at: string;
  nome: string;
  email: string;
  telefone: string;
  numero_exame: string | null;
  mensagem: string;
  status: "pendente" | "respondido";
}

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

function truncate(text: string, max = 80): string {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

function buildWhatsAppUrl(row: ConsultationRow): string {
  const digits = row.telefone.replace(/\D/g, "");
  const phone = digits.startsWith("55") ? digits : `55${digits}`;
  const ref = row.numero_exame
    ? `Exame nº ${row.numero_exame}`
    : formatDate(row.created_at);
  const message =
    `Olá ${row.nome}, sou do LAB Laboratório e Medicina Diagnóstica. ` +
    `Entramos em contato sobre sua solicitação de consulta com o Patologista (${ref}). ` +
    `Podemos te ajudar?`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span
    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
      status === "respondido"
        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
    }`}
  >
    {status}
  </span>
);

// ─── Row tooltip for full message ─────────────────────────────────────────────
const MessageCell: React.FC<{ text: string }> = ({ text }) => (
  <span
    className="block max-w-[200px] cursor-default"
    title={text}
  >
    {truncate(text)}
  </span>
);

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminPathologistViews() {
  const [rows, setRows]             = useState<ConsultationRow[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pendente" | "respondido">("all");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from("pathologist_consultations")
      .select("*")
      .order("created_at", { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setRows((data ?? []) as ConsultationRow[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => { void fetchRows(); }, [fetchRows]);

  // ── Status toggle ──────────────────────────────────────────────────────────
  const toggleStatus = async (row: ConsultationRow) => {
    const next = row.status === "pendente" ? "respondido" : "pendente";
    setTogglingId(row.id);

    // Optimistic update
    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, status: next } : r))
    );

    const { error: err } = await supabase
      .from("pathologist_consultations")
      .update({ status: next })
      .eq("id", row.id);

    if (err) {
      // Roll back
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, status: row.status } : r))
      );
      setError(`Erro ao atualizar status: ${err.message}`);
    }

    setTogglingId(null);
  };

  // ── Filtered rows ──────────────────────────────────────────────────────────
  const q = search.trim().toLowerCase();
  const filtered = rows.filter((r) => {
    const matchSearch = !q || r.nome.toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingCount    = rows.filter((r) => r.status === "pendente").length;
  const respondedCount  = rows.filter((r) => r.status === "respondido").length;

  return (
    <div className="space-y-5">

      {/* ── Summary cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total", value: rows.length, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "Pendentes", value: pendingCount, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
          { label: "Respondidos", value: respondedCount, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" },
        ].map((stat) => (
          <div key={stat.label}
            className="flex items-center gap-3 bg-white dark:bg-gray-800
              rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm px-5 py-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
              <Users className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 leading-none">
                {loading
                  ? <span className="inline-block w-6 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  : stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail…"
            className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl
              border border-gray-200 dark:border-gray-600
              bg-white dark:bg-gray-800
              text-gray-800 dark:text-gray-100
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
              transition-all duration-200"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2
                text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="pl-9 pr-4 py-2.5 text-sm rounded-xl appearance-none
              border border-gray-200 dark:border-gray-600
              bg-white dark:bg-gray-800
              text-gray-800 dark:text-gray-100
              focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
              transition-all duration-200 cursor-pointer"
          >
            <option value="all">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="respondido">Respondido</option>
          </select>
        </div>

        {/* Refresh */}
        <button
          onClick={() => void fetchRows()}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-xl
            text-gray-600 dark:text-gray-300
            border border-gray-200 dark:border-gray-600
            bg-white dark:bg-gray-800
            hover:bg-gray-50 dark:hover:bg-gray-700
            disabled:opacity-50 transition-all duration-200"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Atualizar</span>
        </button>
      </div>

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2 p-4 rounded-2xl text-sm
              bg-red-50 dark:bg-red-900/20
              border border-red-200 dark:border-red-800/40
              text-red-700 dark:text-red-400"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Table card ────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl
        border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700
          bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50
          dark:from-gray-800 dark:via-gray-800 dark:to-gray-800">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            Solicitações de Consulta ao Patologista
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            {q || statusFilter !== "all" ? " (filtrado)" : ""}
          </p>
        </div>

        {/* Loading skeleton */}
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
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center px-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center
              bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500">
              <MessageCircle className="w-7 h-7" />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {q || statusFilter !== "all"
                ? "Nenhum resultado para os filtros aplicados"
                : "Nenhuma solicitação encontrada"}
            </p>
            {(q || statusFilter !== "all") && (
              <button
                onClick={() => { setSearch(""); setStatusFilter("all"); }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}

        {/* Table */}
        {!loading && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  {["Data", "Nome", "Contato", "Nº Exame", "Mensagem", "Status", "Ações"].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-semibold
                        text-gray-500 dark:text-gray-400 uppercase tracking-wide
                        first:pl-6 last:pr-6"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/60">
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50 dark:hover:bg-gray-700/40 transition-colors duration-150"
                  >
                    {/* Data */}
                    <td className="px-4 py-3.5 pl-6 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                      {formatDate(row.created_at)}
                    </td>

                    {/* Nome */}
                    <td className="px-4 py-3.5 font-medium text-gray-800 dark:text-gray-100 whitespace-nowrap">
                      {row.nome}
                    </td>

                    {/* Contato */}
                    <td className="px-4 py-3.5">
                      <p className="text-gray-700 dark:text-gray-200 text-xs">{row.email}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">{row.telefone}</p>
                    </td>

                    {/* Nº Exame */}
                    <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 text-xs">
                      {row.numero_exame ?? <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </td>

                    {/* Mensagem */}
                    <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300 text-xs">
                      <MessageCell text={row.mensagem} />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusBadge status={row.status} />
                    </td>

                    {/* Ações */}
                    <td className="px-4 py-3.5 pr-6">
                      <div className="flex items-center gap-2">
                        {/* Toggle status */}
                        <button
                          onClick={() => void toggleStatus(row)}
                          disabled={togglingId === row.id}
                          title={row.status === "pendente" ? "Marcar como Respondido" : "Marcar como Pendente"}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
                            transition-all duration-200 disabled:opacity-50
                            ${row.status === "pendente"
                              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40"
                              : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/40"
                            }`}
                        >
                          {togglingId === row.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : row.status === "pendente" ? (
                            <CheckCircle className="w-3.5 h-3.5" />
                          ) : (
                            <RotateCcw className="w-3.5 h-3.5" />
                          )}
                          <span className="hidden sm:inline">
                            {row.status === "pendente" ? "Responder" : "Reabrir"}
                          </span>
                        </button>

                        {/* WhatsApp */}
                        <a
                          href={buildWhatsAppUrl(row)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Abrir WhatsApp"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
                            bg-green-500 hover:bg-green-600 text-white
                            transition-colors duration-200"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700
              bg-gray-50 dark:bg-gray-800/50
              text-xs text-gray-500 dark:text-gray-400">
              {filtered.length} de {rows.length} solicitação{rows.length !== 1 ? "ões" : ""}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
