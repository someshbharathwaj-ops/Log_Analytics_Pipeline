"""Predicate builders for filtering log streams."""

from __future__ import annotations

from collections.abc import Callable


LogRecord = dict[str, str]


def has_level(level: str) -> Callable[[LogRecord], bool]:
    """Closure capturing the target log level."""
    target = level.upper()
    return lambda record: record.get("level", "").upper() == target


def service_is(service_name: str) -> Callable[[LogRecord], bool]:
    """Closure capturing the target service name."""
    return lambda record: record.get("service", "") == service_name


def message_contains(text: str) -> Callable[[LogRecord], bool]:
    """Closure for case-insensitive message search."""
    lowered = text.lower()
    return lambda record: lowered in record.get("message", "").lower()


def predicate_and(
    first: Callable[[LogRecord], bool], second: Callable[[LogRecord], bool]
) -> Callable[[LogRecord], bool]:
    """Combine predicates with functional composition."""
    return lambda record: first(record) and second(record)


def predicate_or(
    first: Callable[[LogRecord], bool], second: Callable[[LogRecord], bool]
) -> Callable[[LogRecord], bool]:
    """Combine predicates using OR semantics."""
    return lambda record: first(record) or second(record)

