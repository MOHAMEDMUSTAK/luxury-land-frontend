"use client";

import { useState, useEffect, useRef } from "react";
import { X, Download, Share, Smartphone, Home } from "lucide-react";

const DISMISSED_KEY = "pwa-install-dismissed";
const INSTALLED_KEY = "pwa-installed";

type InstallState = "hidden" | "android" | "ios" | "installed";

export default function InstallAppBanner() {
  const deferredPromptRef = useRef<any>(null);
  const [installState, setInstallState] = useState<InstallState>("hidden");
  const [installing, setInstalling] = useState(false);
  // iOS: which instruction step to highlight
  const [iosStep, setIosStep] = useState(0);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      localStorage.setItem(INSTALLED_KEY, "true");
      setInstallState("installed");
      return;
    }

    if (
      localStorage.getItem(DISMISSED_KEY) === "true" ||
      localStorage.getItem(INSTALLED_KEY) === "true"
    ) {
      return;
    }

    const ua = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);

    if (isIOS) {
      const delay = setTimeout(() => setInstallState("ios"), 4000);
      return () => clearTimeout(delay);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setInstallState("android");
    };

    const handleAppInstalled = () => {
      localStorage.setItem(INSTALLED_KEY, "true");
      deferredPromptRef.current = null;
      setInstallState("installed");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Cycle through iOS instructions
  useEffect(() => {
    if (installState !== "ios") return;
    const timer = setInterval(() => {
      setIosStep((s) => (s + 1) % 3);
    }, 2500);
    return () => clearInterval(timer);
  }, [installState]);

  const handleInstallClick = async () => {
    if (installState === "ios") return; // iOS: banner is instruction-only

    const prompt = deferredPromptRef.current;
    if (!prompt) return;

    setInstalling(true);
    try {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") {
        localStorage.setItem(INSTALLED_KEY, "true");
        setInstallState("installed");
      } else {
        handleDismiss();
      }
    } catch (err) {
      console.error("[PWA] Install prompt error:", err);
    } finally {
      deferredPromptRef.current = null;
      setInstalling(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true");
    setInstallState("hidden");
  };

  if (installState === "hidden" || installState === "installed") return null;

  const iosSteps = [
    { icon: Share, label: "Tap the Share button", sub: "at the bottom of Safari" },
    { icon: Home, label: "Scroll & tap 'Add to Home Screen'" , sub: "in the Share menu" },
    { icon: Smartphone, label: "Tap 'Add' to install", sub: "enjoy the full app experience" },
  ];

  return (
    <div
      role="dialog"
      aria-label="Install LuxuryLand App"
      className="fixed bottom-24 left-4 right-4 z-[90] sm:bottom-6 sm:left-auto sm:right-6 sm:w-[400px] bg-[var(--surface)]/95 backdrop-blur-2xl border border-[var(--ui-border)] rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] p-6 animate-fade-in-up"
    >
      {/* Close button */}
      <button
        id="pwa-banner-close"
        onClick={handleDismiss}
        aria-label="Dismiss install banner"
        className="absolute top-3 right-3 p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-main)] rounded-full hover:bg-[var(--surface-elevated)] transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* App identity */}
      <div className="flex gap-5 items-center mb-5">
        <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-brand-primary via-[#818cf8] to-brand-secondary flex flex-shrink-0 items-center justify-center text-white shadow-[0_8px_20px_rgba(99,102,241,0.3)] border border-white/20">
          <span className="font-black text-3xl tracking-tighter">L</span>
        </div>
        <div className="flex-1 pr-6">
          <h4 className="font-black text-[var(--text-main)] text-[17px] tracking-tight">LuxuryLand App</h4>
          <p className="text-xs text-text-secondary mt-0.5 leading-tight font-medium">
            {installState === "ios"
              ? "Follow the 3 steps below to install"
              : "Install for faster loading & offline access."}
          </p>
        </div>
      </div>

      {/* iOS Step-by-step instructions */}
      {installState === "ios" ? (
        <div className="space-y-2.5 mb-4">
          {iosSteps.map((step, i) => {
            const Icon = step.icon;
            const isActive = iosStep === i;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
                  isActive
                    ? "bg-brand-primary/[0.04] border-brand-primary/20 shadow-sm"
                    : "bg-gray-50 border-transparent"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                  isActive ? "bg-brand-primary text-white shadow-sm shadow-brand-primary/30" : "bg-gray-100 text-gray-400"
                }`}>
                  <span className={`text-[11px] font-black ${isActive ? "text-white" : "text-gray-400"}`}>{i + 1}</span>
                </div>
                <div>
                  <p className={`text-sm font-bold transition-colors ${isActive ? "text-text-main" : "text-text-secondary"}`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-text-secondary opacity-70">{step.sub}</p>
                </div>
                {isActive && <Icon className="w-4 h-4 text-brand-primary ml-auto flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      ) : (
        /* Android / Desktop: single install button */
        <button
          id="pwa-install-button"
          onClick={handleInstallClick}
          disabled={installing}
          className="mt-2 w-full bg-[var(--text-main)] text-[var(--background)] hover:opacity-90 active:scale-95 transition-all duration-300 py-3.5 px-4 rounded-[18px] flex items-center justify-center gap-2.5 text-[15px] font-bold shadow-[0_4px_14px_0_rgba(0,0,0,0.2)]"
        >
          {installing ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Download className="w-4.5 h-4.5 animate-bounce" style={{ animationDuration: '2s' }} />
              Get the Full Experience
            </>
          )}
        </button>
      )}

      {/* iOS: dismiss link */}
      {installState === "ios" && (
        <button
          onClick={handleDismiss}
          className="w-full text-center text-[11px] font-bold text-text-secondary mt-2 hover:text-text-main transition-colors"
        >
          Maybe later
        </button>
      )}
    </div>
  );
}
