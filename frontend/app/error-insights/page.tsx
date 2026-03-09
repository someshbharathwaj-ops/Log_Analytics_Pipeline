"use client";

import { ResponsiveContainer, Tooltip, Treemap } from "recharts";

import { AnimatedContainer } from "@/components/AnimatedContainer";
import { ChartWidget } from "@/components/ChartWidget";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { useAnalytics } from "@/hooks/use-analytics";

export default function ErrorInsightsPage() {
  const { data, loading } = useAnalytics();

  if (loading || !data) {
    return <LoadingSkeleton className="h-[420px]" />;
  }

  const serviceData = data.top_failing_services.map(([name, size]) => ({ name, size }));
  const errorRate = data.total_records > 0 ? ((data.total_errors / data.total_records) * 100).toFixed(2) : "0.00";

  return (
    <AnimatedContainer className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Error Insights</h2>
        <p className="text-sm text-muted">Failure concentration, severity ratio, and high-risk services.</p>
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
          <p className="mt-2 text-4xl font-semibold text-text">{data.top_failing_services.length}</p>
        </article>
      </section>

      <ChartWidget title="Top Failing Services" subtitle="Treemap by error count">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap data={serviceData} dataKey="size" stroke="#0f172a" fill="#ff6f91" />
          </ResponsiveContainer>
        </div>
      </ChartWidget>

      <div className="glass rounded-2xl p-5">
        <h3 className="mb-3 text-lg font-semibold">Service Breakdown</h3>
        <ul className="space-y-2 text-sm">
          {data.top_failing_services.map(([service, count]) => (
            <li key={service} className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
              <span className="text-muted">{service}</span>
              <span className="font-semibold text-text">{count}</span>
            </li>
          ))}
        </ul>
      </div>
    </AnimatedContainer>
  );
}