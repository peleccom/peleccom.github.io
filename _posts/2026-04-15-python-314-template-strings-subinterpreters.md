---
title: "Python 3.14: Template Strings, Subinterpreters, and Deferred Annotations"
excerpt: "Python 3.14 introduced t-strings, multiple interpreters in the stdlib, deferred annotation evaluation, and Zstandard support."
date: 2026-04-15
categories:
  - python
tags:
  - python
  - 3.14
  - release
  - subinterpreters
  - template-strings
---

Python 3.14, released in October 2025, brought several long-awaited features to the language. Here's a look at the highlights.

## Template String Literals (t-strings)

PEP 750 introduces `t"..."` literals that create template objects instead of plain strings. Unlike f-strings (which are evaluated immediately), t-strings produce reusable templates with deferred interpolation:

```python
from string.templatelib import Template

name = "World"
t = t"Hello, {name}!"
# t is a Template object, not a string

str(t)  # "Hello, World!"

# Templates are safe by default — no injection risk
greet = t"Hello, {name}"
# Later, with different context:
name = "Python"
str(greet)  # "Hello, Python"
```

## Deferred Annotation Evaluation

PEP 649 (with PEP 749 refinements) makes annotation evaluation lazy. Annotations are stored as functions and evaluated only when accessed via `get_annotations()`:

```python
def greet(name: str) -> str:
    return f"Hello, {name}"

# Annotations are not evaluated at definition time
# They're evaluated lazily when requested
import typing
typing.get_annotations(greet)  # {'name': str, 'return': str}
```

This means forward references work without `from __future__ import annotations`.

## Multiple Interpreters in the Standard Library

PEP 734 adds the `concurrent.interpreters` module, letting you run Python code in isolated subinterpreters — each with its own GIL:

```python
from concurrent.interpreters import Interpreter

interp = Interpreter()
interp.run("""
import math
result = math.factorial(100)
""")
```

This is especially useful for CPU-bound parallel work without the GIL limitations, since each subinterpreter has its own GIL.

## Zstandard in the Standard Library

PEP 784 adds Zstandard compression support via `compression.zstd`:

```python
import compression.zstd as zstd

data = b"Hello, World!" * 1000
compressed = zstd.compress(data)
decompressed = zstd.decompress(compressed)
```

## Other Highlights

- **Safe debugger interface** (PEP 768): Debuggers can now attach to running processes without stopping them
- **Tail-call interpreter**: Up to 5% faster on supported compilers
- **Improved error messages**: More helpful tracebacks for common mistakes
- **Free-threaded mode improvements**: Performance penalty reduced to ~5-10%
- **New `annotationlib` module** for introspecting annotations programmatically

Python 3.14 is the current stable release, and 3.14.6 (June 2026) is the latest bugfix version.
