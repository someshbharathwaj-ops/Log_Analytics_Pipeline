"use client";

import { Bell, RefreshCw } from "lucide-react";

import { HealthBadge } from "@/components/HealthBadge";
import { useDashboardPreferences } from "@/hooks/use-dashboard-preferences";
import { useAnalytics } from "@/hooks/use-analytics";
import { formatDateLabel } from "@/lib/format";

export function Navbar() {
  const { refresh, loading, lastUpdated, data, service, level } = useAnalytics();
  const { autoRefresh } = useDashboardPreferences();

  return (
    <header className="glass sticky top-3 z-20 flex items-center justify-between rounded-2xl px-4 py-3">
      <div>
        <p className="text-sm text-muted">Log Analytics Pipeline</p>
        <h1 className="text-lg font-semibold">Operational Intelligence</h1>
        <p className="text-xs text-muted">
          Scope: {level || "ALL"} | {service || "all services"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {data ? <HealthBadge status={data.health_status} /> : null}
        <span className="hidden text-xs text-muted lg:inline">
          Updated {formatDateLabel(lastUpdated)}{autoRefresh ? " | Auto refresh on" : ""}
        </span>
        <button
          onClick={() => void refresh()}
          className="rounded-lg border border-white/15 bg-white/5 p-2 text-muted transition hover:text-text"
          aria-label="Refresh analytics"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
        <button
          className="rounded-lg border border-white/15 bg-white/5 p-2 text-muted transition hover:text-text"
          aria-label="Alerts"
        >
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
