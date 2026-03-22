"""Pydantic schemas for analytics API responses."""

from __future__ import annotations

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(..., examples=["ok"])


class AnalyticsResponse(BaseModel):
    error_counts_per_ip: dict[str, int]
    log_level_distribution: dict[str, int]
    top_failing_services: list[tuple[str, int]]
    service_error_share: dict[str, float]
    error_timeline: dict[str, int]
    total_errors: int
    total_records: int
    skipped_records: int
    source: str
    applied_level: str | None
    dominant_level: str | None
    peak_error_window: str | None
    noisiest_ip: str | None
    health_status: str
    generated_at: str
