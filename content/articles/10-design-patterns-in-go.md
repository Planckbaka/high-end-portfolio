---
title: "Ten Go Design Patterns, Judged by Their Tradeoffs"
date: "2025-12-23"
updatedAt: "2026-09-09"
category: "Go"
excerpt: "Constructors, small interfaces, options, adapters, and other patterns are useful when they clarify ownership and failure\u2014not when they make a service look more sophisticated."
lang: "en"
tags: ["Go design", "interfaces", "errors", "maintainability"]
featured: false
draft: false
---

## Patterns should explain a design decision

A catalog of patterns can help name recurring problems. It can also encourage an implementation to accumulate interfaces and factories before there is any variation to manage. In Go, the useful question is what becomes easier to understand, change, or test after a pattern is introduced.

This revised note keeps ten familiar patterns, but evaluates each through a concrete backend concern. There is no claim that memorizing them separates junior and senior engineers. The evidence is in the resulting code: dependencies are visible, failure paths are intentional, and the abstraction is smaller than the problem it solves.

## 1. Constructors establish valid state

A constructor is useful when a value must satisfy an invariant before use. A concurrency gate, for example, rejects a nonpositive capacity. Returning an error at construction is clearer than allowing the first request to discover a configuration problem. Go does not require constructors, and a useful zero value is often even simpler.

Prefer concrete parameter types when the dependency has no meaningful variation. Avoid accepting a broad configuration bag merely because it may grow later. Construction should reveal what the object actually requires, including resources that must eventually be closed.

## 2. Consumer-owned interfaces describe a need

A service that only reads one kind of record should not depend on an interface containing every database operation. Define the small interface near the consumer. This makes a test substitute easier to write and limits the assumptions the service can make.

An interface is not automatically a boundary against change. If it exposes storage-specific transactions and query builders, callers still depend on those semantics. The abstraction should preserve the operations the domain needs rather than renaming a database client method for method.

## 3. Functional options manage genuine optionality

Functional options can make a constructor with several independent optional settings readable. They are less useful when there are only two required arguments. Options need defaults and validation; the pattern does not decide whether contradictory options should fail or override one another.

Repeated options are another hidden policy. If two options set the same timeout, the implementation may use the last value, but that should be predictable. Do not allow option functions to begin background work during configuration unless the lifecycle is explicit.

## 4. Repositories protect a domain boundary

A repository can express operations such as reserving inventory or loading an aggregate. That is useful when it keeps query details out of business logic. A generic CRUD wrapper often hides little and can make transaction ownership harder to see.

The important test is an invariant across operations. If reserving stock requires an atomic conditional update, splitting it into `Get` and `Save` methods may encourage a race. A smaller domain operation can be safer than a more flexible-looking storage interface.

## 5. Error wrapping preserves inspectable causes

Wrapping an error with `%w` adds context while allowing callers to inspect the chain with `errors.Is` and `errors.As`. It does not automatically capture a stack trace. This corrects a common overstatement in explanations of Go error handling.

Decide which errors form part of a public contract. Exposing every storage error through a service boundary can couple callers to an implementation detail. Translate errors where the domain needs a stable meaning, and log them at an ownership boundary that avoids duplicate reports.

## 6. Middleware owns cross-cutting request behavior

Middleware works well for behavior such as request identification, authentication, or timing around an HTTP handler. Its ordering is observable. A timer outside authentication includes rejected requests; a timer inside it may not. A recovery boundary only covers work executed within that boundary.

Avoid hiding domain decisions in a global chain. A route-specific authorization rule belongs close enough to the route that a reviewer can discover it. Middleware also needs cancellation propagation and must not retain request objects in unowned background goroutines.

## 7. Context carries a request lifetime

Context is a standard propagation mechanism rather than a substitute for every function parameter. Use it for deadlines, cancellation, and narrowly scoped request values. Required business arguments should remain explicit parameters.

Calling `cancel` signals intent; it does not prove that a goroutine stopped. A worker must observe the signal, and its owner must wait for completion where that matters. The [bounded concurrency lab](/articles/go-bounded-concurrency) demonstrates this difference with a drain barrier and failure tests.

## 8. Strategies isolate a changing policy

A strategy can represent an operation whose implementation genuinely varies, such as choosing a retry decision or a pricing rule. A function value may be sufficient; a large interface hierarchy is not required. Keep the strategy's inputs and outputs small enough to test directly.

A strategy should not smuggle in unrelated state transitions. If selecting a policy also opens connections or changes global configuration, the call site becomes difficult to reason about. Separate choosing behavior from owning expensive resources.

## 9. Adapters preserve meaning across boundaries

An adapter translates a foreign API into the contract the application expects. Renaming fields is the easy part. Timeouts, partial results, error categories, and cancellation are where compatibility usually becomes interesting.

For a model provider, a stream fragment is not necessarily a complete tool request. An adapter must establish completion before the agent loop executes anything. The [agent-loop article](/articles/go-agent-loop) separates that provider boundary from the host's state transitions.

## 10. Factories centralize construction choices

A factory is useful when runtime configuration chooses among concrete implementations. Unknown values should fail explicitly rather than return a nil dependency that causes a panic later. The factory should also explain who closes resources created during partial initialization.

If there is one implementation, direct construction is often clearer. The existence of a future alternative is not sufficient evidence to introduce indirection everywhere. Add the factory when it collects a real choice that otherwise leaks through many call sites.

## Review the combined design

These patterns interact. A factory can call constructors, which accept small interfaces and options; middleware can invoke a service that returns wrapped errors. Combining every pattern is not the goal. A good review follows one request and asks whether each layer earns its place.

Test invalid construction, dependency failure, cancellation, and cleanup alongside the happy path. Use deterministic substitutes for external systems, then add integration tests where their semantics matter. A mock repository does not validate database isolation, just as a mock model does not validate a provider protocol.

This note is a design review guide, not ten independent runnable programs. The accompanying Go labs provide executable examples of constructor validation, explicit errors, function-based strategies, and cancellation ownership. Run `go test -race ./...` from `labs/go` to inspect those behaviors.

## Sources and attribution

The earlier version linked to [Coding Plain English's pattern list](https://medium.com/@codingplainenglish/10-design-patterns-in-go-that-separate-juniors-from-seniors-ed2bdf70d1bc). That historical attribution is retained; this revision is an independently written review of tradeoffs.

For language behavior, consult [Effective Go](https://go.dev/doc/effective_go), [errors](https://pkg.go.dev/errors), and [context](https://pkg.go.dev/context). Apply patterns to a concrete ownership or change problem, then verify the behavior they are supposed to improve.
