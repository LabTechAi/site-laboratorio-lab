-- ============================================================================
-- Migration: Recreate pathologist_consultations — tabela + RLS + trigger
--
-- Executar via: Supabase Dashboard → SQL Editor (copie e cole tudo abaixo)
-- ============================================================================

-- ── 1. Remove objetos anteriores (ordem inversa de dependência) ───────────────

DROP TRIGGER  IF EXISTS on_pathologist_consultation_insert
  ON public.pathologist_consultations;

DROP FUNCTION IF EXISTS public.trigger_notify_pathologist_consultation();

DROP TABLE IF EXISTS public.pathologist_consultations;

-- ── 2. Recria a tabela ────────────────────────────────────────────────────────

CREATE TABLE public.pathologist_consultations (
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

-- ── 3. Row Level Security ─────────────────────────────────────────────────────

ALTER TABLE public.pathologist_consultations ENABLE ROW LEVEL SECURITY;

-- Qualquer visitante (anon) pode inserir uma consulta
CREATE POLICY "anon_insert_pathologist_consultations"
  ON public.pathologist_consultations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Anon pode ler (necessário pois auth e data são projetos Supabase separados —
-- a sessão do projeto auth não autentica queries no projeto data)
CREATE POLICY "anon_select_pathologist_consultations"
  ON public.pathologist_consultations
  FOR SELECT
  TO anon
  USING (true);

-- Anon pode atualizar o status (admin UI usa o mesmo client anon do projeto data)
CREATE POLICY "anon_update_pathologist_consultations"
  ON public.pathologist_consultations
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Usuários autenticados (admins) podem ler
CREATE POLICY "authenticated_select_pathologist_consultations"
  ON public.pathologist_consultations
  FOR SELECT
  TO authenticated
  USING (true);

-- Usuários autenticados (admins) podem atualizar o status
CREATE POLICY "authenticated_update_pathologist_consultations"
  ON public.pathologist_consultations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ── 4. Trigger de notificação (pg_net — função correta: net.http_post) ────────
--
-- NOTA: a versão anterior usava extensions.http_post() que não existe.
--       A função correta do pg_net no Supabase é net.http_post().
--       O trigger é AFTER INSERT e não bloqueia a transação principal.

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

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
  _secret   text;
BEGIN
  -- Tenta buscar o segredo no Supabase Vault (recomendado)
  BEGIN
    SELECT decrypted_secret
      INTO _secret
      FROM vault.decrypted_secrets
     WHERE name = 'notify_webhook_secret'
     LIMIT 1;
  EXCEPTION
    WHEN undefined_table THEN
      _secret := NULL;
  END;

  -- Fallback para parâmetro de banco (legado)
  IF _secret IS NULL OR _secret = '' THEN
    _secret := current_setting('app.notify_webhook_secret', true);
  END IF;

  _payload := jsonb_build_object(
    'type',       TG_OP,
    'table',      TG_TABLE_NAME,
    'schema',     TG_TABLE_SCHEMA,
    'record',     row_to_json(NEW),
    'old_record', NULL
  );

  _headers := jsonb_build_object('Content-Type', 'application/json');

  IF _secret IS NOT NULL AND _secret <> '' THEN
    _headers := _headers || jsonb_build_object('Authorization', 'Bearer ' || _secret);
  END IF;

  -- net.http_post é a função correta do pg_net no Supabase (não extensions.http_post)
  PERFORM net.http_post(
    url     := _endpoint,
    headers := _headers,
    body    := _payload::text
  );

  RETURN NEW;
EXCEPTION
  -- Isola falhas de notificação: o INSERT não é abortado se o webhook falhar
  WHEN others THEN
    RAISE WARNING 'notify_pathologist_consultation: webhook falhou — %', SQLERRM;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_pathologist_consultation_insert
  ON public.pathologist_consultations;

CREATE TRIGGER on_pathologist_consultation_insert
  AFTER INSERT ON public.pathologist_consultations
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_notify_pathologist_consultation();
