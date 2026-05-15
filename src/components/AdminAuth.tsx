import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogIn, Eye, EyeOff, Sun, Moon,
  ChevronLeft, ChevronRight,
  Microscope, FlaskConical, Activity, BarChart3,
  MessageSquare, FileText, ShieldCheck,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";

// ─── Module carousel data ─────────────────────────────────────────────────────
const MODULES = [
  {
    icon: Microscope,
    title: "Anatomia Patológica",
    description:
      "Biópsias, peças cirúrgicas e análise morfológica celular para diagnóstico preciso de doenças.",
  },
  {
    icon: FlaskConical,
    title: "Biologia Molecular",
    description:
      "PCR em tempo real para diagnóstico de ISTs, mutações genéticas e rastreio oncológico.",
  },
  {
    icon: Activity,
    title: "Análises Clínicas",
    description:
      "Hematologia, bioquímica, imunologia, microbiologia, hormônios e marcadores tumorais.",
  },
  {
    icon: MessageSquare,
    title: "Consultas ao Patologista",
    description:
      "Canal direto com o patologista para esclarecimento de laudos e dúvidas técnicas.",
  },
  {
    icon: FileText,
    title: "Laudos e Resultados",
    description:
      "Portal online com histórico completo de exames e laudos digitais assinados.",
  },
  {
    icon: ShieldCheck,
    title: "Controle de Acesso",
    description:
      "Gestão segura de usuários internos com autenticação e permissões por área.",
  },
];

// ─── Framer Motion variants ───────────────────────────────────────────────────
const formVariants = {
  enter: { x: 20, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -20, opacity: 0 },
};

const slideVariants = {
  enter: (dir: string) => ({ opacity: 0, x: dir === "right" ? 40 : -40, scale: 0.95 }),
  center: { opacity: 1, x: 0, scale: 1 },
  exit: (dir: string) => ({ opacity: 0, x: dir === "right" ? -40 : 40, scale: 0.95 }),
};

