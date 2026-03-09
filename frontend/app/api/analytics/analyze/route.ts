import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  const level = request.nextUrl.searchParams.get("level");
  const formData = await request.formData();
  const url = new URL("/api/analytics/analyze", BACKEND_URL);

  if (level) {
    url.searchParams.set("level", level);
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { "Content-Type": response.headers.get("Content-Type") ?? "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Backend not reachable.";
    return NextResponse.json({ detail: message }, { status: 502 });
  }
}