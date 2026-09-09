---
title: "Structured Concurrency for Model Workloads in Python"
date: "2026-09-09"
updatedAt: "2026-09-09"
category: "Python"
excerpt: "Bound the queue and the number of tasks, preserve result identity, and make failures cancel the work they own. A standard-library asyncio lab."
lang: "en"
tags: ["asyncio", "TaskGroup", "backpressure", "cancellation"]
featured: true
draft: false
series: "Engineering Reliable Model Systems"
seriesOrder: 3
labPath: "labs/python/concurrency"
---

## The limit that only limits execution

Suppose a Python service receives a batch of documents and calls an asynchronous operation for each document. Wrapping the operation in a semaphore appears to solve the concurrency problem. But if the program creates a task for every document before those tasks acquire the semaphore, it still allocates and retains one task per input. A million inputs can therefore produce a million waiting tasks while only four calls are active.

This is not an argument against semaphores. It is an argument for naming what is bounded. Active operations, queued items, scheduled tasks, retained inputs, and stored results are different quantities. Each has a cost. A program can meet one limit while violating another, especially when a small test batch conceals its allocation pattern.

The companion lab uses a fixed number of workers, one producer, and a bounded queue. It also places their lifetimes inside a `TaskGroup`, with an overall deadline outside the group. The code uses Python's standard library and synthetic work, so the failure paths are reproducible without a model server.

## Define the ownership boundary

`run_bounded` accepts a sequence of inputs and an asynchronous worker function. It returns results in input order. A positive concurrency value determines the worker count; a positive queue size determines how far the producer may get ahead of consumers. If any worker raises an ordinary exception, the batch fails and its sibling tasks are canceled.

That last rule is a product decision. A batch processor might instead return a mixture of values and per-item failures. This lab chooses fail-fast behavior because it makes the ownership and cleanup contract explicit. It does not silently convert errors into missing results, and it does not promise partial results when the group fails.

The timeout applies to the whole batch, including queueing and cleanup that cooperates with cancellation. It is not a fresh timeout for every item. Giving every downstream operation a new full budget can make an end-to-end request live much longer than intended. Per-item limits can still be added, but their relationship to the overall deadline must be stated.

The caller retains the input sequence, and the implementation accumulates all results. Therefore the complete function is not constant-memory. Its task population and queue are bounded; its input and output storage are proportional to batch size. A streaming API would need a different interface and a decision about output ordering.

## A producer and a fixed set of consumers

<!-- lab: labs/python/concurrency/workload.py#workload -->

The producer attaches an index to each input. Consumers may finish in any order, but results are stored under their original index and assembled only after the group exits successfully. This preserves identity without assuming that scheduling order is completion order.

`await queue.put(...)` is a backpressure point. When the queue reaches its capacity, the producer suspends until a consumer makes space. The producer does not create a new task to wait for that space. This is the key difference from launching all work and putting a semaphore inside each task.

There are `concurrency` consumers plus one producer. The amount of application work scheduled by this function does not grow one-for-one with the number of inputs. Each consumer retrieves an item, awaits its processing, and then requests the next item. The queue capacity controls the number of waiting entries, not the number already being processed.

The implementation sends one sentinel per worker after all inputs have entered the queue. A sentinel is not an input value because queue items are wrapped as `(index, item)` tuples. Even an input whose value is `None` remains distinct from the bare sentinel. A worker acknowledges every retrieved entry in a `finally` block, including the sentinel.

## Why the group is the completion barrier

The function does not use `queue.join()` as its primary completion signal. The task group owns the producer and all consumers, and a successful exit means all of those tasks have completed. Queue accounting is kept balanced, but it does not replace lifetime ownership.

On an ordinary worker exception, the group cancels the other tasks and waits for their cleanup. That includes a producer suspended on a full queue. Without shared ownership, it is easy to cancel consumers and leave a producer waiting forever for capacity that no worker will free.

An `ExceptionGroup` preserves the failures that the task group reports. The caller should inspect or handle the relevant exceptions deliberately. Catching every exception and returning an empty list would turn a failed batch into a superficially valid result with no explanation of what happened.

Structured concurrency also makes a review question easier: can any child task outlive this function? In this implementation, tasks created inside the group cannot simply escape through a forgotten reference. A worker function can still violate that assumption by creating its own unowned background tasks. The contract must apply to the code passed into the abstraction as well as the abstraction itself.

## Cancellation is not an ordinary item error

External cancellation enters the function through the task that awaits it. `asyncio.CancelledError` participates in control flow; treating it as a successful item result prevents the owner from stopping its work. In particular, broad exception-handling logic must not swallow cancellation and continue submitting requests.

