-- Migration: collaborator_anamnesis
-- Tabela para armazenar as respostas do formulário de anamnese
-- coletado na página /colaboradores (projeto piloto LAB).

create table if not exists public.collaborator_anamnesis (
  id                       uuid primary key default gen_random_uuid(),

  -- Etapa 1: Identificação
  email                    text not null,
  nome_completo            text not null,
  data_nascimento          date not null,
  estado_civil             text not null
                             check (estado_civil in ('solteiro','casado','divorciado','viuvo')),

  -- Etapa 2: Objetivos
  objetivo_saude           text not null,
  importancia_participacao text not null,

  -- Etapa 3: Histórico (campos opcionais exceto possui_plano_saude)
  metricas_corporais       text,
  condicoes_saude          text,
  possui_plano_saude       boolean not null,

  -- Auditoria
  created_at               timestamptz not null default now()
);

-- Índice para buscas por e-mail
create index if not exists collaborator_anamnesis_email_idx
  on public.collaborator_anamnesis (email);

-- RLS: habilitar e bloquear leitura pública; permitir apenas INSERT anônimo
alter table public.collaborator_anamnesis enable row level security;

-- Qualquer visitante autenticado/anônimo pode inserir (formulário público)
create policy "allow_anon_insert"
  on public.collaborator_anamnesis
  for insert
  to anon, authenticated
  with check (true);

-- Apenas service_role pode ler/editar/deletar registros
create policy "allow_service_role_all"
  on public.collaborator_anamnesis
  for all
  to service_role
  using (true)
  with check (true);
