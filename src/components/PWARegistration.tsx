"use client";

import { useEffect } from "react";

export default function PWARegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Register immediately — useEffect already runs post-hydration (no need to wrap in 'load')
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("[PWA] Service Worker registered, scope:", registration.scope);
      })
      .catch((error) => {
        console.error("[PWA] Service Worker registration failed:", error);
      });
  }, []);

  return null;
}
