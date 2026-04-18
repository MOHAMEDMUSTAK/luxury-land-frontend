"use client";

import { useState, useEffect, useRef, memo, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, PlusCircle, User } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useAuthStore } from "@/store/useAuthStore";
import { requireStrictAuth } from "@/lib/authUtils";

function MobileBottomNav() {
  const pathname = usePathname();
  const { isChatActive } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Auto-hide logic on scroll — throttled with rAF for 60fps
  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        
        if (Math.abs(currentScrollY - lastScrollY.current) < 10) {
          ticking.current = false;
          return;
        }

        if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Haptic on tap
  const handleTap = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([8]);
    }
  }, []);

  // Hide on chat pages or if a chat modal is active
  if (pathname.startsWith('/chat/') || isChatActive) {
    return null;
  }

  const navItems = [
    { label: "Home", icon: Home, path: "/" },
    { label: "Search", icon: Search, path: "/?focus=true" },
    { label: "Post", icon: PlusCircle, path: "/my-ads/create", protected: true },
    { label: "Wishlist", icon: Heart, path: "/wishlist", protected: true },
    { label: "My Ads", icon: User, path: "/my-ads", protected: true },
  ];

  return (
    <div 
      className="md:hidden fixed left-1/2 z-[40] w-[92%] max-w-[420px] flex items-center justify-between bg-white/70 backdrop-blur-xl border border-white/40 h-16 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.2)] px-2 overflow-hidden pointer-events-auto"
      style={{ 
        bottom: `calc(16px + env(safe-area-inset-bottom))`,
        transform: `translateX(-50%) translateY(${isVisible ? '0' : '100px'})`,
        transition: 'transform 0.3s ease-in-out',
      }}
    >
      {/* Subtle accent line on top */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent" />
      
      {navItems.map((item) => {
        const isActive = pathname === item.path || (item.path === '/' && pathname === '/');
        return (
          <Link 
            onClick={(e) => {
              handleTap();
              if (item.protected && !requireStrictAuth(isAuthenticated, item.path)) {
                e.preventDefault();
              }
            }}
            key={item.path} 
            href={item.path} 
            className="relative flex-1 flex flex-col items-center justify-center h-14 rounded-2xl group active:scale-90 transition-transform gap-0.5"
          >
            {/* Active background pill */}
            {isActive && (
              <div className="absolute inset-x-1 inset-y-1 bg-brand-primary/[0.08] rounded-xl" />
            )}

            <item.icon 
              className={`h-5 w-5 transition-all duration-200 relative z-10 ${
                isActive 
                  ? "text-brand-primary scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
                  : "text-gray-400 group-hover:text-text-main"
              }`} 
            />

            {/* Label — visible & animated on active */}
            <span 
              className={`text-[9px] font-black tracking-widest uppercase relative z-10 transition-all duration-200 ${
                isActive 
                  ? "text-brand-primary nav-label-active opacity-100" 
                  : "text-gray-400 opacity-0 group-hover:opacity-60"
              }`}
            >
              {item.label}
            </span>
            
            {/* Active dot indicator */}
            {isActive && (
              <div className="absolute bottom-1 w-1 h-1 bg-brand-primary rounded-full shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
            )}
          </Link>
        );
      })}
    </div>
  );
}

export default memo(MobileBottomNav);
