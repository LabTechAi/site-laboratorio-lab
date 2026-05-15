import { createClient } from "@supabase/supabase-js";

const supabaseAuthUrl = import.meta.env.VITE_SUPABASE_AUTH_URL as string;
const supabaseAuthAnonKey = import.meta.env.VITE_SUPABASE_AUTH_ANON_KEY as string;

if (!supabaseAuthUrl || !supabaseAuthAnonKey) {
  throw new Error(
    "Auth Supabase env vars not found. Set VITE_SUPABASE_AUTH_URL and VITE_SUPABASE_AUTH_ANON_KEY in your .env file."
  );
}

/**
 * Client dedicated to the authentication project.
 * Used exclusively by useAuth.ts — never for data queries.
 */
export const supabaseAuth = createClient(supabaseAuthUrl, supabaseAuthAnonKey);
