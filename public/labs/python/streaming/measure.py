"""Measure stream events, not unobserved model tokens. Standard library only."""

from __future__ import annotations
import json
import math
import time
from collections.abc import AsyncIterator, Callable
from dataclasses import dataclass
from typing import Iterable


@dataclass(frozen=True)
class StreamRecord:
    start: float
    events: tuple[float, ...]
    end: float
    error: str | None = None

    def __post_init__(self) -> None:
        times = (self.start, *self.events, self.end)
        if not all(math.isfinite(t) for t in times):
            raise ValueError("timestamps must be finite")
        if any(b < a for a, b in zip(times, times[1:])):
            raise ValueError("timestamps must be monotonic")


# region:metrics
def summarize(record: StreamRecord) -> dict:
    gaps = [b - a for a, b in zip(record.events, record.events[1:])]
    return {
        "event_count": len(record.events),
        "first_event_seconds": record.events[0] - record.start
        if record.events
        else None,
        "event_gaps_seconds": gaps,
        "mean_gap_seconds": sum(gaps) / len(gaps) if gaps else None,
        "duration_seconds": record.end - record.start,
        "error": record.error,
    }


def percentile(values: Iterable[float], q: float) -> float | None:
    ordered = sorted(values)
    if not 0 <= q <= 1:
        raise ValueError("quantile must be between zero and one")
    if not all(math.isfinite(v) for v in ordered):
        raise ValueError("samples must be finite")
    if not ordered:
        return None
    position = (len(ordered) - 1) * q
    low = math.floor(position)
    high = math.ceil(position)
    return ordered[low] + (ordered[high] - ordered[low]) * (position - low)


# endregion:metrics


async def record_stream(
    stream: AsyncIterator[object], clock: Callable[[], float] = time.perf_counter
) -> StreamRecord:
    """Collect one timestamp per yielded event. Caller owns iterator cleanup."""
    start = clock()
    events: list[float] = []
    error = None
    try:
        async for _ in stream:
            events.append(clock())
    except Exception as exc:
        error = type(exc).__name__
    return StreamRecord(start, tuple(events), clock(), error)


def report(records: list[StreamRecord]) -> dict:
    successful = [r for r in records if r.error is None]
    durations = [r.end - r.start for r in successful]
    first = [r.events[0] - r.start for r in successful if r.events]
    return {
        "requests": len(records),
        "errors": len(records) - len(successful),
        "empty_successes": sum(not r.events for r in successful),
        "success_duration_p50": percentile(durations, 0.5),
        "success_duration_p95": percentile(durations, 0.95),
        "success_first_event_p95": percentile(first, 0.95),
        "records": [summarize(r) for r in records],
    }


if __name__ == "__main__":
    fixtures = [
        StreamRecord(0.0, (0.2, 0.3, 0.5), 0.6),
        StreamRecord(0.0, (), 0.4, "upstream timeout"),
        StreamRecord(0.0, (0.1,), 0.25),
    ]
    print(
        json.dumps(
            {"measurement_kind": "synthetic timestamp fixture", **report(fixtures)},
            indent=2,
        )
    )
