from __future__ import annotations

from backend.pipeline.analytics import (
    count_errors_per_ip,
    error_timeline_by_hour,
    log_level_distribution,
    recursive_total,
    top_failing_services,
)


SAMPLE_RECORDS = [
    {
        "timestamp": "2026-03-01T10:00:00Z",
        "level": "ERROR",
        "service": "auth",
        "ip": "10.0.0.1",
        "message": "Invalid token",
    },
    {
        "timestamp": "2026-03-01T10:15:00Z",
        "level": "ERROR",
        "service": "auth",
        "ip": "10.0.0.1",
        "message": "Login failed",
    },
    {
        "timestamp": "2026-03-01T11:00:00Z",
        "level": "WARN",
        "service": "billing",
        "ip": "10.0.0.2",
        "message": "Timeout warning",
    },
]


def test_count_errors_per_ip() -> None:
    assert count_errors_per_ip(SAMPLE_RECORDS) == {"10.0.0.1": 2}


def test_log_level_distribution() -> None:
    assert log_level_distribution(SAMPLE_RECORDS) == {"ERROR": 2, "WARN": 1}


def test_top_failing_services() -> None:
    assert top_failing_services(SAMPLE_RECORDS, top_n=1) == [("auth", 2)]


def test_error_timeline_by_hour() -> None:
    timeline = error_timeline_by_hour(SAMPLE_RECORDS)
    assert timeline["2026-03-01T10:00"] == 2


def test_recursive_total() -> None:
    assert recursive_total([2, 3, 5]) == 10

