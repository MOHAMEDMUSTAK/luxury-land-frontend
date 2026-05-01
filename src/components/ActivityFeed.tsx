"use client";

import { useState, useEffect, useRef } from 'react';
import { Flame, Bell, MapPin, Eye, Home } from 'lucide-react';

const MESSAGES = [
  { text: "Someone from Chennai just viewed a 5-Acre Plot", icon: "eye", color: "text-blue-500", bg: "bg-blue-500/10" },
  { text: "New Villa added in ECR! 🔥", icon: "flame", color: "text-brand-primary", bg: "bg-brand-primary/10" },
  { text: "Property in Coimbatore just sold for ₹1.2Cr", icon: "bell", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { text: "15 users are currently searching for lands in Madurai", icon: "map", color: "text-orange-500", bg: "bg-orange-500/10" },
  { text: "Price drop! Residential plot in Trichy is now 5% off", icon: "home", color: "text-rose-500", bg: "bg-rose-500/10" },
];

const IconMap = ({ type, className }: { type: string; className?: string }) => {
  const cn = className || "w-5 h-5";
  switch (type) {
    case "eye": return <Eye strokeWidth={2} className={cn} />;
    case "flame": return <Flame strokeWidth={2} className={cn} />;
    case "bell": return <Bell strokeWidth={2} className={cn} />;
    case "map": return <MapPin strokeWidth={2} className={cn} />;
    case "home": return <Home strokeWidth={2} className={cn} />;
    default: return <Bell strokeWidth={2} className={cn} />;
  }
};

export default function ActivityFeed() {
  const [currentTick, setCurrentTick] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const triggerRandomEvent = () => {
      // 40% chance to show a message every 8 seconds
      if (Math.random() > 0.6) {
        const randomIndex = Math.floor(Math.random() * MESSAGES.length);
        setCurrentTick(randomIndex);
        setIsVisible(true);
        
        // Hide message after 5 seconds
        timeoutRef.current = setTimeout(() => {
          setIsVisible(false);
          // Remove from DOM after animation completes
          setTimeout(() => setCurrentTick(null), 300);
        }, 5000);
      }
    };

    const id = setInterval(triggerRandomEvent, 8000);
    return () => {
      clearInterval(id);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (currentTick === null) return null;

  const msg = MESSAGES[currentTick];

  return (
    <div className="fixed bottom-24 left-4 z-40 pointer-events-none md:bottom-6 md:left-6">
      <div className={`activity-feed-toast flex items-center gap-3 bg-white/95 backdrop-blur-xl border border-ui-border shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] rounded-xl md:rounded-2xl p-3 md:p-4 max-w-[280px] md:max-w-[320px] pointer-events-auto ${isVisible ? 'activity-feed-enter' : 'activity-feed-exit'}`}>
        <div className={`p-2.5 rounded-xl flex-shrink-0 ${msg.bg} ${msg.color}`}>
          <IconMap type={msg.icon} />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary opacity-60 mb-0.5">Live Activity</span>
          <p className="text-[11px] md:text-xs font-bold text-text-main leading-[1.3]">
            {msg.text}
          </p>
        </div>
      </div>
    </div>
  );
}
