"use client";

import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AnimatedContainer } from "@/components/AnimatedContainer";
import { ChartWidget } from "@/components/ChartWidget";
import { EmptyStatePanel } from "@/components/EmptyStatePanel";
import { HealthBadge } from "@/components/HealthBadge";
import { LevelFilterSelect } from "@/components/LevelFilterSelect";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { LogTable } from "@/components/LogTable";
import { ServiceFilterSelect } from "@/components/ServiceFilterSelect";
import { StatsCard } from "@/components/StatsCard";
import { useAnalytics } from "@/hooks/use-analytics";
import { formatDateLabel, formatHours, formatPercent, formatSourceLabel } from "@/lib/format";
import { buildLogRows } from "@/lib/selectors";

const PIE_COLORS = ["#29d3ae", "#5ba8ff", "#ffaf64", "#ff6f91", "#b7c4e4"];

export default function DashboardPage() {
  const { data, loading, refreshing, lastUpdated, level, setLevel, service, setService, refresh } = useAnalytics();

  if (loading || !data) {
    return (
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <LoadingSkeleton className="h-28" />
        <LoadingSkeleton className="h-28" />
        <LoadingSkeleton className="h-28" />
        <LoadingSkeleton className="h-28" />
        <LoadingSkeleton className="h-72 md:col-span-2" />
        <LoadingSkeleton className="h-72 md:col-span-2" />
      </section>
    );
  }

  const ipData = Object.entries(data.error_counts_per_ip).map(([name, value]) => ({ name, value }));
  const levelData = Object.entries(data.log_level_distribution).map(([name, value]) => ({ name, value }));
  const timelineData = Object.entries(data.error_timeline)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([bucket, errors]) => ({ bucket, errors }));
  const recordTimelineData = Object.entries(data.record_timeline)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([bucket, records]) => ({
      bucket,
      records,
      errors: data.error_timeline[bucket] ?? 0,
    }));
  const serviceShareData = Object.entries(data.service_error_share)
    .sort(([, a], [, b]) => b - a)
    .map(([name, share]) => ({ name, share }));
  const serviceHealthData = Object.entries(data.service_health);
  const errorRate = data.total_records > 0 ? (data.total_errors / data.total_records) * 100 : 0;

  return (
    <AnimatedContainer className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted">Real-time operational snapshot and trend overview.</p>
            <HealthBadge status={data.health_status} />
          </div>
          <p className="mt-2 text-xs text-muted">
            Source {formatSourceLabel(data.source)} | Peak window {data.peak_error_window ?? "No error bursts"} | Refreshed{" "}
            {formatDateLabel(lastUpdated ?? data.generated_at)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <LevelFilterSelect value={level} onChange={setLevel} />
          <ServiceFilterSelect services={data.service_volume} value={service} onChange={setService} />
          <button
            type="button"
            onClick={() => void refresh()}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-text transition hover:bg-white/10"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Total Records" value={data.total_records} />
        <StatsCard label="Total Errors" value={data.total_errors} tone="danger" />
        <StatsCard label="Unique IPs" value={data.unique_ip_count} />
        <StatsCard label="Error Rate" value={Number(errorRate.toFixed(1))} suffix="%" tone="danger" />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Observation Window"
          value={data.observation_window_hours}
          displayValue={formatHours(data.observation_window_hours)}
        />
        <StatsCard label="Skipped Records" value={data.skipped_records} />
        <StatsCard label="Quiet Services" value={data.error_free_service_count} />
        <StatsCard label="Failing Services" value={data.top_failing_services.length} />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="glass rounded-2xl p-5">
          <p className="text-sm text-muted">Operational Summary</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Dominant Level</p>
              <p className="mt-2 text-xl font-semibold">{data.dominant_level ?? "No signal"}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Noisiest IP</p>
              <p className="mt-2 text-xl font-semibold">{data.noisiest_ip ?? "None"}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Busiest Service</p>
              <p className="mt-2 text-xl font-semibold">{data.busiest_service ?? "No traffic"}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Clean Records</p>
              <p className="mt-2 text-xl font-semibold">{formatPercent(data.clean_record_ratio)}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">First Seen</p>
              <p className="mt-2 text-sm font-semibold">{formatDateLabel(data.first_seen_at)}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Last Seen</p>
              <p className="mt-2 text-sm font-semibold">{formatDateLabel(data.last_seen_at)}</p>
            </div>
          </div>
        </div>

        <ChartWidget title="Error Counts by IP" subtitle="Error volume concentration" action={null}>
          <div className="h-72">
            {ipData.length === 0 ? (
              <EmptyStatePanel
                title="No IP hotspots in this slice"
                description="Adjust the level or service filters to inspect another portion of the dataset."
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ipData}>
                  <XAxis dataKey="name" stroke="#9ca8c3" />
                  <YAxis stroke="#9ca8c3" />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#5ba8ff" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartWidget>

        <ChartWidget title="Log Level Distribution" subtitle="Signal quality by severity">
          <div className="h-72">
            {levelData.length === 0 ? (
              <EmptyStatePanel
                title="No levels available"
                description="This filter combination returned no records, so there is nothing to chart yet."
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={levelData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                    {levelData.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartWidget>
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <ChartWidget title="Traffic vs Errors" subtitle="Hourly traffic volume compared with error bursts">
            <div className="h-80">
              {recordTimelineData.length === 0 ? (
                <EmptyStatePanel
                  title="No timeline available"
                  description="Load a dataset with timestamped records to unlock timeline comparisons."
                />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={recordTimelineData}>
                    <XAxis dataKey="bucket" stroke="#9ca8c3" />
                    <YAxis stroke="#9ca8c3" />
                    <Tooltip />
                    <Line type="monotone" dataKey="records" stroke="#5ba8ff" strokeWidth={2.2} dot={false} />
                    <Line type="monotone" dataKey="errors" stroke="#29d3ae" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartWidget>
        </div>

        <ChartWidget title="Service Error Share" subtitle="How error load is distributed across failing services">
          {serviceShareData.length === 0 ? (
            <EmptyStatePanel
              title="No failing services"
              description="The current slice has no error-bearing services, so share analysis is empty."
            />
          ) : (
            <div className="space-y-3">
              {serviceShareData.map((serviceEntry) => (
                <div key={serviceEntry.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-muted">{serviceEntry.name}</span>
                    <span className="font-medium text-text">{formatPercent(serviceEntry.share)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-accent to-accent2"
                      style={{ width: `${serviceEntry.share}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartWidget>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="glass rounded-2xl p-5 lg:col-span-2">
          <p className="text-sm text-muted">Active Filter Scope</p>
          <p className="mt-2 text-lg font-semibold text-text">
            {data.applied_level ?? "ALL"} severity on {data.applied_service ?? "all services"}
          </p>
          <p className="mt-2 text-sm text-muted">
            {data.impacted_service_count} services and {data.unique_ip_count} IPs are represented in the current slice.
          </p>
        </article>
        <article className="glass rounded-2xl p-5">
          <p className="text-sm text-muted">Top Message</p>
          <p className="mt-2 text-lg font-semibold text-text">{data.top_error_messages[0]?.[0] ?? "No recurring error"}</p>
          <p className="mt-2 text-sm text-muted">{data.top_error_messages[0]?.[1] ?? 0} repeated errors</p>
        </article>
        <article className="glass rounded-2xl p-5">
          <p className="text-sm text-muted">Observation Span</p>
          <p className="mt-2 text-lg font-semibold text-text">{formatHours(data.observation_window_hours)}</p>
          <p className="mt-2 text-sm text-muted">
            {data.first_seen_at ? formatDateLabel(data.first_seen_at) : "No starting point"} to{" "}
            {data.last_seen_at ? formatDateLabel(data.last_seen_at) : "No ending point"}
          </p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ChartWidget title="Service Health" subtitle="Per-service health based on the local error rate">
          {serviceHealthData.length === 0 ? (
            <EmptyStatePanel
              title="No service health to report"
              description="Service health appears after records have been grouped by service."
            />
          ) : (
            <div className="space-y-3">
              {serviceHealthData.map(([serviceName, health]) => (
                <div
                  key={serviceName}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-text">{serviceName}</p>
                    <p className="text-sm text-muted">{data.service_volume[serviceName] ?? 0} total records</p>
                  </div>
                  <HealthBadge status={health} />
                </div>
              ))}
            </div>
          )}
        </ChartWidget>

        <ChartWidget title="Error Trend Focus" subtitle="Pure error-only view for quick escalation checks">
          <div className="h-[22rem]">
            {timelineData.length === 0 ? (
              <EmptyStatePanel
                title="No error bursts detected"
                description="The selected slice has no error timeline, which usually means it is stable or empty."
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <XAxis dataKey="bucket" stroke="#9ca8c3" />
                  <YAxis stroke="#9ca8c3" />
                  <Tooltip />
                  <Line type="monotone" dataKey="errors" stroke="#ff6f91" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartWidget>
      </section>

      <LogTable rows={buildLogRows(data)} />
    </AnimatedContainer>
  );
}
