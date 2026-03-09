"""End-to-end functional log processing pipeline."""

from __future__ import annotations

from collections.abc import Callable, Iterable, Iterator
from dataclasses import dataclass
from datetime import datetime
from functools import partial
from pathlib import Path

from backend.pipeline import analytics
from backend.pipeline.functional_utils import compose, curry_binary
from backend.pipeline.stream_utils import filter_stream, map_stream, read_lines_lazy

LogRecord = dict[str, str]


@dataclass(frozen=True)
class PipelineResult:
    """Container returned by the analytics pipeline."""

    error_counts_per_ip: dict[str, int]
    log_level_distribution: dict[str, int]
    top_failing_services: list[tuple[str, int]]
    error_timeline: dict[str, int]
    total_errors: int
    total_records: int


def parse_log_line(line: str) -> LogRecord:
    """
    Parse expected line format:
    timestamp|level|service|ip|message
    """
    timestamp, level, service, ip_address, message = line.split("|", maxsplit=4)
    # Validate timestamp while keeping the transformation pure.
    datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
    return {
        "timestamp": timestamp,
        "level": level,
        "service": service,
        "ip": ip_address,
        "message": message,
    }


def parse_or_skip(line: str) -> LogRecord | None:
    """Parse a line and skip malformed records."""
    try:
        return parse_log_line(line)
    except (ValueError, TypeError):
        return None


def not_none(item: LogRecord | None) -> bool:
    """Predicate used to keep valid records only."""
    return item is not None


def build_level_filter(level: str) -> Callable[[LogRecord], bool]:
    """Closure that captures a log level for filtering."""
    normalized = level.upper()
    return lambda record: record.get("level", "").upper() == normalized


def transform_pipeline(*steps: Callable[[Iterable], Iterable]) -> Callable[[Iterable], Iterable]:
    """
    Compose stream transformations into a single pipeline function.
    Each step accepts and returns an iterable.
    """
    return compose(*steps)


def stream_records(file_path: str | Path) -> Iterator[LogRecord]:
    """Read and parse records lazily using an iterator pipeline."""
    return filter_stream(
        not_none,
        map_stream(parse_or_skip, read_lines_lazy(file_path)),
    )  # type: ignore[arg-type]


def run_pipeline(file_path: str | Path, level: str | None = None) -> PipelineResult:
    """Run the full analytics pipeline for a log file."""
    records_stream = stream_records(file_path)

    if level:
        records_stream = filter_stream(build_level_filter(level), records_stream)

    # Materialize once after lazy processing to support multiple analytics passes.
    records = tuple(records_stream)

    return PipelineResult(
        error_counts_per_ip=analytics.count_errors_per_ip(records),
        log_level_distribution=analytics.log_level_distribution(records),
        top_failing_services=analytics.top_failing_services(records),
        error_timeline=analytics.error_timeline_by_hour(records),
        total_errors=analytics.recursive_total(
            list(analytics.count_errors_per_ip(records).values())
        ),
        total_records=len(records),
    )


def run_pipeline_from_content(content: str, level: str | None = None) -> PipelineResult:
    """Run the same pipeline for in-memory text content."""
    lines = (line.strip() for line in content.splitlines() if line.strip())
    parse_step = partial(map, parse_or_skip)
    valid_step = partial(filter, not_none)
    pipeline_runner = transform_pipeline(valid_step, parse_step)
    records = tuple(pipeline_runner(lines))  # type: ignore[arg-type]

    if level:
        level_filter = build_level_filter(level)
        records = tuple(filter(level_filter, records))

    curried_top = curry_binary(analytics.top_failing_services)
    top_five = curried_top(records)(5)

    return PipelineResult(
        error_counts_per_ip=analytics.count_errors_per_ip(records),
        log_level_distribution=analytics.log_level_distribution(records),
        top_failing_services=top_five,
        error_timeline=analytics.error_timeline_by_hour(records),
        total_errors=analytics.recursive_total(
            list(analytics.count_errors_per_ip(records).values())
        ),
        total_records=len(records),
    )

