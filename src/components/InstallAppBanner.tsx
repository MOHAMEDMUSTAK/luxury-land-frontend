"use client";

import { useState, useEffect, useRef } from "react";
import { X, Download, Share } from "lucide-react";

// Key stored in localStorage so the banner is shown only once total.
const DISMISSED_KEY = "pwa-install-dismissed";
const INSTALLED_KEY = "pwa-installed";

type InstallState = "hidden" | "android" | "ios" | "installed";

export default function InstallAppBanner() {
  // Use a ref for deferredPrompt so the tap handler always has the latest value
  // (useState creates stale closures in async event handlers).
  const deferredPromptRef = useRef<any>(null);
  const [installState, setInstallState] = useState<InstallState>("hidden");
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // ── Already installed (launched in standalone mode) ──────────────────────
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      localStorage.setItem(INSTALLED_KEY, "true");
      setInstallState("installed");
      return;
    }

    // ── User already dismissed or installed previously ───────────────────────
    if (
      localStorage.getItem(DISMISSED_KEY) === "true" ||
      localStorage.getItem(INSTALLED_KEY) === "true"
    ) {
      console.log("[PWA] Install banner suppressed (already dismissed/installed)");
      return;
    }

    const ua = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);

    if (isIOS) {
      // iOS Safari doesn't fire beforeinstallprompt; we show manual instructions
      const delay = setTimeout(() => setInstallState("ios"), 4000);
      return () => clearTimeout(delay);
    }

    // ── Android / Desktop Chrome ─────────────────────────────────────────────
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // prevent auto-prompt
      deferredPromptRef.current = e;
      console.log("[PWA] beforeinstallprompt captured — showing install banner");
      setInstallState("android");
    };

    const handleAppInstalled = () => {
      console.log("[PWA] App installed via browser UI");
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

  // ── Handler: Install button tapped ────────────────────────────────────────
  const handleInstallClick = async () => {
    if (installState === "ios") {
      // Slightly nicer than a raw alert — could be a modal, but keep it simple
      alert(
        "To install LuxuryLand:\n\n" +
          "1. Tap the Share button (□↑) at the bottom of Safari\n" +
          "2. Scroll down and tap 'Add to Home Screen'\n" +
          "3. Tap 'Add'"
      );
      handleDismiss();
      return;
    }

    const prompt = deferredPromptRef.current;
    if (!prompt) {
      console.warn("[PWA] No deferred prompt available — cannot trigger install");
      return;
    }

    setInstalling(true);
    try {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      console.log("[PWA] User choice:", outcome);

      if (outcome === "accepted") {
        localStorage.setItem(INSTALLED_KEY, "true");
        setInstallState("installed");
      } else {
        // Dismissed from native sheet — record so we don't re-show
        handleDismiss();
      }
    } catch (err) {
      console.error("[PWA] Install prompt error:", err);
    } finally {
      deferredPromptRef.current = null;
      setInstalling(false);
    }
  };

  // ── Handler: Close / dismiss ───────────────────────────────────────────────
  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true");
    setInstallState("hidden");
  };

  // Don't render anything in hidden / installed states
  if (installState === "hidden" || installState === "installed") return null;

  return (
    <div
      role="dialog"
      aria-label="Install LuxuryLand App"
      className="fixed bottom-24 left-4 right-4 z-[90] sm:bottom-6 sm:left-auto sm:right-6 sm:w-96 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/60 dark:border-slate-700/60 rounded-[24px] shadow-2xl p-4 transition-all animate-in slide-in-from-bottom-5 fade-in duration-500"
    >
      {/* Close button */}
      <button
        id="pwa-banner-close"
        onClick={handleDismiss}
        aria-label="Dismiss install banner"
        className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* App identity row */}
      <div className="flex gap-4 items-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex flex-shrink-0 items-center justify-center text-white shadow-lg shadow-blue-500/25">
          <span className="font-black text-2xl tracking-tighter">L</span>
        </div>

        <div className="flex-1 pr-6">
          <h4 className="font-bold text-gray-900 dark:text-white text-base">
            LuxuryLand App
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
            {installState === "ios"
              ? "Add to your Home Screen for the full experience."
              : "Install for faster loading & offline access."}
          </p>
        </div>
      </div>

      {/* Install / learn button */}
      <button
        id="pwa-install-button"
        onClick={handleInstallClick}
        disabled={installing}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/25"
      >
        {installState === "ios" ? (
          <>
            <Share className="w-4 h-4" />
            How to Install
          </>
        ) : installing ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Download className="w-4 h-4" />
            Install App
          </>
        )}
      </button>
    </div>
  );
}
