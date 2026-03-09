"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AnimatedContainer } from "@/components/AnimatedContainer";
import { ChartWidget } from "@/components/ChartWidget";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { LogTable } from "@/components/LogTable";
import { useAnalytics } from "@/hooks/use-analytics";

export default function IpActivityPage() {
  const { data, loading } = useAnalytics();

  if (loading || !data) {
    return <LoadingSkeleton className="h-[420px]" />;
  }

  const ipData = Object.entries(data.error_counts_per_ip)
    .sort(([, a], [, b]) => b - a)
    .map(([ip, errors]) => ({ ip, errors }));

  return (
    <AnimatedContainer className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">IP Activity</h2>
        <p className="text-sm text-muted">Traffic behavior and high-error source addresses.</p>
      </div>

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

      <LogTable
        rows={ipData.map((row) => ({
          key: `ip-${row.ip}`,
          category: "IP",
          label: row.ip,
          value: row.errors,
        }))}
      />
    </AnimatedContainer>
  );
}