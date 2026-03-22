"use client";

import { formatHealthStatus } from "@/lib/format";
import type { HealthStatus } from "@/lib/types";

const HEALTH_STYLES: Record<HealthStatus, string> = {
  "no-data": "border-white/10 bg-white/5 text-muted",
  stable: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  monitor: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  degraded: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  critical: "border-rose-400/30 bg-rose-400/10 text-rose-200",
};

export function HealthBadge({ status }: { status: HealthStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${HEALTH_STYLES[status]}`}>
      {formatHealthStatus(status)}
    </span>
  );
}
