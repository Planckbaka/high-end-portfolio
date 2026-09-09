---
title: "Measuring Streaming Systems Without Fooling Yourself"
date: "2026-09-09"
updatedAt: "2026-09-09"
category: "Python"
excerpt: "Separate first-event latency, inter-event gaps, completion time, and failures. Build a small measurement tool whose arithmetic can be checked against known timelines."
lang: "en"
tags: ["measurement", "streaming", "latency", "percentiles"]
featured: false
draft: false
series: "Engineering Reliable Model Systems"
seriesOrder: 4
labPath: "labs/python/streaming"
---

## A fast number can describe a broken service

A streaming endpoint returns its first bytes quickly, so the dashboard looks healthy. Users still wait a long time for meaningful output. Some requests fail immediately, lowering the average duration if failures and successes are mixed together. Several transport chunks contain multiple model tokens, while another contains only metadata. Calling the resulting chart “tokens per second” does not make it a token measurement.

Measurement starts by defining the event being observed. A client can timestamp when its iterator yields an event. That timestamp includes the effects of the server, network, buffering, parser, and client scheduling. It does not reveal when a GPU finished computing a token unless the protocol supplies that information and the clocks are understood.

The companion lab deliberately measures events. It provides a timestamp recorder, per-stream summaries, aggregate percentiles, and deterministic fixtures. It can verify its own arithmetic without requiring access to a model. This separation is useful: first prove that the instrument measures what it says, then attach it to a real workload.

## Define the timeline

A stream record contains a start time, an ordered tuple of event timestamps, an end time, and an optional error classification. All timestamps must be finite and monotonic. The start is taken before consuming the iterator, and the end after consumption finishes or an ordinary exception is observed.

First-event latency is the first event time minus the start. Inter-event gaps are adjacent timestamp differences. Total duration is the end minus the start. The final duration can exceed the time of the last event because the stream may take additional time to terminate cleanly.

For an empty stream, first-event latency is undefined. For a one-event stream, there is no inter-event gap. The code returns `None` for those values rather than zero. Zero would claim an observed interval of no duration; an undefined measurement says no suitable observation exists.

An unsuccessful stream can still have delivered events. Its partial timeline is valuable for debugging, so the record retains it. Aggregate success latency excludes failures, while error counts remain visible. The combination answers two different questions: how fast successful requests complete, and how often a request fails to complete successfully.

## Make the arithmetic inspectable

<!-- lab: labs/python/streaming/measure.py#metrics -->

The percentile implementation uses linear interpolation between sorted samples. With four values, the median lies halfway between the middle two; the 95th percentile lies near the largest observation. Other valid conventions exist, including nearest rank. A report should identify its convention so that two tools do not appear to disagree mysteriously on a small sample.

Finite-value validation matters because a single NaN can poison sorting, averages, or serialized results. Monotonic validation matters because negative gaps often indicate a clock mistake or mixed timestamp domains. Silently taking an absolute value would conceal the instrument defect and invent plausible-looking latency.

The computation is intentionally separate from recording. A pure function over timestamps can be tested with exact fixtures. A network test combines parsing, buffering, scheduler behavior, and the endpoint itself, so a failed numerical assertion is harder to localize. Both forms of testing are useful, but they answer different questions.

The returned report retains each record's gaps instead of exposing only the mean. Two streams can have the same average interval while feeling very different to a reader: one emits regularly, another pauses for a long time and then delivers a burst. A mean loses the ordering information that distinguishes those experiences.

## Use a clock appropriate for elapsed time

The asynchronous recorder uses `time.perf_counter` by default. The purpose is to measure elapsed intervals within one process. Wall-clock timestamps are useful for correlating logs across systems, but wall time can be adjusted. Subtracting a monotonic clock reading from a wall-clock reading is meaningless even if both are represented as floating-point seconds.

The recorder also accepts an injected clock. The test supplies a known sequence of values while an asynchronous generator yields two events and then raises an exception. The expected event timestamps, duration, and error classification can therefore be checked without sleeping or depending on machine speed.

The caller owns cleanup of the underlying iterator or response. For a network stream, use the client's response context manager so that cancellation releases the connection. The recorder does not claim ownership of every possible asynchronous iterator, and it does not suppress task cancellation as a successful measurement.

Ordinary stream exceptions are classified by type in the fixture tool. This keeps diagnostic output small and avoids copying an arbitrary exception message that could include a URL or request content. A production instrument can define richer error categories, but it should make those categories stable enough to aggregate over time.

## Work through a known example

One fixture begins at zero, yields at 0.2, 0.3, and 0.5 seconds, and ends at 0.6 seconds. Its first-event latency is 0.2 seconds. Its gaps are 0.1 and 0.2 seconds, giving a mean gap of 0.15 seconds. Its full duration is 0.6 seconds, not 0.5.

