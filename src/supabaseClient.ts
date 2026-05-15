import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
// supabase-js >= 2.100 uses the publishable key (sb_publishable_...)
// Fall back to the legacy JWT anon key for local dev / older projects
const supabaseKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY
) as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase env vars not found. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Row type for the waitlist table ─────────────────────────────────────────
export interface WaitlistRow {
  id: string;
  nome: string;
  telefone: string;
  parceiro: string;
  status: "pendente" | "confirmado" | "cancelado";
  created_at: string;
}
