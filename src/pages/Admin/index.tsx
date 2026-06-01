import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, LogOut, RefreshCw, Users, ShieldCheck, AlertCircle,
  HeartPulse, Microscope, Building2, Sun, Moon,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { supabase, WaitlistRow } from "../../supabaseClient";
import AdminAuth from "../../components/AdminAuth";
import AdminPathologistViews from "./AdminPathologistViews";
import AdminColaboradoresView from "./AdminColaboradoresView";
import { useTheme } from "../../context/ThemeContext";

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
type Tab = "colaboradores" | "parceiros" | "patologista";

interface NavTab   { id: Tab;    label: string; Icon: React.ElementType; }
interface NavGroup { id: string; label: string; Icon: React.ElementType; tabs: NavTab[]; defaultTab: Tab; }

const NAV: NavGroup[] = [
  {
    id: "saude",
    label: "Saúde Preventiva",
    Icon: HeartPulse,
    defaultTab: "colaboradores",
    tabs: [
      { id: "colaboradores", label: "Colaboradores", Icon: Users     },
      { id: "parceiros",     label: "Parceiros",     Icon: Building2 },
    ],
  },
  {
    id: "patologista",
    label: "Patologista",
    Icon: Microscope,
    defaultTab: "patologista",
    tabs: [
      { id: "patologista", label: "Consultas", Icon: Microscope },
    ],
  },
];

