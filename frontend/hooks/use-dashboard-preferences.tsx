"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { TableDensity } from "@/lib/types";

type DashboardPreferencesValue = {
  autoRefresh: boolean;
  density: TableDensity;
  setAutoRefresh: (value: boolean) => void;
  setDensity: (value: TableDensity) => void;
};

const AUTO_REFRESH_KEY = "log-analytics:auto-refresh";
const DENSITY_KEY = "log-analytics:density";
const DashboardPreferencesContext = createContext<DashboardPreferencesValue | null>(null);

export function DashboardPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [density, setDensity] = useState<TableDensity>("comfortable");

  useEffect(() => {
    const storedAutoRefresh = window.localStorage.getItem(AUTO_REFRESH_KEY);
    const storedDensity = window.localStorage.getItem(DENSITY_KEY);

    if (storedAutoRefresh) {
      setAutoRefresh(storedAutoRefresh === "true");
    }

    if (storedDensity === "compact" || storedDensity === "comfortable") {
      setDensity(storedDensity);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(AUTO_REFRESH_KEY, String(autoRefresh));
  }, [autoRefresh]);

  useEffect(() => {
    window.localStorage.setItem(DENSITY_KEY, density);
  }, [density]);

  const value = useMemo(
    () => ({ autoRefresh, density, setAutoRefresh, setDensity }),
    [autoRefresh, density],
  );

  return <DashboardPreferencesContext.Provider value={value}>{children}</DashboardPreferencesContext.Provider>;
}

export function useDashboardPreferences() {
  const context = useContext(DashboardPreferencesContext);
  if (!context) {
    throw new Error("useDashboardPreferences must be used inside DashboardPreferencesProvider.");
  }

  return context;
}
