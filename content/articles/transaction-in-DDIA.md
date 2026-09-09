---
title: "Transactions and Isolation: Reading DDIA Through Failure Cases"
date: "2025-12-31"
updatedAt: "2026-09-09"
category: "Systems"
excerpt: "Separate atomicity, durability, and isolation, then use concrete concurrent schedules to understand what a transaction does\u2014and what it does not guarantee."
lang: "en"
tags: ["transactions", "DDIA", "isolation", "PostgreSQL"]
featured: false
draft: false
---

## Start with the invariant

Two requests try to reserve the last item in stock. Both read a quantity of one. Both decide that a reservation is allowed. If each writes a new quantity of zero, the stored number can look reasonable while two reservations have been created. The problem is not simply that a write failed; the concurrent schedule violated a business invariant.

This article is a revised reading note inspired by *Designing Data-Intensive Applications*. The explanation and schedules are independently written. It does not reproduce a book chapter, and the SQL discussion below is not a report of a database experiment run during this revision.

Before choosing an isolation level, state what must remain true. “Stock never goes below zero” is different from “at most one reservation exists for the last unit.” An implementation can satisfy a counter constraint while allowing inconsistent records elsewhere.

## Atomicity is about a unit of change

Atomicity lets a transaction's changes succeed or fail as a unit according to the database's contract. It does not automatically include an email, HTTP request, or message broker outside that transaction. Sending a notification inside a database transaction block does not make the notification rollback-capable.

A useful application design keeps irreversible external effects out of an uncertain commit path. Record an intent transactionally and deliver it afterward with a recovery protocol. The resulting delivery may repeat, so the receiver still needs deduplication or idempotent behavior.

A lost connection during commit can leave the client uncertain about whether the transaction committed. Retrying the whole business operation without an identifier can duplicate it. Atomicity inside the database does not eliminate uncertainty at the client boundary.

## Consistency requires the application to say what is valid

The “C” in ACID is not the same as a distributed consistency model such as linearizability. In the transaction discussion, it concerns preserving valid states and constraints. A database can enforce declared constraints, but it cannot infer every business rule from a table name.

Use unique constraints and conditional updates where they encode the invariant directly. A check performed only in application code can race with another request. For relationships across rows, the required protection depends on the query, locking, isolation, and database behavior.

The best design often combines mechanisms: a unique key identifies a business operation, a conditional update prevents overselling, and a transaction groups the related records. No single acronym substitutes for that concrete design.

## Isolation is a set of allowed schedules

Read Committed can provide a fresh committed view for each statement. A later statement may therefore see changes that were not visible to an earlier one. A repeatable snapshot offers a different view, but snapshot stability alone does not rule out every multi-row anomaly.

Consider two on-call doctors. Each transaction observes that the other doctor is on call, then marks its own doctor off call. The transactions update different rows. A snapshot-based execution can let both decisions proceed unless additional protection prevents the combined invalid state.

Serializable isolation aims for an outcome equivalent to some serial ordering of committed transactions. That does not mean concurrent execution is physically disabled, and applications must handle transactions that the database aborts to preserve the guarantee. Retrying requires restarting the relevant transaction logic, not just its final statement.

PostgreSQL's documented behavior is more specific than a generic SQL isolation table: its Repeatable Read prevents phantom reads but can still permit serialization anomalies. Its Read Uncommitted behaves as Read Committed. These are database-specific details, so a cross-database article should not flatten them into one universal implementation.

## Prefer an atomic operation when it expresses the rule

For a simple stock counter, an update conditioned on positive stock can combine checking and modification. The caller inspects the affected-row count to distinguish success from no available stock. This avoids a separate application-level read followed by an unconditional write.

That still leaves related effects to handle. If the operation also inserts a reservation, both changes need an appropriate transaction boundary. If it calls another service, that call introduces a distributed protocol problem. Start with the smallest invariant and expand the boundary only when required.

Locks can also protect a decision, but their scope matters. Locking the rows already returned by a query may not protect the absence of another matching row. Predicate-based invariants deserve careful review against the database's concurrency model.

## Durability has an operational context

Durability concerns persistence of committed changes under the database's stated failure assumptions. It does not imply that a replica immediately exposes the change or that a backup exists. Replication lag, recovery settings, storage failures, and acknowledgment policy affect the operational story.

A recovery exercise should verify both data and application interpretation. Restoring rows is insufficient if external consumers have already acted on a different view or if an application replays an operation without its deduplication records.

## How to turn the note into an experiment

Use two database sessions and a written sequence of reads, writes, and commits. Establish the initial state, run the schedule at the selected isolation level, and inspect both return values and final rows. Record the database version and every session's transaction settings.

Add a retry test for serialization failures and a duplicate-operation test for uncertain client outcomes. Confirm that retries do not emit external side effects twice. These experiments require a real database; a mocked repository cannot reproduce its locking or snapshot semantics.

## References

- [Designing Data-Intensive Applications](https://dataintensive.net/), the source of the reading theme.
- [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html).
- [Event-driven reliability and outbox boundaries](/articles/event-driven-architecture-kafka).
