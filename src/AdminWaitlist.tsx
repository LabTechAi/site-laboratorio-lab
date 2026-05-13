/**
 * AdminWaitlist.tsx — Painel de Administração da Lista de Espera
 *
 * Autenticação via Supabase Auth (email + senha).
 * Exibe tabela com todos os cadastros da waitlist, ordenados por data.
 * Estilizado de acordo com o Design System FlowLAB.
 *
 * Rota sugerida: /admin  (configure no React Router ou equivalente)
 * Exemplo Next.js App Router: adicione "use client" na primeira linha.
 */

import React, { useState, useEffect, useCallback } from "react";
import { supabase, WaitlistRow } from "./supabaseClient";
import {
  LogOut,
  Loader2,
  ShieldCheck,
  RefreshCw,
  Users,
  AlertCircle,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

const STATUS_STYLES: Record<string, string> = {
  pendente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  confirmado: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  cancelado: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span
    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
      STATUS_STYLES[status] ?? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
    }`}
  >
    {status}
  </span>
);

// ─────────────────────────────────────────────────────────────────────────────
// Login screen
// ─────────────────────────────────────────────────────────────────────────────

const LoginScreen: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputCls =
    "w-full px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl " +
    "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 " +
    "dark:focus-visible:ring-offset-gray-900 focus:border-blue-500 " +
    "transition-all duration-200 hover:border-slate-300 dark:hover:border-gray-500 " +
    "bg-white dark:bg-gray-800 text-slate-800 dark:text-gray-100 " +
    "placeholder:text-slate-400 dark:placeholder:text-gray-500 text-sm outline-none";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50
        dark:from-gray-900 dark:via-gray-900 dark:to-gray-900
        flex items-center justify-center p-4"
    >
      <div
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-3xl
          shadow-2xl shadow-slate-900/10 dark:shadow-black/30
          p-8 w-full max-w-sm border border-slate-200/50 dark:border-gray-700/50"
      >
        {/* Logo mark */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center
              bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30"
          >
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Área Administrativa
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              LAB Lista de Espera
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-gray-300">
              E-mail
            </label>
            <input
              type="email"
              placeholder="admin@exemplo.com"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-gray-300">
              Senha
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
            />
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20
                border border-red-200 dark:border-red-800/40
                rounded-xl p-3 text-sm text-red-700 dark:text-red-400"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600
              text-white font-semibold rounded-xl shadow-md shadow-blue-500/25
              hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:shadow-blue-500/30
              transition-all duration-200 text-sm
              disabled:opacity-70 disabled:cursor-not-allowed
              flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard (waitlist table)
// ─────────────────────────────────────────────────────────────────────────────

const Dashboard: React.FC<{ onSignOut: () => void }> = ({ onSignOut }) => {
  const [rows, setRows] = useState<WaitlistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("waitlist")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setRows(data as WaitlistRow[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchRows();
  }, [fetchRows]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onSignOut();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      {/* ── Admin header ──────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-20 bg-white dark:bg-gray-800
          border-b border-gray-100 dark:border-gray-700
          shadow-sm"
      >
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
            h-14 flex items-center justify-between gap-4"
        >
          {/* Left: brand */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center
                bg-gradient-to-br from-blue-500 to-indigo-600"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
              Admin · Lista de Espera
            </span>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => void fetchRows()}
              disabled={loading}
              aria-label="Atualizar lista"
              title="Atualizar lista"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium
                text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700
                border border-gray-200 dark:border-gray-600
                rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600
                transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

            <button
              onClick={() => void handleSignOut()}
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
      </header>

      {/* ── Page content ──────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary card */}
        <div className="mb-6">
          <div
            className="inline-flex items-center gap-3 bg-white dark:bg-gray-800
              rounded-2xl border border-gray-100 dark:border-gray-700
              shadow-sm px-5 py-4"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center
                bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
            >
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Total de cadastros
              </p>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 leading-none">
                {loading ? (
                  <span className="inline-block w-8 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                ) : (
                  rows.length
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20
              border border-red-200 dark:border-red-800/40 rounded-2xl
              p-4 mb-6 text-sm text-red-700 dark:text-red-400"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Erro ao carregar dados: {error}</span>
          </div>
        )}

        {/* ── Table card ─────────────────────────────────────────────────── */}
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl
            border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
        >
          {/* Table header */}
          <div
            className="px-6 py-4 border-b border-gray-100 dark:border-gray-700
              bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50
              dark:from-gray-800 dark:via-gray-800 dark:to-gray-800"
          >
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
              Cadastros na lista de espera
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Ordenados por data de cadastro (mais recentes primeiro)
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
          {!loading && !error && rows.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center px-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center
                  bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
              >
                <Users className="w-7 h-7" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Nenhum cadastro encontrado
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Os cadastros aparecerão aqui assim que os primeiros usuários se inscreverem.
              </p>
            </div>
          )}

          {/* Table */}
          {!loading && rows.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    {["Data", "Nome", "Telefone", "Parceiro", "Status"].map((col) => (
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
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50 dark:hover:bg-gray-700/40
                        transition-colors duration-150"
                    >
                      {/* Data */}
                      <td className="px-4 py-3.5 pl-6 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(row.created_at)}
                      </td>

                      {/* Nome */}
                      <td className="px-4 py-3.5 font-medium text-gray-800 dark:text-gray-100 max-w-[180px] truncate">
                        {row.nome}
                      </td>

                      {/* Telefone */}
                      <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {row.telefone}
                      </td>

                      {/* Parceiro */}
                      <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300 max-w-[200px] truncate">
                        {row.parceiro}
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3.5 pr-6">
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer with count */}
              <div
                className="px-6 py-3 border-t border-gray-100 dark:border-gray-700
                  bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400"
              >
                {rows.length} cadastro{rows.length !== 1 ? "s" : ""} no total
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Root: session gate
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminWaitlist() {
  const [session, setSession] = useState<boolean | null>(null); // null = checking

  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(!!data.session);
    });

    // Keep session state in sync (handles tab focus, token refresh, signOut)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(!!s);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Still checking session — show a neutral loading screen
  if (session === null) {
    return (
      <div
        className="min-h-screen flex items-center justify-center
          bg-slate-50 dark:bg-gray-900"
      >
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <LoginScreen onSuccess={() => setSession(true)} />;
  }

  return <Dashboard onSignOut={() => setSession(false)} />;
}
