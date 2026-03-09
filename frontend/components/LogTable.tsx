"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

type LogRow = {
  key: string;
  category: string;
  label: string;
  value: number;
};

export function LogTable({ rows }: { rows: LogRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) {
      return rows;
    }
    return rows.filter((row) =>
      `${row.category} ${row.label}`.toLowerCase().includes(normalized),
    );
  }, [rows, query]);

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
        <Search className="h-4 w-4 text-muted" />
        <input
          className="w-full bg-transparent text-sm text-text outline-none placeholder:text-muted"
          placeholder="Search by category or label"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
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
                <td className="py-2 text-muted">{row.category}</td>
                <td className="py-2 text-text">{row.label}</td>
                <td className="py-2 text-right text-text">{row.value}</td>
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