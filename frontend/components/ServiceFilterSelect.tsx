"use client";

import { buildServiceOptions } from "@/lib/format";
import type { ServiceFilter } from "@/lib/types";

type ServiceFilterSelectProps = {
  services: Record<string, number>;
  value: ServiceFilter;
  onChange: (value: ServiceFilter) => void;
};

export function ServiceFilterSelect({ services, value, onChange }: ServiceFilterSelectProps) {
  const options = buildServiceOptions(services);

  return (
    <label className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-muted">
      <span>Service</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="max-w-40 bg-transparent text-text outline-none"
      >
        {options.map((option) => (
          <option key={option || "ALL"} value={option} className="bg-panel text-text">
            {option || "ALL"}
          </option>
        ))}
      </select>
    </label>
  );
}
