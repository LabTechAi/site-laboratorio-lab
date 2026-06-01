import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ShieldOff, ArrowLeft, HeartPulse, Lock } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { supabaseAuth } from "../supabaseAuthClient";

const ALLOWED_CUSTOM_ROLE_IDS = [
  "6cd20adb-9c9f-485f-bd17-f893a22f14c1",
  "cbb11266-d7b0-41b8-960c-3bd5cd529492",
];

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RequireMedicalAuth({ children, fallback }: Props) {
  const { user, loading: authLoading, authenticated } = useAuth();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!authenticated || !user) {
      setAuthorized(false);
      setChecking(false);
      return;
    }

    let cancelled = false;

    async function checkPermission() {
      try {
        const { data, error: dbError } = await supabaseAuth
          .from("user_profiles")
          .select("role, custom_role_id")
          .eq("id", user!.id)
          .single();

        if (cancelled) return;

        if (dbError) throw dbError;

        const hasAllowedRole =
          data.custom_role_id &&
          ALLOWED_CUSTOM_ROLE_IDS.includes(data.custom_role_id);

        const isAdmin = data.role === "admin";

        setAuthorized(hasAllowedRole || isAdmin);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Erro ao verificar permissões.",
        );
        setAuthorized(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    checkPermission();
    return () => { cancelled = true; };
  }, [user, authenticated, authLoading]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (authLoading || checking) {
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
          Verificando credenciais...
        </motion.p>
      </div>
    );
  }

  // ── Authorized → render children ──────────────────────────────────────────
  if (authorized) return <>{children}</>;

  // ── Custom fallback ───────────────────────────────────────────────────────
  if (fallback) return <>{fallback}</>;

  // ── Denied — premium glass-morphism screen ─────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      {/* Animated background dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-32 -right-32 w-96 h-96 bg-red-400/5 dark:bg-red-400/3 rounded-full blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-400/5 dark:bg-blue-400/3 rounded-full blur-3xl"
          animate={{ scale: [1.1, 0.95, 1.1], opacity: [0.5, 0.3, 0.5] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key="denied"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: -8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-md w-full"
        >
          {/* Glass card */}
          <div
            className="
              backdrop-blur-2xl
              bg-white/70 dark:bg-gray-900/70
              rounded-3xl
              border border-white/40 dark:border-gray-800/60
              shadow-2xl shadow-black/5 dark:shadow-black/30
              p-10 text-center
            "
          >
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.1 }}
                className="relative"
              >
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500 via-rose-500 to-pink-600 flex items-center justify-center shadow-2xl shadow-red-500/25">
                  <motion.div
                    animate={{ rotateY: [0, 360] }}
                    transition={{ repeat: Infinity, duration: 8, ease: "linear", repeatDelay: 2 }}
                  >
                    <Lock className="w-10 h-10 text-white" />
                  </motion.div>
                </div>
                {/* Pulse ring */}
                <motion.div
                  className="absolute inset-0 rounded-3xl border-2 border-red-400/30"
                  animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                />
              </motion.div>
            </div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
                Acesso Negado
              </h1>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 mb-4">
                <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                <span className="text-[11px] font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
                  Área Médica Restrita
                </span>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
                Você não possui as credenciais necessárias para acessar o
                módulo de prontuário médico. Esta área é reservada para
                profissionais de saúde autorizados.
              </p>
            </motion.div>

            {/* Error detail (dev only) */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4 text-[11px] text-red-400 dark:text-red-500 bg-red-50/50 dark:bg-red-900/10 rounded-lg px-3 py-2 font-mono overflow-hidden"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-8 flex flex-col gap-3"
            >
              <button
                onClick={() => window.history.back()}
                className="
                  w-full inline-flex items-center justify-center gap-2
                  px-6 py-3 rounded-2xl
                  bg-gradient-to-r from-red-500 to-rose-600
                  text-white font-bold text-sm
                  shadow-lg shadow-red-500/20
                  hover:from-red-600 hover:to-rose-700
                  active:scale-[0.98]
                  transition-all duration-200
                "
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>

              <button
                onClick={() => (window.location.href = "/")}
                className="
                  w-full inline-flex items-center justify-center gap-2
                  px-6 py-3 rounded-2xl
                  bg-white/60 dark:bg-gray-800/60
                  text-gray-600 dark:text-gray-300 font-medium text-sm
                  border border-gray-200 dark:border-gray-700
                  hover:bg-white dark:hover:bg-gray-800
                  active:scale-[0.98]
                  transition-all duration-200
                "
              >
                <HeartPulse className="w-4 h-4 text-blue-500" />
                Ir para a página inicial
              </button>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="
              mt-5 flex items-center justify-center gap-1.5
              text-xs text-gray-400 dark:text-gray-500
            "
          >
            <ShieldOff className="w-3.5 h-3.5 shrink-0 text-red-400" />
            Se você acredita que deveria ter acesso, entre em contato com o
            administrador.
          </motion.p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
