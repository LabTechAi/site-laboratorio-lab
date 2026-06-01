import { createClient } from "@supabase/supabase-js";

const supabaseDbUrl = import.meta.env.VITE_SUPABASE_DB_URL as string;
const supabaseDbAnonKey = import.meta.env.VITE_SUPABASE_DB_ANON_KEY as string;

if (!supabaseDbUrl || !supabaseDbAnonKey) {
  throw new Error(
    "DB Supabase env vars not found. Set VITE_SUPABASE_DB_URL and VITE_SUPABASE_DB_ANON_KEY in your .env file."
  );
}

/**
 * Client for the medical data project (prontuário médico).
 * Tables: patient_medical_profiles, medical_consultations.
 */
export const supabaseDb = createClient(supabaseDbUrl, supabaseDbAnonKey);
