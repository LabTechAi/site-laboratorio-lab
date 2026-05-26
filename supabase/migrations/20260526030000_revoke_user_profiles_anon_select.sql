-- Migration: REVOGA a policy anon de SELECT em user_profiles
-- Projeto de auth: jqxeqmeikqclmmongclj
--
-- Contexto: a policy "allow_anon_select_by_cpf" criada anteriormente
-- permitia que qualquer chamada anon listasse user_profiles.
-- Com a Edge Function cpf-sign-in, essa exposição não é mais necessária:
-- o mapeamento CPF → email é feito com service_role dentro da Edge Function,
-- nunca no cliente.
--
-- IMPORTANTE: aplique esta migration ANTES de ativar a Edge Function em produção.

drop policy if exists "allow_anon_select_by_cpf" on public.user_profiles;

-- Garante que apenas usuários autenticados leem os próprios dados (padrão seguro)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'user_profiles'
      and policyname = 'users_read_own_profile'
  ) then
    create policy "users_read_own_profile"
      on public.user_profiles
      for select
      to authenticated
      using (auth.uid() = id);
  end if;
end $$;
