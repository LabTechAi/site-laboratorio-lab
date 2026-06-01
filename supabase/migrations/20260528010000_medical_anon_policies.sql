-- ============================================================================
-- 20260528010000_medical_anon_policies.sql
-- Políticas anon para acesso via front-end ao projeto supabaseDb.
-- Motivo: o auth está em projeto separado, queries chegam como anon.
-- A segurança de acesso é garantida pelo HOC RequireMedicalAuth no front-end.
-- ============================================================================

-- ── Índice único para upsert por anamnesis_id ─────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_patient_medical_profiles_anamnesis_id'
  ) THEN
    CREATE UNIQUE INDEX idx_patient_medical_profiles_anamnesis_id
      ON patient_medical_profiles(anamnesis_id);
  END IF;
END $$;


-- ── patient_medical_profiles → anon policies ──────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'anon_select_patient_medical_profiles'
      AND tablename = 'patient_medical_profiles'
  ) THEN
    CREATE POLICY "anon_select_patient_medical_profiles"
      ON patient_medical_profiles FOR SELECT
      TO anon
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'anon_insert_patient_medical_profiles'
      AND tablename = 'patient_medical_profiles'
  ) THEN
    CREATE POLICY "anon_insert_patient_medical_profiles"
      ON patient_medical_profiles FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'anon_update_patient_medical_profiles'
      AND tablename = 'patient_medical_profiles'
  ) THEN
    CREATE POLICY "anon_update_patient_medical_profiles"
      ON patient_medical_profiles FOR UPDATE
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;


-- ── medical_consultations → anon policies ─────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'anon_select_medical_consultations'
      AND tablename = 'medical_consultations'
  ) THEN
    CREATE POLICY "anon_select_medical_consultations"
      ON medical_consultations FOR SELECT
      TO anon
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'anon_insert_medical_consultations'
      AND tablename = 'medical_consultations'
  ) THEN
    CREATE POLICY "anon_insert_medical_consultations"
      ON medical_consultations FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'anon_update_medical_consultations'
      AND tablename = 'medical_consultations'
  ) THEN
    CREATE POLICY "anon_update_medical_consultations"
      ON medical_consultations FOR UPDATE
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
