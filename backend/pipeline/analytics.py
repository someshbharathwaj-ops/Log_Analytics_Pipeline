"""Pure analytics transformations for log records."""

from __future__ import annotations

from collections.abc import Iterable
from datetime import datetime
from functools import reduce
from math import isclose

from backend.pipeline.filters import has_level

LogRecord = dict[str, str]
HealthStatus = str


def _increment_counter(counter: dict[str, int], key: str) -> dict[str, int]:
    """Return a new counter dictionary with an incremented key."""
    return {**counter, key: counter.get(key, 0) + 1}


def _sorted_counter_items(counter: dict[str, int], *, limit: int | None = None) -> list[tuple[str, int]]:
    """Return counter items sorted by value descending, then label ascending."""
    ranked = sorted(counter.items(), key=lambda pair: (-pair[1], pair[0]))
    if limit is None:
        return ranked
    return ranked[:limit]


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
    return _sorted_counter_items(error_counts, limit=top_n)


def top_error_messages(records: Iterable[LogRecord], top_n: int = 5) -> list[tuple[str, int]]:
    """Return the most frequent error messages."""
    error_counts = reduce(
        lambda acc, record: _increment_counter(acc, record.get("message", "unknown")),
        filter(has_level("ERROR"), records),
        {},
    )
    return _sorted_counter_items(error_counts, limit=top_n)


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


def record_timeline_by_hour(records: Iterable[LogRecord]) -> dict[str, int]:
    """Build an hourly timeline across all observed records."""
    def reducer(acc: dict[str, int], record: LogRecord) -> dict[str, int]:
        timestamp = record.get("timestamp", "unknown")
        return _increment_counter(acc, f"{timestamp[:13]}:00")

    return reduce(reducer, records, {})


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


def busiest_service(records: Iterable[LogRecord]) -> str | None:
    """Return the service with the highest observed record count."""
    volumes = service_volume(records)
    if not volumes:
        return None
    return _sorted_counter_items(volumes, limit=1)[0][0]


def timestamp_bounds(records: Iterable[LogRecord]) -> tuple[str | None, str | None]:
    """Return the earliest and latest timestamps observed in the dataset."""
    timestamps = sorted(record.get("timestamp", "") for record in records if record.get("timestamp"))
    if not timestamps:
        return (None, None)
    return (timestamps[0], timestamps[-1])


def observation_window_hours(records: Iterable[LogRecord]) -> float:
    """Return the observed time span between the first and last log entry."""
    first_seen, last_seen = timestamp_bounds(records)
    if not first_seen or not last_seen:
        return 0.0

    start = datetime.fromisoformat(first_seen.replace("Z", "+00:00"))
    end = datetime.fromisoformat(last_seen.replace("Z", "+00:00"))
    return round((end - start).total_seconds() / 3600, 2)


def service_health_breakdown(records: Iterable[LogRecord]) -> dict[str, HealthStatus]:
    """Classify each service by its local error rate."""
    service_totals = service_volume(records)
    service_errors = dict(top_failing_services(records, top_n=len(service_totals) or 1))

    return {
        service: classify_health_status(service_errors.get(service, 0), total)
        for service, total in sorted(service_totals.items())
    }


def error_free_service_count(records: Iterable[LogRecord]) -> int:
    """Count services that have traffic but no observed errors."""
    service_totals = service_volume(records)
    failing_services = {service for service, _ in top_failing_services(records, top_n=len(service_totals) or 1)}
    return sum(1 for service in service_totals if service not in failing_services)


def clean_record_ratio(total_records: int, skipped_records: int) -> float:
    """Return the percentage of non-skipped records in the dataset."""
    observed_records = total_records + skipped_records
    if observed_records <= 0:
        return 0.0
    return round((total_records / observed_records) * 100, 2)
