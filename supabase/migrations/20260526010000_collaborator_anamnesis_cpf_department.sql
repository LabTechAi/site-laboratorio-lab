-- Migration: adiciona colunas cpf e department à tabela collaborator_anamnesis
-- Projeto de dados: ezlhmejolbjqpxkpbgyg
-- Contexto: CPF é obtido via lookup no projeto de auth; department vem de user_profiles.

alter table public.collaborator_anamnesis
  add column if not exists cpf        text,
  add column if not exists department text;
