"use client";

import { Search } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

import { useDashboardPreferences } from "@/hooks/use-dashboard-preferences";

type LogRow = {
  key: string;
  category: string;
  label: string;
  value: number;
};

export function LogTable({ rows }: { rows: LogRow[] }) {
  const [query, setQuery] = useState("");
  const [sortDescending, setSortDescending] = useState(true);
  const { density } = useDashboardPreferences();
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const normalized = deferredQuery.toLowerCase().trim();
    const matchingRows = !normalized
      ? rows
      : rows.filter((row) => `${row.category} ${row.label}`.toLowerCase().includes(normalized));

    return [...matchingRows].sort((left, right) => {
      const delta = left.value - right.value;
      return sortDescending ? -delta : delta;
    });
  }, [rows, deferredQuery, sortDescending]);

  const rowPadding = density === "compact" ? "py-1.5" : "py-2.5";

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
        <div className="flex min-w-60 flex-1 items-center gap-3">
          <Search className="h-4 w-4 text-muted" />
          <input
            className="w-full bg-transparent text-sm text-text outline-none placeholder:text-muted"
            placeholder="Search by category or label"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <button
          type="button"
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-muted transition hover:text-text"
          onClick={() => setSortDescending((current) => !current)}
        >
          Sort {sortDescending ? "Highest first" : "Lowest first"}
        </button>
        <span className="text-xs text-muted">{filtered.length} rows</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-muted">
            <tr>
              <th className="pb-2">Category</th>
              <th className="pb-2">Label</th>
              <th className="pb-2 text-right">Count</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.key} className="border-t border-white/5">
                <td className={`${rowPadding} text-muted`}>{row.category}</td>
                <td className={`${rowPadding} text-text`}>{row.label}</td>
                <td className={`${rowPadding} text-right text-text`}>{row.value}</td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td className="py-6 text-center text-muted" colSpan={3}>
                  No records match this search.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
