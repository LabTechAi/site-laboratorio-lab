import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import PathologistConsultationForm from "./PathologistConsultationForm";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function PathologistConsultationModal({ isOpen, onClose }: Props) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="patologista-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4
            bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          aria-modal="true"
          role="dialog"
          aria-label="Fale com um Patologista"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-2xl max-h-[90svh] overflow-y-auto rounded-2xl"
          >
            {/* Close button — floats over the gradient header */}
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="absolute top-3.5 right-3.5 z-10
                w-8 h-8 flex items-center justify-center
                rounded-full bg-white/20 hover:bg-white/35 active:bg-white/20
                text-white transition-colors duration-150
                ring-1 ring-white/15"
            >
              <X className="w-4 h-4" />
            </button>

            <PathologistConsultationForm />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
