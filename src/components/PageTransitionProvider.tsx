"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PageTransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div 
          key={`progress-${pathname}`}
          className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-gold z-[9999] shadow-[0_0_10px_rgba(99,102,241,0.5)]"
          initial={{ width: "0%", opacity: 1 }}
          animate={{ width: "100%", opacity: 0 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          style={{ transformOrigin: "left" }}
        />
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.div 
          key={pathname}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex-1 flex flex-col w-full h-full relative"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
