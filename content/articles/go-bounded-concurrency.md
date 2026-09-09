---
title: "Bounded Concurrency in Go: Admission Control, Cancellation, and Shutdown"
date: "2026-09-09"
updatedAt: "2026-09-09"
category: "Go"
excerpt: "A small admission gate makes overload and shutdown explicit. Follow the lifecycle from acquiring a slot to proving that every worker has finished."
lang: "en"
tags: ["concurrency", "admission", "context", "shutdown"]
featured: true
draft: false
series: "Engineering Reliable Model Systems"
seriesOrder: 1
labPath: "labs/go/gateway"
---

## The queue you did not mean to build

A service receives requests faster than its downstream model can complete them. Creating a goroutine for each request looks inexpensive, so the first implementation launches work immediately and places a semaphore inside the goroutine. The semaphore limits active calls. Meanwhile, a growing population of waiting goroutines retains request data, contexts, and response channels. The downstream is protected, but the process is accumulating a queue that nobody named or sized.

The distinction matters because concurrency and admission answer different questions. Concurrency asks how many operations may execute together. Admission asks whether this operation should enter the system at all. A useful service needs an answer to both. A bounded worker pool can still have an unbounded input queue; a bounded queue can still feed tasks whose lifetimes escape their request.

This article isolates admission in a small Go package. It is informed by the local `go-review` gateway, whose HTTP handler rejects excess requests before calling its upstream. The companion implementation is new teaching code: it removes HTTP concerns and makes the worker lifecycle observable. It has no networking dependency and can be exercised with the race detector on a laptop.

## State the contract before choosing a primitive

The gate accepts a positive concurrency limit. `Start` either returns a result channel for accepted work or returns an error immediately. There is no waiting queue. After shutdown starts, subsequent calls receive `ErrDraining`, even when capacity becomes free. Shutdown waits for accepted workers, subject to its caller's deadline.

Those choices are intentionally specific. Rejecting instead of waiting moves responsibility for retrying to the caller. A gateway might translate capacity exhaustion into HTTP 429 and draining into 503, but this package does not prescribe an HTTP policy. It also does not retry work automatically. Retrying an operation with unknown side effects requires a separate idempotency contract.

There are four invariants to inspect. The active count never exceeds the limit. Each admitted worker increments that count exactly once. Each finishing worker decrements it exactly once. The completion signal closes only after admission has ended and active work reaches zero. These are stronger and more reviewable than saying that the package is “concurrency safe.”

## Acquire before spawning

<!-- lab: labs/go/gateway/gateway.go#admission -->

The mutex protects the state transition, not the expensive work. While holding it, `Start` checks cancellation, draining, and capacity, then reserves a slot. Only an admitted operation gets a goroutine. The lock is released when `Start` returns; the worker does not run under that lock.

A worker may begin before its caller receives the result channel. That is fine: admission has already happened. If it finishes immediately, its deferred cleanup waits briefly for the admission lock. There is no circular dependency because `Start` does not wait for worker completion while retaining the mutex.

The result channel has capacity one. This prevents a completed worker from blocking forever if its caller abandons the result after cancellation. It is not a general-purpose queue; there is exactly one result. The worker sends its error and executes cleanup before closing the channel. Receiving the error alone is not proof that cleanup has already finished: the sender can be descheduled between the send and the defer. `Shutdown` is the explicit barrier for the whole gate.

A semaphore could represent the same capacity reservation, but it would still need coordination with the draining transition. Here, one mutex keeps those decisions in one place. At this scale, that simplicity is more valuable than using a particular concurrency primitive for its own sake. The critical section is small and contains no I/O.

## Cancellation remains cooperative

The context belongs to the caller and is passed to the worker. The gate checks it before admission. That prevents work already known to be canceled from entering. Cancellation can still arrive immediately after that check, so the worker must observe the context itself. No preflight check can remove this race with the outside world.

Consider a worker blocked on a channel. If it uses a plain receive, canceling the context does not interrupt the receive. The worker needs a `select` containing both the channel and `ctx.Done()`. An HTTP worker should attach the same request context to its downstream request. CPU-heavy code may need periodic checks between chunks of work. The placement of those checks determines cancellation latency.

A deadline does not undo side effects that already happened. If a storage write succeeded but its acknowledgment was lost, the caller may see a timeout while the state changed. Admission control cannot settle that uncertainty. It prevents overload; it does not create transaction semantics.

This is also why the package does not claim to forcibly terminate workers. A goroutine is not an operating-system process that can safely be killed at an arbitrary instruction. The caller owns a cancellation signal, the worker owns observing it, and shutdown owns waiting for the resulting lifecycle to end.

## Draining is a one-way transition

