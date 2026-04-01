"use client";

import { X, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamically import map to avoid SSR issues with window object
const MapLeaflet = dynamic(() => import("./MapLeaflet"), { ssr: false });

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
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  // Default coordinates (e.g. Chennai, Tamil Nadu) if not provided
  const finalLat = lat ?? 13.0827;
  const finalLng = lng ?? 80.2707;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl relative z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">Property Location</h2>
              <p className="text-brand-primary font-medium text-sm">{locationName || "Location Area"}</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Body */}
        <div className="p-4 sm:p-6 bg-gray-50">
          <MapLeaflet lat={finalLat} lng={finalLng} title={locationName} />
          
          <div className="mt-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm flex items-start gap-3">
            <div className="mt-0.5">
              <MapPin className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              This map provides an approximate location of the property based on the available area details. For exact coordinates and directions, please contact the seller.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
