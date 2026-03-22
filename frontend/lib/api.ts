import type { AnalyticsResponse, LevelFilter } from "@/lib/types";

const API_BASE = "/api/analytics";

async function parseResponse(response: Response): Promise<AnalyticsResponse> {
  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const payload = (await response.json()) as { detail?: string };
      throw new Error(payload.detail || "Request failed.");
    }

    const details = await response.text();
    throw new Error(details || "Request failed.");
  }
  return (await response.json()) as AnalyticsResponse;
}

export async function fetchSampleAnalytics(level: LevelFilter): Promise<AnalyticsResponse> {
  const params = new URLSearchParams();
  if (level) {
    params.set("level", level);
  }
  const query = params.toString();
  const response = await fetch(`${API_BASE}/sample${query ? `?${query}` : ""}`, {
    cache: "no-store",
  });

  return parseResponse(response);
}

export async function uploadAnalytics(file: File, level: LevelFilter): Promise<AnalyticsResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const params = new URLSearchParams();
  if (level) {
    params.set("level", level);
  }

  const query = params.toString();
  const response = await fetch(`${API_BASE}/analyze${query ? `?${query}` : ""}`, {
    method: "POST",
    body: formData,
  });

  return parseResponse(response);
}

export function toChartEntries(source: Record<string, number>): Array<{ name: string; value: number }> {
  return Object.entries(source).map(([name, value]) => ({ name, value }));
}
