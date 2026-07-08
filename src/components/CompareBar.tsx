"use client";

import { X, ArrowRight, BarChart2, ChevronUp, ChevronDown, TrendingDown, Target, Building2, CheckCircle2, Info } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { useCompareStore } from "@/store/useCompareStore";

export default function CompareBar() {
  const { properties, removeProperty, clearCompare } = useCompareStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const router = useRouter();

  // Sync visibility with scroll — rAF throttled for 60fps
  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        if (Math.abs(currentScrollY - lastScrollY.current) < 10) {
          ticking.current = false;
          return;
        }
        if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-collapse on mobile initially
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  }, []);

  if (properties.length === 0) return null;

  // Comparison Logic
  const lowestPrice = Math.min(...properties.map(p => p.price));
  const largestSize = Math.max(...properties.map(p => p.size || 0));

  return (
    <>
      {/* 📊 ANALYSIS DRAWER (Level 1: Comparison Matrix / Analytics) */}
      <AnimatePresence>
        {isAnalysisOpen && (
          <div className="fixed inset-0 z-[120] flex items-end md:items-center justify-center">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAnalysisOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            {/* Analysis Drawer Content */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full md:max-w-[540px] h-[85vh] md:h-auto md:max-h-[85vh] bg-[var(--surface)] rounded-t-[32px] md:rounded-[32px] shadow-2xl overflow-hidden flex flex-col z-[121]"
            >
              {/* Native Mobile Drag Handle */}
              <div className="md:hidden flex justify-center p-3">
                <div className="w-12 h-1.5 bg-[var(--ui-border)] rounded-full" />
              </div>

              {/* Header */}
              <div className="px-6 pb-6 border-b border-[var(--ui-border)] flex items-center justify-between bg-[var(--surface)] sticky top-0 z-10 pt-2">
                <div>
                  <h3 className="text-2xl font-black text-[var(--text-main)] tracking-tight uppercase">AI Insights</h3>
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-50">Advanced side-by-side metric comparison</p>
                </div>
                <button 
                  onClick={() => setIsAnalysisOpen(false)}
                  className="w-10 h-10 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--text-main)] hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Matrix Scrollable Content */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-10 bg-[var(--background)]">
                <div className="grid grid-cols-2 gap-4">
                  {properties.map((p) => (
                    <div key={p.id || p._id} className="group relative">
                      <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-3 shadow-md border-2 border-white relative">
                        {p.images && p.images.length > 0 ? (
                          <Image src={p.images[0]} alt={p.title} fill className="object-cover" sizes="240px" />
                        ) : (
                          <div className="w-full h-full bg-[var(--skeleton-base)] flex items-center justify-center text-[var(--text-secondary)]">No Image</div>
                        )}
                        {p.price === lowestPrice && (
                          <div className="absolute top-2 left-2 px-2.5 py-1 bg-brand-primary text-white text-[8px] font-black tracking-widest uppercase rounded-full shadow-lg">
                            MVP Selection
                          </div>
                        )}
                      </div>
                      <h4 className="text-xs font-black text-[var(--text-main)] line-clamp-1 mb-1">{p.title}</h4>
                      <p className="text-sm font-black text-brand-primary">{formatCurrency(p.price)}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  {[
                    { label: "Price / Sq Ft", icon: TrendingDown, data: properties.map(p => p.size ? `₹${Math.round(p.price / p.size).toLocaleString()}` : "N/A") },
                    { label: "Total Area", icon: Maximize2, data: properties.map(p => p.size ? `${p.size} ${p.sizeUnit || 'sq ft'}` : "N/A"), highlight: true },
                    { label: "Location", icon: Target, data: properties.map(p => p.town || p.area || "N/A") },
                    { label: "Features", icon: CheckCircle2, data: properties.map(p => (p.features?.length || 0) + " Premium Items") }
                  ].map((row, i) => (
                    <div key={i} className="bg-[var(--surface)] p-5 rounded-3xl border border-[var(--ui-border)] shadow-sm space-y-4">
                      <div className="flex items-center gap-2 opacity-30">
                        <row.icon className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{row.label}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {row.data.map((val, idx) => (
                          <div key={idx} className={`p-3 rounded-2xl text-center font-bold text-xs ${row.highlight && properties[idx].size === largestSize ? 'bg-brand-primary text-white shadow-lg' : 'bg-[var(--surface-elevated)] text-[var(--text-main)]'}`}>
                            {val}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 bg-[var(--surface)] border-t border-[var(--ui-border)] flex flex-col gap-3">
                <button 
                  onClick={() => router.push(`/property/${properties[0].id || properties[0]._id}`)}
                  className="w-full py-4 bg-brand-primary text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-brand-primary/20 hover:scale-[1.01] transition-all active:scale-[0.98]"
                >
                  View Prime Property
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 📊 SELECTION CONSOLE (Level 0: Toggle & Dropdown Drawer) */}
      <AnimatePresence>
        {isExpanded && (
          <div className="fixed inset-0 z-[110] flex items-end justify-center md:pointer-events-none">
            {/* Backdrop for Mobile selection console */}
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsExpanded(false)}
               className="md:hidden absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            {/* Selection Console Drawer/Bar */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full md:max-w-4xl md:px-0 bg-[var(--surface)] md:bg-[var(--glass-bg)] md:backdrop-blur-3xl md:border md:border-[var(--glass-border)] rounded-t-[32px] md:rounded-[32px] md:mb-10 px-6 py-6 pb-12 md:p-4 shadow-[0_-20px_50px_rgba(0,0,0,0.1),0_30px_70px_rgba(0,0,0,0.1)] pointer-events-auto flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden"
              style={{ bottom: `env(safe-area-inset-bottom)` }}
            >
              {/* Desktop Close Arrow (Hidden on Mobile) */}
              <button 
                onClick={() => setIsExpanded(false)}
                className="hidden md:flex absolute top-4 right-5 p-2 text-[var(--text-secondary)] hover:text-brand-primary transition-colors active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col md:flex-row items-center gap-6 w-full">
                {/* Mobile Drag Handle */}
                <div className="md:hidden flex justify-center w-full pb-2">
                  <div className="w-10 h-1 bg-[var(--ui-border)] rounded-full" />
                </div>

                <div className="flex flex-col gap-0.5 text-center md:text-left pt-2 md:pt-0">
                  <div className="flex items-center gap-2 text-brand-primary font-black text-sm uppercase tracking-wider justify-center md:justify-start">
                    <BarChart2 className="w-4 h-4" />
                    <span>Comparison Console</span>
                  </div>
                  <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.1em] opacity-40">
                    {properties.length} Selection Ready
                  </p>
                </div>

                {/* Selected Thumbnails */}
                <div className="flex justify-center md:justify-start gap-4 overflow-x-auto no-scrollbar pb-1 w-full md:w-auto">
                    {properties.map((p) => (
                      <div key={p.id || p._id} className="group relative flex-shrink-0">
                        <div className="w-16 h-16 md:w-12 md:h-12 relative rounded-2xl md:rounded-xl overflow-hidden border-2 border-[var(--ui-border)] shadow-sm transition-all group-hover:border-brand-primary/40">
                          {p.images && p.images.length > 0 ? (
                            <Image src={p.images[0]} alt="Prop" fill className="object-cover" sizes="64px" />
                          ) : (
                            <div className="w-full h-full bg-[var(--skeleton-base)] flex items-center justify-center text-[8px] text-[var(--text-secondary)]">No Img</div>
                          )}
                          <button
                            onClick={() => removeProperty(p.id || p._id || '')}
                            className="absolute inset-0 bg-red-500/95 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                          >
                            <X className="w-5 h-5 md:w-4 md:h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {properties.length < 3 && (
                      <div className="w-16 h-16 md:w-12 md:h-12 border-2 border-dashed border-[var(--ui-border)] rounded-2xl md:rounded-xl flex items-center justify-center bg-[var(--surface-elevated)]">
                        <Target className="w-5 h-5 md:w-4 md:h-4 text-[var(--text-secondary)] opacity-30" />
                      </div>
                    )}
                </div>
              </div>

              {/* Main Actions */}
              <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                <button 
                  onClick={clearCompare}
                  className="flex-1 md:px-6 py-4 text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-700 transition-all active:scale-95"
                >
                  Clear Selection
                </button>
                <button 
                  onClick={() => setIsAnalysisOpen(true)}
                  className="flex-[2] md:flex-initial bg-brand-primary text-white px-12 py-4.5 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl text-center shadow-xl hover:shadow-brand-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Analyze <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 📬 COLLAPSED FAB (Always Fixed Floating Bubble) */}
      {!isExpanded && !isAnalysisOpen && (
        <div className="fixed left-0 right-0 z-[100] px-6 pointer-events-none transition-all duration-500"
             style={{ 
               bottom: isVisible ? 'calc(90px + env(safe-area-inset-bottom))' : '-100px',
               opacity: isVisible ? 1 : 0
             }}>
          <div className="max-w-4xl mx-auto flex justify-center">
            <motion.button
              key="collapsed-fab"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              onClick={() => setIsExpanded(true)}
              className="pointer-events-auto flex items-center gap-3 bg-brand-primary text-white py-4 px-8 rounded-full shadow-[0_20px_60px_rgba(37,99,235,0.4)] border border-white/20 hover:scale-105 active:scale-95 transition-all group"
            >
              <div className="relative">
                <BarChart2 className="w-6 h-6" />
                <div className="absolute -top-2 -right-2.5 w-6 h-6 bg-white text-brand-primary text-[10px] font-black flex items-center justify-center rounded-full border-2 border-brand-primary shadow-sm">
                  {properties.length}
                </div>
              </div>
              <span className="text-[12px] font-black uppercase tracking-[0.2em]">Console</span>
              <ChevronUp className="w-4 h-4 opacity-40 group-hover:-translate-y-0.5 transition-transform" />
            </motion.button>
          </div>
        </div>
      )}
    </>
  );
}

// Reuse icon component for layout
function Maximize2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}
