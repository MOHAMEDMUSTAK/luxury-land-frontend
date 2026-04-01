"use client";

import { useCompareStore } from "@/store/useCompareStore";
import { formatCurrency } from "@/lib/utils";
import { X, ArrowLeft, BarChart2, Info, CheckCircle2, TrendingDown, Target, Building2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ComparePage() {
  const { properties, removeProperty, clearCompare } = useCompareStore();
  const router = useRouter();

  const handleRemove = (id: string) => {
    removeProperty(id);
  };

  if (properties.length === 0) {
    return (
      <ProtectedRoute>
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-8 bg-white/50 animate-in fade-in duration-700">
        <div className="w-24 h-24 rounded-[32px] bg-gray-50 flex items-center justify-center mb-8 shadow-inner">
          <BarChart2 className="w-10 h-10 text-gray-300" />
        </div>
        <h1 className="text-4xl font-black text-text-main mb-4 tracking-tight">Comparison Empty</h1>
        <p className="text-text-secondary mb-10 max-w-md font-medium leading-relaxed opacity-70">
          Your comparison list is currently empty. Explore our premium land listings and select up to 3 properties to analyze side-by-side.
        </p>
        <Link href="/" className="btn-primary px-10 py-4 text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl active:scale-95 transition-all">
          Browse Premium Lands
        </Link>
      </div>
      </ProtectedRoute>
    );
  }

  // Logic for highlighting "Best Value" (Lowest Price)
  const lowestPrice = Math.min(...properties.map(p => p.price));
  const largestSize = Math.max(...properties.map(p => p.size || 0));

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-[#fafbfc] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-2">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-brand-primary transition-colors text-[10px] font-black uppercase tracking-widest group">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              Back to Browse
            </Link>
            <h1 className="text-5xl font-black text-text-main tracking-tight leading-none">
              Property <span className="gradient-accent">Analysis</span>
            </h1>
            <p className="text-text-secondary font-medium text-lg opacity-60">Analyze up to 3 premium properties side-by-side.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="px-5 py-2.5 rounded-2xl bg-white border border-ui-border shadow-sm flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
              <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                {properties.length} / 3 Selections
              </span>
            </div>
            <button 
              onClick={clearCompare}
              className="px-6 py-2.5 text-xs font-black text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest"
            >
              Clear Analysis
            </button>
          </div>
        </div>

        {/* Comparison Table/Grid */}
        <div className="bg-white rounded-[40px] shadow-[0_30px_80px_rgba(0,0,0,0.06)] border border-white/40 overflow-hidden relative">
          
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="overflow-x-auto selection:bg-brand-primary/10">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr>
                  <th className="p-10 w-1/4 sticky left-0 z-20 bg-white/95 backdrop-blur-md">
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] opacity-80">Insight</span>
                      <h3 className="text-2xl font-black text-text-main tracking-tight">Feature Matrix</h3>
                    </div>
                  </th>
                  
                  <AnimatePresence mode="popLayout">
                    {properties.map((p) => (
                      <motion.th 
                        key={p.id || p._id} 
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-10 text-center w-1/4 relative align-top min-w-[300px]"
                      >
                        <button
                          onClick={() => handleRemove(p.id || p._id || '')}
                          className="absolute top-6 right-6 w-10 h-10 rounded-2xl border border-ui-border bg-white text-gray-400 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center shadow-sm z-30 group"
                          title="Remove from comparison"
                        >
                          <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                        
                        <Link href={`/property/${p.id || p._id}`} className="block group">
                          <div className="relative w-full aspect-[16/10] rounded-[28px] overflow-hidden mb-6 shadow-xl transition-all duration-700 group-hover:shadow-2xl group-hover:-translate-y-1 border border-ui-border">
                            {p.images && p.images.length > 0 ? (
                              <Image src={p.images[0]} alt={p.title} fill className="object-cover group-hover:scale-110 transition-transform duration-[2000ms]" sizes="300px" />
                            ) : (
                              <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">No Visuals</div>
                            )}
                            {p.price === lowestPrice && (
                              <div className="absolute top-4 left-4 z-10 px-4 py-1.5 bg-green-500 text-white text-[10px] font-black tracking-widest uppercase rounded-full shadow-lg flex items-center gap-2">
                                <TrendingDown className="w-3.5 h-3.5" />
                                Best Value
                              </div>
                            )}
                          </div>
                          <h3 className="text-xl font-black text-text-main leading-[1.3] mb-3 line-clamp-2 px-2 group-hover:text-brand-primary transition-colors">{p.title}</h3>
                          <p className="text-2xl font-black gradient-price tracking-tight">{formatCurrency(p.price)}</p>
                        </Link>
                      </motion.th>
                    ))}
                  </AnimatePresence>

                  {/* Empty Slot UI */}
                  {Array.from({ length: 3 - properties.length }).map((_, i) => (
                    <th key={`empty-${i}`} className="p-10 align-top opacity-50 w-1/4 grayscale transition-all">
                      <div className="w-full border-2 border-dashed border-gray-200 rounded-[32px] aspect-[16/10] flex flex-col items-center justify-center text-gray-300 gap-4 bg-gray-50/50 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-inner">
                          <Target className="w-6 h-6 opacity-30" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Awaiting selection</span>
                      </div>
                      <Link href="/" className="inline-flex items-center justify-center w-full py-3.5 bg-white border border-ui-border rounded-xl text-[10px] font-black text-text-secondary uppercase tracking-[0.15em] hover:bg-gray-50 transition-colors">
                        Discover More
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-ui-border/50">
                
                {/* Location row */}
                <tr className="hover:bg-gray-50/30 transition-colors group">
                  <td className="p-10 sticky left-0 z-20 bg-white/95 backdrop-blur-md border-r border-ui-border/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-brand-primary/5 transition-colors">
                        <Target className="w-4 h-4 text-brand-primary opacity-60" />
                      </div>
                      <span className="text-[11px] font-black text-text-secondary uppercase tracking-widest">Region</span>
                    </div>
                  </td>
                  {properties.map((p) => (
                    <td key={p.id || p._id} className="p-10 text-center font-bold text-text-main text-sm">
                      <div className="inline-flex items-center gap-2 bg-gray-50/50 px-4 py-2 rounded-xl text-text-secondary">
                        {p.town ? `${p.town}, ${p.state}` : p.location || "N/A"}
                      </div>
                    </td>
                  ))}
                  {Array.from({ length: 3 - properties.length }).map((_, i) => <td key={i} className="p-10"></td>)}
                </tr>

                {/* Size row */}
                <tr className="hover:bg-gray-50/30 transition-colors group">
                  <td className="p-10 sticky left-0 z-20 bg-white/95 backdrop-blur-md border-r border-ui-border/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-brand-primary/5 transition-colors">
                        <Maximize2 className="w-4 h-4 text-brand-primary opacity-60" />
                      </div>
                      <span className="text-[11px] font-black text-text-secondary uppercase tracking-widest">Dimension</span>
                    </div>
                  </td>
                  {properties.map((p) => (
                    <td key={p.id || p._id} className="p-10 text-center">
                      <div className={`inline-flex items-center gap-2.5 px-6 py-2.5 rounded-2xl border transition-all duration-500 font-black text-sm ${
                        p.size === largestSize 
                          ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20 scale-105' 
                          : 'bg-white text-text-main border-ui-border'
                      }`}>
                        {p.size ? `${p.size} ${p.sizeUnit || 'sq ft'}` : 'N/A'}
                        {p.size === largestSize && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </td>
                  ))}
                  {Array.from({ length: 3 - properties.length }).map((_, i) => <td key={i} className="p-10"></td>)}
                </tr>

                {/* Type row */}
                <tr className="hover:bg-gray-50/30 transition-colors group">
                  <td className="p-10 sticky left-0 z-20 bg-white/95 backdrop-blur-md border-r border-ui-border/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-brand-primary/5 transition-colors">
                        <Building2 className="w-4 h-4 text-brand-primary opacity-60" />
                      </div>
                      <span className="text-[11px] font-black text-text-secondary uppercase tracking-widest">Property Type</span>
                    </div>
                  </td>
                  {properties.map((p) => (
                    <td key={p.id || p._id} className="p-10 text-center">
                      <span className="text-sm font-black text-text-main uppercase tracking-widest opacity-80 decoration-brand-primary/30 underline underline-offset-8">
                        {p.listingType || p.type || "Land"}
                      </span>
                    </td>
                  ))}
                  {Array.from({ length: 3 - properties.length }).map((_, i) => <td key={i} className="p-10"></td>)}
                </tr>

                {/* Status row */}
                <tr className="hover:bg-gray-50/30 transition-colors group">
                  <td className="p-10 sticky left-0 z-20 bg-white/95 backdrop-blur-md border-r border-ui-border/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-brand-primary/5 transition-colors">
                        <Info className="w-4 h-4 text-brand-primary opacity-60" />
                      </div>
                      <span className="text-[11px] font-black text-text-secondary uppercase tracking-widest">Availability</span>
                    </div>
                  </td>
                  {properties.map((p) => (
                    <td key={p.id || p._id} className="p-10 text-center">
                      <span className={`inline-flex items-center gap-2 px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm ${
                        p.status === "Available" 
                          ? "bg-green-50 text-green-600 border-green-100" 
                          : "bg-orange-50 text-orange-600 border-orange-100"
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${p.status === "Available" ? "bg-green-500" : "bg-orange-500"}`} />
                        {p.status || "Unknown"}
                      </span>
                    </td>
                  ))}
                  {Array.from({ length: 3 - properties.length }).map((_, i) => <td key={i} className="p-10"></td>)}
                </tr>

                {/* Footnote Action row */}
                <tr>
                  <td className="p-10 sticky left-0 z-20 bg-white/95 backdrop-blur-md border-r border-ui-border/30 rounded-bl-[40px]"></td>
                  {properties.map((p) => (
                    <td key={p.id || p._id} className="p-10 text-center">
                      <button 
                        onClick={() => router.push(`/property/${p.id || p._id}`)}
                        className="w-full py-4 bg-gray-900 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:bg-brand-primary hover:-translate-y-1 active:scale-95 transition-all duration-500"
                      >
                        Secure Listing
                      </button>
                    </td>
                  ))}
                  {Array.from({ length: 3 - properties.length }).map((_, i) => <td key={i} className="p-10"></td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Comparison Disclaimer */}
        <div className="mt-12 text-center flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40">
            <Info className="w-3.5 h-3.5" />
            Analysis based on current verified listing data
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
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
