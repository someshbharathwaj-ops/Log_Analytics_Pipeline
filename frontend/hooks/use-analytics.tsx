"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { fetchSampleAnalytics, uploadAnalytics } from "@/lib/api";
import type { AnalyticsResponse, LevelFilter } from "@/lib/types";

type AnalyticsContextValue = {
  data: AnalyticsResponse | null;
  level: LevelFilter;
  loading: boolean;
  uploading: boolean;
  lastUpdated: string | null;
  setLevel: (level: LevelFilter) => void;
  refresh: () => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
};

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [level, setLevel] = useState<LevelFilter>("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const result = await fetchSampleAnalytics(level);
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
      const result = await uploadAnalytics(file, level);
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
  }, [level]);

  const value = useMemo(
    () => ({ data, level, loading, uploading, lastUpdated, setLevel, refresh, uploadFile }),
    [data, level, loading, uploading, lastUpdated],
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