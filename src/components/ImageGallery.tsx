"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface ImageGalleryProps {
  images: string[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Disable background scroll when fullscreen is active
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

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
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
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-0"
          >
            <TransformWrapper
              initialScale={1}
              minScale={1}
              maxScale={8}
              centerOnInit={true}
              wheel={{ step: 0.1 }}
              doubleClick={{ disabled: false }}
              pinch={{ disabled: false }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  {/* Toolbar */}
                  <div className="absolute top-6 right-6 flex items-center gap-3 z-[101]">
                    <button 
                      onClick={() => zoomIn()}
                      className="text-white hover:bg-white/20 bg-white/10 p-3 rounded-xl transition-all border border-white/10 shadow-lg backdrop-blur-md"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => zoomOut()}
                      className="text-white hover:bg-white/20 bg-white/10 p-3 rounded-xl transition-all border border-white/10 shadow-lg backdrop-blur-md"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => resetTransform()}
                      className="text-white hover:bg-white/20 bg-white/10 p-3 rounded-xl transition-all border border-white/10 shadow-lg backdrop-blur-md"
                      title="Reset"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                    <div className="w-px h-6 bg-white/20 mx-1" />
                    <button 
                      onClick={() => setIsFullscreen(false)}
                      className="text-white hover:bg-red-500 bg-white/10 p-3 rounded-xl transition-all border border-white/10 shadow-lg backdrop-blur-md"
                      title="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Navigation Arrows (Absolute to screen, not transform) */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); handlePrev(); resetTransform(); }}
                    className="absolute left-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all z-[101] p-4 hidden md:block"
                  >
                    <ChevronLeft className="w-12 h-12" />
                  </button>

                  <TransformComponent
                    wrapperClass="!w-screen !h-screen"
                    contentClass="!w-screen !h-screen flex items-center justify-center"
                  >
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                      <Image
                        src={images[currentIndex]}
                        alt="Fullscreen main"
                        fill
                        className="object-contain select-none"
                        sizes="100vw"
                        priority
                        draggable={false}
                      />
                    </div>
                  </TransformComponent>

                  <button 
                    onClick={(e) => { e.stopPropagation(); handleNext(); resetTransform(); }}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all z-[101] p-4 hidden md:block"
                  >
                    <ChevronRight className="w-12 h-12" />
                  </button>
                  
                  {/* Overlay Counter */}
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white font-bold text-sm shadow-xl flex items-center gap-2">
                    <span className="text-brand-primary">{currentIndex + 1}</span>
                    <span className="opacity-20">/</span>
                    <span>{images.length}</span>
                  </div>
                  
                  {/* Mobile Hints */}
                  <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 md:hidden pointer-events-none opacity-40">
                    <p className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Pinch to zoom</p>
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
