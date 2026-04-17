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
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex-1 flex flex-col w-full h-full relative"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
