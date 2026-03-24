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
import { HealthBadge } from "@/components/HealthBadge";
import { LevelFilterSelect } from "@/components/LevelFilterSelect";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { LogTable } from "@/components/LogTable";
import { ServiceFilterSelect } from "@/components/ServiceFilterSelect";
import { StatsCard } from "@/components/StatsCard";
import { useAnalytics } from "@/hooks/use-analytics";
import { formatDateLabel, formatPercent, formatSourceLabel } from "@/lib/format";
import { buildLogRows } from "@/lib/selectors";

const PIE_COLORS = ["#29d3ae", "#5ba8ff", "#ffaf64", "#ff6f91", "#b7c4e4"];

export default function DashboardPage() {
  const { data, loading, level, setLevel, service, setService } = useAnalytics();

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
  const serviceShareData = Object.entries(data.service_error_share)
    .sort(([, a], [, b]) => b - a)
    .map(([name, share]) => ({ name, share }));
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
            {formatDateLabel(data.generated_at)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <LevelFilterSelect value={level} onChange={setLevel} />
          <ServiceFilterSelect services={data.service_volume} value={service} onChange={setService} />
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Total Records" value={data.total_records} />
        <StatsCard label="Total Errors" value={data.total_errors} tone="danger" />
        <StatsCard label="Unique IPs" value={data.unique_ip_count} />
        <StatsCard label="Error Rate" value={Number(errorRate.toFixed(1))} suffix="%" tone="danger" />
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
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Failing Services</p>
              <p className="mt-2 text-xl font-semibold">{data.top_failing_services.length}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Clean Records</p>
              <p className="mt-2 text-xl font-semibold">{formatPercent(data.clean_record_ratio)}</p>
            </div>
          </div>
        </div>

        <ChartWidget title="Error Counts by IP" subtitle="Error volume concentration" action={null}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ipData}>
                <XAxis dataKey="name" stroke="#9ca8c3" />
                <YAxis stroke="#9ca8c3" />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#5ba8ff" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartWidget>

        <ChartWidget title="Log Level Distribution" subtitle="Signal quality by severity">
          <div className="h-72">
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
          </div>
        </ChartWidget>
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <ChartWidget title="Error Trends Over Time" subtitle="Hourly buckets from pipeline output">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <XAxis dataKey="bucket" stroke="#9ca8c3" />
                  <YAxis stroke="#9ca8c3" />
                  <Tooltip />
                  <Line type="monotone" dataKey="errors" stroke="#29d3ae" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartWidget>
        </div>

        <ChartWidget title="Service Error Share" subtitle="How error load is distributed across failing services">
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
      </section>

      <LogTable rows={buildLogRows(data)} />
    </AnimatedContainer>
  );
}
