"""Pure analytics transformations for log records."""

from __future__ import annotations

from collections.abc import Iterable
from functools import reduce

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


def top_failing_services(records: Iterable[LogRecord], top_n: int = 5) -> list[tuple[str, int]]:
    """Return top failing services sorted by error count descending."""
    error_counts = reduce(
        lambda acc, record: _increment_counter(acc, record.get("service", "unknown")),
        filter(has_level("ERROR"), records),
        {},
    )
    return sorted(error_counts.items(), key=lambda pair: pair[1], reverse=True)[:top_n]


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
