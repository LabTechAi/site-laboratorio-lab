/**
 * AboutSection.tsx — "Sobre Nós"
 * Fiel ao layout original: vídeo, texto, 3 cards MVV com fundo cinza uniforme
 * e imagens reais dos ícones, accordion de valores idêntico ao HTML original.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Users, Target, Rocket, TrendingUp, Heart, ShieldCheck } from "lucide-react";

// ─── Variants ────────────────────────────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ─── Dados dos valores ────────────────────────────────────────────────────────
const VALUES = [
  {
    icon: Users,
    title: "Senso de time",
    body: (
      <>
        <p>Uma unidade, uma só linguagem. A força do nosso time está na soma de talentos diversos que compartilham uma mesma visão.</p>
        <p className="italic mt-2">"Sendo um só povo, com uma só língua, não haverá limites para o que ousarmos fazer."</p>
        <p className="mt-2">Inspirados nessa ideia, sabemos que, quando trabalhamos como um só time, alcançamos resultados inimagináveis.</p>
      </>
    ),
  },
  {
    icon: Target,
    title: "Foco implacável no cliente",
    body: (
      <p>Colocamos nossos clientes no centro de tudo o que fazemos. Nosso objetivo vai além de atender às necessidades imediatas — buscamos encantar, superar expectativas e construir relacionamentos duradouros. Entregar sempre mais do que prometemos é reflexo do nosso compromisso com confiança mútua e experiências memoráveis.</p>
    ),
  },
  {
    icon: Rocket,
    title: "Espírito empreendedor",
    body: (
      <p>Incentivamos todos a tomar iniciativa, buscar soluções criativas e assumir riscos calculados para promover melhorias contínuas. O protagonismo e a coragem para inovar fazem parte do nosso jeito de ser.</p>
    ),
  },
  {
    icon: TrendingUp,
    title: "Constante evolução",
    body: (
      <p>Estamos em movimento permanente. Buscamos todos os dias aprimorar nossas habilidades, processos e horizontes. O aprendizado contínuo faz parte do nosso DNA e impulsiona a excelência nos resultados para nossos pacientes e parceiros.</p>
    ),
  },
  {
    icon: Heart,
    title: "Empatia",
    body: (
      <>
        <p className="italic mb-2">"Assim, em tudo, façam aos outros o que vocês querem que eles lhes façam." (Mateus 7:12)</p>
        <p>Estamos atentos às histórias e necessidades de cada paciente, parceiro e colega de trabalho. Ouvir, compreender e acolher são pilares do nosso cuidado.</p>
      </>
    ),
  },
  {
    icon: ShieldCheck,
    title: "Autorresponsabilidade",
    body: (
      <p>Somos responsáveis por nossas ações e decisões. Agimos com ética, transparência e consciência em todas as nossas relações.</p>
    ),
  },
];

// ─── ValorItem ────────────────────────────────────────────────────────────────
const ValorItem: React.FC<{ icon: React.ElementType; title: string; body: React.ReactNode }> = ({ icon: Icon, title, body }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-xl overflow-hidden transition-all duration-300 backdrop-blur-sm
      border ${
        open
          ? "bg-white/70 dark:bg-white/5 border-blue-400/50 dark:border-blue-500/40 shadow-sm shadow-blue-500/10"
          : "bg-white/50 dark:bg-white/[0.04] border-white/60 dark:border-white/10"
      }`}>
      <button
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-4 py-4 text-left
          hover:bg-blue-50/60 dark:hover:bg-white/5 transition-colors duration-200 select-none"
      >
        <Icon className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
        <span className="flex-1 text-sm font-semibold text-slate-800 dark:text-gray-100">
          {title}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="w-4 h-4 text-slate-400 dark:text-gray-500 shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-white/40 dark:border-white/10
              text-sm text-slate-600 dark:text-gray-300 leading-[1.75] text-left space-y-2">
              {body}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── MVV Card ─────────────────────────────────────────────────────────────────
const MvvCard: React.FC<{ icon: string; iconAlt: string; title: string; children: React.ReactNode }> = ({
  icon, iconAlt, title, children,
}) => (
  <motion.div
    variants={fadeInUp}
    whileHover={{ y: -5 }}
    transition={{ type: "spring", stiffness: 300, damping: 24 }}
    className="group relative px-[30px] py-[40px] rounded-2xl text-center
      bg-white/80 dark:bg-gray-800/60
      backdrop-blur-[14px]
      border border-slate-200/50 dark:border-white/10
      shadow-lg shadow-slate-900/10 dark:shadow-black/30
      hover:shadow-xl hover:shadow-slate-900/15 dark:hover:shadow-black/40
      hover:border-blue-300/60 dark:hover:border-blue-500/40
      transition-all duration-300 overflow-hidden"
  >
    {/* Glow de fundo no hover */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 to-indigo-500/0
      group-hover:from-blue-500/5 group-hover:to-indigo-500/5
      dark:group-hover:from-blue-500/10 dark:group-hover:to-indigo-500/10
      transition-all duration-500 pointer-events-none" />
    {/* Borda shimmer */}
    <div className="absolute inset-0 rounded-2xl pointer-events-none
      bg-gradient-to-br from-blue-400/0 via-blue-500/20 to-indigo-500/0
      dark:from-blue-400/0 dark:via-blue-500/30 dark:to-indigo-500/0
      opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{ padding: "1px", WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }} />
    {/* Ícone real — envolto em anel sutil */}
    <div className="relative w-20 h-20 mx-auto mb-5
      rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50
      dark:from-blue-900/30 dark:to-indigo-900/20
      border border-blue-100/80 dark:border-blue-800/40
      flex items-center justify-center
      shadow-md shadow-blue-500/10">
      <img
        src={icon}
        alt={iconAlt}
        className="w-18 h-18 object-contain
          [filter:brightness(0)_saturate(100%)_invert(20%)_sepia(80%)_saturate(1500%)_hue-rotate(210deg)]
          dark:[filter:none]"
      />
    </div>
    <h3 className="relative text-base font-extrabold tracking-widest uppercase mb-5
      bg-gradient-to-r from-blue-700 to-indigo-700
      dark:from-blue-400 dark:to-indigo-400
      bg-clip-text text-transparent">
      {title}
    </h3>
    <div className="relative">{children}</div>
  </motion.div>
);

