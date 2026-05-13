/**
 * helpData.ts — FAQ e categorias específicos do LAB – Laboratório e Medicina Diagnóstica.
 * Substitui os dados genéricos TechFind do react-components original.
 */

export interface HelpCategory {
  id: string;
  title: string;
  /** lucide-react icon name key */
  icon: "calendar" | "file-text" | "activity" | "credit-card" | "map-pin";
  description: string;
}

export interface HelpFAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export const helpCategories: HelpCategory[] = [
  {
    id: "agendamento",
    title: "Agendamento",
    icon: "calendar",
    description: "Como marcar seus exames",
  },
  {
    id: "resultados",
    title: "Resultados",
    icon: "file-text",
    description: "Prazos e formas de retirada",
  },
  {
    id: "exames",
    title: "Exames",
    icon: "activity",
    description: "Preparo e tipos de exames",
  },
  {
    id: "convenios",
    title: "Convênios",
    icon: "credit-card",
    description: "Planos aceitos e particular",
  },
  {
    id: "unidades",
    title: "Unidades",
    icon: "map-pin",
    description: "Endereços e horários",
  },
];

export const helpFaqs: HelpFAQ[] = [
  // ── Agendamento ────────────────────────────────────────────────────────────
  {
    id: 1,
    question: "Preciso agendar para fazer exames?",
    answer:
      "Sim, recomendamos o agendamento prévio para garantir seu atendimento no horário desejado e reduzir o tempo de espera. O agendamento pode ser feito por telefone ou WhatsApp. Em caso de urgência, entre em contato e verificaremos disponibilidade imediata.",
    category: "agendamento",
  },
  {
    id: 2,
    question: "Como posso fazer o agendamento?",
    answer:
      "O agendamento pode ser realizado por telefone, WhatsApp ou presencialmente em qualquer uma das nossas unidades. Basta informar o exame solicitado, o convênio ou preferência de pagamento, e escolher o horário disponível.",
    category: "agendamento",
  },
  {
    id: 3,
    question: "Posso reagendar ou cancelar um exame?",
    answer:
      "Sim. Para reagendar ou cancelar, entre em contato pelo telefone ou WhatsApp com antecedência mínima de 24 horas. Isso nos permite oferecer o horário a outro paciente.",
    category: "agendamento",
  },
  // ── Resultados ─────────────────────────────────────────────────────────────
  {
    id: 4,
    question: "Qual o prazo para receber os resultados?",
    answer:
      "O prazo varia conforme o exame. Análises clínicas de rotina ficam prontas em 24 a 48 horas. Anatomia patológica e biologia molecular podem levar de 3 a 10 dias úteis. Você será informado do prazo exato no momento da coleta.",
    category: "resultados",
  },
  {
    id: 5,
    question: "Como faço para retirar os resultados?",
    answer:
      "Os laudos podem ser retirados presencialmente em qualquer unidade, mediante documento com foto e protocolo do exame. Também disponibilizamos o Portal do Paciente (Meu Espaço Saúde), onde você acessa e baixa seus resultados com segurança a qualquer hora.",
    category: "resultados",
  },
  {
    id: 6,
    question: "O LAB disponibiliza resultados online?",
    answer:
      "Sim! Acesse o Portal do Paciente 'Meu Espaço Saúde' com as credenciais fornecidas no cadastro. Caso ainda não tenha cadastro, informe seu e-mail no momento da coleta para receber as instruções de acesso.",
    category: "resultados",
  },
  // ── Exames ─────────────────────────────────────────────────────────────────
  {
    id: 7,
    question: "Quais tipos de exames o LAB realiza?",
    answer:
      "O LAB oferece análises clínicas completas (hemograma, bioquímica, urina, coagulograma), biologia molecular, anatomia patológica, genética, microbiologia e muito mais. Consulte o portfólio completo na seção Exames.",
    category: "exames",
  },
  {
    id: 8,
    question: "Preciso estar em jejum para o exame?",
    answer:
      "Depende do exame. Glicemia, colesterol e triglicerídeos geralmente exigem 8 a 12 horas de jejum. Outros não requerem preparo especial. As instruções completas são fornecidas no agendamento conforme os exames prescritos.",
    category: "exames",
  },
  {
    id: 9,
    question: "O que é anatomia patológica?",
    answer:
      "Anatomia patológica é a especialidade que analisa tecidos e células para diagnosticar doenças, incluindo cânceres. O LAB conta com patologistas especializados e tecnologia de ponta. Analisa biópsias, peças cirúrgicas e citologias — diferente dos exames de sangue convencionais.",
    category: "exames",
  },
  // ── Convênios ──────────────────────────────────────────────────────────────
  {
    id: 10,
    question: "Quais convênios são aceitos?",
    answer:
      "Trabalhamos com os principais planos do mercado, incluindo setor público, setor privado, GEAP, Bradesco Saúde e Notre Dame Intermédica. Consulte a lista completa de convênios na seção Convênios do site.",
    category: "convenios",
  },
  {
    id: 11,
    question: "Atendem por particular?",
    answer:
      "Sim! Atendemos pacientes particulares com tabela acessível. Também atendemos por ordem de serviço (O.S.) para empresas e instituições. Entre em contato para verificar os valores dos exames desejados.",
    category: "convenios",
  },
  {
    id: 12,
    question: "Meu convênio cobre todos os exames?",
    answer:
      "A cobertura depende do seu plano e das orientações médicas. Recomendamos verificar com o convênio quais exames estão cobertos antes do agendamento. Nossa equipe pode auxiliar com informações sobre os exames mais comuns.",
    category: "convenios",
  },
  // ── Unidades ───────────────────────────────────────────────────────────────
  {
    id: 13,
    question: "Quais são as unidades do LAB em Brasília?",
    answer:
      "O LAB possui 4 unidades em Brasília-DF: Asa Sul (SGAS 915), Asa Norte (CLN 304), Lago Norte (SHIN QL 12) e Noroeste (SQNW 311). Todas oferecem estrutura completa para coleta e análise.",
    category: "unidades",
  },
  {
    id: 14,
    question: "Qual o horário de funcionamento?",
    answer:
      "Em geral, funcionamos de segunda a sexta das 7h às 18h e aos sábados das 7h às 12h. Horários podem variar por unidade. Consulte os detalhes de cada unidade na seção Unidades do site.",
    category: "unidades",
  },
  {
    id: 15,
    question: "O LAB realiza coleta domiciliar?",
    answer:
      "Sim, oferecemos coleta domiciliar para pacientes com mobilidade reduzida ou que preferem praticidade. Para solicitar, entre em contato pelo telefone ou WhatsApp informando seu endereço para verificarmos a disponibilidade na sua região.",
    category: "unidades",
  },
];
