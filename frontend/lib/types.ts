export type LevelFilter = "" | "ERROR" | "WARN" | "INFO" | "DEBUG";

export type AnalyticsResponse = {
  error_counts_per_ip: Record<string, number>;
  log_level_distribution: Record<string, number>;
  top_failing_services: [string, number][];
  error_timeline: Record<string, number>;
  total_errors: number;
  total_records: number;
};