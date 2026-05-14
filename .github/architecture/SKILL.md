---
name: architecture
description: >
  Analisa um projeto de tecnologia e gera (ou atualiza) um arquivo ARCHITECTURE.md com documentação arquitetural completa: visão geral, stack, estrutura de diretórios, decisões arquiteturais, fluxo de dados e diagramas Mermaid.
  Use esta skill sempre que o usuário pedir para documentar a arquitetura do projeto, criar ou atualizar ARCHITECTURE.md, explicar como o projeto está estruturado, gerar documentação técnica do projeto, ou usar termos como "arquitetura", "documentar projeto", "estrutura do projeto", "como o projeto funciona", "architecture doc", "tech doc". Acione também quando o usuário perguntar "como esse projeto está organizado?", "quais tecnologias esse projeto usa?" ou qualquer variação de documentar como o sistema funciona internamente.
---

# Skill: Architecture

Gera ou atualiza o arquivo `ARCHITECTURE.md` com documentação arquitetural completa e profunda de qualquer projeto de tecnologia.

O objetivo é que qualquer desenvolvedor novo — humano ou LLM — consiga entender o projeto rapidamente apenas lendo esse arquivo.

---

## Fase 1 — Exploração do projeto

Antes de escrever qualquer coisa, explore o projeto de forma abrangente. Rode os comandos em paralelo sempre que possível.

### 1.1 Estrutura e arquivos-chave

- Liste a estrutura de diretórios (`find . -maxdepth 4 -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/__pycache__/*' -not -path '*/dist/*' -not -path '*/.next/*'`)
- Leia os arquivos de configuração e manifesto:
  - `package.json` / `package-lock.json` / `yarn.lock` / `pnpm-lock.yaml`
  - `pyproject.toml` / `requirements.txt` / `setup.py`
  - `Cargo.toml` / `go.mod` / `pom.xml` / `build.gradle`
  - `Dockerfile` / `docker-compose.yml`
  - `.env.example` / `config/` / qualquer arquivo de configuração
  - `tsconfig.json` / `vite.config.*` / `next.config.*` / `webpack.config.*`
- Leia o `README.md` existente se houver

### 1.2 Código-fonte

- Identifique os pontos de entrada (`main.*`, `index.*`, `app.*`, `server.*`)
- Leia os arquivos de rota/endpoint principais
- Examine os modelos de dados (schemas, types, interfaces, models)
- Verifique testes para entender o comportamento esperado dos módulos
- Leia arquivos de CI/CD (`.github/workflows/`, `.gitlab-ci.yml`)

### 1.3 Verificar ARCHITECTURE.md existente

Se `ARCHITECTURE.md` já existir:
- Leia o arquivo atual
- Identifique seções que precisam ser atualizadas vs. mantidas
- Preserve informações históricas (decisões arquiteturais passadas, seção de ADRs)

---

## Fase 2 — Análise e síntese

Com base na exploração, sintetize:

1. **Tipo do projeto**: web app, API REST, CLI, biblioteca, microsserviços, monolito, etc.
2. **Stack tecnológica**: linguagens, frameworks, banco de dados, ferramentas de build, serviços externos
3. **Padrões arquiteturais em uso**: MVC, Clean Architecture, hexagonal, event-driven, serverless, etc.
4. **Fluxo de dados**: como os dados entram, são processados e saem do sistema
5. **Módulos e responsabilidades**: quais são os módulos principais e o que cada um faz
6. **Integrações externas**: APIs de terceiros, serviços de nuvem, filas, cache, etc.
7. **Decisões arquiteturais implícitas**: por que essa stack? por que essa estrutura?

---

## Fase 3 — Geração do ARCHITECTURE.md

Escreva o arquivo `ARCHITECTURE.md` na raiz do projeto com as seguintes seções. Adapte o idioma ao projeto: se o projeto usa inglês predominantemente (variáveis, comentários, commits), escreva em inglês; caso contrário, use português.

