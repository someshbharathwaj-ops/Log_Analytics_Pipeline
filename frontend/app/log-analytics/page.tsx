"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AnimatedContainer } from "@/components/AnimatedContainer";
import { ChartWidget } from "@/components/ChartWidget";
import { HealthBadge } from "@/components/HealthBadge";
import { LevelFilterSelect } from "@/components/LevelFilterSelect";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { UploadDropzone } from "@/components/UploadDropzone";
import { useAnalytics } from "@/hooks/use-analytics";
import { formatDateLabel, formatSourceLabel } from "@/lib/format";

export default function LogAnalyticsPage() {
  const { data, loading, level, setLevel, uploading } = useAnalytics();

  if (loading || !data) {
    return <LoadingSkeleton className="h-[420px]" />;
  }

  const timelineData = Object.entries(data.error_timeline)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([bucket, errors]) => ({ bucket, errors }));

  return (
    <AnimatedContainer className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Log Analytics</h2>
          <p className="text-sm text-muted">Upload logs or inspect sample data analytics.</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span>Source {formatSourceLabel(data.source)}</span>
            <span>•</span>
            <span>Generated {formatDateLabel(data.generated_at)}</span>
            <HealthBadge status={data.health_status} />
          </div>
        </div>
        <LevelFilterSelect value={level} onChange={setLevel} />
      </div>

      <section className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <UploadDropzone />
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Processed</p>
              <p className="mt-2 text-lg font-semibold">{data.total_records}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Skipped</p>
              <p className="mt-2 text-lg font-semibold">{data.skipped_records}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Filter</p>
              <p className="mt-2 text-lg font-semibold">{data.applied_level ?? "ALL"}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted">{uploading ? "Processing upload..." : "Sample analytics auto-refresh on level change."}</p>
        </div>
        <div className="lg:col-span-3">
          <ChartWidget title="Error Trend" subtitle="Time-series trajectory of error events">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#29d3ae" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#29d3ae" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="bucket" stroke="#9ca8c3" />
                  <YAxis stroke="#9ca8c3" />
                  <Tooltip />
                  <Area type="monotone" dataKey="errors" stroke="#29d3ae" fill="url(#errorGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartWidget>
        </div>
      </section>
    </AnimatedContainer>
  );
}