// ─── Main component ───────────────────────────────────────────────────────────
export default function AboutSection() {
  return (
    <section id="sobre" className="py-16 md:py-20 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* ── Vídeo institucional ─────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="mx-auto max-w-3xl rounded-2xl overflow-hidden shadow-xl
            shadow-slate-900/10 dark:shadow-black/30
            border border-gray-100 dark:border-gray-700"
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            controls
            poster="/assets/video de abertura/thumbnail.jpg"
            className="w-full h-auto bg-black"
            preload="auto"
          >
            <source src="/assets/video de abertura/Site LAB.mp4" type="video/mp4" />
            Seu navegador não suporta vídeos HTML5.
          </video>
        </motion.div>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={stagger}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.span
            variants={fadeInUp}
            className="inline-block px-4 py-1.5 text-xs font-semibold text-blue-700
              dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-3
              border border-blue-100 dark:border-blue-800/40"
          >
            Conheça o LAB
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight
              text-gray-900 dark:text-gray-100 mb-4"
          >
            50 Anos de História e Tradição
          </motion.h2>
        </motion.div>

        {/* ── Texto institucional ──────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
          className="max-w-3xl mx-auto space-y-4 text-[#475569] dark:text-gray-300
            text-base leading-relaxed"
        >
          <motion.p variants={fadeInUp} className="italic">Tudo começou com um olhar atento.</motion.p>
          <motion.p variants={fadeInUp}>
            Há 50 anos, o Laboratório Lab nasceu para transformar diagnósticos em experiências de confiança, cuidado e prevenção. Desde 1974, somos pioneiros em anatomia patológica no Distrito Federal e referência em soluções diagnósticas que unem ciência, tecnologia e humanidade.
          </motion.p>
          <motion.p variants={fadeInUp}>
            Nossa essência está em ver a saúde de perto: compreender cada detalhe, enxergar a pessoa por trás do exame e oferecer um cuidado que vai além dos resultados. É essa visão que nos move a inovar continuamente, aproximando médicos, clínicas e pacientes em um ecossistema de soluções personalizadas e seguras.
          </motion.p>
          <motion.p variants={fadeInUp}>
            Somos reconhecidos pela precisão técnica, pela empatia no atendimento e por um compromisso constante com a prevenção e o bem-estar. Nosso legado é construído por muitas mãos, profissionais dedicados que unem expertise, coragem de evoluir e o propósito de transformar a forma de cuidar da saúde.
          </motion.p>
        </motion.div>

        {/* ── Texto final + Banner 50 anos ─────────────────────────── */}
        <div className="space-y-5">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={stagger}
            className="max-w-3xl mx-auto space-y-3 text-center"
          >
            <motion.p variants={fadeInUp} className="text-base text-[#475569] dark:text-gray-300 leading-relaxed">
              Hoje, expandimos nossa atuação para novas áreas e tecnologias, mantendo o mesmo princípio que nos guia desde o início: promover a saúde vista de perto, para o melhor cuidado do viver.
            </motion.p>
            <motion.p variants={fadeInUp} className="text-base font-semibold text-[#1e293b] dark:text-blue-300">
              Qualidade está em nosso DNA, porque há 50 anos cuidamos da sua saúde de perto.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto rounded-2xl overflow-hidden"
          >
            <img
              src="/assets/background/LAB-50 ANOS.svg"
              alt="LAB — 50 anos de história e tradição em medicina diagnóstica"
              className="w-full object-fill max-h-24 dark:hidden"
            />
            <img
              src="/assets/background/LAB-50 ANOS-DM.svg"
              alt="LAB — 50 anos de história e tradição em medicina diagnóstica"
              className="w-full object-fill max-h-24 hidden dark:block"
            />
          </motion.div>
        </div>

        {/* ── Cards Missão / Visão / Valores ──────────────────────────── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Missão */}
          <MvvCard icon="/assets/misaão_visao_valores/MISSAO.svg" iconAlt="Ícone de Missão" title="MISSÃO">
            <p className="text-[15px] leading-[1.8] text-slate-600 dark:text-gray-300 text-center">
              Promover a saúde vista de perto, unindo excelência técnica, cuidado humano e inovação para oferecer diagnósticos precisos e uma experiência de confiança, prevenção e bem-estar.
            </p>
          </MvvCard>

          {/* Visão */}
          <MvvCard icon="/assets/misaão_visao_valores/VISAO.svg" iconAlt="Ícone de Visão" title="VISÃO">
            <p className="text-[15px] leading-[1.8] text-slate-600 dark:text-gray-300 text-center">
              Ser referência em medicina diagnóstica no Brasil, ampliando continuamente nosso ecossistema de soluções em saúde, guiados pela precisão científica, pela empatia no cuidado e pela coragem de evoluir.
            </p>
          </MvvCard>

          {/* Valores */}
          <MvvCard icon="/assets/misaão_visao_valores/VALORES.svg" iconAlt="Ícone de Valores" title="VALORES">
            <div className="flex flex-col gap-[10px] mt-5 text-left">
              {VALUES.map((v) => (
                <ValorItem key={v.title} icon={v.icon} title={v.title} body={v.body} />
              ))}
            </div>
          </MvvCard>
        </motion.div>
      </div>
    </section>
  );
}
