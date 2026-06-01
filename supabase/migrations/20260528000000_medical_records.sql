-- ============================================================================
-- 20260528000000_medical_records.sql
-- Módulo de Prontuário Médico — Tabelas com RLS restrito (apenas service_role)
-- Projeto: supabaseDb (Dados Internos)
-- ============================================================================

-- ── 1. patient_medical_profiles ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS patient_medical_profiles (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  anamnesis_id  UUID,
  naturalidade  TEXT,
  escolaridade  TEXT,
  profissao     TEXT,
  religiao      TEXT,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE patient_medical_profiles IS 'Perfis médicos dos pacientes, complementares à anamnese';
COMMENT ON COLUMN patient_medical_profiles.anamnesis_id IS 'FK opcional → collaborator_anamnesis.id (projeto de dados principal)';

ALTER TABLE patient_medical_profiles ENABLE ROW LEVEL SECURITY;

-- Apenas service_role pode acessar diretamente.
-- Operações via front-end devem passar por Edge Functions que validam a sessão
-- do supabaseAuth e repassam a query com a service_role key.
CREATE POLICY "service_role_all_patient_medical_profiles"
  ON patient_medical_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ── 2. medical_consultations ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS medical_consultations (
  id                         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id                 UUID NOT NULL REFERENCES patient_medical_profiles(id) ON DELETE CASCADE,
  doctor_id                  UUID,
  tipo_consulta              TEXT CHECK (tipo_consulta IN ('primeira', 'retorno')),
  comorbidades               TEXT,
  medicacoes_uso_continuo    TEXT,
  queixa_principal           TEXT,
  historia_doenca_atual      TEXT,
  historia_patologica_pregressa TEXT,
  historia_familiar          TEXT,
  hipoteses_diagnosticas     TEXT,
  conduta                    TEXT,
  evolucao_efeitos           TEXT,
  evolucao_adesao            TEXT,
  created_at                 TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE medical_consultations IS 'Consultas médicas vinculadas a um perfil de paciente';
COMMENT ON COLUMN medical_consultations.profile_id IS 'FK → patient_medical_profiles.id';
COMMENT ON COLUMN medical_consultations.doctor_id IS 'UUID do médico responsável (auth.users do supabaseAuth)';
COMMENT ON COLUMN medical_consultations.tipo_consulta IS 'primeira | retorno';

CREATE INDEX IF NOT EXISTS idx_medical_consultations_profile_id
  ON medical_consultations(profile_id);

ALTER TABLE medical_consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_medical_consultations"
  ON medical_consultations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
