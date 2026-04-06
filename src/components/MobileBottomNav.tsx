"use client";

import { useState, useEffect, useRef, memo } from "react";
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
      className="md:hidden fixed left-1/2 z-[40] w-[92%] max-w-[420px] flex items-center justify-between bg-white/70 backdrop-blur-xl border border-white/40 h-16 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.2)] px-4 overflow-hidden pointer-events-auto"
      style={{ 
        bottom: `calc(16px + env(safe-area-inset-bottom))`,
        transform: `translateX(-50%) translateY(${isVisible ? '0' : '100px'})`,
        transition: 'transform 0.3s ease-in-out',
      }}
    >
      {/* Subtle accent line on top */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent" />
      
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link 
            onClick={(e) => {
              if (item.protected && !requireStrictAuth(isAuthenticated, item.path)) {
                e.preventDefault();
              }
            }}
            key={item.path} 
            href={item.path} 
            className="relative flex-1 flex flex-col items-center justify-center h-14 rounded-2xl group active:scale-90 transition-transform"
          >
            <item.icon className={`h-5 w-5 transition-colors duration-200 ${isActive ? "text-brand-primary scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "text-gray-400 group-hover:text-text-main"}`} />
            
            {isActive && (
              <div className="absolute bottom-2 w-1.5 h-1.5 bg-brand-primary rounded-full shadow-[0_0_10px_rgba(99,102,241,1)]" />
            )}
            <span className="sr-only">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default memo(MobileBottomNav);
