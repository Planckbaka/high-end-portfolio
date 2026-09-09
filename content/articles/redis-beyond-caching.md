---
title: "Redis Beyond Caching: Streams, Idempotency, and Atomic Decisions"
date: "2024-05-20"
updatedAt: "2026-09-09"
category: "Systems"
excerpt: "Redis offers useful coordination primitives, but message acknowledgment, atomic commands, and persistence each solve a different part of the application problem."
lang: "en"
tags: ["Redis", "streams", "idempotency", "rate limiting"]
featured: false
draft: false
---

## Choose the semantic contract first

Redis can store cached values, represent counters, support stream consumers, and coordinate small state transitions. Those capabilities are not interchangeable. A cache miss is usually recoverable from another source; losing a queued business operation may not be. The required failure model should determine the data structure and persistence policy.

Consider a service that accepts a request, increments a rate counter, and publishes work. Each step asks a different question: whether the caller may proceed, whether the work was recorded, and whether a worker completed it. A single Redis instance can participate in all three, but proximity does not automatically make their application semantics coherent.

## Pub/Sub and Streams have different lifetimes

Pub/Sub is useful for transient notification to connected subscribers. It is not a retained work queue that guarantees a disconnected consumer can later replay missed messages. Treating it as a durable job transport can lose work while a consumer is unavailable.

Streams retain entries according to the application's retention choices and support consumer-group mechanisms. A delivered entry can remain pending until acknowledged. This gives a worker an explicit progress protocol, but it still needs a policy for failure, reclaiming abandoned work, and duplicate effects.

A stream acknowledgment removes the entry from a consumer group's pending bookkeeping; it does not delete the stream entry itself. Retention and trimming are separate concerns. Confusing acknowledgment with deletion can produce inaccurate storage expectations and recovery behavior.

## Acknowledge after the effect, then handle repeats

If a worker acknowledges before committing its effect and crashes, the work can be skipped. If it commits the effect and crashes before acknowledging, it may be delivered again. The second ordering is useful when effects can be made idempotent, but that idempotency must be implemented at the destination.

An event identifier stored transactionally with a database effect can prevent repeated application. A temporary Redis key used as a deduplication marker has a lifetime; after it expires, a replay may be accepted again. The marker's retention must match the replay horizon the system intends to support.

A pending entry also needs an owner-recovery policy. Reclaiming too aggressively can run the same slow job concurrently; reclaiming too slowly delays recovery after a crash. Include work duration and heartbeat behavior in the design instead of choosing a threshold from an unrelated example.

## Atomicity is useful for a small decision

A rate limit often needs to read state, decide whether a request is permitted, and update that state. Separating those steps into independent client round trips allows concurrent requests to observe the same old value. A server-side atomic operation or script can keep the decision together within its supported scope.

The algorithm still needs a time-window policy. A fixed window can allow a burst near the boundary between windows. A sliding-window or token-bucket design has different state and computation costs. Name the policy before presenting a requests-per-minute number as if all algorithms enforced the same experience.

Expiration is another part of the operation. Updating a counter without establishing the intended expiry can leave state around indefinitely. Refreshing expiry on every request can turn a fixed window into a different policy. Test the boundary behavior using a controlled clock or an explicitly staged timeline.

## A lock needs an ownership protocol

A key that says “locked” does not identify who may release it. A lock value should carry an ownership token, and release should check that token atomically. Otherwise, a delayed old owner can remove a newer owner's lock after its own lease expired.

A lease also does not stop the old owner from continuing to execute. If a paused worker resumes after expiration, it can still write to an external resource unless that resource rejects stale ownership. Fencing tokens or a destination-side consistency mechanism may be needed for correctness-sensitive operations.

This is why a distributed lock should not be introduced merely to avoid thinking about the underlying invariant. Sometimes a unique constraint or a conditional database update expresses the rule more directly and with a clearer failure boundary.

## Persistence and eviction affect the meaning of state

A cache can often tolerate eviction; a deduplication record or queued intent may not. Mixing these workloads under one memory and eviction policy deserves careful review. A process that is healthy and responsive can still have discarded state the application assumed was durable.

Persistence configuration, replication, and acknowledgment behavior should be documented with the application's recovery expectations. An in-memory write acknowledged to a client is not automatically equivalent to a committed transaction in another database.

## Validation and references

No Redis server was started for this revision. The examples are design analyses reviewed against upstream documentation, not performance or failover claims. A real acceptance suite should cover a worker crash before and after its effect, expired deduplication state, a stale lease owner, and the exact rate-window boundary.

- [Redis XACK](https://redis.io/docs/latest/commands/xack/), for acknowledgment semantics.
- [Redis Pub/Sub](https://redis.io/docs/latest/develop/pubsub/).
- [Redis persistence](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/).
- [Event-driven recovery](/articles/event-driven-architecture-kafka).
