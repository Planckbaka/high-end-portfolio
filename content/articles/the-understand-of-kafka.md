---
title: "Kafka Internals: Logs, Replication, and the Boundary of Durability"
date: "2025-12-21"
updatedAt: "2026-09-09"
category: "Systems"
excerpt: "Understand partitions, offsets, replication, and acknowledgments before treating a Kafka cluster as an unlimited durable queue."
lang: "en"
tags: ["Kafka", "replication", "logs", "durability"]
featured: false
draft: false
---

## Begin with one partition

A Kafka topic contains partitions. Within a partition, records have an ordered position identified by an offset. That local order is the useful starting point: a multi-partition topic does not provide one global sequence across all records. Choosing a partition key is therefore part of the application's ordering contract.

Imagine events for individual orders. Routing each order's events consistently to one partition can preserve their partition order. Increasing the number of partitions or changing keying behavior deserves review because it can change placement. Application consumers must still decide what to do with duplicates and delayed business events.

The log abstraction separates writing data from consuming it. Different consumers can maintain different positions and replay retained records. Replay depends on retention and the continued interpretation of the record schema; it is not an unlimited historical guarantee.

## Offsets are positions, not business completion

A consumer position describes progress through a partition. It does not inherently prove that an external database update succeeded. If the consumer commits an offset before its side effect and crashes, the effect may be skipped on restart. If it commits after the side effect and crashes between them, the effect may repeat.

This is a boundary between two systems, not a defect solved by choosing a faster consumer library. The application needs idempotent effects, a shared transaction boundary where available, or another explicit recovery protocol. The [event-driven architecture article](/articles/event-driven-architecture-kafka) examines that application-level problem separately.

Consumer lag also needs interpretation. A growing difference between produced and consumed positions can indicate insufficient processing capacity, a stalled partition, a rebalance, or a deliberate pause. A single aggregate lag number can conceal one hot partition while others remain idle.

## Replication has a failure model

A partition leader handles its records while replicas maintain copies. Producer acknowledgment settings and the required in-sync replica policy influence when a write is reported as successful. More replicas do not by themselves establish what happens under every combination of unavailable replicas and election policy.

The phrase “durable write” should therefore be accompanied by assumptions: which replicas acknowledged, which failures are tolerated, and which configuration controls apply. Local disk persistence, replicated availability, and the application's acknowledgment are related but different boundaries.

A successful producer response also does not mean every consumer has processed the record. It establishes a write-side outcome under the selected configuration. Consumer-side correctness remains a separate protocol, including deserialization, schema handling, side effects, and offset management.

## Throughput comes from workload and layout

Batching can amortize request overhead and improve compression. It can also increase the time an individual record waits before transmission. The right batch policy depends on the latency budget and arrival pattern. A benchmark with a continuous high-volume stream may not resemble a low-volume interactive service.

Sequential log access and efficient transfer paths help explain Kafka's architecture, but “zero copy” is not a universal description of every deployment path. TLS, compression, protocol handling, and platform details can change where bytes are copied and where CPU time is spent.

A useful performance report includes record size, compression, partition count, replication settings, producer behavior, consumer work, and hardware. Without these inputs, a large messages-per-second number is difficult to compare or reproduce. It should not be transplanted into a personal project description as an achieved result.

## Retention and compaction express different goals

Time- or size-based retention bounds how much log history remains available. A consumer that falls behind beyond the retained range may no longer be able to replay the missing data. Recovery then needs a snapshot, a rebuilt projection, or another source of truth.

Compaction is useful for retaining a key's latest relevant state over time. It is not an immediate deduplication operation for consumers. A consumer can encounter multiple records for the same key before compaction and must understand tombstones and state reconstruction.

The choice affects event design. An immutable business-event history and a compacted latest-state topic serve different purposes. Treating them as interchangeable can erase information that a later audit or replay requires.

## Review operational changes as semantic changes

Changing partition count, retention, producer retries, or consumer offset policy can alter application behavior. These settings should be reviewed alongside the code that depends on them. A deployment configuration is not merely an infrastructure concern when it changes what data can be replayed.

For a failure exercise, write down a record's timeline: produced, acknowledged, fetched, processed, side effect committed, and offset committed. Stop the consumer at specific boundaries and inspect the result after restart. A deliberate timeline is more informative than restarting random components and declaring resilience when the service eventually responds.

## Validation and limits

This is a conceptual, source-reviewed article. No Kafka cluster was started for this blog revision, and no throughput or failover result is claimed. Cluster behavior must be checked against a pinned Kafka version and actual configuration before using it as project evidence.

A practical next step is a small reproducible consumer experiment with duplicate delivery and restart points. Keep it focused on one invariant, such as applying an order transition at most once in the destination database, and preserve the raw event and offset records needed to explain the outcome.

## References

- [Apache Kafka design documentation](https://kafka.apache.org/41/design/design/), with a pinned documentation version for the architecture discussion.
- [Event-driven application reliability](/articles/event-driven-architecture-kafka).
- [Transactions and isolation](/articles/transaction-in-DDIA).
