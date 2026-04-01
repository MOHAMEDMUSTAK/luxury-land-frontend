"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useEffect } from "react";

interface ImageGalleryProps {
  images: string[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Lock body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isFullscreen]);

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
      <div className="flex gap-3 overflow-x-auto p-1 scrollbar-hide no-scrollbar">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => {
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
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center"
          >
            <TransformWrapper
              initialScale={1}
              minScale={1}
              maxScale={5}
              centerOnInit
              wheel={{ step: 0.1 }}
              doubleClick={{ mode: "reset" }}
            >
              {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                <>
                  {/* Premium Toolbar */}
                  <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-[102] bg-gradient-to-b from-black/50 to-transparent">
                    <div className="flex items-center gap-4">
                      <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-white font-bold text-sm tracking-widest uppercase">
                        {currentIndex + 1} / {images.length}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => zoomIn()}
                        className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md border border-white/10 transition-all active:scale-95"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => zoomOut()}
                        className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md border border-white/10 transition-all active:scale-95"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => resetTransform()}
                        className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md border border-white/10 transition-all active:scale-95"
                        title="Reset"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                      <div className="w-px h-8 bg-white/10 mx-2" />
                      <button 
                        onClick={() => setIsFullscreen(false)}
                        className="p-3 bg-red-500/80 hover:bg-red-500 text-white rounded-xl backdrop-blur-md border border-white/10 transition-all active:scale-95 flex items-center gap-2 shadow-lg"
                      >
                        <X className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">Close</span>
                      </button>
                    </div>
                  </div>

                  {/* Desktop Navigation */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); resetTransform(); handlePrev(); }}
                    className="absolute left-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-sm transition-all z-[101] hidden md:block group"
                  >
                    <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
                  </button>

                  <button 
                    onClick={(e) => { e.stopPropagation(); resetTransform(); handleNext(); }}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-sm transition-all z-[101] hidden md:block group"
                  >
                    <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Main Transformable Area */}
                  <TransformComponent
                    wrapperClass="!w-screen !h-screen flex items-center justify-center overflow-hidden"
                    contentClass="!w-fit !h-fit"
                  >
                    <div className="relative w-screen h-screen flex items-center justify-center p-4 md:p-20">
                      <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="relative w-full h-full"
                      >
                        <Image
                          src={images[currentIndex]}
                          alt={`View Image ${currentIndex + 1}`}
                          fill
                          className="object-contain pointer-events-none select-none"
                          sizes="100vw"
                          priority
                        />
                      </motion.div>
                    </div>
                  </TransformComponent>

                  {/* Mobile Instructions / Quick View */}
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[102] flex flex-col items-center gap-4 w-full px-6">
                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar max-w-full pb-2">
                       {images.map((_, i) => (
                         <div 
                           key={i} 
                           className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 bg-brand-primary' : 'w-2 bg-white/20'}`}
                         />
                       ))}
                    </div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] md:hidden">
                      Pinch to zoom • Swipe to navigate
                    </p>
                  </div>
                </>
              )}
            </TransformWrapper>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
