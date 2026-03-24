from __future__ import annotations

from backend.pipeline.functional_utils import curry_binary, recursive_map
import pytest

from backend.pipeline.pipeline import normalize_level, normalize_service, parse_log_line, run_pipeline_from_content


def test_closure_level_filter() -> None:
    content = "\n".join(
        [
            "2026-03-01T10:00:00Z|ERROR|auth|10.0.0.1|Login failed",
            "2026-03-01T10:05:00Z|INFO|auth|10.0.0.1|Login success",
        ]
    )
    result = run_pipeline_from_content(content, level="ERROR")
    assert result.total_records == 1
    assert result.log_level_distribution == {"ERROR": 1}
    assert result.applied_level == "ERROR"


def test_recursive_map() -> None:
    assert recursive_map(lambda value: value * 2, [1, 2, 3]) == [2, 4, 6]


def test_parse_log_line() -> None:
    record = parse_log_line("2026-03-01T10:00:00Z|ERROR|api|10.0.0.5|Unhandled exception")
    assert record["level"] == "ERROR"
    assert record["service"] == "api"


def test_parse_log_line_rejects_invalid_ip() -> None:
    with pytest.raises(ValueError):
        parse_log_line("2026-03-01T10:00:00Z|ERROR|api|999.999.0.1|Unhandled exception")


def test_parse_log_line_rejects_missing_fields() -> None:
    with pytest.raises(ValueError):
        parse_log_line("2026-03-01T10:00:00Z|ERROR|api|10.0.0.5")


def test_currying() -> None:
    curried_sum = curry_binary(lambda a, b: a + b)
    assert curried_sum(4)(6) == 10


def test_normalize_level_accepts_case_insensitive_input() -> None:
    assert normalize_level("error") == "ERROR"
    assert normalize_level(" WARN ") == "WARN"


def test_normalize_level_rejects_unknown_value() -> None:
    with pytest.raises(ValueError):
        normalize_level("TRACE")


def test_normalize_service_trims_blank_input() -> None:
    assert normalize_service(" auth ") == "auth"
    assert normalize_service("   ") is None


def test_run_pipeline_from_content_reports_skipped_records_and_insights() -> None:
    content = "\n".join(
        [
            "2026-03-01T10:00:00Z|ERROR|auth|10.0.0.1|Login failed",
            "malformed-line",
            "2026-03-01T10:05:00Z|WARN|billing|10.0.0.2|Retry threshold nearing",
        ]
    )
    result = run_pipeline_from_content(content)

    assert result.total_records == 2
    assert result.skipped_records == 1
    assert result.clean_record_ratio == pytest.approx(66.67)
    assert result.unique_ip_count == 2
    assert result.impacted_service_count == 2
    assert result.source == "upload"
    assert result.noisiest_ip == "10.0.0.1"
    assert result.dominant_level in {"ERROR", "WARN"}
    assert result.health_status == "critical"
    assert result.service_volume == {"auth": 1, "billing": 1}
    assert result.top_error_messages == [("Login failed", 1)]


def test_run_pipeline_from_content_filters_by_service() -> None:
    content = "\n".join(
        [
            "2026-03-01T10:00:00Z|ERROR|auth|10.0.0.1|Login failed",
            "2026-03-01T10:05:00Z|WARN|billing|10.0.0.2|Retry threshold nearing",
        ]
    )
    result = run_pipeline_from_content(content, service="billing")

    assert result.total_records == 1
    assert result.service_volume == {"billing": 1}
    assert result.log_level_distribution == {"WARN": 1}
