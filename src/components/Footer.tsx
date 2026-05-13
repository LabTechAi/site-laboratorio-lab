/**
 * Footer.tsx — Minimal footer bar.
 */

import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 border-t border-gray-800 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5
        flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
        <span>© {new Date().getFullYear()} LAB – Laboratório e Medicina Diagnóstica. Todos os direitos reservados.</span>
        <span>50 anos de saúde vista de perto · Brasília-DF</span>
      </div>
    </footer>
  );
}

