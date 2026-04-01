"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize2, ZoomIn, ZoomOut } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleNext = () => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  return (
    <div className="flex flex-col gap-5 relative page-fade-in">
      {/* Main Image View */}
      <div 
        className="relative aspect-[16/10] md:aspect-[21/9] w-full bg-gray-100 rounded-3xl overflow-hidden group cursor-pointer border border-ui-border shadow-sm"
        onClick={() => setIsFullscreen(true)}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src={images[currentIndex]}
              alt={`Property Image ${currentIndex + 1}`}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              priority
              loading="eager"
              sizes="(max-width: 768px) 100vw, 100vw"
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Overlay Text */}
        <div className="absolute top-6 left-6 z-10 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20"
          >
            <p className="text-[10px] font-bold text-white uppercase tracking-widest leading-none shadow-sm">
              Discover your future land
            </p>
          </motion.div>
        </div>

        {/* Fullscreen Hint */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-brand-primary p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 border border-ui-border shadow-sm">
          <Maximize2 className="w-4 h-4" />
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md text-text-main p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 border border-ui-border hover:bg-white hover:text-brand-primary shadow-sm z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md text-text-main p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 border border-ui-border hover:bg-white hover:text-brand-primary shadow-sm z-10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto p-1 scrollbar-hide">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => {
              setIsZoomed(false);
              setCurrentIndex(idx);
            }}
            className={`relative flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
              idx === currentIndex ? "border-brand-primary shadow-md opacity-100 scale-105" : "border-ui-border opacity-60 hover:opacity-100"
            }`}
          >
            <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" sizes="96px" />
          </button>
        ))}
      </div>

      {/* Fullscreen Overlay */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-0"
          >
            {/* Toolbar */}
            <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-[101] bg-gradient-to-b from-black/60 to-transparent">
               <div className="px-5 py-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white font-bold text-sm flex items-center gap-2">
                <span className="text-white">{currentIndex + 1}</span>
                <span className="opacity-40">/</span>
                <span className="opacity-60">{images.length}</span>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsZoomed(!isZoomed)}
                  className={`p-3 rounded-xl transition-all border shadow-sm ${isZoomed ? "bg-white text-black border-white" : "bg-white/10 text-white border-white/10"}`}
                  title="Toggle Zoom"
                >
                  {isZoomed ? <ZoomOut className="w-6 h-6" /> : <ZoomIn className="w-6 h-6" />}
                </button>
                <button 
                  onClick={() => {
                    setIsFullscreen(false);
                    setIsZoomed(false);
                  }}
                  className="bg-white/10 text-white hover:text-red-500 p-3 rounded-xl transition-all border border-white/10 backdrop-blur-md"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Navigation Arrows (Desktop) */}
            <button 
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all z-[101] p-4 hidden md:block bg-white/5 flex items-center justify-center rounded-2xl border border-white/5 backdrop-blur-sm"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>

            <div className="relative w-full h-[100dvh] flex items-center justify-center overflow-hidden touch-none">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  scale: isZoomed ? 2.5 : 1,
                  x: 0,
                  y: 0
                }}
                drag={isZoomed}
                dragConstraints={{ left: -1500, right: 1500, top: -1500, bottom: 1500 }}
                dragElastic={0.1}
                className={`relative w-full h-full flex items-center justify-center ${isZoomed ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"}`}
                onClick={() => !isZoomed && setIsZoomed(true)}
              >
                <Image
                  src={images[currentIndex]}
                  alt="Fullscreen main"
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </motion.div>
            </div>

            <button 
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all z-[101] p-4 hidden md:block bg-white/5 flex items-center justify-center rounded-2xl border border-white/5 backdrop-blur-sm"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
            
            {/* Mobile Navigation Dots */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 w-full px-6">
              <div className="flex gap-2.5">
                {images.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setCurrentIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? "w-8 bg-white" : "w-1.5 bg-white/20"}`} 
                  />
                ))}
              </div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                {isZoomed ? "Drag to explore details" : "Tap to zoom • Swipe to navigate"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
