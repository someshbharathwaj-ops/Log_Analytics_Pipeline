"""Pydantic schemas for analytics API responses."""

from __future__ import annotations

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(..., examples=["ok"])


class AnalyticsResponse(BaseModel):
    error_counts_per_ip: dict[str, int]
    log_level_distribution: dict[str, int]
    top_failing_services: list[tuple[str, int]]
    error_timeline: dict[str, int]
    total_errors: int
    total_records: int
