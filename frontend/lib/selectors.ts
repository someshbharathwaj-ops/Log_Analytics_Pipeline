import type { AnalyticsResponse } from "@/lib/types";

export function buildLogRows(data: AnalyticsResponse): Array<{ key: string; category: string; label: string; value: number }> {
  const fromIps = Object.entries(data.error_counts_per_ip).map(([label, value]) => ({
    key: `ip-${label}`,
    category: "IP",
    label,
    value,
  }));

  const fromLevels = Object.entries(data.log_level_distribution).map(([label, value]) => ({
    key: `level-${label}`,
    category: "Level",
    label,
    value,
  }));

  const fromServices = data.top_failing_services.map(([label, value]) => ({
    key: `service-${label}`,
    category: "Service",
    label,
    value,
  }));

  const fromHealth = Object.entries(data.service_health).map(([label, status]) => ({
    key: `service-health-${label}`,
    category: "Service Health",
    label: `${label} (${status})`,
    value: data.service_volume[label] ?? 0,
  }));

  return [...fromIps, ...fromLevels, ...fromServices, ...fromHealth].sort((a, b) => b.value - a.value);
}
