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
        staleTime: 2 * 60 * 1000, // 2 minutes — instant navigation
        gcTime: 10 * 60 * 1000, // 10 minutes in memory
        refetchOnWindowFocus: false,
        refetchOnMount: false, // Use cache when navigating back
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