const springTransition = { type: "spring" as const, stiffness: 300, damping: 30 };

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminAuth() {
  const { signIn, resetPassword } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [formView, setFormView] = useState<"login" | "forgot">("login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);

  const [activeSlide, setActiveSlide]       = useState(0);
  const [isAutoPlaying, setIsAutoPlaying]   = useState(true);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");

  const goToSlide = useCallback(
    (index: number, direction?: "left" | "right") => {
      setSlideDirection(direction ?? (index > activeSlide ? "right" : "left"));
      setActiveSlide(index);
    },
    [activeSlide]
  );

  const nextSlide = useCallback(
    () => goToSlide((activeSlide + 1) % MODULES.length, "right"),
    [activeSlide, goToSlide]
  );

  const prevSlide = useCallback(
    () => goToSlide((activeSlide - 1 + MODULES.length) % MODULES.length, "left"),
    [activeSlide, goToSlide]
  );

  useEffect(() => {
    if (!isAutoPlaying) return;
    const t = setInterval(nextSlide, 4500);
    return () => clearInterval(t);
  }, [isAutoPlaying, nextSlide]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (formView === "forgot") {
        const { error: err } = await resetPassword(email);
        if (err) {
          setError("Não foi possível enviar o e-mail de recuperação. Tente novamente.");
        } else {
          setForgotSent(true);
        }
      } else {
        const { error: err } = await signIn(email, password);
        if (err) {
          const msg = err.message ?? "";
          if (msg.includes("Invalid login credentials"))
            setError("E-mail ou senha incorretos. Verifique e tente novamente.");
          else if (msg.includes("Email not confirmed"))
            setError("Por favor, confirme seu e-mail antes de fazer login.");
          else
            setError("Ocorreu um erro ao fazer login. Tente novamente.");
        }
        // On success, useAuth hook updates session → parent gate re-renders
      }
    } catch {
      setError("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const switchView = (view: "login" | "forgot") => {
    setError(null);
    setForgotSent(false);
    setFormView(view);
  };

  // ── Input class ─────────────────────────────────────────────────────────────
  const inputCls =
    "w-full px-4 py-3 border border-slate-300 dark:border-gray-600 rounded-xl " +
    "focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 " +
    "transition-all duration-200 hover:border-slate-400 dark:hover:border-gray-500 " +
    "bg-white dark:bg-gray-900/50 backdrop-blur-sm " +
    "text-slate-800 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-400 " +
    "outline-none text-sm";

  return (
    <div className="min-h-screen flex w-full">

      {/* ══ LEFT PANEL — Branding (hidden on mobile) ═══════════════════════════ */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden
        bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900
        dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950
        flex-col items-center justify-center p-10">

        {/* Animated orbs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full blur-3xl animate-blob
          bg-gradient-to-r from-blue-200/50 to-cyan-200/50 dark:from-blue-500/20 dark:to-cyan-500/20" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full blur-3xl animate-blob animation-delay-2000
          bg-gradient-to-r from-indigo-200/50 to-blue-200/50 dark:from-indigo-500/20 dark:to-blue-500/20" />
        <div className="absolute top-2/3 left-1/4 w-72 h-72 rounded-full blur-3xl animate-blob animation-delay-4000
          bg-gradient-to-r from-cyan-200/30 to-blue-300/30 dark:from-cyan-500/15 dark:to-blue-500/15" />

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

        {/* Branding card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex flex-col items-center gap-5 w-full max-w-lg px-10 py-12
            bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-3xl
            border border-white/20 dark:border-white/10 shadow-2xl"
        >
          {/* Glow behind card */}
          <div className="absolute -inset-2 rounded-3xl blur-2xl -z-10 animate-pulse-soft
            bg-gradient-to-r from-blue-500/20 via-indigo-500/15 to-cyan-500/20" />

          {/* Logo with spinning ring */}
          <div className="relative inline-flex items-center justify-center">
            <div
              className="absolute w-32 h-32 rounded-full border-2 border-transparent animate-spin-slow"
              style={{
                background:
                  "linear-gradient(rgba(255,255,255,0.1),rgba(255,255,255,0.1)) padding-box, linear-gradient(to right,#1e3a8a,#3b82f6,#1e40af) border-box",
                animationDuration: "8s",
              }}
            />
            <div className="relative w-28 h-28 rounded-full bg-white/20 backdrop-blur-md
              border border-white/30 flex items-center justify-center shadow-lg">
              <img
                src="/assets/logo/LOGO-HOR-DM.svg"
                alt="LAB Laboratório e Medicina Diagnóstica"
                className="h-10 w-auto object-contain"
                draggable={false}
              />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white tracking-tight">LAB Admin</h2>
            <p className="text-blue-200/80 text-sm max-w-sm leading-relaxed">
              Sistema interno do Laboratório LAB — Medicina Diagnóstica
            </p>
          </div>

          <div className="w-20 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/15">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-soft" />
            <span className="text-blue-100/90 text-xs font-medium">{MODULES.length} módulos integrados</span>
          </div>
        </motion.div>

        {/* Module carousel */}
        <div
          className="relative z-10 w-full max-w-lg mt-7"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: "130px" }}>
            <AnimatePresence mode="wait" custom={slideDirection}>
              <motion.div
                key={activeSlide}
                custom={slideDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {(() => {
                  const mod = MODULES[activeSlide];
                  const Icon = mod.icon;
                  return (
                    <div className="w-full p-5 bg-white/[0.08] dark:bg-white/[0.04] backdrop-blur-lg
                      rounded-2xl border border-white/15 shadow-lg card-interactive cursor-default group">
                      <div className="flex items-start gap-4">
                        <div className="shrink-0 w-11 h-11 rounded-xl
                          bg-gradient-to-br from-blue-400/30 to-indigo-400/30
                          border border-white/20 flex items-center justify-center
                          group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-5 h-5 text-blue-200" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-sm mb-1
                            group-hover:text-blue-200 transition-colors duration-300">
                            {mod.title}
                          </h3>
                          <p className="text-blue-200/70 text-xs leading-relaxed">{mod.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel controls */}
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={prevSlide}
              className="p-2 rounded-xl bg-white/10 border border-white/15
                text-white/70 hover:bg-white/20 hover:text-white
                transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Módulo anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex gap-2">
              {MODULES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeSlide
                      ? "w-5 h-2 bg-blue-400"
                      : "w-2 h-2 bg-white/30 hover:bg-white/50"
                  }`}
                  aria-label={`Módulo ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="p-2 rounded-xl bg-white/10 border border-white/15
                text-white/70 hover:bg-white/20 hover:text-white
                transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Próximo módulo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ══ RIGHT PANEL — Form ════════════════════════════════════════════════ */}
      <div className="w-full lg:w-[55%] relative flex items-center justify-center p-4 sm:p-8
        bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50
        dark:from-gray-900 dark:via-gray-900 dark:to-gray-800
        transition-colors duration-300 overflow-hidden">

        {/* Mobile-only background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none lg:hidden">
          <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full blur-3xl animate-blob
            bg-gradient-to-r from-blue-200/50 to-cyan-200/50 dark:from-blue-900/30 dark:to-cyan-900/30" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full blur-3xl animate-blob animation-delay-2000
            bg-gradient-to-r from-indigo-200/50 to-blue-200/50 dark:from-indigo-900/30 dark:to-blue-900/30" />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none
          bg-[linear-gradient(rgba(30,58,138,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(30,58,138,0.03)_1px,transparent_1px)]
          dark:bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)]
          bg-[size:64px_64px]" />

        {/* Glass form card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md
            bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl
            rounded-3xl shadow-2xl shadow-slate-800/[0.12] dark:shadow-black/40
            pt-12 px-8 pb-8
            border border-slate-200/50 dark:border-gray-600/50"
        >
          {/* Glow behind card */}
          <div className="absolute -inset-1 rounded-3xl blur-xl -z-10
            bg-gradient-to-r from-blue-500/[0.12] via-indigo-500/[0.10] to-slate-500/[0.06]
            dark:from-blue-500/8 dark:via-indigo-500/8 dark:to-slate-500/8" />

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="absolute top-4 right-4 p-2 rounded-xl z-20
              bg-slate-100/80 dark:bg-gray-700/80
              hover:bg-slate-200 dark:hover:bg-gray-600
              text-slate-600 dark:text-gray-300
              transition-all duration-200"
            aria-label="Alternar tema"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Mobile logo */}
          <div className="text-center mb-6 lg:hidden">
            <div className="inline-flex items-center justify-center">
              <img
                src={isDark ? "/assets/logo/LOGO-HOR-DM.svg" : "/assets/logo/LOGO-HOR.svg"}
                alt="LAB"
                className="h-10 w-auto object-contain"
                draggable={false}
              />
            </div>
          </div>

          {/* ── Animated form area ────────────────────────────────────────── */}
          <AnimatePresence mode="wait" initial={false}>

            {/* ══ LOGIN ══ */}
            {formView === "login" && (
              <motion.div
                key="login"
                variants={formVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={springTransition}
              >
                <div className="text-center mb-7">
                  <h1 className="text-3xl font-bold mb-1">
                    <span className="bg-gradient-to-r from-blue-900 via-blue-700 to-indigo-800
                      dark:from-white dark:via-gray-100 dark:to-white
                      bg-clip-text text-transparent">
                      Bem-vindo
                    </span>
                  </h1>
                  <p className="text-slate-500 dark:text-gray-400 text-sm">
                    Faça login para acessar o painel administrativo
                  </p>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      key="err"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="mb-4 p-3 flex items-center gap-2 rounded-xl text-sm
                        bg-red-50 dark:bg-red-900/30
                        border border-red-200 dark:border-red-800
                        text-red-700 dark:text-red-300"
                    >
                      <span className="shrink-0 w-5 h-5 rounded-full bg-red-100 dark:bg-red-800
                        flex items-center justify-center text-red-500 dark:text-red-300 font-bold text-xs">
                        !
                      </span>
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="admin-email" className="block text-sm font-medium
                      text-slate-700 dark:text-gray-300 mb-1.5">
                      E-mail
                    </label>
                    <input
                      id="admin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="seu@laboratoriolab.com.br"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label htmlFor="admin-password" className="block text-sm font-medium
                      text-slate-700 dark:text-gray-300 mb-1.5">
                      Senha
                    </label>
                    <div className="relative">
                      <input
                        id="admin-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        placeholder="••••••••"
                        minLength={6}
                        className={`${inputCls} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2
                          text-slate-400 dark:text-gray-400
                          hover:text-slate-600 dark:hover:text-gray-200
                          p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-600
                          transition-colors"
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPassword
                          ? <EyeOff className="w-4 h-4" />
                          : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => switchView("forgot")}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline transition-colors"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white
                      bg-gradient-to-r from-blue-500 to-blue-600
                      shadow-md shadow-blue-500/25 dark:shadow-blue-500/15
                      hover:from-blue-600 hover:to-blue-700
                      hover:shadow-lg hover:shadow-blue-500/30
                      hover-lift transition-all duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        Entrar
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ══ FORGOT PASSWORD ══ */}
            {formView === "forgot" && (
              <motion.div
                key="forgot"
                variants={formVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={springTransition}
              >
                <div className="text-center mb-7">
                  <h1 className="text-2xl font-bold mb-1 text-gray-800 dark:text-gray-100">
                    Redefinir senha
                  </h1>
                  <p className="text-slate-500 dark:text-gray-400 text-sm">
                    Enviaremos as instruções para seu e-mail
                  </p>
                </div>

                {forgotSent ? (
                  <div className="text-center space-y-4 py-4">
                    <div className="w-14 h-14 mx-auto rounded-full bg-green-50 dark:bg-green-900/20
                      flex items-center justify-center ring-4 ring-green-100 dark:ring-green-800/30">
                      <ShieldCheck className="w-7 h-7 text-green-500" />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-gray-400">
                      Instruções enviadas para <strong>{email}</strong>. Verifique sua caixa de entrada.
                    </p>
                    <button
                      onClick={() => switchView("login")}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Voltar ao login
                    </button>
                  </div>
                ) : (
                  <>
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          key="err"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mb-4 p-3 rounded-xl text-sm
                            bg-red-50 dark:bg-red-900/30
                            border border-red-200 dark:border-red-800
                            text-red-700 dark:text-red-300"
                        >
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label htmlFor="forgot-email" className="block text-sm font-medium
                          text-slate-700 dark:text-gray-300 mb-1.5">
                          E-mail cadastrado
                        </label>
                        <input
                          id="forgot-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoComplete="email"
                          placeholder="seu@laboratoriolab.com.br"
                          className={inputCls}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white
                          bg-gradient-to-r from-blue-500 to-blue-600
                          shadow-md shadow-blue-500/25 hover:from-blue-600 hover:to-blue-700
                          hover-lift transition-all duration-200
                          disabled:opacity-50 disabled:cursor-not-allowed
                          flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          "Enviar instruções"
                        )}
                      </button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => switchView("login")}
                          className="text-sm text-slate-500 dark:text-gray-400
                            hover:text-blue-600 dark:hover:text-blue-400
                            transition-colors"
                        >
                          ← Voltar ao login
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
