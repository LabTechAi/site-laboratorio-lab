import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Loader2, LogOut, RefreshCw, Users, ShieldCheck, AlertCircle,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { supabase, WaitlistRow } from "../../supabaseClient";
import AdminAuth from "../../components/AdminAuth";
import AdminPathologistViews from "./AdminPathologistViews";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

const STATUS_STYLES: Record<string, string> = {
  pendente:   "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  confirmado: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  cancelado:  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize
    ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}>
    {status}
  </span>
);

// ─── Waitlist tab ─────────────────────────────────────────────────────────────
const WaitlistTab: React.FC = () => {
  const [rows, setRows]     = useState<WaitlistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("waitlist")
      .select("*")
      .order("created_at", { ascending: false });
    if (err) setError(err.message);
    else setRows(data as WaitlistRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { void fetchRows(); }, [fetchRows]);

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="inline-flex items-center gap-3
        bg-white dark:bg-gray-800 rounded-2xl
        border border-gray-100 dark:border-gray-700 shadow-sm px-5 py-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center
          bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total de cadastros</p>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 leading-none">
            {loading
              ? <span className="inline-block w-8 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              : rows.length}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div role="alert" className="flex items-start gap-2 p-4 rounded-2xl text-sm
          bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40
          text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          Erro ao carregar dados: {error}
        </div>
      )}

      {/* Table card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl
        border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">

        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700
          bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50
          dark:from-gray-800 dark:via-gray-800 dark:to-gray-800
          flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
              Cadastros na lista de espera
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Ordenados por data (mais recentes primeiro)
            </p>
          </div>
          <button
            onClick={() => void fetchRows()}
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

        {loading && (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse"
                style={{ opacity: 1 - i * 0.15 }} />
            ))}
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center px-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center
              bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500">
              <Users className="w-7 h-7" />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Nenhum cadastro encontrado</p>
          </div>
        )}

        {!loading && rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  {["Data", "Nome", "Telefone", "Parceiro", "Status"].map((col) => (
                    <th key={col} className="px-4 py-3 text-left text-xs font-semibold
                      text-gray-500 dark:text-gray-400 uppercase tracking-wide first:pl-6 last:pr-6">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/60">
                {rows.map((row) => (
                  <tr key={row.id}
                    className="hover:bg-slate-50 dark:hover:bg-gray-700/40 transition-colors duration-150">
                    <td className="px-4 py-3.5 pl-6 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-800 dark:text-gray-100 max-w-[180px] truncate">
                      {row.nome}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {row.telefone}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300 max-w-[200px] truncate">
                      {row.parceiro}
                    </td>
                    <td className="px-4 py-3.5 pr-6">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700
              bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400">
              {rows.length} cadastro{rows.length !== 1 ? "s" : ""} no total
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Tab type ─────────────────────────────────────────────────────────────────
type Tab = "waitlist" | "patologista";

const TABS: { id: Tab; label: string }[] = [
  { id: "waitlist",    label: "Lista de Espera" },
  { id: "patologista", label: "Consultas Patologistas" },
];

// ─── Authenticated dashboard ──────────────────────────────────────────────────
const AdminDashboard: React.FC<{ email: string; onSignOut: () => void }> = ({
  email,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("waitlist");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      {/* Sticky header */}
      <header className="sticky top-0 z-20 bg-white dark:bg-gray-800
        border-b border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
          h-14 flex items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center
              bg-gradient-to-br from-blue-500 to-indigo-600">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <img
              src="/assets/logo/LOGO-HOR.svg"
              alt="LAB"
              className="h-7 w-auto object-contain dark:hidden"
              draggable={false}
            />
            <img
              src="/assets/logo/LOGO-HOR-DM.svg"
              alt="LAB"
              className="h-7 w-auto object-contain hidden dark:block"
              draggable={false}
            />
            <span className="hidden sm:block text-xs text-gray-400 dark:text-gray-500 font-medium">
              · Admin
            </span>
          </div>

          {/* Tabs (desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${activeTab === tab.id
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* User + sign out */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 truncate max-w-[160px]">
              {email}
            </span>
            <button
              onClick={onSignOut}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium
                text-white rounded-xl shadow-md shadow-red-500/20
                bg-gradient-to-r from-red-500 to-rose-500
                hover:from-red-600 hover:to-rose-600
                transition-all duration-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Tabs (mobile) */}
        <div className="md:hidden flex border-t border-gray-100 dark:border-gray-700">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors duration-150
                ${activeTab === tab.id
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-500 dark:text-gray-400"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {activeTab === "waitlist" ? <WaitlistTab /> : <AdminPathologistViews />}
        </motion.div>
      </main>
    </div>
  );
};

// ─── Root: auth gate ──────────────────────────────────────────────────────────
export default function Admin() {
  const { authenticated, loading, user, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center
        bg-slate-50 dark:bg-gray-900">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return <AdminAuth />;
  }

  return (
    <AdminDashboard
      email={user?.email ?? ""}
      onSignOut={() => void signOut()}
    />
  );
}
