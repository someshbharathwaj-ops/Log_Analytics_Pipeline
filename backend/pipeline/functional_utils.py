"""Functional programming helpers used across the project."""

from __future__ import annotations

from collections.abc import Callable, Iterable, Iterator
from functools import lru_cache, partial, reduce, wraps
from time import perf_counter
from typing import Any, TypeVar

T = TypeVar("T")
U = TypeVar("U")
V = TypeVar("V")
W = TypeVar("W")

# Lambda (anonymous function)
identity: Callable[[T], T] = lambda value: value
double_lambda: Callable[[int], int] = lambda value: value * 2


# Functions as first-class objects
def apply_function(function: Callable[[T], U], value: T) -> U:
    """Pass a function as data and execute it."""
    return function(value)


# Higher-order function
def apply_to_each(function: Callable[[T], U], values: Iterable[T]) -> Iterator[U]:
    """Return a lazy mapped iterator."""
    return map(function, values)


# Function composition
def compose(*functions: Callable[[Any], Any]) -> Callable[[Any], Any]:
    """Compose unary functions right-to-left."""

    def composed(value: Any) -> Any:
        for function in reversed(functions):
            value = function(value)
        return value

    return composed


def pipe(value: T, *functions: Callable[[Any], Any]) -> Any:
    """Apply functions left-to-right."""
    result: Any = value
    for function in functions:
        result = function(result)
    return result


# Currying
def curry_binary(function: Callable[[T, U], V]) -> Callable[[T], Callable[[U], V]]:
    """Curry a binary function."""

    def first(argument_one: T) -> Callable[[U], V]:
        return lambda argument_two: function(argument_one, argument_two)

    return first


# Partial application
def multiply(base: int, factor: int) -> int:
    """Basic multiply helper for partial application demos."""
    return base * factor


times_two = partial(multiply, factor=2)


# Closures
def updater_for(counter_key: str) -> Callable[[dict[str, int]], dict[str, int]]:
    """
    Build a closure that returns an immutable-style updated dictionary.
    The returned function does not mutate the provided state.
    """

    def update(counter: dict[str, int]) -> dict[str, int]:
        next_value = counter.get(counter_key, 0) + 1
        return {**counter, counter_key: next_value}

    return update


def make_threshold_filter(min_value: int) -> Callable[[int], bool]:
    """Return a closure that captures threshold state."""
    return lambda value: value >= min_value


# Recursion
def recursive_factorial(number: int) -> int:
    """Classic recursion example."""
    if number <= 1:
        return 1
    return number * recursive_factorial(number - 1)


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


# Tail recursion (style demonstration; Python does not optimize tail calls)
def tail_recursive_sum(numbers: list[int], accumulator: int = 0) -> int:
    """Tail-recursive style sum with explicit accumulator."""
    if not numbers:
        return accumulator
    return tail_recursive_sum(numbers[1:], accumulator + numbers[0])


# Memoization
@lru_cache(maxsize=256)
def memoized_fibonacci(number: int) -> int:
    """Memoized recursive fibonacci."""
    if number < 2:
        return number
    return memoized_fibonacci(number - 1) + memoized_fibonacci(number - 2)


# Decorators
def timing_decorator(function: Callable[..., T]) -> Callable[..., tuple[T, float]]:
    """Decorator returning result and elapsed execution seconds."""

    @wraps(function)
    def wrapper(*args: Any, **kwargs: Any) -> tuple[T, float]:
        start = perf_counter()
        result = function(*args, **kwargs)
        elapsed = perf_counter() - start
        return result, elapsed

    return wrapper


# Map, filter, reduce primitives
def map_values(function: Callable[[T], U], values: Iterable[T]) -> list[U]:
    """Materialized map helper."""
    return list(map(function, values))


def filter_values(predicate: Callable[[T], bool], values: Iterable[T]) -> list[T]:
    """Materialized filter helper."""
    return list(filter(predicate, values))


def reduce_values(function: Callable[[U, T], U], values: Iterable[T], seed: U) -> U:
    """Reduce helper."""
    return reduce(function, values, seed)


# List comprehensions
def squares_list_comprehension(values: Iterable[int]) -> list[int]:
    """Square values using list comprehension."""
    return [value * value for value in values]


# Generator functions and lazy evaluation
def naturals(limit: int) -> Iterator[int]:
    """Yield natural numbers lazily up to a limit."""
    for value in range(limit):
        yield value


def lazy_transform(values: Iterable[T], function: Callable[[T], U]) -> Iterator[U]:
    """Lazily transform iterables."""
    for value in values:
        yield function(value)


# Generator comprehensions
def even_square_generator(values: Iterable[int]) -> Iterator[int]:
    """Return a generator comprehension for even squares."""
    return (value * value for value in values if value % 2 == 0)


# Iterables and iterators
def to_iterator(values: Iterable[T]) -> Iterator[T]:
    """Convert iterable to iterator."""
    return iter(values)


def consume_iterator(iterator: Iterator[T], count: int) -> list[T]:
    """Take first N items from an iterator."""
    taken: list[T] = []
    for _ in range(count):
        try:
            taken.append(next(iterator))
        except StopIteration:
            break
    return taken


# Immutable vs mutable data
def append_immutable(values: tuple[T, ...], item: T) -> tuple[T, ...]:
    """Return a new tuple with appended value."""
    return values + (item,)


def append_mutable(values: list[T], item: T) -> list[T]:
    """Mutate and return the same list."""
    values.append(item)
    return values


# Enumerate, zip, sorted, reversed
def enumerate_values(values: Iterable[T], start: int = 0) -> list[tuple[int, T]]:
    """Enumerate values with explicit start index."""
    return list(enumerate(values, start=start))


def zip_values(left: Iterable[T], right: Iterable[U]) -> list[tuple[T, U]]:
    """Zip two iterables into pairs."""
    return list(zip(left, right))


def sort_by_key(values: Iterable[T], key_function: Callable[[T], Any], reverse: bool = False) -> list[T]:
    """Sort with key functions."""
    return sorted(values, key=key_function, reverse=reverse)


def reverse_values(values: Iterable[T]) -> list[T]:
    """Return a reversed list view materialized as list."""
    return list(reversed(list(values)))


# Map-Filter-Reduce pattern
def map_filter_reduce_pattern(values: Iterable[int]) -> int:
    """Double numbers, keep > 5, and sum."""
    mapped = map(lambda value: value * 2, values)
    filtered = filter(lambda value: value > 5, mapped)
    return reduce(lambda acc, value: acc + value, filtered, 0)


# Transforming iterables
def transform_iterables(values: Iterable[T], *functions: Callable[[Any], Any]) -> list[Any]:
    """Apply a transformation pipeline and materialize results."""
    transformed: Iterable[Any] = values
    for function in functions:
        transformed = map(function, transformed)
    return list(transformed)


# Reducing iterables
def reduce_iterables(values: Iterable[T], function: Callable[[U, T], U], initial: U) -> U:
    """Reduce iterable values to a single output."""
    return reduce(function, values, initial)


def safe_get(key: str, default: Any = None) -> Callable[[dict[str, Any]], Any]:
    """Return a safe dictionary lookup function."""
    return lambda data: data.get(key, default)
