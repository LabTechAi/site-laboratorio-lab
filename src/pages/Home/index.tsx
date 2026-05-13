/**
 * Home/index.tsx — Institutional site home page.
 * Assembles all section components in order.
 */

import React from "react";
import HeroSection from "./HeroSection";
import AboutSection from "./AboutSection";
import MedicalTeamSection from "./MedicalTeamSection";
import SpecialtiesSection from "./SpecialtiesSection";
import ExamsSection from "./ExamsSection";
import ConveniosSection from "./ConveniosSection";
import UnitsSection from "./UnitsSection";
import ContactSection from "./ContactSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <MedicalTeamSection />
      <SpecialtiesSection />
      <ExamsSection />
      <ConveniosSection />
      <UnitsSection />
      <ContactSection />
    </>
  );
}
