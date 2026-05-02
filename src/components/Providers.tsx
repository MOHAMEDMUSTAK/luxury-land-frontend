"use client";

import { ReactNode, useState, useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { useUIStore } from "@/store/useUIStore";

// ★ ThemeInitializer — syncs Zustand theme with DOM on mount and listens for OS changes
function ThemeInitializer() {
  useEffect(() => {
    const cleanup = useUIStore.getState()._initThemeListener();
    return () => { cleanup?.(); };
  }, []);
  return null;
}

// Create a singleton QueryClient with aggressive caching — Amazon-tier speed
const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 2 * 60 * 1000,        // 2 min — data considered fresh
        gcTime: 24 * 60 * 60 * 1000,     // 24h — keep cache in memory (fixes 30-min stale issue)
        refetchOnWindowFocus: false,      // Don't re-fetch when tab regains focus
        refetchOnMount: false,            // Use cache when navigating back — instant
        refetchOnReconnect: false,        // Don't re-fetch on reconnect
        retry: 1,                         // Only one retry on failure
        retryDelay: 500,
      },
    },
  });

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      // Create localStorage persister — data survives page refresh (0ms reload)
      const localStoragePersister = createSyncStoragePersister({
        storage: window.localStorage,
        key: "luxuryland-query-cache",
        throttleTime: 1000,              // Throttle writes to localStorage
      });

      persistQueryClient({
        queryClient,
        persister: localStoragePersister,
        maxAge: 24 * 60 * 60 * 1000,   // Persist for 24 hours
        buster: "v2",                   // Cache buster — bumped to invalidate old caches
        // Only persist non-sensitive, high-value queries
        hydrateOptions: {},
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            const key = query.queryKey[0] as string;
            // Only persist public listing data — never persist auth or personal data
            return ["lands", "trending-properties", "land"].includes(key) && 
                   query.state.status === "success";
          },
        },
      });
    } catch (e) {
      // Silently fail if localStorage is unavailable (e.g., private browsing)
      console.debug("[Providers] Could not initialize query persistence:", e);
    }
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <ThemeInitializer />
        {children}
      </I18nextProvider>
    </QueryClientProvider>
  );
}
