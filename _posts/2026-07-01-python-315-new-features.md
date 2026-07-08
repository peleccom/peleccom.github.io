---
title: "Python 3.15: frozendict, UTF-8 by Default, and More"
excerpt: "Python 3.15 reaches beta with frozendict, default UTF-8 mode, sentinel values, and unpacking in comprehensions."
date: 2026-07-01
categories:
  - python
tags:
  - python
  - 3.15
  - release
---

Python 3.15 is shaping up to be a significant release. The feature set is now frozen as the second beta landed in June, and the final release is expected this fall.

## frozendict is Here

After years of discussion, PEP 814 delivers a built-in `frozendict` — an immutable dictionary that's hashable and can be used as a dictionary key or set member.

```python
from frozendict import frozendict

config = frozendict({"host": "localhost", "port": 8080})
# config["port"] = 9090  # TypeError: 'frozendict' object does not support item assignment

cache = {config: "cached_value"}  # Works because frozendict is hashable
```

## UTF-8 Mode is Now the Default

PEP 686 makes UTF-8 mode the default on all platforms. No more `locale.getpreferredencoding()` returning something surprising. If you need the old behavior for compatibility, set `PYTHON_UTF8=0`.

## Sentinel Values

PEP 661 adds a standard way to create sentinel values — unique objects you can use as defaults or markers:

```python
from sentinel import Sentinel

NOT_FOUND = Sentinel("NOT_FOUND")

def find_value(key, data):
    result = data.get(key, NOT_FOUND)
    if result is NOT_FOUND:
        return None
    return result
```

## Unpacking in Comprehensions

PEP 798 allows `*` and `**` unpacking inside comprehensions:

```python
items = [(1, 2), (3, 4)]
results = [x + y for x, *rest in items]  # Works in 3.15

dicts = [{"a": 1}, {"b": 2}]
merged = {**d for d in dicts}  # {'a': 1, 'b': 2}
```

## Type System Improvements

PEP 800 introduces `@typing.disjoint_base`, a decorator that tells the type checker two types are mutually exclusive:

```python
@typing.disjoint_base(AsyncIterable)
class Iterable: ...

value: Iterable[int] | AsyncIterable[int]  # Properly narrowed
```

## Frame Pointers for Profiling

PEP 831 makes frame pointers the default on supported platforms, making system profilers (like Linux `perf`) work out of the box with Python without installing debug symbols.

## What's Next

Beta 4 is due July 18, release candidates start August 4, and the final 3.15.0 lands this fall. Now's the time to test your projects against the betas.