### Estrutura do ARCHITECTURE.md

```markdown
# Architecture — [Nome do Projeto]

> Última atualização: [data de hoje]

## Visão Geral / Overview

[2-4 parágrafos descrevendo o que o projeto faz, seu propósito e contexto de uso]

## Stack Tecnológica / Tech Stack

| Categoria         | Tecnologia        | Versão   | Observação              |
|-------------------|-------------------|----------|-------------------------|
| Linguagem         | TypeScript        | 5.x      |                         |
| Framework         | Next.js           | 14       | App Router              |
| Banco de dados    | PostgreSQL        | 16       | Via Supabase            |
| ...               | ...               | ...      |                         |

## Estrutura de Diretórios / Directory Structure

[Árvore de diretórios comentada explicando o propósito de cada pasta/arquivo importante]

src/
├── app/           # Rotas e páginas (Next.js App Router)
├── components/    # Componentes React reutilizáveis
│   ├── ui/        # Primitivos de UI (botões, inputs...)
│   └── features/  # Componentes de domínio
├── lib/           # Utilitários e integrações externas
├── hooks/         # React hooks customizados
└── types/         # Definições de tipos TypeScript


## Arquitetura do Sistema / System Architecture

[Diagrama Mermaid de alto nível mostrando os principais componentes e suas relações]

[Descrição em prosa da arquitetura: camadas, separação de responsabilidades, princípios seguidos]

## Fluxo de Dados / Data Flow

[Diagrama Mermaid de sequência ou flowchart mostrando como os dados fluem pelo sistema para os casos de uso principais]

[Descrição dos fluxos mais importantes: autenticação, CRUD principal, integrações]

## Módulos e Responsabilidades / Modules & Responsibilities

[Para cada módulo/camada principal, explique:]
- O que ele faz
- O que ele NÃO faz (boundaries)
- Com quem ele se comunica

## Integrações Externas / External Integrations

[Liste e explique cada serviço externo: APIs, bancos de dados, filas, storage, autenticação, etc.]

## Decisões Arquiteturais / Architectural Decisions

[ADRs informais ou lista das decisões mais relevantes:]

### [Título da decisão]
- **Contexto**: Por que essa decisão foi necessária
- **Decisão**: O que foi escolhido
- **Consequências**: Trade-offs e implicações

## Configuração e Variáveis de Ambiente / Configuration

[Lista das variáveis de ambiente necessárias com descrição (nunca valores reais)]

## Como Rodar Localmente / Local Development

[Instruções mínimas para rodar o projeto — só se não houver README.md detalhado]

## Roadmap Arquitetural / Architectural Roadmap (opcional)

[Melhorias planejadas ou débitos técnicos arquiteturais conhecidos]
```

### Regras de qualidade

- **Diagramas Mermaid são obrigatórios**: pelo menos um de arquitetura geral e um de fluxo de dados
- **A tabela de stack deve ter versões** quando identificáveis nos arquivos de configuração
- **A árvore de diretórios deve ter comentários** explicando o propósito de cada pasta principal
- **ADRs devem ser concretas**: não documente "usamos React porque é popular" — documente as razões reais observadas no projeto
- **Nunca inclua secrets ou valores de variáveis de ambiente reais**
- **Se ARCHITECTURE.md já existia**, preserve seções como ADRs históricas e adicione as novas no topo ou sinalize que foram atualizadas

---

## Fase 4 — Revisão final

Antes de finalizar, verifique:

- [ ] Todos os diagramas Mermaid são válidos (sintaxe correta)
- [ ] A stack está completa e com versões
- [ ] O fluxo de dados cobre os casos de uso principais do projeto
- [ ] As ADRs refletem decisões reais observadas no código, não suposições genéricas
- [ ] O idioma está consistente com o projeto
- [ ] Nenhum dado sensível foi incluído

Ao final, informe ao usuário que o `ARCHITECTURE.md` foi criado/atualizado e destaque as seções mais relevantes que foram geradas.
