-- ============================================================================
-- 20260605000000_medical_fields_expansion.sql
-- Expansão de campos: Identificação (patient_medical_profiles) e
-- Sinais Vitais + Hábitos (medical_consultations)
-- Projeto: supabaseDb (Dados Internos)
-- ============================================================================

-- ── 1. patient_medical_profiles — novos campos de identificação ───────────────

ALTER TABLE patient_medical_profiles
ADD COLUMN IF NOT EXISTS onde_mora TEXT,
ADD COLUMN IF NOT EXISTS com_mora  TEXT;

COMMENT ON COLUMN patient_medical_profiles.onde_mora IS 'Onde o paciente reside (cidade/bairro)';
COMMENT ON COLUMN patient_medical_profiles.com_mora  IS 'Com quem o paciente reside';


-- ── 2. medical_consultations — sinais vitais e hábitos ────────────────────────

ALTER TABLE medical_consultations
ADD COLUMN IF NOT EXISTS pa_sistolica      TEXT,
ADD COLUMN IF NOT EXISTS pa_diastolica     TEXT,
ADD COLUMN IF NOT EXISTS fc               TEXT,
ADD COLUMN IF NOT EXISTS saturacao        TEXT,
ADD COLUMN IF NOT EXISTS sono             TEXT,
ADD COLUMN IF NOT EXISTS apetite          TEXT,
ADD COLUMN IF NOT EXISTS tabagismo        TEXT,
ADD COLUMN IF NOT EXISTS etilismo         TEXT,
ADD COLUMN IF NOT EXISTS atividade_fisica TEXT;

COMMENT ON COLUMN medical_consultations.pa_sistolica  IS 'Pressão arterial — sistólica (mmHg)';
COMMENT ON COLUMN medical_consultations.pa_diastolica IS 'Pressão arterial — diastólica (mmHg)';
COMMENT ON COLUMN medical_consultations.fc           IS 'Frequência cardíaca (bpm)';
COMMENT ON COLUMN medical_consultations.saturacao    IS 'Saturação de oxigênio (%)';
COMMENT ON COLUMN medical_consultations.sono         IS 'Padrão de sono do paciente';
COMMENT ON COLUMN medical_consultations.apetite      IS 'Padrão de apetite do paciente';
COMMENT ON COLUMN medical_consultations.tabagismo    IS 'Histórico de tabagismo';
COMMENT ON COLUMN medical_consultations.etilismo     IS 'Histórico de etilismo';
COMMENT ON COLUMN medical_consultations.atividade_fisica IS 'Nível de atividade física';
