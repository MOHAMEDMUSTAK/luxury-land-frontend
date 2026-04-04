"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/services/api";
import PropertyCard from "./PropertyCard";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, Trash2, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "react-hot-toast";

interface RecentlyViewedProps {
  activeCategory?: string;
}

export default function RecentlyViewed({ activeCategory }: RecentlyViewedProps) {
  const { user } = useAuthStore();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const url = activeCategory 
        ? `/land/recently-viewed?category=${activeCategory}`
        : "/land/recently-viewed";
      const res = await api.get(url);
      const serverData = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setItems(serverData);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user, activeCategory]);

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear your viewing history?")) return;
    try {
      await api.delete("/land/recently-viewed");
      setItems([]);
      toast.success("History cleared");
    } catch (err) {
      console.error("Failed to clear history:", err);
      toast.error("Failed to clear history");
    }
  };

  const getTimeLabel = (viewedAt: string) => {
    const now = new Date();
    const date = new Date(viewedAt);
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) return "Recently Viewed Today";
    if (diffInHours < 48) return "Yesterday";
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (!user || (!isLoading && items.length === 0)) return null;

  return (
    <section className="py-24 border-t border-ui-border/50 mt-20 relative overflow-hidden">
      {/* Premium Decorative Elements */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center shadow-inner border border-brand-primary/5">
                <Clock className="w-6 h-6 text-brand-primary" />
              </div>
              <span className="text-[11px] font-black text-brand-primary uppercase tracking-[0.3em] bg-brand-primary/5 px-4 py-1.5 rounded-full border border-brand-primary/10 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Continuity
              </span>
            </motion.div>
            
            <div>
              <h2 className="text-4xl sm:text-5xl font-black text-text-main tracking-tighter leading-none mb-3">
                Recently <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Visited</span>
              </h2>
              <p className="text-text-secondary text-base font-medium max-w-xl">
                Refined selections from your recent explorations {activeCategory && <>in <span className="text-brand-primary font-black uppercase tracking-widest text-xs">{activeCategory}s</span></>}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleClearHistory}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-red-100 bg-red-50/30 text-red-500 hover:bg-red-50 hover:shadow-md transition-all active:scale-95 text-xs font-bold uppercase tracking-widest group"
              title="Clear history"
            >
              <Trash2 className="w-4 h-4 transition-transform group-hover:rotate-12" />
              Clear Selection
            </button>
            
            <div className="h-10 w-px bg-gray-200 mx-2" />

            <div className="flex items-center gap-3">
              <button 
                onClick={() => scroll("left")}
                className="p-3.5 rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-md shadow-sm hover:border-brand-primary hover:text-brand-primary hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                disabled={items.length < 3}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={() => scroll("right")}
                className="p-3.5 rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-md shadow-sm hover:border-brand-primary hover:text-brand-primary hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                disabled={items.length < 3}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
           <div className="flex gap-8 overflow-hidden">
             {[...Array(4)].map((_, i) => (
                <div key={i} className="min-w-[320px] w-[320px] h-[380px] bg-white rounded-[40px] animate-pulse border border-gray-100 shadow-sm" />
             ))}
           </div>
        ) : (
          <div 
            ref={scrollRef}
            className="flex gap-8 overflow-x-auto no-scrollbar scroll-smooth pt-8 pb-12 h-full px-1"
          >
            {items.filter(Boolean).map((item, i) => (
              <div 
                key={item._id} 
                className="min-w-[320px] w-[320px] group/card relative animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="absolute -top-4 left-8 z-20">
                  <span className="px-4 py-2 bg-white/95 backdrop-blur-xl border border-brand-primary/10 rounded-2xl text-[10px] font-black text-text-secondary shadow-lg shadow-black/[0.03] flex items-center gap-2 transition-all group-hover/card:text-brand-primary group-hover/card:border-brand-primary/30 group-hover/card:scale-105 group-hover/card:shadow-brand-primary/10 uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5" />
                    {getTimeLabel(item.viewedAt)}
                  </span>
                </div>
                <div className="transition-transform duration-300 group-hover/card:-translate-y-3 h-full">
                  <PropertyCard property={item} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
