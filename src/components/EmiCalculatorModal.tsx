"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Calculator } from "lucide-react";

export default function EmiCalculatorModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [principal, setPrincipal] = useState(5000000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);

  const calculateEMI = () => {
    const p = principal;
    const r = rate / 12 / 100;
    const n = years * 12;
    if (p === 0 || r === 0 || n === 0) return 0;
    const emi = p * r * (Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
    return Math.round(emi);
  };

  const emi = calculateEMI();
  const totalPayment = emi * years * 12;
  const totalInterest = totalPayment - principal;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-[92%] max-w-[420px] bg-[var(--surface)] rounded-[24px] shadow-2xl z-[201] overflow-hidden"
          >
            <div className="bg-gradient-to-r from-brand-primary to-brand-secondary p-6 text-white relative">
              <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 p-2 rounded-full backdrop-blur-md transition-all active:scale-95">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 border border-white/20 bg-white/10 rounded-xl shadow-inner"><Calculator className="w-5 h-5 text-white" /></div>
                <h2 className="text-xl font-black tracking-tight">Quick EMI Calc</h2>
              </div>
              <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest opacity-80 mt-1">Estimate your payments instantly.</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-5">
                {/* Principal */}
                <div>
                  <label className="flex justify-between text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-3">
                    <span>Loan Amount</span>
                    <span className="text-brand-primary">₹{(principal / 100000).toFixed(1)} Lakhs</span>
                  </label>
                  <input type="range" min="100000" max="50000000" step="100000" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} className="w-full h-1.5 bg-[var(--ui-border)] rounded-lg appearance-none cursor-pointer accent-brand-primary" />
                </div>
                {/* Interest Rate */}
                <div>
                  <label className="flex justify-between text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-3">
                    <span>Interest Rate</span>
                    <span className="text-brand-primary">{rate}%</span>
                  </label>
                  <input type="range" min="5" max="15" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full h-1.5 bg-[var(--ui-border)] rounded-lg appearance-none cursor-pointer accent-brand-primary" />
                </div>
                {/* Years */}
                <div>
                  <label className="flex justify-between text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-3">
                    <span>Tenure (Years)</span>
                    <span className="text-brand-primary">{years} Years</span>
                  </label>
                  <input type="range" min="1" max="30" step="1" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full h-1.5 bg-[var(--ui-border)] rounded-lg appearance-none cursor-pointer accent-brand-primary" />
                </div>
              </div>

              <div className="bg-brand-primary/[0.03] border border-brand-primary/10 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary opacity-5 rounded-full blur-2xl -mr-10 -mt-10"/>
                
                <div className="text-center mb-5 relative z-10">
                   <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] mb-1 opacity-80">Monthly EMI</p>
                   <p className="text-3xl font-black text-[var(--text-main)] tracking-tight">₹{emi.toLocaleString('en-IN')}</p>
                </div>
                
                <div className="flex justify-between items-center text-xs border-t border-[var(--ui-border)] pt-4 relative z-10">
                   <div className="text-center w-1/2 border-r border-[var(--ui-border)] pr-2">
                     <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60 mb-1">Principal</p>
                     <p className="font-black text-[var(--text-main)]">₹{(principal / 100000).toFixed(1)}L</p>
                   </div>
                   <div className="text-center w-1/2 pl-2">
                     <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60 mb-1">Total Interest</p>
                     <p className="font-black text-red-500">₹{(totalInterest / 100000).toFixed(1)}L</p>
                   </div>
                </div>
              </div>
            </div>
            <div className="p-4 pt-0">
               <button onClick={onClose} className="w-full btn-primary py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest">
                  Done
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
