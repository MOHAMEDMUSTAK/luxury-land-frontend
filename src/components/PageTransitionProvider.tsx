"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function PageTransitionProvider({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 flex flex-col page-fade-in">
      {children}
    </div>
  );
}
