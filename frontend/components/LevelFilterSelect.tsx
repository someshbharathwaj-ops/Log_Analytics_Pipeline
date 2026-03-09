"use client";

import { LEVEL_OPTIONS } from "@/lib/format";
import type { LevelFilter } from "@/lib/types";

type LevelFilterSelectProps = {
  value: LevelFilter;
  onChange: (value: LevelFilter) => void;
};

export function LevelFilterSelect({ value, onChange }: LevelFilterSelectProps) {
  return (
    <label className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-muted">
      <span>Level</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as LevelFilter)}
        className="bg-transparent text-text outline-none"
      >
        {LEVEL_OPTIONS.map((option) => (
          <option key={option || "ALL"} value={option} className="bg-panel text-text">
            {option || "ALL"}
          </option>
        ))}
      </select>
    </label>
  );
}