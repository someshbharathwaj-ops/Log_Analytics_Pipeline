"use client";

import { ResponsiveContainer, Tooltip, Treemap } from "recharts";

import { AnimatedContainer } from "@/components/AnimatedContainer";
import { ChartWidget } from "@/components/ChartWidget";
import { HealthBadge } from "@/components/HealthBadge";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { useAnalytics } from "@/hooks/use-analytics";
import { formatPercent } from "@/lib/format";

export default function ErrorInsightsPage() {
  const { data, loading } = useAnalytics();

  if (loading || !data) {
    return <LoadingSkeleton className="h-[420px]" />;
  }

  const serviceData = data.top_failing_services.map(([name, size]) => ({ name, size }));
  const serviceVolumeRows = Object.entries(data.service_volume).sort(([, left], [, right]) => right - left);
  const errorRate = data.total_records > 0 ? ((data.total_errors / data.total_records) * 100).toFixed(2) : "0.00";
  const diagnosis =
    data.health_status === "critical"
      ? "Failure volume is dominating this dataset. Prioritize containment and isolate the top failing service."
      : data.health_status === "degraded"
        ? "Error pressure is elevated. Investigate the peak window and verify mitigation on the noisiest systems."
        : data.health_status === "monitor"
          ? "The system is mostly healthy, but there is enough noise to justify trend monitoring."
          : "Current data shows a stable operating posture.";

  return (
    <AnimatedContainer className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Error Insights</h2>
        <p className="text-sm text-muted">Failure concentration, severity ratio, and high-risk services.</p>
        <div className="mt-2">
          <HealthBadge status={data.health_status} />
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="glass rounded-2xl p-5">
          <p className="text-sm text-muted">Error Rate</p>
          <p className="mt-2 text-4xl font-semibold text-danger">{errorRate}%</p>
        </article>
        <article className="glass rounded-2xl p-5">
          <p className="text-sm text-muted">Total Errors</p>
          <p className="mt-2 text-4xl font-semibold text-text">{data.total_errors}</p>
        </article>
        <article className="glass rounded-2xl p-5">
          <p className="text-sm text-muted">Impacted Services</p>
          <p className="mt-2 text-4xl font-semibold text-text">{data.impacted_service_count}</p>
        </article>
      </section>

      <ChartWidget title="Top Failing Services" subtitle="Treemap by error count">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap data={serviceData} dataKey="size" stroke="#0f172a" fill="#ff6f91" />
          </ResponsiveContainer>
        </div>
      </ChartWidget>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h3 className="mb-3 text-lg font-semibold">Service Breakdown</h3>
          <ul className="space-y-3 text-sm">
            {data.top_failing_services.map(([service, count]) => (
              <li key={service}>
                <div className="mb-1 flex items-center justify-between rounded-lg px-1">
                  <span className="text-muted">{service}</span>
                  <span className="font-semibold text-text">
                    {count} | {formatPercent(data.service_error_share[service] ?? 0)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/5">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-danger to-accent2"
                    style={{ width: `${data.service_error_share[service] ?? 0}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <article className="glass rounded-2xl p-5">
          <h3 className="text-lg font-semibold">Operational Diagnosis</h3>
          <p className="mt-3 text-sm leading-6 text-muted">{diagnosis}</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
              <dt className="text-muted">Peak Error Window</dt>
              <dd className="font-medium text-text">{data.peak_error_window ?? "None"}</dd>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
              <dt className="text-muted">Noisiest IP</dt>
              <dd className="font-medium text-text">{data.noisiest_ip ?? "None"}</dd>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
              <dt className="text-muted">Dominant Level</dt>
              <dd className="font-medium text-text">{data.dominant_level ?? "None"}</dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="glass rounded-2xl p-5">
          <h3 className="text-lg font-semibold">Frequent Error Messages</h3>
          <ul className="mt-3 space-y-3 text-sm">
            {data.top_error_messages.map(([message, count]) => (
              <li key={message} className="rounded-lg border border-white/10 px-3 py-2">
                <p className="font-medium text-text">{message}</p>
                <p className="mt-1 text-muted">{count} occurrences</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="glass rounded-2xl p-5">
          <h3 className="text-lg font-semibold">Service Activity</h3>
          <ul className="mt-3 space-y-3 text-sm">
            {serviceVolumeRows.map(([service, count]) => (
              <li key={service} className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
                <span className="text-muted">{service}</span>
                <span className="font-medium text-text">{count} records</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </AnimatedContainer>
  );
}
