"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Shield, Users, Home, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const trustItems = [
  { icon: "✅", label: "Verified Sellers" },
  { icon: "🔒", label: "Secure Platform" },
  { icon: "⚡", label: "24h Response" },
  { icon: "🌾", label: "Made in TN" },
  { icon: "🏆", label: "Est. 2023" },
  { icon: "⭐", label: "Top Rated" },
  // Duplicated for seamless loop
  { icon: "✅", label: "Verified Sellers" },
  { icon: "🔒", label: "Secure Platform" },
  { icon: "⚡", label: "24h Response" },
  { icon: "🌾", label: "Made in TN" },
  { icon: "🏆", label: "Est. 2023" },
  { icon: "⭐", label: "Top Rated" },
];

const stats = [
  { value: "1,200+", label: "Active Listings" },
  { value: "5", label: "Districts" },
  { value: "850+", label: "Happy Sellers" },
  { value: "₹50Cr+", label: "Transacted" },
];

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-[var(--surface)] border-t border-[var(--ui-border)] pt-0 pb-12 mt-auto relative overflow-hidden">
      {/* Premium Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary/40 to-transparent" />

      {/* ★ Scrolling Trust Bar */}
      <div className="bg-[var(--surface-elevated)] border-b border-[var(--ui-border)] py-3 overflow-hidden">
        <div className="flex overflow-hidden">
          <div className="trust-bar-track flex items-center gap-10 px-6">
            {trustItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] whitespace-nowrap flex-shrink-0">
                <span>{item.icon}</span>
                <span>{item.label}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300 ml-4" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ★ Stats Row */}
      <div className="container mx-auto px-4 lg:px-8 pt-10 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--ui-border)] hover:border-brand-primary/20 hover:bg-brand-primary/[0.02] transition-all group">
              <p className="text-2xl font-black gradient-accent">{stat.value}</p>
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-1 group-hover:text-brand-primary transition-colors">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 items-start">

          {/* Column 1: Brand */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-primary/25 group-hover:scale-105 transition-transform duration-500">
                L
              </div>
              <span className="text-2xl font-bold tracking-tight text-[var(--text-main)]">
                <span className="gradient-accent">Land</span><span className="text-brand-secondary">Market</span>
              </span>
            </Link>
            <p className="text-text-secondary text-base leading-relaxed max-w-xs font-medium opacity-80">
              {t("footer.tagline")}
            </p>

            {/* Social / contact icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/917094055969"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center hover:bg-green-500 hover:border-green-500 group/wa transition-all"
              >
                <MessageCircle className="w-4 h-4 text-green-500 group-hover/wa:text-white transition-colors" />
              </a>
              <a
                href="mailto:landmarket@gmail.com"
                aria-label="Email"
                className="w-9 h-9 rounded-xl bg-brand-primary/5 border border-brand-primary/10 flex items-center justify-center hover:bg-brand-primary hover:border-brand-primary group/mail transition-all"
              >
                <Mail className="w-4 h-4 text-brand-primary group-hover/mail:text-white transition-colors" />
              </a>
              <a
                href="tel:+917094055969"
                aria-label="Call us"
                className="w-9 h-9 rounded-xl bg-brand-primary/5 border border-brand-primary/10 flex items-center justify-center hover:bg-brand-primary hover:border-brand-primary group/phone transition-all"
              >
                <Phone className="w-4 h-4 text-brand-primary group-hover/phone:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div className="lg:col-span-3 lg:pt-2">
            <h4 className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em] mb-8 opacity-60">Platform</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-sm font-bold text-text-main hover:text-brand-primary transition-all duration-300 flex items-center gap-2 group/link">
                  <span className="w-0 h-px bg-brand-primary group-hover/link:w-3 transition-all duration-300" />
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link href="/my-ads/create" className="text-sm font-bold text-text-main hover:text-brand-primary transition-all duration-300 flex items-center gap-2 group/link">
                  <span className="w-0 h-px bg-brand-primary group-hover/link:w-3 transition-all duration-300" />
                  Post Your Property
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-sm font-bold text-text-main hover:text-brand-primary transition-all duration-300 flex items-center gap-2 group/link">
                  <span className="w-0 h-px bg-brand-primary group-hover/link:w-3 transition-all duration-300" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-sm font-bold text-text-main hover:text-brand-primary transition-all duration-300 flex items-center gap-2 group/link">
                  <span className="w-0 h-px bg-brand-primary group-hover/link:w-3 transition-all duration-300" />
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Premium Contact Card */}
          <div className="md:col-span-2 lg:col-span-5">
            <div className="premium-card luxe-lift p-8 relative border border-[var(--ui-border)] group/card">
              {/* Glow Line Top */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-brand-primary to-brand-secondary opacity-80" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <h5 className="text-lg font-black text-[var(--text-main)] tracking-tight">MOHAMED MUSTAK M</h5>
                  <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.15em]">{t("footer.trusted")}</p>
                </div>

                <div className="flex flex-col gap-3">
                  <a href="mailto:landmarket@gmail.com" className="flex items-center gap-3 text-sm font-bold text-text-secondary hover:text-brand-primary transition-colors group/link">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover/link:bg-brand-primary/10 transition-colors">
                      <Mail className="w-4 h-4 text-brand-primary" />
                    </div>
                    <span>landmarket@gmail.com</span>
                  </a>
                  <a href="tel:+917094055969" className="flex items-center gap-3 text-sm font-bold text-text-secondary hover:text-brand-primary transition-colors group/link">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover/link:bg-brand-primary/10 transition-colors">
                      <Phone className="w-4 h-4 text-brand-primary" />
                    </div>
                    <span>+91 7094055969</span>
                  </a>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-ui-border/50 flex items-center justify-between">
                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest italic opacity-60">"Usually responds within 24h"</p>
                <div className="flex items-center gap-1.5 min-w-max">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Live Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-[var(--ui-border)] flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.1em] opacity-60">
          <p>© {new Date().getFullYear()} LuxuryLand. All rights reserved.</p>
          <p className="flex items-center gap-2">
            Made with ❤️ in <span className="gradient-accent">Tamil Nadu </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
