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
        staleTime: 5 * 60 * 1000, // 5 minutes — instant navigation, prevents redundant fetching
        gcTime: 30 * 60 * 1000, // 30 minutes memory keeping
        refetchOnWindowFocus: false,
        refetchOnMount: false, // Use cache when navigating back
        retry: false, // Prevents massive retries on 401/404s
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
