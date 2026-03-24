"use client";

import { AnimatedContainer } from "@/components/AnimatedContainer";
import { useAnalytics } from "@/hooks/use-analytics";
import { useDashboardPreferences } from "@/hooks/use-dashboard-preferences";
import { formatDateLabel, formatSourceLabel } from "@/lib/format";
import type { TableDensity } from "@/lib/types";

export default function SettingsPage() {
  const { autoRefresh, setAutoRefresh, density, setDensity } = useDashboardPreferences();
  const { data, lastUpdated, level, service } = useAnalytics();

  return (
    <AnimatedContainer className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="text-sm text-muted">Customize dashboard behavior and display preferences.</p>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="glass rounded-2xl p-5">
          <h3 className="text-lg font-semibold">Connection</h3>
          <p className="mt-1 text-sm text-muted">Backend API endpoint is read from `BACKEND_URL`.</p>
          <code className="mt-3 block rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs">
            BACKEND_URL=http://127.0.0.1:8000
          </code>
        </article>

        <article className="glass rounded-2xl p-5">
          <h3 className="text-lg font-semibold">Experience</h3>
          <label className="mt-3 flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-sm">
            <span className="text-muted">Auto refresh every minute</span>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(event) => setAutoRefresh(event.target.checked)}
            />
          </label>
          <label className="mt-3 block text-sm text-muted">
            Density
            <select
              value={density}
              onChange={(event) => setDensity(event.target.value as TableDensity)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-text outline-none"
            >
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </select>
          </label>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="glass rounded-2xl p-5">
          <p className="text-sm text-muted">Current Source</p>
          <p className="mt-2 text-lg font-semibold">{data ? formatSourceLabel(data.source) : "No dataset loaded"}</p>
        </article>
        <article className="glass rounded-2xl p-5">
          <p className="text-sm text-muted">Latest Refresh</p>
          <p className="mt-2 text-lg font-semibold">{formatDateLabel(lastUpdated)}</p>
        </article>
        <article className="glass rounded-2xl p-5">
          <p className="text-sm text-muted">Skipped Records</p>
          <p className="mt-2 text-lg font-semibold">{data?.skipped_records ?? 0}</p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="glass rounded-2xl p-5">
          <p className="text-sm text-muted">Active Level Filter</p>
          <p className="mt-2 text-lg font-semibold">{level || "ALL"}</p>
        </article>
        <article className="glass rounded-2xl p-5">
          <p className="text-sm text-muted">Active Service Filter</p>
          <p className="mt-2 text-lg font-semibold">{service || "All services"}</p>
        </article>
        <article className="glass rounded-2xl p-5">
          <p className="text-sm text-muted">Clean Record Ratio</p>
          <p className="mt-2 text-lg font-semibold">{data ? `${data.clean_record_ratio.toFixed(1)}%` : "0.0%"}</p>
        </article>
      </section>
    </AnimatedContainer>
  );
}
