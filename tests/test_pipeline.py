from __future__ import annotations

from backend.pipeline.functional_utils import curry_binary, recursive_map
import pytest

from backend.pipeline.pipeline import normalize_level, parse_log_line, run_pipeline_from_content


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


def test_recursive_map() -> None:
    assert recursive_map(lambda value: value * 2, [1, 2, 3]) == [2, 4, 6]


def test_parse_log_line() -> None:
    record = parse_log_line("2026-03-01T10:00:00Z|ERROR|api|10.0.0.5|Unhandled exception")
    assert record["level"] == "ERROR"
    assert record["service"] == "api"


def test_currying() -> None:
    curried_sum = curry_binary(lambda a, b: a + b)
    assert curried_sum(4)(6) == 10


def test_normalize_level_accepts_case_insensitive_input() -> None:
    assert normalize_level("error") == "ERROR"
    assert normalize_level(" WARN ") == "WARN"


def test_normalize_level_rejects_unknown_value() -> None:
    with pytest.raises(ValueError):
        normalize_level("TRACE")
