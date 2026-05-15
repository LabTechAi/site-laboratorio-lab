-- ============================================================================
-- Migration: Create pathologist_consultations table + RLS policies
--
-- Safe to run even if the table already exists (IF NOT EXISTS).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.pathologist_consultations (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          text        NOT NULL,
  email         text        NOT NULL,
  telefone      text        NOT NULL,
  numero_exame  text,
  mensagem      text        NOT NULL,
  status        text        NOT NULL DEFAULT 'pendente'
                            CHECK (status IN ('pendente', 'respondido')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE public.pathologist_consultations ENABLE ROW LEVEL SECURITY;

-- Allow any visitor (anon) to submit a consultation
DROP POLICY IF EXISTS "anon can insert pathologist_consultations"
  ON public.pathologist_consultations;

CREATE POLICY "anon can insert pathologist_consultations"
  ON public.pathologist_consultations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users (admins) to read all rows
DROP POLICY IF EXISTS "authenticated can select pathologist_consultations"
  ON public.pathologist_consultations;

CREATE POLICY "authenticated can select pathologist_consultations"
  ON public.pathologist_consultations
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users (admins) to update status
DROP POLICY IF EXISTS "authenticated can update pathologist_consultations"
  ON public.pathologist_consultations;

CREATE POLICY "authenticated can update pathologist_consultations"
  ON public.pathologist_consultations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
