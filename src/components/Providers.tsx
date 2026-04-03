"use client";

import { ReactNode, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function Providers({ children }: { children: ReactNode }) {
  // Setup a default QueryClient with 60 seconds caching
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 60 seconds
        gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes (instant back-nav)
        refetchOnWindowFocus: false, // Prevents lag when switching tabs
        refetchOnMount: false, // Don't refetch if data is within staleTime
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        {children}
      </I18nextProvider>
    </QueryClientProvider>
  );
}
