"""Pure analytics transformations for log records."""

from __future__ import annotations

from collections.abc import Iterable
from functools import reduce
from math import isclose

from backend.pipeline.filters import has_level

LogRecord = dict[str, str]


def _increment_counter(counter: dict[str, int], key: str) -> dict[str, int]:
    """Return a new counter dictionary with an incremented key."""
    return {**counter, key: counter.get(key, 0) + 1}


def count_errors_per_ip(records: Iterable[LogRecord]) -> dict[str, int]:
    """Aggregate error count by IP using functional reduce."""
    errors = filter(has_level("ERROR"), records)
    return reduce(
        lambda acc, record: _increment_counter(acc, record.get("ip", "unknown")),
        errors,
        {},
    )


def count_errors_per_ip_and_total(records: Iterable[LogRecord]) -> tuple[dict[str, int], int]:
    """Aggregate error count by IP and total error count in one pass."""

    def reducer(
        acc: tuple[dict[str, int], int], record: LogRecord
    ) -> tuple[dict[str, int], int]:
        counter, total = acc
        ip = record.get("ip", "unknown")
        return (_increment_counter(counter, ip), total + 1)

    return reduce(reducer, filter(has_level("ERROR"), records), ({}, 0))


def log_level_distribution(records: Iterable[LogRecord]) -> dict[str, int]:
    """Aggregate all records by level."""
    return reduce(
        lambda acc, record: _increment_counter(acc, record.get("level", "UNKNOWN")),
        records,
        {},
    )


def service_volume(records: Iterable[LogRecord]) -> dict[str, int]:
    """Aggregate all records by service."""
    return reduce(
        lambda acc, record: _increment_counter(acc, record.get("service", "unknown")),
        records,
        {},
    )


def top_failing_services(records: Iterable[LogRecord], top_n: int = 5) -> list[tuple[str, int]]:
    """Return top failing services sorted by error count descending."""
    error_counts = reduce(
        lambda acc, record: _increment_counter(acc, record.get("service", "unknown")),
        filter(has_level("ERROR"), records),
        {},
    )
    return sorted(error_counts.items(), key=lambda pair: pair[1], reverse=True)[:top_n]


def top_error_messages(records: Iterable[LogRecord], top_n: int = 5) -> list[tuple[str, int]]:
    """Return the most frequent error messages."""
    error_counts = reduce(
        lambda acc, record: _increment_counter(acc, record.get("message", "unknown")),
        filter(has_level("ERROR"), records),
        {},
    )
    return sorted(error_counts.items(), key=lambda pair: (pair[1], pair[0]), reverse=True)[:top_n]


def error_timeline_by_hour(records: Iterable[LogRecord]) -> dict[str, int]:
    """Build a timeline grouped by hour (YYYY-MM-DD HH:00)."""
    def hour_bucket(timestamp: str) -> str:
        return f"{timestamp[:13]}:00"

    errors = filter(has_level("ERROR"), records)
    return reduce(
        lambda acc, record: _increment_counter(
            acc,
            hour_bucket(record.get("timestamp", "unknown")),
        ),
        errors,
        {},
    )


def recursive_total(counts: list[int]) -> int:
    """Recursively sum integer values to demonstrate recursion."""
    if not counts:
        return 0
    return counts[0] + recursive_total(counts[1:])


def service_error_share(records: Iterable[LogRecord]) -> dict[str, float]:
    """Return percentage share of errors contributed by each failing service."""
    error_counts = dict(top_failing_services(records, top_n=1000))
    total_errors = recursive_total(list(error_counts.values()))
    if total_errors == 0:
        return {}

    return {
        service: round((count / total_errors) * 100, 2)
        for service, count in error_counts.items()
    }


def dominant_level(records: Iterable[LogRecord]) -> str | None:
    """Return the most frequent log level in the provided records."""
    distribution = log_level_distribution(records)
    if not distribution:
        return None
    return max(distribution.items(), key=lambda item: (item[1], item[0]))[0]


def peak_error_window(records: Iterable[LogRecord]) -> str | None:
    """Return the hour bucket with the highest error volume."""
    timeline = error_timeline_by_hour(records)
    if not timeline:
        return None
    return max(timeline.items(), key=lambda item: (item[1], item[0]))[0]


def classify_health_status(total_errors: int, total_records: int) -> str:
    """Classify operational health using the observed error rate."""
    if total_records <= 0:
        return "no-data"

    error_rate = total_errors / total_records
    if isclose(error_rate, 0.0):
        return "stable"
    if error_rate < 0.2:
        return "monitor"
    if error_rate < 0.4:
        return "degraded"
    return "critical"
