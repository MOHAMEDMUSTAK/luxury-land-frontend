"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [direction, setDirection] = useState(0); // -1 for prev, 1 for next

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setDirection(-1);
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

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  return (
    <div className="flex flex-col gap-5 relative page-fade-in group/gallery">
      {/* Main Image View */}
      <div 
        className="relative aspect-[16/10] md:aspect-[21/9] w-full bg-gray-100 rounded-3xl overflow-hidden group/main cursor-pointer border border-ui-border shadow-sm"
        onClick={() => setIsFullscreen(true)}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={images[currentIndex]}
              alt={`Property Image ${currentIndex + 1}`}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover/main:scale-105"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Fullscreen Hint */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-brand-primary p-2.5 rounded-xl opacity-0 group-hover/main:opacity-100 transition-all duration-300 border border-ui-border shadow-sm z-10">
          <Maximize2 className="w-4 h-4" />
        </div>

        {/* Navigation Arrows (Visible on hover) */}
        {images.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md text-text-main p-3 rounded-xl opacity-0 group-hover/main:opacity-100 transition-all duration-300 border border-ui-border hover:bg-white hover:text-brand-primary shadow-sm z-10 hidden md:block"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md text-text-main p-3 rounded-xl opacity-0 group-hover/main:opacity-100 transition-all duration-300 border border-ui-border hover:bg-white hover:text-brand-primary shadow-sm z-10 hidden md:block"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails (Only show if multiple images exist) */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto p-1 scrollbar-hide no-scrollbar">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              className={`relative flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                idx === currentIndex ? "border-brand-primary shadow-md opacity-100 scale-105" : "border-ui-border opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" sizes="96px" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Overlay (Amazon Style) */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex items-center justify-center overscroll-none"
            onWheel={(e) => {
                // Prevent scroll passing through to body
                e.stopPropagation();
            }}
          >
            {/* Minimal Header */}
            <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-[202] bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
                <span className="text-white/60 text-xs font-bold uppercase tracking-widest">
                    {currentIndex + 1} / {images.length}
                </span>
                <button 
                    onClick={() => setIsFullscreen(false)}
                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/10 transition-all active:scale-95 pointer-events-auto"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Swipeable Slides Area */}
            <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipe = swipePower(offset.x, velocity.x);
                            if (swipe < -swipeConfidenceThreshold) {
                                handleNext();
                            } else if (swipe > swipeConfidenceThreshold) {
                                handlePrev();
                            }
                        }}
                        className="absolute inset-x-0 h-full flex items-center justify-center p-4 md:p-8 touch-pan-y"
                    >
                        <Image
                            src={images[currentIndex]}
                            alt={`Fullscreen Image ${currentIndex + 1}`}
                            width={1920}
                            height={1080}
                            className="max-w-full max-h-full object-contain pointer-events-none select-none"
                            quality={100}
                            priority
                            sizes="100vw"
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Desktop Navigation Arrows (Visible on Desktop Screen) */}
            {images.length > 1 && (
                <>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                        className="absolute left-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-4 rounded-full border border-white/5 backdrop-blur-sm transition-all z-[201] hidden md:block"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-4 rounded-full border border-white/5 backdrop-blur-sm transition-all z-[201] hidden md:block"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>
                </>
            )}

            {/* Image Indicator (Dots) */}
            {images.length > 1 && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[202] flex items-center gap-2">
                    {images.map((_, i) => (
                        <div 
                            key={i} 
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/20'}`}
                        />
                    ))}
                </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Performance Prefetching */}
      {images[currentIndex + 1] && (
        <link rel="preload" href={images[currentIndex + 1]} as="image" />
      )}
      {images[currentIndex - 1] && (
        <link rel="preload" href={images[currentIndex - 1]} as="image" />
      )}
    </div>
  );
}
