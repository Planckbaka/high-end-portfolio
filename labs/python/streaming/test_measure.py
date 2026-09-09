import unittest
from measure import StreamRecord, summarize, percentile, report, record_stream


class MeasurementTests(unittest.TestCase):
    def test_known_timeline(self):
        actual = summarize(StreamRecord(10.0, (10.2, 10.3, 10.5), 10.6))
        self.assertAlmostEqual(actual["first_event_seconds"], 0.2)
        self.assertAlmostEqual(actual["mean_gap_seconds"], 0.15)
        self.assertAlmostEqual(actual["duration_seconds"], 0.6)

    def test_empty_and_single(self):
        self.assertIsNone(summarize(StreamRecord(0, (), 1))["first_event_seconds"])
        self.assertIsNone(summarize(StreamRecord(0, (0.5,), 1))["mean_gap_seconds"])
        self.assertIsNone(percentile([], 0.95))

    def test_bad_timestamps(self):
        for args in [
            (0, (2,), 1),
            (2, (), 1),
            (0, (float("nan"),), 2),
            (0, (), float("inf")),
        ]:
            with self.assertRaises(ValueError):
                StreamRecord(*args)

    def test_percentile_definition(self):
        self.assertEqual(percentile([4, 1, 2, 3], 0.5), 2.5)
        self.assertAlmostEqual(percentile([1, 2, 3, 4], 0.95), 3.85)
        with self.assertRaises(ValueError):
            percentile([1], 2)

    def test_failures_not_disguised_as_fast_success(self):
        actual = report([StreamRecord(0, (1,), 2), StreamRecord(0, (), 0.1, "error")])
        self.assertEqual(actual["errors"], 1)
        self.assertEqual(actual["success_duration_p50"], 2)
        self.assertEqual(report([])["requests"], 0)


class RecorderTests(unittest.IsolatedAsyncioTestCase):
    async def test_events_and_failure_use_injected_clock(self):
        async def events():
            yield "first"
            yield "second"
            raise RuntimeError("upstream")

        ticks = iter([10.0, 10.2, 10.5, 10.6])
        record = await record_stream(events(), lambda: next(ticks))
        self.assertEqual(record.events, (10.2, 10.5))
        self.assertEqual(record.error, "RuntimeError")
        self.assertAlmostEqual(summarize(record)["duration_seconds"], 0.6)

    async def test_cancellation_is_not_converted_to_success(self):
        import asyncio

        async def events():
            raise asyncio.CancelledError()
            yield  # retain async iterator type

        with self.assertRaises(asyncio.CancelledError):
            await record_stream(events())


if __name__ == "__main__":
    unittest.main()
