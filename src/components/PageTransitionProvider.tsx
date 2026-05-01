"use client";

import { ReactNode } from "react";

/**
 * Ultra-fast zero-delay page transition.
 * No artificial CSS transition blocking, instant content display.
 * ★ FIX: Removed the key={pathname} that was forcing full unmount/remount of all children
 * on every route change, causing massive performance degradation.
 */
export default function PageTransitionProvider({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 flex flex-col w-full h-full relative page-fade-in">
      {children}
    </div>
  );
}