"use client";

import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="hero-dark relative pt-20 pb-12 mt-auto overflow-hidden">
      {/* Premium Accent Line — Gold */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold/60 to-transparent" />
      
      {/* Subtle grid overlay */}
      <div className="hero-grid opacity-30" />
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          
          {/* Column 1: Brand (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-primary/25 group-hover:scale-105 transition-transform duration-500">
                L
              </div>
              <span className="text-2xl font-bold tracking-tight">
                <span className="gold-text">Land</span><span className="text-violet-300">Market</span>
              </span>
            </Link>
            <p className="text-white/40 text-base leading-relaxed max-w-xs font-medium">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Column 2: Info/Links (4 cols) */}
          <div className="lg:col-span-3 lg:pt-2">
            <h4 className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mb-8">Platform</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-sm font-bold text-white/70 hover:text-white transition-all duration-300 flex items-center gap-2 group/link">
                  <span className="w-0 h-px bg-brand-gold group-hover/link:w-3 transition-all duration-300" />
                  {t("home.showAll")}
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-sm font-bold text-white/70 hover:text-white transition-all duration-300 flex items-center gap-2 group/link">
                  <span className="w-0 h-px bg-brand-gold group-hover/link:w-3 transition-all duration-300" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-sm font-bold text-white/70 hover:text-white transition-all duration-300 flex items-center gap-2 group/link">
                  <span className="w-0 h-px bg-brand-gold group-hover/link:w-3 transition-all duration-300" />
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Premium Contact Card (5 cols) — Dark Glass */}
          <div className="md:col-span-2 lg:col-span-5">
            <div className="glass-card p-8 relative group/card">
              {/* Glow Line Top — Gold */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-brand-primary via-brand-gold to-brand-secondary opacity-80" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <h5 className="text-lg font-black text-white tracking-tight">MOHAMED MUSTAK M</h5>
                  <p className="text-[10px] font-black gold-text uppercase tracking-[0.15em]">{t("footer.trusted")}</p>
                </div>
                
                <div className="flex flex-col gap-3">
                  <a href="mailto:landmarket@gmail.com" className="flex items-center gap-3 text-sm font-bold text-white/60 hover:text-white transition-colors group/link">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center group-hover/link:bg-brand-primary/20 transition-colors">
                      <Mail className="w-4 h-4 text-brand-primary" />
                    </div>
                    <span>landmarket@gmail.com</span>
                  </a>
                  <a href="tel:+917094055969" className="flex items-center gap-3 text-sm font-bold text-white/60 hover:text-white transition-colors group/link">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center group-hover/link:bg-brand-primary/20 transition-colors">
                      <Phone className="w-4 h-4 text-brand-primary" />
                    </div>
                    <span>+91 7094055969</span>
                  </a>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-between">
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest italic">"Usually responds within 24h"</p>
                <div className="flex items-center gap-1.5 min-w-max">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[9px] font-black text-green-400 uppercase tracking-widest">Live Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-white/[0.06] flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] font-bold text-white/30 uppercase tracking-[0.1em]">
          <p>© {new Date().getFullYear()} LuxuryLand. All rights reserved.</p>
          <p className="flex items-center gap-2">
            Designed for <span className="gold-text">Excellence</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
