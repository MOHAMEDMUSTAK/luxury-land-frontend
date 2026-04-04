"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { createPortal } from "react-dom";

interface ImageGalleryProps {
  images: string[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const swiperRef = useRef<any>(null);
  const swiperContainerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Lock body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isFullscreen]);

  // Keyboard navigation for fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
      if (e.key === "ArrowRight") swiperRef.current?.slideNext();
      if (e.key === "ArrowLeft") swiperRef.current?.slidePrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isFullscreen]);

  // Initialize Swiper when fullscreen opens
  useEffect(() => {
    if (!isFullscreen || !swiperContainerRef.current) return;

    let swiperInstance: any = null;

    const initSwiper = async () => {
      const { Swiper } = await import("swiper");
      // @ts-ignore
      const { Navigation, Pagination } = await import("swiper/modules");

      // Inject Swiper CSS via link tag if not already present
      if (!document.getElementById("swiper-css")) {
        const link = document.createElement("link");
        link.id = "swiper-css";
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css";
        document.head.appendChild(link);
      }

      swiperInstance = new Swiper(swiperContainerRef.current!, {
        modules: [Navigation, Pagination],
        initialSlide: currentIndex,
        speed: 280,
        spaceBetween: 0,
        grabCursor: true,
        resistance: true,
        resistanceRatio: 0.65,
        touchRatio: 1.2,
        threshold: 5,
        navigation: {
          nextEl: ".fs-swiper-next",
          prevEl: ".fs-swiper-prev",
        },
        pagination: {
          el: ".fs-swiper-pagination",
          clickable: true,
          bulletClass: "fs-bullet",
          bulletActiveClass: "fs-bullet-active",
        },
        on: {
          slideChange: (s: any) => {
            setCurrentIndex(s.activeIndex);
          },
        },
      });

      swiperRef.current = swiperInstance;
    };

    initSwiper();

    return () => {
      if (swiperInstance) {
        swiperInstance.destroy(true, true);
        swiperRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullscreen]);

  const openFullscreen = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsFullscreen(true);
  }, []);

  return (
    <div className="flex flex-col gap-5 relative page-fade-in group/gallery">
      {/* Main Image View */}
      <div
        className="relative aspect-[16/10] md:aspect-[21/9] w-full bg-gray-100 rounded-3xl overflow-hidden group/main cursor-pointer border border-ui-border shadow-sm"
        onClick={() => openFullscreen(currentIndex)}
      >
        <Image
          key={currentIndex}
          src={images[currentIndex]}
          alt={`Property Image ${currentIndex + 1}`}
          fill
          className="object-cover transition-opacity duration-300 ease-out group-hover/main:scale-105 transition-transform duration-700"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
        />

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

        {/* Mobile dot indicators on main image */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 md:hidden">
            {images.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${i === currentIndex ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails (Only show if multiple images exist) */}
      {images.length > 1 && (
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
              <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" sizes="96px" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Overlay — Amazon-style clean viewer with Swiper */}
      {isFullscreen && mounted && createPortal(
        <div
          className="fs-overlay"
          onClick={(e) => {
            // Close on backdrop click only
            if (e.target === e.currentTarget) setIsFullscreen(false);
          }}
        >
          {/* Close button — top right */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="fs-close-btn"
            aria-label="Close fullscreen"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image counter */}
          <div className="fs-counter">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Swiper container */}
          <div ref={swiperContainerRef} className="swiper fs-swiper">
            <div className="swiper-wrapper">
              {images.map((img, idx) => (
                <div key={idx} className="swiper-slide fs-slide">
                  <img
                    src={img}
                    alt={`Property image ${idx + 1}`}
                    className="fs-image"
                    draggable={false}
                    loading={Math.abs(idx - currentIndex) <= 1 ? "eager" : "lazy"}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Desktop nav arrows */}
          {images.length > 1 && (
            <>
              <button className="fs-swiper-prev fs-nav-btn fs-nav-prev" aria-label="Previous image">
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button className="fs-swiper-next fs-nav-btn fs-nav-next" aria-label="Next image">
                <ChevronRight className="w-7 h-7" />
              </button>
            </>
          )}

          {/* Dot pagination */}
          {images.length > 1 && (
            <div className="fs-swiper-pagination" />
          )}
        </div>,
        document.body
      )}

      {/* Performance Prefetching — adjacent images */}
      {images[currentIndex + 1] && (
        <link rel="preload" href={images[currentIndex + 1]} as="image" />
      )}
      {images[currentIndex - 1] && (
        <link rel="preload" href={images[currentIndex - 1]} as="image" />
      )}
    </div>
  );
}
