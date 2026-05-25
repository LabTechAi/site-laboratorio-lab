-- Migration: adiciona coluna status à tabela collaborator_anamnesis
-- e abre políticas de leitura/atualização para usuários autenticados (admins).

-- 1. Coluna de status (default pendente)
alter table public.collaborator_anamnesis
  add column if not exists status text not null default 'pendente'
    check (status in ('pendente', 'em_analise', 'contatado'));

-- 2. Admins autenticados podem ler todos os registros
create policy "allow_authenticated_select"
  on public.collaborator_anamnesis
  for select
  to authenticated
  using (true);

-- 3. Admins autenticados podem atualizar qualquer registro (ex.: mudar status)
create policy "allow_authenticated_update"
  on public.collaborator_anamnesis
  for update
  to authenticated
  using (true)
  with check (true);
