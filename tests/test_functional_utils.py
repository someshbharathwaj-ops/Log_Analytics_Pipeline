from __future__ import annotations

from backend.pipeline.functional_utils import (
    append_immutable,
    append_mutable,
    apply_function,
    consume_iterator,
    curry_binary,
    double_lambda,
    enumerate_values,
    even_square_generator,
    filter_values,
    identity,
    lazy_transform,
    map_filter_reduce_pattern,
    map_values,
    memoized_fibonacci,
    naturals,
    pipe,
    recursive_factorial,
    reduce_iterables,
    reduce_recursive,
    reduce_values,
    reverse_values,
    safe_get,
    sort_by_key,
    squares_list_comprehension,
    tail_recursive_sum,
    times_two,
    timing_decorator,
    to_iterator,
    transform_iterables,
    updater_for,
    zip_values,
)


def test_first_class_lambda_and_partial() -> None:
    assert apply_function(identity, 9) == 9
    assert double_lambda(4) == 8
    assert times_two(7) == 14


def test_recursion_tail_recursion_and_memoization() -> None:
    assert recursive_factorial(5) == 120
    assert tail_recursive_sum([1, 2, 3, 4]) == 10
    assert memoized_fibonacci(10) == 55


def test_closure_and_currying() -> None:
    updater = updater_for("ERROR")
    assert updater({}) == {"ERROR": 1}
    curried_add = curry_binary(lambda a, b: a + b)
    assert curried_add(10)(5) == 15


def test_map_filter_reduce_family() -> None:
    assert map_values(lambda value: value * 2, [1, 2, 3]) == [2, 4, 6]
    assert filter_values(lambda value: value % 2 == 0, [1, 2, 3, 4]) == [2, 4]
    assert reduce_values(lambda acc, value: acc + value, [1, 2, 3], 0) == 6
    assert reduce_recursive(lambda acc, value: acc + value, [1, 2, 3], 0) == 6
    assert map_filter_reduce_pattern([1, 2, 3, 4]) == 14
    assert reduce_iterables([1, 2, 3], lambda acc, value: acc + value, 0) == 6


def test_iterables_iterators_and_lazy() -> None:
    iterator = to_iterator([10, 20, 30])
    assert consume_iterator(iterator, 2) == [10, 20]
    assert list(naturals(4)) == [0, 1, 2, 3]
    assert list(lazy_transform([1, 2, 3], lambda value: value + 1)) == [2, 3, 4]
    assert list(even_square_generator([1, 2, 3, 4])) == [4, 16]


def test_collection_helpers_and_mutability() -> None:
    immutable = (1, 2)
    mutable = [1, 2]
    assert append_immutable(immutable, 3) == (1, 2, 3)
    assert immutable == (1, 2)
    append_mutable(mutable, 3)
    assert mutable == [1, 2, 3]

    assert enumerate_values(["a", "b"], start=1) == [(1, "a"), (2, "b")]
    assert zip_values([1, 2], ["x", "y"]) == [(1, "x"), (2, "y")]
    assert sort_by_key(["aaa", "b", "cc"], key_function=len) == ["b", "cc", "aaa"]
    assert reverse_values([1, 2, 3]) == [3, 2, 1]
    assert squares_list_comprehension([2, 3]) == [4, 9]
    assert transform_iterables([1, 2], lambda value: value + 1, lambda value: value * 2) == [4, 6]


def test_decorator_and_safe_get() -> None:
    @timing_decorator
    def add(a: int, b: int) -> int:
        return a + b

    result, elapsed = add(2, 5)
    assert result == 7
    assert elapsed >= 0

    getter = safe_get("missing", 42)
    assert getter({}) == 42

