"use client";

import { Toaster } from "react-hot-toast";

import { AnalyticsProvider } from "@/hooks/use-analytics";
import { DashboardPreferencesProvider } from "@/hooks/use-dashboard-preferences";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DashboardPreferencesProvider>
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
    </DashboardPreferencesProvider>
  );
}
