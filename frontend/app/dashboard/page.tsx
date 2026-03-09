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
import { LevelFilterSelect } from "@/components/LevelFilterSelect";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { LogTable } from "@/components/LogTable";
import { StatsCard } from "@/components/StatsCard";
import { useAnalytics } from "@/hooks/use-analytics";
import { buildLogRows } from "@/lib/selectors";

const PIE_COLORS = ["#29d3ae", "#5ba8ff", "#ffaf64", "#ff6f91", "#b7c4e4"];

export default function DashboardPage() {
  const { data, loading, level, setLevel } = useAnalytics();

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

  return (
    <AnimatedContainer className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">Real-time operational snapshot and trend overview.</p>
        <LevelFilterSelect value={level} onChange={setLevel} />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Total Records" value={data.total_records} />
        <StatsCard label="Total Errors" value={data.total_errors} tone="danger" />
        <StatsCard label="Unique IPs" value={Object.keys(data.error_counts_per_ip).length} />
        <StatsCard label="Failing Services" value={data.top_failing_services.length} />
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
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
      </section>

      <LogTable rows={buildLogRows(data)} />
    </AnimatedContainer>
  );
}