// ─── Authenticated dashboard ──────────────────────────────────────────────────
const AdminDashboard: React.FC<{ email: string; onSignOut: () => void }> = ({
  email,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("colaboradores");
  const { isDark, toggleTheme } = useTheme();

  const activeGroup = NAV.find((g) => g.tabs.some((t) => t.id === activeTab))!;
  const subTabs     = activeGroup.tabs.length > 1 ? activeGroup.tabs : null;

  const handleGroupClick = (group: NavGroup) => {
    if (activeGroup.id !== group.id) setActiveTab(group.defaultTab);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <header className="
        sticky top-0 z-30
        bg-white/85 dark:bg-gray-900/85
        backdrop-blur-2xl saturate-150
        border-b border-gray-200/50 dark:border-white/[0.06]
        shadow-[0_1px_0_rgba(0,0,0,.04)]
      ">

        {/* Main bar */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8
          h-[62px] flex items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <img
              src="/assets/logo/LOGO-HOR.svg"
              alt="LAB"
              className="h-10 w-auto object-contain dark:hidden"
              draggable={false}
            />
            <img
              src="/assets/logo/LOGO-HOR-DM.svg"
              alt="LAB"
              className="h-10 w-auto object-contain hidden dark:block"
              draggable={false}
            />
            <span className="
              hidden sm:flex items-center gap-1.5
              text-[11px] font-bold uppercase tracking-[0.08em]
              text-gray-600 dark:text-gray-500
            ">
              <span className="h-3.5 w-px bg-gray-200 dark:bg-gray-700 rounded-full" />
              Admin
            </span>
          </div>

          {/* Desktop segmented control */}
          <nav aria-label="Navegação principal" className="hidden md:flex">
            <div className="
              flex items-center gap-[3px] p-[3px] rounded-2xl
              bg-gray-100/90 dark:bg-white/[0.06]
              ring-1 ring-black/[0.04] dark:ring-white/[0.04]
            ">
              {NAV.map((group) => {
                const isActive  = group.id === activeGroup.id;
                const GroupIcon = group.Icon;
                return (
                  <button
                    key={group.id}
                    onClick={() => handleGroupClick(group)}
                    className="
                      relative px-4 py-[7px] rounded-[13px]
                      flex items-center gap-2
                      transition-colors duration-150
                      outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50
                    "
                  >
                    {isActive && (
                      <motion.span
                        layoutId="group-pill"
                        className="
                          absolute inset-0 rounded-[13px]
                          bg-white dark:bg-gray-700
                          shadow-[0_1px_3px_rgba(0,0,0,.10),0_1px_2px_rgba(0,0,0,.06)]
                          dark:shadow-[0_1px_4px_rgba(0,0,0,.4)]
                          ring-[0.5px] ring-black/[0.06] dark:ring-white/[0.07]
                        "
                        transition={{ type: "spring", stiffness: 400, damping: 28 }}
                      />
                    )}
                    <GroupIcon className={[
                      "relative z-10 w-[14px] h-[14px] shrink-0 transition-colors duration-200",
                      isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400",
                    ].join(" ")} />
                    <span className={[
                      "relative z-10 text-[13px] font-medium whitespace-nowrap transition-colors duration-200",
                      isActive ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400",
                    ].join(" ")}>
                      {group.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* User + sign-out */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Theme toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              onClick={toggleTheme}
              aria-label={isDark ? "Alternar para modo claro" : "Alternar para modo escuro"}
              className="
                w-9 h-9 flex items-center justify-center rounded-xl
                bg-gray-100/80 dark:bg-white/[0.06]
                ring-1 ring-black/[0.04] dark:ring-white/[0.06]
                text-gray-600 dark:text-gray-300
                hover:bg-gray-200 dark:hover:bg-white/[0.12]
                transition-colors duration-150
              "
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isDark ? "moon" : "sun"}
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            <div className="
              hidden lg:flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-xl
              bg-gray-100/80 dark:bg-white/[0.05]
              ring-1 ring-black/[0.04] dark:ring-white/[0.04]
            ">
              <div className="
                w-5 h-5 rounded-full flex items-center justify-center
                bg-gradient-to-br from-blue-400 to-indigo-500
                text-white text-[9px] font-bold uppercase
                ring-1 ring-blue-400/30
              ">
                {email.slice(0, 1)}
              </div>
              <span className="text-[12px] font-medium text-gray-600 dark:text-gray-300
                max-w-[140px] truncate">
                {email}
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onSignOut}
              aria-label="Sair"
              className="
                flex items-center gap-1.5 px-3 py-[7px] rounded-xl
                text-[13px] font-semibold text-white
                bg-gradient-to-r from-red-500 to-rose-500
                hover:from-red-600 hover:to-rose-600
                shadow-sm shadow-red-500/20
                transition-colors duration-150
              "
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </motion.button>
          </div>
        </div>

        {/* Mobile group nav */}
        <div className="md:hidden flex border-t border-gray-100/70 dark:border-white/[0.05]">
          {NAV.map((group) => {
            const isActive  = group.id === activeGroup.id;
            const GroupIcon = group.Icon;
            return (
              <button
                key={group.id}
                onClick={() => handleGroupClick(group)}
                className={[
                  "flex-1 flex flex-col items-center gap-0.5 py-2.5 relative",
                  "text-[10px] font-semibold uppercase tracking-wider transition-colors duration-150",
                  isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500",
                ].join(" ")}
              >
                <GroupIcon className="w-4 h-4" />
                <span className="leading-none">{group.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="mobile-group-line"
                    className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full
                      bg-blue-500 dark:bg-blue-400"
                    transition={{ type: "spring", stiffness: 500, damping: 38 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Sub-tab bar – aparece apenas para seções com múltiplas abas */}
        <AnimatePresence>
          {subTabs && (
            <motion.div
              key={activeGroup.id + "-sub"}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden
                border-t border-gray-100/60 dark:border-white/[0.04]
                bg-gray-50/50 dark:bg-white/[0.015]"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-1 h-[44px]">
                  {subTabs.map((tab) => {
                    const isActive = tab.id === activeTab;
                    const TabIcon  = tab.Icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="
                          relative flex items-center gap-1.5 px-3 h-8 rounded-lg
                          transition-colors duration-150
                          outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40
                        "
                      >
                        {isActive && (
                          <motion.span
                            layoutId="subtab-bg"
                            className="absolute inset-0 rounded-lg
                              bg-blue-500/[0.09] dark:bg-blue-400/[0.12]"
                            transition={{ type: "spring", stiffness: 500, damping: 38 }}
                          />
                        )}
                        <TabIcon className={[
                          "relative z-10 w-[13px] h-[13px] transition-colors duration-150",
                          isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500",
                        ].join(" ")} />
                        <span className={[
                          "relative z-10 text-[13px] transition-colors duration-150",
                          isActive
                            ? "text-blue-600 dark:text-blue-400 font-semibold"
                            : "text-gray-500 dark:text-gray-400 font-medium",
                        ].join(" ")}>
                          {tab.label}
                        </span>
                        {isActive && (
                          <motion.div
                            layoutId="subtab-line"
                            className="absolute bottom-[-1px] left-0 right-0 h-[2px]
                              rounded-full bg-blue-500 dark:bg-blue-400"
                            transition={{ type: "spring", stiffness: 500, damping: 38 }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Page content */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {activeTab === "colaboradores" ? (
              <AdminColaboradoresView />
            ) : activeTab === "parceiros" ? (
              <WaitlistTab />
            ) : (
              <AdminPathologistViews />
            )}
          </motion.div>
        </AnimatePresence>
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
