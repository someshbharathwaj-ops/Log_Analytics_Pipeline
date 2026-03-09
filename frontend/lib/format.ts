export const LEVEL_OPTIONS = ["", "ERROR", "WARN", "INFO", "DEBUG"] as const;

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

export function humanizeLabel(label: string): string {
  return label
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}