A worker should release local resources in `finally` blocks or asynchronous context managers. Cleanup should be bounded where possible. If cleanup waits forever, the task group also waits, because it cannot honestly announce that its children have stopped. A timeout signal is not a guarantee that arbitrary code will finish by that wall-clock instant.

The companion tests use events to prove that workers entered and exited. One test cancels the parent while a worker is blocked. Another lets the overall timeout expire. In both cases, the worker's `finally` block must run and no named lab task may remain unfinished afterward.

A common workaround for a blocking library is to move the call into a thread. That can keep the event loop responsive, but canceling the awaiting coroutine does not necessarily stop the running thread. The thread's work may still hold a connection or continue a side effect. Thread offloading changes the scheduling boundary; it does not automatically establish a cancellation protocol.

## Concurrency is useful only when work yields

The worker in the demonstration yields with `asyncio.sleep(0)`. That is a scheduling fixture, not a model of inference latency. Real asynchronous network libraries yield while waiting for I/O. Pure Python CPU work generally does not become parallel merely because it is placed in several coroutines on one event-loop thread.

If a worker performs a long synchronous calculation without yielding, it can delay the producer, all other workers, and the timeout callback itself. The effect is visible as event-loop lag, not just slower individual work. A service should measure lag alongside request latency when investigating unexpectedly slow cancellation.

For model workloads, separate orchestration from execution. The Python service may handle I/O around a model server, while the actual tensor computation occurs in another process or library runtime. Limits at the orchestration layer should reflect downstream capacity, connection-pool limits, and memory budgets. Increasing the number of coroutines cannot create additional GPU memory.

The queue size also represents a latency choice. A larger queue absorbs bursts but permits more work to wait. If the average service time grows under load, queued work can spend most of its deadline waiting before it starts. Backpressure is helpful when it reaches a caller capable of slowing down; otherwise rejection or load shedding may be necessary.

## Make concurrency tests control the schedule

The ordering test uses a saturation event. Workers increment an active counter, and the first wave waits until the configured concurrency is reached. This proves that multiple workers can be active and that the observed peak does not exceed the chosen bound. A simple sleep would make this test depend on scheduler timing.

During development, a test that assumed three workers would overlap after a single yield observed only two. The queue capacity and scheduling order made that a legal execution. The implementation did not violate its maximum; the test had confused a limit with a guarantee of saturation. The event-based version establishes the prerequisite explicitly.

The failure test gives one item a deliberate exception while another worker waits indefinitely. A small queue causes the producer to encounter backpressure. The expected outcome is an exception group and completed cleanup, not a hang. Empty input and invalid configuration have separate tests so they do not rely on incidental behavior of the queue implementation.

Run the example and its tests:

```bash
python3 -m unittest discover -s labs/python/concurrency -p 'test_*.py' -v
python3 labs/python/concurrency/workload.py
```

The successful example returns the squares of eight inputs in their original order. The tests verify ordering, bounds, worker failure, timeout, external cancellation, and empty input. No network service is involved in this result.

## Extend the interface only when the semantics are clear

Returning partial results is a useful extension for independent document processing. To implement it, represent success and failure as typed per-item outcomes and keep cancellation separate. Decide whether a failed item is retried, whether its original index remains in the output, and whether downstream consumers can distinguish absent data from a valid empty result.

Streaming results can reduce retained output memory. Completion-order delivery is straightforward, but callers may need to reorder it. Input-order delivery can suffer head-of-line blocking: one slow early item prevents later completed items from being emitted. That ordering buffer can become another queue that needs an explicit limit.

A fair multi-tenant service adds another dimension. A single large batch should not necessarily occupy every worker while small interactive requests wait. Per-tenant queues, weighted scheduling, or separate pools may be appropriate, but those policies require workload evidence. The small batch function should not pretend to be a full scheduler.

The review habit transfers directly to larger systems: count tasks, count retained items, identify every suspension point, and determine who cancels each child. A concurrency abstraction is useful when those answers become easier to see after introducing it.

## References

- [Python: Coroutines and tasks](https://docs.python.org/3/library/asyncio-task.html), for TaskGroup, timeout, and cancellation semantics.
- [Python: asyncio queues](https://docs.python.org/3/library/asyncio-queue.html), for bounded queue behavior and accounting.
- [Bounded concurrency in Go](/articles/go-bounded-concurrency), for the related choice to reject instead of queue.
- [Streaming measurements](/articles/python-streaming-measurement), for observing the resulting workload honestly.
