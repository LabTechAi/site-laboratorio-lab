/**
 * cpf-sign-in — Edge Function (projeto auth: jqxeqmeikqclmmongclj)
 *
 * Autentica um colaborador usando CPF + senha FlowLab.
 *
 * Fluxo:
 *   1. Recebe { cpf, password } no body (POST)
 *   2. Usa service-role para resolver CPF → email em user_profiles
 *      (a chave de serviço nunca sai do servidor)
 *   3. Autentica com supabase.auth.signInWithPassword(email, password)
 *   4. Retorna apenas { name, email, department } — sem tokens de sessão,
 *      pois a submissão da anamnese usa a anon key do projeto de dados.
 *
 * Segurança:
 *   – CPF e email nunca são expostos se a autenticação falhar
 *   – Erros de "CPF não encontrado" e "senha errada" retornam a mesma
 *     mensagem genérica (sem vazamento de informação / enumeração)
 *   – Rate limiting nativo do Supabase Auth protege contra brute-force
 *   – Service-role key existe apenas no ambiente da Edge Function
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // restrinja ao seu domínio em produção
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ─── CPF validation (same algorithm as front-end) ────────────────────────────

function validateCPF(cpf: string): boolean {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i);
  let r1 = (sum * 10) % 11;
  if (r1 >= 10) r1 = 0;
  if (r1 !== parseInt(d[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i);
  let r2 = (sum * 10) % 11;
  if (r2 >= 10) r2 = 0;
  return r2 === parseInt(d[10]);
}

// ─── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Método não permitido" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    // ── Parse body ──────────────────────────────────────────────────────────
    let cpf: unknown, password: unknown;
    try {
      ({ cpf, password } = await req.json());
    } catch {
      return new Response(
        JSON.stringify({ error: "Payload inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!cpf || !password) {
      return new Response(
        JSON.stringify({ error: "CPF e senha são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const rawCpf = String(cpf).replace(/\D/g, "");

    if (!validateCPF(rawCpf)) {
      return new Response(
        JSON.stringify({ error: "CPF inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── Resolve CPF → email (server-side only, service role) ────────────────
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: profile, error: profileErr } = await adminClient
      .from("user_profiles")
      .select("email, name, department")
      .eq("cpf", rawCpf)
      .single();

    if (profileErr || !profile?.email) {
      // Generic error — never reveal whether CPF exists
      return new Response(
        JSON.stringify({ error: "CPF ou senha inválidos" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── Authenticate with email + password ───────────────────────────────────
    // Uses the regular anon client so Supabase Auth rate limiting applies
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: authData, error: signInErr } = await anonClient.auth.signInWithPassword({
      email: profile.email,
      password: String(password),
    });

    if (signInErr || !authData?.session) {
      // Same generic message for wrong password
      return new Response(
        JSON.stringify({ error: "CPF ou senha inválidos" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── Success: return only profile data, not the session token ─────────────
    // The anamnesis form submits to the data project via anon key — no user
    // session is needed on the client side.
    return new Response(
      JSON.stringify({
        name:       profile.name       ?? "",
        email:      profile.email,
        department: profile.department ?? "",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Erro interno no servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