<!-- lab: labs/go/gateway/gateway.go#shutdown -->

The shutdown method first prevents future admission. If there are no workers, it closes the completion channel immediately. Otherwise, the final worker closes it. Every caller of `Shutdown` waits on the same signal, so repeated calls do not create helper goroutines or a separate completion race.

The `draining` flag and active count share a lock. This closes a subtle gap: if shutdown checked the count separately from changing admission state, it could observe zero just before a new worker entered. A completion signal might then announce success while work was still running. One locked transition provides a precise boundary between admitted and rejected requests.

If the shutdown context expires, the gate stays draining. A later shutdown call can wait again. That is an intentional separation between the lifetime of the gate and the lifetime of a caller waiting for it. Timing out a wait must not reopen admission or reset a completion channel.

At the service layer, a complete termination sequence usually has additional steps: fail readiness, stop accepting connections, allow admitted requests to finish, and cancel remaining work when the grace budget expires. This package covers the admission and waiting portions. It does not prove that a load balancer stopped routing or that an HTTP response reached its client.

## Test the state transitions, not a convenient delay

The capacity test uses a release channel to hold two accepted workers in place. Once both workers announce that they started, a third admission must fail. There is no guess that a sleep of ten milliseconds is long enough. The test controls the condition it wants to inspect.

Next, it starts shutdown with a canceled waiting context. Shutdown cannot complete while the workers are blocked, but the draining transition must still take effect. A subsequent `Start` must report `ErrDraining`. Releasing the workers allows a fresh shutdown wait to succeed and the active count to reach zero.

A separate test returns a deliberate worker error. Cleanup must happen on failure just as it does on success. The cancellation case blocks inside work until the context is canceled, then verifies that shutdown completes. Another test races many admission attempts against shutdown. Outcomes may differ by scheduling, but each must be a legal result: accepted work, capacity exhaustion, or draining.

Run the tests from the repository root:

```bash
cd labs/go
go test -race ./gateway
```

The local run passes these behavioral tests with the race detector enabled. That is evidence about the tested state transitions and observed memory accesses. It is not a mathematical proof of all schedules, and it is not a throughput measurement. The package has no network or model in its critical path.

## What to measure in a real gateway

Expose separate counts for admitted, rejected, canceled, and failed work. A falling average latency can be a bad sign if the service is rejecting most requests. Report the denominator: latency for successful admitted work and the fraction of all requests that obtained admission.

Measure the residence time of accepted work and the time spent waiting wherever a queue exists. This gate deliberately has no queue, but upstream proxies, client connection pools, and model schedulers can each add one. A queue hidden in a transport layer does not stop existing because the application avoids an explicit channel.

The active gauge should return to zero after a controlled shutdown test. A permanently nonzero gauge suggests a lifecycle that did not close, but the gauge alone does not identify the cause. Pair it with goroutine profiles and request identifiers. Be careful that diagnostic logging does not retain entire prompts or secret-bearing headers.

Choose a capacity using a downstream budget and measurements, not a large number that appears to use every CPU. Model-serving capacity can be constrained by memory, context length, and scheduler behavior. An HTTP request count is a coarse limit when different requests have very different costs. Weighted admission may be a later extension, but it needs a defensible weight estimate.

## The tradeoff: rejection is visible backpressure

An immediate rejection gives the caller a clear signal and protects process memory. It can also amplify retries if every client responds by retrying immediately. Clients need bounded attempts, jitter, and a deadline for the overall operation. A retry budget belongs outside this gate because it depends on the meaning and cost of the request.

A short bounded queue is a reasonable alternative when small bursts dominate and the latency budget permits waiting. That alternative requires policies for cancellation while queued, queue timeouts, fairness, and shutdown of queued items. It should be introduced as a deliberate feature rather than emerging accidentally from goroutines waiting behind a semaphore.

The gate also assumes worker panics are programming failures. Deferred cleanup runs during panic unwinding, but this package does not recover panics or promise process survival. A service that recovers at a worker boundary must decide what result to expose and what state may already have changed. Silent recovery would make debugging harder.

Finally, the result channel transfers only an error because the lesson is about lifetime. A production API may return a typed result, but adding generics is not the first improvement to make. First establish who owns each operation, where it can wait, and what event proves it has stopped. Those answers survive changes in framework, transport, and model provider.

## References and next step

- [Go: Pipelines and cancellation](https://go.dev/blog/pipelines) discusses explicit cancellation and blocked senders.
- [The context package](https://pkg.go.dev/context) defines deadlines and cancellation propagation.
- [The Go race detector](https://go.dev/doc/articles/race_detector) explains its usage and detection boundary.
- Continue with [the Go agent loop](/articles/go-agent-loop), where cancellation must cross model and tool boundaries.
