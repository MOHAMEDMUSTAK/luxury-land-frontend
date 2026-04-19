"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthInit({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Only check auth initially if checking auth is true to avoid duplicate checks
    // since Zustand persist handles it on rehydrate already
  }, []);



  return <>{children}</>;
}
