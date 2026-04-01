"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { motion } from "framer-motion";

const PUBLIC_ROUTES = ["/login", "/signup"];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isCheckingAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [showFailSafe, setShowFailSafe] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fail-safe timer: if still checking auth after 5s, show "Proceed Anyway"
    const timer = setTimeout(() => {
      setShowFailSafe(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const isPublic = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));

  useEffect(() => {
    if (!mounted || isCheckingAuth) return;

    // Decision logic
    if (!isPublic && !isAuthenticated) {
      // Trying to access private route while logged out
      router.replace("/login");
    } else if (isPublic && isAuthenticated) {
      // Trying to access login/signup while logged in
      router.replace("/");
    }
  }, [mounted, isCheckingAuth, isAuthenticated, isPublic, router, pathname]);

  // Prevent hydration mismatch
  if (!mounted) return null;

  // Show loading screen ONLY if we are truly checking auth and it's a private route
  if (isCheckingAuth && !isPublic) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white p-6 text-center">
        <div className="w-16 h-16 relative mb-8">
          <div className="absolute inset-0 border-4 border-brand-primary/20 rounded-full animate-pulse" />
          <div className="absolute inset-0 border-4 border-t-brand-primary rounded-full animate-spin" />
        </div>
        
        <div className="space-y-4">
          <p className="text-sm font-bold text-brand-primary tracking-widest uppercase animate-pulse">
            LuxuryLand Secure Access
          </p>
          
          {showFailSafe && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-4 space-y-4"
            >
              <p className="text-xs text-text-secondary font-medium max-w-xs mx-auto">
                Authentication is taking longer than usual. You can try to proceed anyway or refresh.
              </p>
              <button 
                onClick={() => router.replace("/")}
                className="text-xs font-black text-brand-primary uppercase tracking-[0.2em] underline underline-offset-4 hover:text-brand-secondary transition-colors"
                type="button"
              >
                Proceed Anyway
              </button>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
