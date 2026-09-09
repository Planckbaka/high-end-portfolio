---
title: "Event-Driven Architecture with Kafka: Make Recovery Part of the Protocol"
date: "2024-03-05"
updatedAt: "2026-09-09"
category: "Systems"
excerpt: "An event bus does not make a workflow reliable by itself. Trace the database write, event publication, consumer side effect, and offset commit as separate boundaries."
lang: "en"
tags: ["Kafka", "outbox", "idempotency", "event-driven systems"]
featured: false
draft: false
---

## The dual-write gap

An order service writes a row and publishes an event. If the database write succeeds and publication fails, downstream services never learn about the order. Reversing the order merely reverses the failure: an event can describe an order that never committed.

The operations belong to different systems. A try/catch block around both does not make them atomic. The application needs a recovery protocol that states what happens after a process crash, a timeout, or a duplicate attempt.

Kafka supplies useful log and consumption mechanisms, but the business workflow remains an application concern. This article focuses on those boundaries; the companion [Kafka internals note](/articles/the-understand-of-kafka) covers partitions, replication, and retention.

## Record the intent with the business change

A transactional outbox writes an event intent in the same database transaction as the business change. A separate publisher reads pending intents and sends them to the broker. If the transaction commits, the intent remains available for later delivery even when the publisher is temporarily unavailable.

The publisher can still crash after publishing but before marking the intent delivered. On restart it may publish again. The outbox closes the lost-intent gap; it does not automatically provide exactly-once delivery to every downstream effect.

Give the business operation and event stable identifiers. The consumer can use an event identifier to record that a particular effect was applied. Keep that deduplication record in the same transaction as the effect when both live in one database. An in-memory set disappears on restart and is not an equivalent guarantee.

## Define what acknowledgment means

A broker acknowledgment concerns event publication under the producer's configuration. A consumer offset commit concerns a position in a partition. A database commit concerns a side effect in another system. Treating these as one generic “ack” hides the windows where recovery must act.

Write the timeline explicitly:

```text
business + outbox commit
  → publish event
  → broker acknowledgment
  → consumer applies effect + deduplication record
  → consumer commits offset
```

Crashing between the last two steps should cause a duplicate delivery that the consumer can recognize. Committing the offset before applying the effect creates a different risk: a restart can skip unapplied work. The ordering is part of the protocol and belongs in tests.

Kafka transactions can support atomic operations within their supported Kafka scope, including relevant offset handling. They do not automatically include an arbitrary external HTTP endpoint or database. An “exactly once” claim must name the boundary in which it holds.

## Partitioning chooses an ordering domain

If events for one order must be processed in order, a consistent key can place them in the same partition. That does not order unrelated orders across partitions. The consumer should not infer a global business chronology from wall-clock timestamps that may come from different machines.

A hot key can concentrate work on one partition. More consumers do not make that partition arbitrarily parallel within a single consumer group's assignment model. If the business operation permits parallelism, its ordering requirement may need to be reconsidered rather than hidden behind a larger worker pool.

Within a consumer, parallel processing adds another offset question. Finishing record 12 does not mean record 11's effect is complete. Committing progress past unfinished earlier work can lose that work after a crash. Track a completed prefix or use a processing design whose commit semantics remain explicit.

## Schema evolution is recovery compatibility

A retained event may be replayed by code written months later. Renaming a field or changing its meaning can break recovery even if all currently running producers and consumers were deployed together. The schema is a long-lived contract with historical data.

Prefer additive evolution where possible and test old fixtures against new readers. Distinguish an optional field from a required value that happens to have a default in one language. Keep event meaning focused on a business fact rather than exposing an entire internal database row.

A schema registry can assist compatibility management, but it cannot decide whether a renamed monetary field changed units or whether a state transition remains valid. Semantic review belongs alongside structural validation.

## Poison messages need an operational path

A permanently invalid record can repeatedly fail a consumer. Retrying forever preserves neither useful progress nor clarity. Define a bounded retry policy, an observable failure record, and a route for investigation or controlled reprocessing.

Moving a record to a dead-letter destination also requires a delivery policy. If the consumer commits its original offset before the failure record is safely captured, the diagnostic evidence can be lost. If it records the failure and crashes before committing, the failure record may repeat. The same boundary reasoning applies again.

Do not log full sensitive payloads merely to make troubleshooting convenient. Preserve identifiers, schema version, error category, and enough sanitized context to reproduce the issue. Recovery tooling should make deliberate reprocessing visible rather than silently replaying business effects.

## Acceptance tests for the workflow

Test the publisher crashing after broker acknowledgment. Test the consumer crashing after its database commit but before its offset commit. Re-deliver the same event and verify that the destination effect is unchanged. Replay an older schema fixture and inspect the outcome.

This revision does not run Kafka or a transactional database cluster. The timelines are design examples, not deployment evidence. The local go-review outbox material informed the choice to focus on dual-write recovery, but its existence is not proof that this complete distributed workflow has been exercised.

A credible implementation report should include crash points, identifiers, observed rows, and committed offsets. “The service recovered” is too vague if recovery could have duplicated or skipped the operation the system exists to perform.

## References

- [Apache Kafka design and delivery semantics](https://kafka.apache.org/41/design/design/).
- [Transactions and isolation](/articles/transaction-in-DDIA).
- [Bounded concurrency](/articles/go-bounded-concurrency), for the lifecycle of consumer-side work.
