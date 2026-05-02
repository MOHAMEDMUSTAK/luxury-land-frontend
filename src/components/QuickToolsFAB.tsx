"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Plus, Calculator, FileText, PhoneCall } from "lucide-react";
import EmiCalculatorModal from "./EmiCalculatorModal";

export default function QuickToolsFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [showEMI, setShowEMI] = useState(false);

  const tools = [
    { id: 'emi', icon: <Calculator size={16} strokeWidth={2.5} />, label: "EMI Calculator", onClick: () => { setIsOpen(false); setShowEMI(true); } },
    { id: 'report', icon: <FileText size={16} strokeWidth={2.5} />, label: "Market Report", onClick: () => alert("Market Report feature coming soon!") },
    { id: 'contact', icon: <PhoneCall size={16} strokeWidth={2.5} />, label: "Consult Expert", onClick: () => window.location.href = "tel:+917094055969" },
  ];

  return (
    <>
      <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[150] flex items-end justify-end pointer-events-none">
        <div className="relative pointer-events-auto">
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="absolute bottom-[72px] md:bottom-[80px] right-0 flex flex-col items-end gap-3 mb-2"
              >
                {tools.map((tool, i) => (
                  <motion.button
                    key={tool.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={tool.onClick}
                    className="flex items-center gap-3 bg-[var(--surface)] pl-4 pr-2.5 py-2.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[var(--ui-border)] hover:scale-105 hover:border-brand-primary active:scale-95 transition-all group origin-right"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)] group-hover:text-brand-primary transition-colors whitespace-nowrap">
                      {tool.label}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                      {tool.icon}
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(99,102,241,0.4)] text-white transition-all duration-300 ${isOpen ? 'bg-zinc-800 rotate-45' : 'bg-gradient-to-tr from-brand-primary to-brand-secondary hover:scale-110'}`}
          >
            <Plus className="w-6 h-6 md:w-8 md:h-8" strokeWidth={2.5} />
          </button>
        </div>
      </div>
      
      <EmiCalculatorModal isOpen={showEMI} onClose={() => setShowEMI(false)} />
    </>
  );
}
