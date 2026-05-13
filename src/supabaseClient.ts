import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase env vars not found. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Row type for the waitlist table ─────────────────────────────────────────
export interface WaitlistRow {
  id: string;
  nome: string;
  telefone: string;
  parceiro: string;
  status: "pendente" | "confirmado" | "cancelado";
  created_at: string;
}
