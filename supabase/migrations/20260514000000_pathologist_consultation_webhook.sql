-- ============================================================================
-- Migration: Database Webhook → notify-pathologist-consultation
--
-- Aciona a Edge Function sempre que um novo registro for inserido na tabela
-- `pathologist_consultations`.
--
-- Pré-requisitos:
--   1. A tabela `pathologist_consultations` deve existir.
--   2. A extensão `pg_net` deve estar ativa (já habilitada por padrão no Supabase).
--   3. Substitua <SERVICE_ROLE_KEY> pela chave service_role do seu projeto
--      (Supabase Dashboard → Settings → API → service_role key).
--      OU configure via Supabase Vault (ver comentário abaixo).
-- ============================================================================

-- Habilita pg_net se ainda não estiver ativa
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

-- ─── Função de trigger ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trigger_notify_pathologist_consultation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _payload  jsonb;
  _headers  jsonb;
  _endpoint text := 'https://ezlhmejolbjqpxkpbgyg.supabase.co/functions/v1/notify-pathologist-consultation';
  -- ⚠️  Substitua pelo NOTIFY_WEBHOOK_SECRET que você configurou na Edge Function.
  --     Alternativa segura: use Supabase Vault e leia com
  --       vault.decrypted_secrets WHERE name = 'notify_webhook_secret'
  _secret   text := current_setting('app.notify_webhook_secret', true);
BEGIN
  _payload := jsonb_build_object(
    'type',       TG_OP,
    'table',      TG_TABLE_NAME,
    'schema',     TG_TABLE_SCHEMA,
    'record',     row_to_json(NEW),
    'old_record', NULL
  );

  _headers := jsonb_build_object(
    'Content-Type',  'application/json',
    'Authorization', 'Bearer ' || COALESCE(_secret, '')
  );

  PERFORM extensions.http_post(
    url     := _endpoint,
    headers := _headers,
    body    := _payload::text
  );

  RETURN NEW;
END;
$$;

-- ─── Trigger na tabela ────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS on_pathologist_consultation_insert ON public.pathologist_consultations;

CREATE TRIGGER on_pathologist_consultation_insert
  AFTER INSERT ON public.pathologist_consultations
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_notify_pathologist_consultation();

-- ─── Configurar o secret via parâmetro de sessão (opcional) ──────────────────
-- Se preferir usar Supabase Vault (recomendado para produção):
--
--   INSERT INTO vault.secrets (name, secret)
--   VALUES ('notify_webhook_secret', '<seu-secret-aqui>')
--   ON CONFLICT (name) DO UPDATE SET secret = EXCLUDED.secret;
--
-- E no trigger, substitua current_setting(...) por:
--   (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'notify_webhook_secret')
-- ============================================================================
