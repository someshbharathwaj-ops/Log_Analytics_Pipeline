"""Pydantic schemas for analytics API responses."""

from __future__ import annotations

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(..., examples=["ok"])


class AnalyticsResponse(BaseModel):
    error_counts_per_ip: dict[str, int]
    log_level_distribution: dict[str, int]
    service_volume: dict[str, int]
    service_health: dict[str, str]
    top_failing_services: list[tuple[str, int]]
    top_error_messages: list[tuple[str, int]]
    service_error_share: dict[str, float]
    error_timeline: dict[str, int]
    record_timeline: dict[str, int]
    total_errors: int
    total_records: int
    skipped_records: int
    clean_record_ratio: float
    unique_ip_count: int
    impacted_service_count: int
    error_free_service_count: int
    source: str
    applied_level: str | None
    applied_service: str | None
    dominant_level: str | None
    peak_error_window: str | None
    noisiest_ip: str | None
    busiest_service: str | None
    first_seen_at: str | None
    last_seen_at: str | None
    observation_window_hours: float
    health_status: str
    generated_at: str
