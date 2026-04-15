"use client";

import { X, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Dynamically import map to avoid SSR issues with window object
const MapLeaflet = dynamic(() => import("./MapLeaflet"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] sm:h-[500px] bg-gray-50 flex flex-col items-center justify-center rounded-2xl border border-ui-border">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-brand-primary rounded-full animate-spin mb-3"></div>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Initializing Map Engine</p>
    </div>
  )
});

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationName: string;
  lat?: number;
  lng?: number;
}

export default function MapModal({ isOpen, onClose, locationName, lat, lng }: MapModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted) return null;

  // Default coordinates if not provided
  const finalLat = lat ?? 13.0827;
  const finalLng = lng ?? 80.2707;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
          
          {/* Framer Motion Backdrop */}
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/40" 
            onClick={onClose}
          />
          
          {/* Framer Motion Modal Canvas */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="bg-white rounded-[28px] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-4xl relative z-10 flex flex-col overflow-hidden border border-white/20"
          >
            
            {/* Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100 bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full mix-blend-multiply filter blur-[30px] opacity-70 pointer-events-none -translate-y-1/2 translate-x-1/4" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-inner">
                  <MapPin className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight tracking-tight">Geographical Data</h2>
                  <p className="text-brand-primary font-bold text-sm tracking-wide">{locationName || "Location Area"}</p>
                </div>
              </div>
              
              <button 
                onClick={onClose}
                className="w-11 h-11 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 hover:scale-105 active:scale-95 transition-all relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Map Body */}
            <div className="p-4 sm:p-5 bg-gray-50/50">
              <div className="bg-white p-2 rounded-[24px] shadow-sm border border-gray-100">
                <MapLeaflet lat={finalLat} lng={finalLng} title={locationName} />
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/50 flex items-start gap-3"
              >
                <div className="mt-0.5">
                  <MapPin className="w-4 h-4 text-brand-primary/60" />
                </div>
                <p className="text-[13px] text-gray-600 font-medium leading-relaxed">
                  This interactive map highlights the focal coordinates of the property. The dynamic boundary and actual landscape may vary slightly based on final survey mapping.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
