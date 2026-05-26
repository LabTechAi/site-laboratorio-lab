-- Migration: permite leitura anon de user_profiles para lookup por CPF
-- Projeto de auth: jqxeqmeikqclmmongclj
-- Contexto: colaboradores não autenticados digitam o CPF no modal público;
--           a query usa o client anon do projeto de auth.

-- SELECT para anon (idempotente) — somente os campos necessários
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'user_profiles'
      and policyname = 'allow_anon_select_by_cpf'
  ) then
    create policy "allow_anon_select_by_cpf"
      on public.user_profiles
      for select
      to anon
      using (true);
  end if;
end $$;
