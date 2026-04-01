"use client";

import { useState, useEffect } from "react";
import { X, Download, Share } from "lucide-react";

export default function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
      return;
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent Chrome 67+ from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the customized install banner
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If it's iOS and not standalone, we can prompt them to use the share menu
    // Show banner after a slight delay to not interrupt immediate loading
    if (isIosDevice && !isStandalone) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (isIOS) {
      alert("To install: tap the Share button at the bottom of Safari, then scroll down and tap 'Add to Home Screen'.");
      return;
    }

    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    }
  };

  const closeBanner = () => {
    setIsVisible(false);
    // Optional: save to localStorage to not show again for a few days
  };

  if (!isVisible || isStandalone) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[90] sm:bottom-6 sm:left-auto sm:right-6 sm:w-96 bg-white/90 backdrop-blur-xl border border-white/60 rounded-[24px] shadow-2xl p-4 transition-all animate-in slide-in-from-bottom-5 fade-in duration-500">
      <button 
        onClick={closeBanner}
        className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      
      <div className="flex gap-4 items-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex flex-shrink-0 items-center justify-center text-white shadow-lg shadow-brand-primary/20">
          <span className="font-black text-2xl tracking-tighter">L</span>
        </div>
        
        <div className="flex-1 pr-6">
          <h4 className="font-bold text-text-main text-base">LuxuryLand App</h4>
          <p className="text-xs text-text-secondary mt-0.5 leading-tight">
            Get the full app experience. Faster loading & offline access.
          </p>
        </div>
      </div>

      <button 
        onClick={handleInstallClick}
        className="mt-4 w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-brand-primary/20"
      >
        {isIOS ? (
          <>
            <Share className="w-4 h-4" />
            Learn How to Install
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Install App Now
          </>
        )}
      </button>
    </div>
  );
}
