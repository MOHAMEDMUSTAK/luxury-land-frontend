"use client";

import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";

const DATA = [
  { city: "Chennai", trend: "up", val: "+2.4%", desc: "High Demand" },
  { city: "Coimbatore", trend: "up", val: "+1.8%", desc: "Land Value Rising" },
  { city: "ECR & OMR", trend: "hot", val: "🔥", desc: "Most Searched" },
  { city: "Madurai", trend: "stable", val: "0.0%", desc: "Steady Prices" },
  { city: "Trichy", trend: "up", val: "+0.9%", desc: "Commercial Growth" },
  { city: "Salem", trend: "up", val: "+1.2%", desc: "Residential Boom" }
];

const TICKER_DATA = [...DATA, ...DATA, ...DATA];

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'up') return <TrendingUp className="w-2.5 h-2.5" strokeWidth={3} />;
  if (trend === 'down') return <TrendingDown className="w-2.5 h-2.5" strokeWidth={3} />;
  if (trend === 'hot') return <Activity className="w-2.5 h-2.5" strokeWidth={3} />;
  return <Minus className="w-2.5 h-2.5" strokeWidth={3} />;
};

export default function MarketPulseTicker() {
  return (
    <div className="w-full bg-[var(--ticker-bg)] text-white border-b border-white/5 flex items-center h-[38px] px-2 sm:px-4 z-[60] relative">
      <div className="items-center gap-2 shrink-0 bg-[var(--ticker-bg)] z-10 pr-4 mr-2 border-r border-white/10 hidden sm:flex h-full">
         <Activity className="text-brand-primary w-3.5 h-3.5 animate-pulse" />
         <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/70">Market Pulse</span>
      </div>
      <div className="flex-1 overflow-hidden relative flex h-full items-center">
        <div className="ticker-track flex items-center whitespace-nowrap min-w-max">
            {TICKER_DATA.map((item, i) => (
               <div key={i} className="flex items-center gap-2 mx-5">
                 <span className="text-[11px] font-bold text-white/90">{item.city}</span>
                 <span className={`text-[9px] px-1.5 py-0.5 rounded-[4px] flex items-center gap-1 font-black ${
                    item.trend === 'up' ? 'text-emerald-400 bg-emerald-400/10' : 
                    item.trend === 'down' ? 'text-red-400 bg-red-400/10' : 
                    item.trend === 'hot' ? 'text-orange-400 bg-orange-400/10' :
                    'text-gray-400 bg-gray-400/10'
                 }`}>
                   <TrendIcon trend={item.trend} />
                   {item.val}
                 </span>
                 <span className="text-[9px] text-white/40 uppercase tracking-[0.1em]">{item.desc}</span>
               </div>
            ))}
        </div>
      </div>
    </div>
  );
}
