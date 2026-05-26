-- Migration: corrige políticas RLS de collaborator_anamnesis
-- Segura para re-executar (idempotente via DO $$ ... $$).
--
-- Contexto: a migration 20260517 foi criada no repositório mas nunca
-- executada no banco. Resultado: SELECT retornava array vazio sem erro
-- para usuários autenticados, pois só 'service_role' tinha permissão.

-- ── 1. Coluna de status (caso a migration 20260517 também não tenha rodado) ──
alter table public.collaborator_anamnesis
  add column if not exists status text not null default 'pendente'
    check (status in ('pendente', 'em_analise', 'contatado'));

-- ── 2. Policy de SELECT para admins autenticados (idempotente) ────────────────
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'collaborator_anamnesis'
      and policyname = 'allow_authenticated_select'
  ) then
    create policy "allow_authenticated_select"
      on public.collaborator_anamnesis
      for select
      to authenticated
      using (true);
  end if;
end $$;

-- ── 3. Policy de UPDATE para admins autenticados (idempotente) ────────────────
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'collaborator_anamnesis'
      and policyname = 'allow_authenticated_update'
  ) then
    create policy "allow_authenticated_update"
      on public.collaborator_anamnesis
      for update
      to authenticated
      using (true)
      with check (true);
  end if;
end $$;
