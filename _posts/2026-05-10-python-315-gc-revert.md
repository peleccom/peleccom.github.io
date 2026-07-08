---
title: "The Python 3.14 GC Incident: Incremental GC Reverted in 3.14.5 and 3.15"
excerpt: "Python's new incremental garbage collector, shipped in 3.14.0–3.14.4, caused severe memory pressure and was rolled back in 3.14.5 and 3.15."
date: 2026-05-10
categories:
  - python
tags:
  - python
  - gc
  - garbage-collection
  - 3.15
  - 3.14
---

Python 3.14.5 landed on May 10, 2026, with an unusual move for a patch release: it pulled the incremental garbage collector that shipped in 3.14.0 through 3.14.4 and replaced it with the generational collector from 3.13.

## What Happened

CPython 3.14 introduced Mark Shannon's incremental garbage collector, which replaced the classic three-generational collector with a two-generation incremental one. The goal was to reduce "stop-the-world" GC pauses — the old collector could pause execution for hundreds of milliseconds on large heaps.

The incremental collector walked the old generation in pieces, reducing pause times by "an order of magnitude or more." But the fix had a critical flaw: trash cycles piled up in memory because the collector didn't trigger often enough.

## The Bug

Tim Peters traced the issue with a simple program that allocated cyclic structures in a loop. Under the 3.14 collector, **no full collection ran until iteration 20,000**, by which point ~18,000 trash cycles were sitting in memory. The steady state held over 90,000 trash cycles awaiting collection — compared to PyPy's collector which reclaimed over 100,000 cycles between iterations on the same workload.

The root cause: the incremental collector triggered its work based on a calculation that could **go negative** at times. A web server or long-running pipeline allocating cyclic objects steadily would keep adding to the heap without clearing the backlog, and RSS would climb — in worst cases up to **5x memory usage**.

## The Revert

The revert was merged for Python 3.14.5 (pulled forward from June 9 to May 10) and Python 3.15, which was still in alpha:

- **+552 / -1101** lines of code changed in CPython
- Generational collector restored with three generations
- `gc.collect(1)` reverts to its 3.13 meaning
- `gc.get_count()` and `gc.get_objects(generation=N)` again see three generations

## What's Next

The incremental collector isn't dead — a reintroduction for Python 3.16 is on the table, this time through the PEP process with structured review. Neil Schemenauer proposed a fix that triggers a collection every 2,000 net new objects and sizes increments to force a full pass often enough, keeping RSS low while preserving short pauses. But for now, the conservative move won.
