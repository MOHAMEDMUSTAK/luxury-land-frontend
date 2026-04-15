"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PageTransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={pathname}
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -15 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex flex-col w-full h-full relative"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
