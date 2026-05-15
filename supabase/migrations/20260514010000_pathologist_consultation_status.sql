-- ============================================================================
-- Migration: Add status column to pathologist_consultations
--
-- Adds a 'status' column so admins can track whether each consultation
-- has been answered or is still pending.
-- ============================================================================

ALTER TABLE public.pathologist_consultations
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pendente'
  CHECK (status IN ('pendente', 'respondido'));

-- Optional: allow authenticated users to update the status column.
-- Only needed if your RLS policy does not already permit this.
--
-- CREATE POLICY "Authenticated users can update status"
--   ON public.pathologist_consultations
--   FOR UPDATE
--   TO authenticated
--   USING (true)
--   WITH CHECK (true);
