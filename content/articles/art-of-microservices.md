---
title: "Microservice Boundaries: Optimize for Change and Failure"
date: "2024-06-15"
updatedAt: "2026-09-09"
category: "Systems"
excerpt: "A service boundary adds a network and an ownership contract. Use it where independent change earns the cost of partial failure, observability, and recovery."
lang: "en"
tags: ["architecture", "microservices", "reliability", "boundaries"]
featured: false
draft: false
---

## A boundary is a promise to coordinate less

Splitting an application into services is useful when parts can evolve and operate independently. If every change requires synchronized deployments across five services, the system has gained network calls without gaining much independence. The shape of the repositories is not the same as the shape of the architecture.

Start with a concrete change: adding a new pricing rule, replacing a search index, or changing how notifications are delivered. Identify which data and invariants must move together. A boundary that repeatedly cuts through the same invariant will create coordination work on every request and every deployment.

This article uses an order workflow as a design example. It does not describe a production system operated by the author, and no latency or availability figures are implied by the diagram.

## Keep a transactional core coherent

Suppose an order reservation must check inventory and create a reservation atomically. Placing those operations in different services introduces a distributed protocol. That may be necessary for organizational or scaling reasons, but it is not a free decomposition of two function calls.

A modular monolith can preserve clear internal interfaces while retaining one transactional boundary. It can also provide a practical starting point for discovering which modules actually change independently. Extracting a service later is easier when the module already owns a coherent data model and contract.

The useful question is not whether a module has enough lines of code to become a service. Ask whether it has independent ownership, a stable contract, and a failure mode the rest of the system can tolerate. If its data must always be updated with another module's data, examine that coupling before adding a network boundary.

## Make partial failure part of the interface

A local function generally returns or fails within one process. A network call adds outcomes such as timeout after success, connection loss before acknowledgment, and a slow response that arrives after the caller has stopped waiting. A boolean success field is not enough to describe those states.

Set an end-to-end deadline and pass smaller budgets to downstream operations. Retries consume that same overall budget. A chain of services that each grants itself a fresh timeout can exceed the caller's useful waiting time by a large margin.

If an operation may be retried, give it a stable identity and specify how duplicate requests are handled. An idempotency key is meaningful only if its storage and effect share a suitable consistency boundary. A cache entry written after the effect can still leave a duplication window.

## Separate the request path from deferred work

A notification often does not need to block the order response. Moving it to a queue can reduce direct coupling, but the enqueue operation needs a reliable relationship with the order commit. A transactional outbox is one way to record that intent without a fragile dual write.

```text
order transaction → committed outbox intent
                         ↓
                    publisher → notification consumer
```

The consumer must still handle duplicate delivery and delayed processing. A user-facing state may need to distinguish “order accepted” from “notification delivered.” Removing a synchronous call does not remove the workflow; it makes the workflow asynchronous and therefore more important to observe.

## Observe the question, not just the process

CPU and memory charts can show that every process is alive while the business workflow is stalled. Add observations that follow the operation: accepted orders, failed reservations, pending outbox age, duplicate events, and completed notifications. These reveal where useful work stops progressing.

Distributed traces help reconstruct a path, but trace sampling and propagation gaps mean they are not automatically a complete audit history. Keep stable operation identifiers in the records needed for recovery. Avoid making personal data or prompts the identifiers that connect logs.

A service-level objective should describe a user-visible outcome. A low latency for one internal endpoint can coexist with a slow overall workflow. Define the endpoint of success before deciding which percentile to optimize.

## Test the boundary before distributing it further

Contract tests can catch incompatible requests and responses. They do not reproduce every network failure or prove a shared business invariant. Add controlled integration tests for timeouts, duplicate requests, unavailable dependencies, and restart after partial progress.

For a proposed extraction, write a failure table first: what happens if the new service is slow, unavailable, returns an old schema, or completes after the caller times out? If every answer requires the entire application to stop, the promised isolation may be weaker than expected.

No cluster was deployed for this revision. These are review criteria and illustrative workflows. The runnable [admission lab](/articles/go-bounded-concurrency) and [agent-loop lab](/articles/go-agent-loop) provide smaller examples of lifetime and failure contracts that also matter across service boundaries.

## References

- [Go context](https://pkg.go.dev/context), for deadline propagation within Go call chains.
- [Kafka delivery semantics](https://kafka.apache.org/41/design/design/), for the boundary around event publication and consumption.
- [Event-driven recovery](/articles/event-driven-architecture-kafka).
- [Transactions and isolation](/articles/transaction-in-DDIA).
