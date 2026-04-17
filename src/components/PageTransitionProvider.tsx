"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useRef, useEffect, useState } from "react";

/**
 * Ultra-fast page transition using pure CSS animations.
 * Framer Motion removed — eliminates the "wait" blocking that caused slow page loads.
 * Uses GPU-composited opacity + transform for 60fps on low-end phones.
 */
export default function PageTransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [displayKey, setDisplayKey] = useState(pathname);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const isFirstMount = useRef(true);

  useEffect(() => {
    // Skip animation on first mount — show content instantly
    if (isFirstMount.current) {
      isFirstMount.current = false;
      setDisplayKey(pathname);
      return;
    }

    // Trigger progress bar
    if (progressRef.current) {
      progressRef.current.classList.remove("page-progress-animate");
      // Force reflow to restart animation
      void progressRef.current.offsetWidth;
      progressRef.current.classList.add("page-progress-animate");
    }

    // Instant content swap with ultra-fast fade
    if (containerRef.current) {
      containerRef.current.style.opacity = "0";
      containerRef.current.style.transform = "translateY(4px) translateZ(0)";
    }
    
    // Use requestAnimationFrame for buttery smooth timing
    requestAnimationFrame(() => {
      setDisplayKey(pathname);
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.style.opacity = "1";
          containerRef.current.style.transform = "translateY(0) translateZ(0)";
        }
      });
    });
  }, [pathname]);

  return (
    <>
      {/* Ultra-thin progress bar — CSS-only animation */}
      <div
        ref={progressRef}
        className="page-progress-bar"
      />
      
      {/* Content container — GPU-accelerated transitions */}
      <div
        ref={containerRef}
        key={displayKey}
        className="flex-1 flex flex-col w-full h-full relative"
        style={{
          opacity: 1,
          transform: "translateZ(0)",
          transition: "opacity 0.12s ease-out, transform 0.12s ease-out",
          willChange: "opacity, transform",
        }}
      >
        {children}
      </div>
    </>
  );
}
