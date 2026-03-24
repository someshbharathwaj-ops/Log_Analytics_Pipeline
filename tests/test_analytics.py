from __future__ import annotations

from backend.pipeline.analytics import (
    classify_health_status,
    count_errors_per_ip_and_total,
    count_errors_per_ip,
    dominant_level,
    error_timeline_by_hour,
    log_level_distribution,
    peak_error_window,
    recursive_total,
    service_volume,
    service_error_share,
    top_error_messages,
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


def test_count_errors_per_ip_and_total() -> None:
    counts, total = count_errors_per_ip_and_total(SAMPLE_RECORDS)
    assert counts == {"10.0.0.1": 2}
    assert total == 2


def test_log_level_distribution() -> None:
    assert log_level_distribution(SAMPLE_RECORDS) == {"ERROR": 2, "WARN": 1}


def test_top_failing_services() -> None:
    assert top_failing_services(SAMPLE_RECORDS, top_n=1) == [("auth", 2)]


def test_service_volume() -> None:
    assert service_volume(SAMPLE_RECORDS) == {"auth": 2, "billing": 1}


def test_top_error_messages() -> None:
    assert top_error_messages(SAMPLE_RECORDS, top_n=1) == [("Login failed", 1)]


def test_error_timeline_by_hour() -> None:
    timeline = error_timeline_by_hour(SAMPLE_RECORDS)
    assert timeline["2026-03-01T10:00"] == 2


def test_recursive_total() -> None:
    assert recursive_total([2, 3, 5]) == 10


def test_service_error_share() -> None:
    assert service_error_share(SAMPLE_RECORDS) == {"auth": 100.0}


def test_dominant_level() -> None:
    assert dominant_level(SAMPLE_RECORDS) == "ERROR"


def test_peak_error_window() -> None:
    assert peak_error_window(SAMPLE_RECORDS) == "2026-03-01T10:00"


def test_classify_health_status() -> None:
    assert classify_health_status(0, 0) == "no-data"
    assert classify_health_status(0, 5) == "stable"
    assert classify_health_status(1, 10) == "monitor"
    assert classify_health_status(3, 10) == "degraded"
    assert classify_health_status(6, 10) == "critical"
