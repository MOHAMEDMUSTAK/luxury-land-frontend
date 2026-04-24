"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Bell, MapPin, Eye, Home } from 'lucide-react';

const MESSAGES = [
  { text: "Someone from Chennai just viewed a 5-Acre Plot", icon: <Eye strokeWidth={2} className="w-5 h-5" />, color: "text-blue-500", bg: "bg-blue-500/10" },
  { text: "New Villa added in ECR! 🔥", icon: <Flame strokeWidth={2} className="w-5 h-5" />, color: "text-brand-primary", bg: "bg-brand-primary/10" },
  { text: "Property in Coimbatore just sold for ₹1.2Cr", icon: <Bell strokeWidth={2} className="w-5 h-5" />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { text: "15 users are currently searching for lands in Madurai", icon: <MapPin strokeWidth={2} className="w-5 h-5" />, color: "text-orange-500", bg: "bg-orange-500/10" },
  { text: "Price drop! Residential plot in Trichy is now 5% off", icon: <Home strokeWidth={2} className="w-5 h-5" />, color: "text-rose-500", bg: "bg-rose-500/10" },
];

export default function ActivityFeed() {
  const [currentTick, setCurrentTick] = useState<number | null>(null);

  useEffect(() => {
    // Only run on client
    const triggerRandomEvent = () => {
      // 40% chance to show a message every 8 seconds
      if (Math.random() > 0.6) {
        const randomIndex = Math.floor(Math.random() * MESSAGES.length);
        setCurrentTick(randomIndex);
        
        // Hide message after 5 seconds
        setTimeout(() => {
          setCurrentTick(null);
        }, 5000);
      }
    };

    // Initial delay then start loop
    const id = setInterval(triggerRandomEvent, 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed bottom-24 left-4 z-40 pointer-events-none md:bottom-6 md:left-6">
      <AnimatePresence>
        {currentTick !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, x: -20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -10 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex items-center gap-3 bg-white/95 backdrop-blur-xl border border-ui-border shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] rounded-xl md:rounded-2xl p-3 md:p-4 max-w-[280px] md:max-w-[320px] pointer-events-auto"
          >
            <div className={`p-2.5 rounded-xl flex-shrink-0 ${MESSAGES[currentTick].bg} ${MESSAGES[currentTick].color}`}>
              {MESSAGES[currentTick].icon}
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary opacity-60 mb-0.5">Live Activity</span>
              <p className="text-[11px] md:text-xs font-bold text-text-main leading-[1.3]">
                {MESSAGES[currentTick].text}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
