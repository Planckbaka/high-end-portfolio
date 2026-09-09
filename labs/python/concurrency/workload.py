"""Bound task creation as well as active work. Python 3.11+, standard library."""

from __future__ import annotations
import asyncio
from collections.abc import Awaitable, Callable, Sequence
from typing import TypeVar

T = TypeVar("T")
R = TypeVar("R")


# region:workload
async def run_bounded(
    items: Sequence[T],
    work: Callable[[T], Awaitable[R]],
    *,
    concurrency: int = 4,
    queue_size: int = 4,
    timeout: float = 5.0,
) -> list[R]:
    if concurrency < 1 or queue_size < 1 or timeout <= 0:
        raise ValueError("concurrency, queue_size, and timeout must be positive")
    queue: asyncio.Queue[tuple[int, T] | None] = asyncio.Queue(queue_size)
    results: dict[int, R] = {}

    async def produce() -> None:
        for index, item in enumerate(items):
            await queue.put((index, item))
        for _ in range(concurrency):
            await queue.put(None)

    async def consume() -> None:
        while True:
            entry = await queue.get()
            try:
                if entry is None:
                    return
                index, item = entry
                results[index] = await work(item)
            finally:
                queue.task_done()

    async with asyncio.timeout(timeout):
        async with asyncio.TaskGroup() as group:
            group.create_task(produce(), name="lab-producer")
            for index in range(concurrency):
                group.create_task(consume(), name=f"lab-worker-{index}")
    return [results[index] for index in range(len(items))]


# endregion:workload


async def main() -> None:
    async def square(value: int) -> int:
        await asyncio.sleep(0)
        return value * value

    print(await run_bounded(list(range(8)), square, concurrency=2, queue_size=2))


if __name__ == "__main__":
    asyncio.run(main())
