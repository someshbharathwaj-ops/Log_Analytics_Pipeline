"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AnimatedContainer } from "@/components/AnimatedContainer";
import { ChartWidget } from "@/components/ChartWidget";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { LogTable } from "@/components/LogTable";
import { useAnalytics } from "@/hooks/use-analytics";
import { formatPercent } from "@/lib/format";

export default function IpActivityPage() {
  const { data, loading } = useAnalytics();

  if (loading || !data) {
    return <LoadingSkeleton className="h-[420px]" />;
  }

  const ipData = Object.entries(data.error_counts_per_ip)
    .sort(([, left], [, right]) => right - left)
    .map(([ip, errors]) => ({
      ip,
      errors,
      share: data.total_errors > 0 ? (errors / data.total_errors) * 100 : 0,
    }));

  return (
    <AnimatedContainer className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">IP Activity</h2>
        <p className="text-sm text-muted">Traffic behavior and high-error source addresses.</p>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="glass rounded-2xl p-5">
          <p className="text-sm text-muted">Unique Error IPs</p>
          <p className="mt-2 text-4xl font-semibold text-text">{data.unique_ip_count}</p>
        </article>
        <article className="glass rounded-2xl p-5">
          <p className="text-sm text-muted">Noisiest IP</p>
          <p className="mt-2 text-2xl font-semibold text-text">{data.noisiest_ip ?? "None"}</p>
        </article>
        <article className="glass rounded-2xl p-5">
          <p className="text-sm text-muted">Largest Error Share</p>
          <p className="mt-2 text-4xl font-semibold text-text">
            {formatPercent(ipData[0]?.share ?? 0)}
          </p>
        </article>
      </section>

      <ChartWidget title="Top IP Activity" subtitle="Horizontal bar distribution of error counts">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ipData} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" stroke="#9ca8c3" />
              <YAxis dataKey="ip" type="category" width={130} stroke="#9ca8c3" />
              <Tooltip />
              <Bar dataKey="errors" radius={[0, 8, 8, 0]} fill="#5ba8ff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartWidget>

      <section className="grid gap-4 lg:grid-cols-3">
        {ipData.slice(0, 3).map((row, index) => (
          <article key={row.ip} className="glass rounded-2xl p-5">
            <p className="text-sm text-muted">Rank #{index + 1}</p>
            <p className="mt-2 text-xl font-semibold">{row.ip}</p>
            <p className="mt-2 text-sm text-muted">
              {row.errors} errors | {formatPercent(row.share)} of observed errors
            </p>
          </article>
        ))}
      </section>

      <LogTable
        rows={ipData.map((row) => ({
          key: `ip-${row.ip}`,
          category: "IP",
          label: `${row.ip} (${formatPercent(row.share)})`,
          value: row.errors,
        }))}
      />
    </AnimatedContainer>
  );
}
