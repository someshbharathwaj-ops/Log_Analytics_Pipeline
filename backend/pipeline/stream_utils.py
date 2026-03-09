"""Lazy stream utilities used by the analytics pipeline."""

from __future__ import annotations

from collections.abc import Callable, Iterable, Iterator
from pathlib import Path
from typing import TypeVar

T = TypeVar("T")
U = TypeVar("U")


def read_lines_lazy(file_path: str | Path) -> Iterator[str]:
    """Yield non-empty lines from a file lazily."""
    with Path(file_path).open("r", encoding="utf-8") as handle:
        for line in handle:
            clean = line.strip()
            if clean:
                yield clean


def map_stream(function: Callable[[T], U], stream: Iterable[T]) -> Iterator[U]:
    """Functional map over an iterable as a lazy iterator."""
    return map(function, stream)


def filter_stream(predicate: Callable[[T], bool], stream: Iterable[T]) -> Iterator[T]:
    """Functional filter over an iterable as a lazy iterator."""
    return filter(predicate, stream)


def chain_streams(*streams: Iterable[T]) -> Iterator[T]:
    """Yield values from multiple streams in sequence."""
    for stream in streams:
        yield from stream

