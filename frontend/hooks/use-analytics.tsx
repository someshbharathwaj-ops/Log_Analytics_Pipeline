"use client";

import { createContext, startTransition, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { useDashboardPreferences } from "@/hooks/use-dashboard-preferences";
import { fetchSampleAnalytics, uploadAnalytics } from "@/lib/api";
import type { AnalyticsResponse, LevelFilter, ServiceFilter } from "@/lib/types";

type AnalyticsContextValue = {
  data: AnalyticsResponse | null;
  level: LevelFilter;
  service: ServiceFilter;
  loading: boolean;
  refreshing: boolean;
  uploading: boolean;
  lastUpdated: string | null;
  setLevel: (level: LevelFilter) => void;
  setService: (service: ServiceFilter) => void;
  refresh: (options?: { silent?: boolean }) => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
};

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);
const LEVEL_KEY = "log-analytics:level-filter";
const SERVICE_KEY = "log-analytics:service-filter";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { autoRefresh } = useDashboardPreferences();
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [level, setLevel] = useState<LevelFilter>("");
  const [service, setService] = useState<ServiceFilter>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const refresh = async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;

    if (data && silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const result = await fetchSampleAnalytics(level, service);
      startTransition(() => {
        setData(result);
        setLastUpdated(result.generated_at);
      });
      if (!silent) {
        toast.success("Analytics refreshed");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load analytics.";
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const result = await uploadAnalytics(file, level, service);
      startTransition(() => {
        setData(result);
        setLastUpdated(result.generated_at);
      });
      toast.success("Upload analyzed successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload analysis failed.";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const storedLevel = window.localStorage.getItem(LEVEL_KEY);
    const storedService = window.localStorage.getItem(SERVICE_KEY);

    if (storedLevel === "ERROR" || storedLevel === "WARN" || storedLevel === "INFO" || storedLevel === "DEBUG") {
      setLevel(storedLevel);
    }
    if (storedService) {
      setService(storedService);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(LEVEL_KEY, level);
  }, [level]);

  useEffect(() => {
    window.localStorage.setItem(SERVICE_KEY, service);
  }, [service]);

  useEffect(() => {
    void refresh({ silent: true });
  }, [level, service]);

  useEffect(() => {
    if (!autoRefresh) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void refresh({ silent: true });
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [autoRefresh, level, service]);

  const value = useMemo(
    () => ({
      data,
      level,
      service,
      loading,
      refreshing,
      uploading,
      lastUpdated,
      setLevel,
      setService,
      refresh,
      uploadFile,
    }),
    [data, level, service, loading, refreshing, uploading, lastUpdated],
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
