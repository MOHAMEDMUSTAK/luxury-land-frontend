"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

const PROTECTED_ROUTES = ["/profile", "/dashboard", "/my-ads", "/property", "/wishlist", "/chat", "/post"];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isCheckingAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [showFailSafe, setShowFailSafe] = useState(false);
  const failSafeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    // Fail-safe timer: reduced to 1.5s — if still checking, let user through
    failSafeTimer.current = setTimeout(() => {
      setShowFailSafe(true);
    }, 1500);
    return () => {
      if (failSafeTimer.current) clearTimeout(failSafeTimer.current);
    };
  }, []);

  // Clear fail-safe timer as soon as auth check completes
  useEffect(() => {
    if (!isCheckingAuth && failSafeTimer.current) {
      clearTimeout(failSafeTimer.current);
      failSafeTimer.current = null;
    }
  }, [isCheckingAuth]);

  const isProtected = PROTECTED_ROUTES.some(route => pathname?.startsWith(route));

  useEffect(() => {
    if (!mounted || isCheckingAuth) return;

    // Decision logic: Only redirect to login if accessing a protected route while NOT authenticated
    if (isProtected && !isAuthenticated) {
      router.replace("/login");
    } 
    // Redirect to home if accessing login/signup while already authenticated
    else if ((pathname === "/login" || pathname === "/signup") && isAuthenticated) {
      router.replace("/");
    }
  }, [mounted, isCheckingAuth, isAuthenticated, isProtected, router, pathname]);

  // Prevent hydration mismatch
  if (!mounted) return null;

  // Show loading screen ONLY if we are truly checking auth and it's a private route
  // ★ Uses ultra-fast skeleton with reduced timeout for snappier UX
  if (isCheckingAuth && isProtected) {
    // After fail-safe timeout, just render children — don't block the user
    if (showFailSafe) {
      return <>{children}</>;
    }
    
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm p-6 text-center auth-loading-screen">
        {/* Ultra-smooth spinner using CSS only */}
        <div className="w-12 h-12 relative mb-6">
          <div className="absolute inset-0 border-3 border-brand-primary/15 rounded-full" />
          <div className="absolute inset-0 border-3 border-t-brand-primary rounded-full auth-spinner" />
        </div>
        
        <p className="text-[10px] font-black text-brand-primary/60 tracking-[0.3em] uppercase">
          Verifying
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
