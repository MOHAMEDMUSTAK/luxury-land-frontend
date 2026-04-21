"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

const PROTECTED_ROUTES = ["/profile", "/dashboard", "/my-ads", "/property", "/wishlist", "/chat", "/post"];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isCheckingAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // We completely removed the Verifying spinner to make navigation 100% instant
  // If the user isn't authenticated and accesses a protected route, it will seamlessly redirect them.
  // The fast path in useAuthStore ensures isCheckingAuth completes instantly on cached clients.
  
  // If it's still checking auth, we can just return children anyway because the effect above
  // will redirect them seamlessly if they truly aren't authenticated, avoiding any artificial blocker.
  if (isCheckingAuth && isProtected && !isAuthenticated) {
     return null; // Return null only to prevent rendering protected info before redirect
  }

  return <>{children}</>;
}
