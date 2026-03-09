"""Functional programming helpers used across the project."""

from __future__ import annotations

from typing import Any, Callable, TypeVar

T = TypeVar("T")
U = TypeVar("U")
V = TypeVar("V")


def compose(*functions: Callable[[Any], Any]) -> Callable[[Any], Any]:
    """Compose unary functions right-to-left."""

    def composed(value: Any) -> Any:
        for function in reversed(functions):
            value = function(value)
        return value

    return composed


def curry_binary(function: Callable[[T, U], V]) -> Callable[[T], Callable[[U], V]]:
    """Curry a binary function."""

    def first(argument_one: T) -> Callable[[U], V]:
        return lambda argument_two: function(argument_one, argument_two)

    return first


def recursive_map(function: Callable[[T], U], items: list[T]) -> list[U]:
    """Recursively map a function to a list."""
    if not items:
        return []
    return [function(items[0])] + recursive_map(function, items[1:])


def reduce_recursive(function: Callable[[U, T], U], items: list[T], seed: U) -> U:
    """Recursively reduce a list into a single value."""
    if not items:
        return seed
    return reduce_recursive(function, items[1:], function(seed, items[0]))


def updater_for(counter_key: str) -> Callable[[dict[str, int]], dict[str, int]]:
    """
    Build a closure that returns an immutable-style updated dictionary.
    The returned function does not mutate the provided state.
    """

    def update(counter: dict[str, int]) -> dict[str, int]:
        next_value = counter.get(counter_key, 0) + 1
        return {**counter, counter_key: next_value}

    return update


def safe_get(key: str, default: Any = None) -> Callable[[dict[str, Any]], Any]:
    """Return a safe dictionary lookup function."""
    return lambda data: data.get(key, default)
