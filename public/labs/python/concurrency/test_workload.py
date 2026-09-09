import asyncio
import unittest
from workload import run_bounded


class WorkloadTests(unittest.IsolatedAsyncioTestCase):
    async def test_order_and_bound(self):
        active = peak = 0
        saturated = asyncio.Event()

        async def work(value):
            nonlocal active, peak
            active += 1
            peak = max(peak, active)
            if active == 3:
                saturated.set()
            await saturated.wait()
            await asyncio.sleep(0)
            active -= 1
            return value * 2

        self.assertEqual(
            await run_bounded(list(range(100)), work, concurrency=3, queue_size=2),
            list(range(0, 200, 2)),
        )
        self.assertEqual(peak, 3)
        self.assertEqual(active, 0)

    async def test_failure_cleans_blocked_producer_and_workers(self):
        active = 0

        async def work(value):
            nonlocal active
            active += 1
            try:
                if value == 1:
                    raise ValueError("injected failure")
                await asyncio.Event().wait()
            finally:
                active -= 1

        with self.assertRaises(ExceptionGroup):
            await run_bounded(list(range(100)), work, concurrency=2, queue_size=1)
        self.assertEqual(active, 0)
        self.assertFalse(
            [
                t
                for t in asyncio.all_tasks()
                if t.get_name().startswith("lab-") and not t.done()
            ]
        )

    async def test_timeout_and_external_cancellation(self):
        entered = asyncio.Event()
        exited = asyncio.Event()

        async def work(_):
            entered.set()
            try:
                await asyncio.Event().wait()
            finally:
                exited.set()

        with self.assertRaises(TimeoutError):
            await run_bounded([1], work, timeout=0.02)
        self.assertTrue(exited.is_set())
        entered.clear()
        exited.clear()
        task = asyncio.create_task(run_bounded([1, 2, 3], work, queue_size=1))
        await entered.wait()
        task.cancel()
        with self.assertRaises(asyncio.CancelledError):
            await task
        self.assertTrue(exited.is_set())
        self.assertFalse(
            [
                t
                for t in asyncio.all_tasks()
                if t.get_name().startswith("lab-") and not t.done()
            ]
        )

    async def test_empty_and_invalid(self):
        async def identity(value):
            return value

        self.assertEqual(await run_bounded([], identity), [])
        for kwargs in ({"concurrency": 0}, {"queue_size": 0}, {"timeout": 0}):
            with self.assertRaises(ValueError):
                await run_bounded([1], identity, **kwargs)


if __name__ == "__main__":
    unittest.main()
