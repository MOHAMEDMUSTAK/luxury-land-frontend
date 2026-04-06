"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthInit({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Page visibility handler — pauses all CSS animations when app goes to background
  // This is critical for mobile performance when switching to recent apps
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.documentElement.classList.add("page-hidden");
      } else {
        document.documentElement.classList.remove("page-hidden");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange, { passive: true });
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return <>{children}</>;
}