A second fixture fails at 0.4 seconds without an event. Its first-event latency is undefined. A third succeeds with one event at 0.1 seconds and ends at 0.25 seconds. Combining the three produces three requests, one error, and two successful duration samples. The failed request remains in the denominator for the error count.

These values are prescribed timestamps. They are not measurements of a real model, and the report identifies them as a synthetic timestamp fixture. Their usefulness lies in making the calculation auditable. Anyone can reproduce the report and compare it with the hand-worked timeline.

```bash
python3 -m unittest discover -s labs/python/streaming -p 'test_*.py' -v
python3 labs/python/streaming/measure.py
```

The tests check known intervals, empty and single-event streams, nonmonotonic or nonfinite inputs, percentile interpolation, and the separation of failures from successful latency. The recorder test covers a midstream exception with an injected clock.

## An event is not automatically a token

A transport can combine several logical messages into one network read. A parser can combine text fragments or emit metadata separately. A provider can send an event containing multiple token-like text fragments, and a tokenizer can split those fragments differently from another model. Counting iterator yields gives an event count, not an independently verified model-token count.

To report time to first token, define the first qualifying content token and explain how it is identified. Role-only events, empty deltas, keepalive messages, and tool metadata should not quietly count as content. The exact policy depends on the stream protocol. It belongs in an adapter tested with recorded fixtures.

Time per output token also needs a denominator. If there are N generated tokens and timing begins at the first token, the interval between first and last spans N minus one transitions. Using total request duration instead includes prefill, queueing, and finalization. Neither measurement should be renamed without describing its boundary.

The event tool remains useful even before that adapter exists. It can reveal client-visible stalls, compare parser behavior, or check that a proxy is not buffering an entire response. What it cannot do is attribute those stalls specifically to GPU execution. That requires server-side measurements or additional controlled experiments.

## Design the workload as carefully as the instrument

A benchmark with one short prompt and a fixed short output describes one point in a workload space. Context length, output length, batch composition, cache reuse, and concurrency can change behavior. If those inputs vary between two runs, a latency difference may come from the workload rather than the implementation.

A closed-loop load generator starts another request only when a previous request finishes. Under overload, it naturally reduces its offered request rate. That can hide the amount of queueing a fixed-arrival workload would experience. An open-loop generator follows an arrival schedule, but must then measure its own inability to keep up and bound the work it retains.

Before comparing implementations, record attempted, admitted, completed, failed, and canceled request counts. A timeout should not disappear from the report because it lacks a final usage object. A service that returns only its fastest responses can otherwise look better than a service that completes the full workload.

Warmup and repetition need a stated policy. Repeating the same prompt may exercise caches that a diverse workload would not. The first run may include imports, compilation, or connection setup. Report whether those costs are included and why. Discarding slow runs after seeing them is not a neutral warmup policy.

## Tail latency needs enough context to be useful

A percentile over a handful of samples is an observation of those samples, not a stable estimate of a service population. The largest few observations have a strong effect. The tool exposes its interpolation convention, but it cannot create statistical confidence from insufficient data.

Keep raw records when practical and publish the sample count. Compare repeated runs under the same configuration. If one implementation has lower p50 and higher p95, investigate the distribution rather than compressing the comparison into one winner. Scheduling, batching, garbage collection, or a small set of longer requests may explain the difference.

Do not average per-request percentiles to produce a global percentile. Percentiles are not additive summaries. Combine the appropriate raw observations or use a mergeable distribution representation whose approximation is documented. Similarly, a mean of per-request token rates does not necessarily equal total tokens divided by total wall-clock duration.

The correct aggregation depends on the question. Per-user waiting time, per-request latency, and system-wide throughput weight observations differently. A clear report states the question before choosing the aggregation. That makes it harder for a convenient number to become an accidental success criterion.

## From a lab report to an engineering decision

The companion fixture establishes trust in basic arithmetic and failure accounting. The next step is a protocol adapter that identifies meaningful content events, followed by an end-to-end run with a fixed workload and explicit admission limits. Keep client-visible timing distinct from server-side timing throughout that process.

The output should support a decision such as whether buffering causes visible stalls or whether a concurrency increase improves completed work within a latency budget. “Higher tokens per second” is insufficient when the counted objects are events, failures are excluded from denominators, or the workload changed between runs.

A measurement tool is successful when another person can reconstruct its claims from the records. Small pure functions, injectable clocks, and explicit undefined values are practical ways to make that possible. The most useful optimization is often the one you can still explain after someone asks what the number actually measures.

## References

- [Python time: performance counters](https://docs.python.org/3/library/time.html#time.perf_counter).
- [Python statistics](https://docs.python.org/3/library/statistics.html), for statistical terminology and alternative quantile tools.
- [Structured concurrency](/articles/python-structured-concurrency), for bounded workload generation and cleanup.
- [KV Cache through a tiny decoder](/articles/kv-cache-tiny-decoder), for a separate, explicitly CPU-only measurement example.
