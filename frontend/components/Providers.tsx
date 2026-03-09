"use client";

import { Toaster } from "react-hot-toast";

import { AnalyticsProvider } from "@/hooks/use-analytics";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AnalyticsProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0d162b",
            color: "#f2f5ff",
            border: "1px solid rgba(255,255,255,0.12)",
          },
        }}
      />
    </AnalyticsProvider>
  );
}