export type LevelFilter = "" | "ERROR" | "WARN" | "INFO" | "DEBUG";
export type HealthStatus = "no-data" | "stable" | "monitor" | "degraded" | "critical";
export type TableDensity = "comfortable" | "compact";

export type AnalyticsResponse = {
  error_counts_per_ip: Record<string, number>;
  log_level_distribution: Record<string, number>;
  top_failing_services: [string, number][];
  service_error_share: Record<string, number>;
  error_timeline: Record<string, number>;
  total_errors: number;
  total_records: number;
  skipped_records: number;
  source: string;
  applied_level: LevelFilter | null;
  dominant_level: string | null;
  peak_error_window: string | null;
  noisiest_ip: string | null;
  health_status: HealthStatus;
  generated_at: string;
};
