export const LEVEL_OPTIONS = ["", "ERROR", "WARN", "INFO", "DEBUG"] as const;

export function buildServiceOptions(services: Record<string, number>): string[] {
  return ["", ...Object.keys(services).sort((left, right) => left.localeCompare(right))];
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDateLabel(value: string | null): string {
  if (!value) {
    return "Never";
  }
  return new Date(value).toLocaleString();
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatHealthStatus(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatSourceLabel(value: string): string {
  if (value === "upload") {
    return "Uploaded file";
  }

  const segments = value.replace(/\\/g, "/").split("/");
  return segments.slice(-2).join("/");
}

export function humanizeLabel(label: string): string {
  return label
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
