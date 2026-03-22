"""End-to-end functional log processing pipeline."""

from __future__ import annotations

from collections.abc import Callable, Iterable, Iterator
from dataclasses import dataclass
from datetime import UTC, datetime
from functools import partial
from ipaddress import ip_address
from pathlib import Path

from backend.pipeline import analytics
from backend.pipeline.functional_utils import compose, curry_binary
from backend.pipeline.stream_utils import filter_stream, map_stream, read_lines_lazy

LogRecord = dict[str, str]
SUPPORTED_LEVELS = frozenset({"ERROR", "WARN", "INFO", "DEBUG"})


@dataclass(frozen=True)
class PipelineResult:
    """Container returned by the analytics pipeline."""

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


def parse_log_line(line: str) -> LogRecord:
    """
    Parse expected line format:
    timestamp|level|service|ip|message
    """
    parts = [part.strip() for part in line.split("|", maxsplit=4)]
    if len(parts) != 5:
        raise ValueError("Malformed log line. Expected 5 pipe-delimited fields.")

    timestamp, level, service, ip_address_raw, message = parts
    if not timestamp or not level or not service or not ip_address_raw or not message:
        raise ValueError("Malformed log line. Fields cannot be empty.")

    # Validate timestamp while keeping the transformation pure.
    datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
    ip_address(ip_address_raw)
    return {
        "timestamp": timestamp,
        "level": level,
        "service": service,
        "ip": ip_address_raw,
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


def normalize_level(level: str | None) -> str | None:
    """Normalize and validate an optional level filter."""
    if level is None:
        return None

    normalized = level.strip().upper()
    if not normalized:
        return None

    if normalized not in SUPPORTED_LEVELS:
        raise ValueError(
            f"Unsupported level '{level}'. Expected one of: {', '.join(sorted(SUPPORTED_LEVELS))}."
        )

    return normalized


def transform_pipeline(*steps: Callable[[Iterable], Iterable]) -> Callable[[Iterable], Iterable]:
    """
    Compose stream transformations into a single pipeline function.
    Each step accepts and returns an iterable.
    """
    return compose(*steps)


def build_result(records: tuple[LogRecord, ...], *, skipped_records: int, source: str, level: str | None) -> PipelineResult:
    """Create a consistent response payload from processed records."""
    error_counts_per_ip, total_errors = analytics.count_errors_per_ip_and_total(records)
    top_services = analytics.top_failing_services(records)
    service_share = analytics.service_error_share(records)

    return PipelineResult(
        error_counts_per_ip=error_counts_per_ip,
        log_level_distribution=analytics.log_level_distribution(records),
        top_failing_services=top_services,
        service_error_share=service_share,
        error_timeline=analytics.error_timeline_by_hour(records),
        total_errors=total_errors,
        total_records=len(records),
        skipped_records=skipped_records,
        source=source,
        applied_level=level,
        dominant_level=analytics.dominant_level(records),
        peak_error_window=analytics.peak_error_window(records),
        noisiest_ip=max(error_counts_per_ip.items(), key=lambda item: (item[1], item[0]))[0] if error_counts_per_ip else None,
        health_status=analytics.classify_health_status(total_errors, len(records)),
        generated_at=datetime.now(UTC).isoformat(),
    )


def stream_records(file_path: str | Path) -> Iterator[LogRecord]:
    """Read and parse records lazily using an iterator pipeline."""
    return filter_stream(
        not_none,
        map_stream(parse_or_skip, read_lines_lazy(file_path)),
    )  # type: ignore[arg-type]


def run_pipeline(file_path: str | Path, level: str | None = None) -> PipelineResult:
    """Run the full analytics pipeline for a log file."""
    level = normalize_level(level)
    path = Path(file_path)
    raw_lines = tuple(line for line in read_lines_lazy(path) if line.strip())
    parse_step = partial(map, parse_or_skip)
    valid_step = partial(filter, not_none)
    pipeline_runner = transform_pipeline(valid_step, parse_step)
    processed_records = tuple(pipeline_runner(raw_lines))  # type: ignore[arg-type]
    skipped_records = len(raw_lines) - len(processed_records)

    if level:
        processed_records = tuple(filter(build_level_filter(level), processed_records))

    return build_result(
        processed_records,
        skipped_records=skipped_records,
        source=str(path),
        level=level,
    )


def run_pipeline_from_content(content: str, level: str | None = None) -> PipelineResult:
    """Run the same pipeline for in-memory text content."""
    level = normalize_level(level)
    lines = tuple(line.strip() for line in content.splitlines() if line.strip())
    parse_step = partial(map, parse_or_skip)
    valid_step = partial(filter, not_none)
    pipeline_runner = transform_pipeline(valid_step, parse_step)
    records = tuple(pipeline_runner(lines))  # type: ignore[arg-type]
    skipped_records = len(lines) - len(records)

    if level:
        level_filter = build_level_filter(level)
        records = tuple(filter(level_filter, records))

    curried_top = curry_binary(analytics.top_failing_services)
    top_five = curried_top(records)(5)
    result = build_result(
        records,
        skipped_records=skipped_records,
        source="upload",
        level=level,
    )
    return PipelineResult(**{**result.__dict__, "top_failing_services": top_five})
