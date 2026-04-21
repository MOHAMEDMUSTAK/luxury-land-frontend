"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useRef, useEffect, useState } from "react";

/**
 * Ultra-fast zero-delay page transition.
 * No artificial CSS transition blocking, instant content display.
 */
export default function PageTransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [displayKey, setDisplayKey] = useState(pathname);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Instant update
    setDisplayKey(pathname);
  }, [pathname]);

  return (
    <>
      <div
        ref={containerRef}
        key={displayKey}
        className="flex-1 flex flex-col w-full h-full relative"
      >
        {children}
      </div>
    </>
  );
}