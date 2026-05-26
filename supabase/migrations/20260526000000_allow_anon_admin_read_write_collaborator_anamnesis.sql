-- Migration: permite leitura/atualizacao da anamnese pelo cliente anon no projeto de dados.
-- Contexto: autenticacao ocorre em outro projeto Supabase (auth dedicado),
-- portanto as queries deste projeto chegam com role 'anon'.

-- SELECT para anon (idempotente)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'collaborator_anamnesis'
      and policyname = 'allow_anon_select'
  ) then
    create policy "allow_anon_select"
      on public.collaborator_anamnesis
      for select
      to anon
      using (true);
  end if;
end $$;

-- UPDATE para anon (idempotente)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'collaborator_anamnesis'
      and policyname = 'allow_anon_update'
  ) then
    create policy "allow_anon_update"
      on public.collaborator_anamnesis
      for update
      to anon
      using (true)
      with check (true);
  end if;
end $$;
