"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { useDashboardPreferences } from "@/hooks/use-dashboard-preferences";
import { fetchSampleAnalytics, uploadAnalytics } from "@/lib/api";
import type { AnalyticsResponse, LevelFilter, ServiceFilter } from "@/lib/types";

type AnalyticsContextValue = {
  data: AnalyticsResponse | null;
  level: LevelFilter;
  service: ServiceFilter;
  loading: boolean;
  uploading: boolean;
  lastUpdated: string | null;
  setLevel: (level: LevelFilter) => void;
  setService: (service: ServiceFilter) => void;
  refresh: () => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
};

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { autoRefresh } = useDashboardPreferences();
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [level, setLevel] = useState<LevelFilter>("");
  const [service, setService] = useState<ServiceFilter>("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const result = await fetchSampleAnalytics(level, service);
      setData(result);
      setLastUpdated(new Date().toISOString());
      toast.success("Analytics refreshed");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load analytics.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const result = await uploadAnalytics(file, level, service);
      setData(result);
      setLastUpdated(new Date().toISOString());
      toast.success("Upload analyzed successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload analysis failed.";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, [level, service]);

  useEffect(() => {
    if (!autoRefresh) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void refresh();
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [autoRefresh, level, service]);

  const value = useMemo(
    () => ({ data, level, service, loading, uploading, lastUpdated, setLevel, setService, refresh, uploadFile }),
    [data, level, service, loading, uploading, lastUpdated],
  );

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error("useAnalytics must be used inside AnalyticsProvider.");
  }
  return context;
}
