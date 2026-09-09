---
title: "Inside a Go Agent Loop: Tool Calls, State Transitions, and Failure Recovery"
date: "2026-09-09"
updatedAt: "2026-09-09"
category: "Go"
excerpt: "An agent is a state machine around unreliable boundaries. Build a deterministic loop that makes tool identity, errors, cancellation, and termination inspectable."
lang: "en"
tags: ["agent", "tool calls", "state machines", "failure recovery"]
featured: false
draft: false
series: "Engineering Reliable Model Systems"
seriesOrder: 2
labPath: "labs/go/agent"
---

## An agent is more than a repeated model call

A model returns a tool request. The program parses it, runs a function, appends a result, and asks the model what to do next. That description is short enough to hide nearly every interesting failure. The model may return malformed arguments. A tool may fail after doing some work. Cancellation may arrive between a response and execution. The loop may continue requesting tools without producing a final answer.

The useful unit of design is therefore a transition with an owner and an observable outcome. What state is appended before a tool starts? How does the next model call identify the result? Which failures can be offered back to the model, and which terminate the run? What prevents a late completion from being accepted after the user has canceled?

This article is informed by inspection of the local `pi-go` agent loop and its tests. That project ports the upstream pi agent into Go and has a much richer event model, including streaming and session concerns. The companion lab is an original reduced implementation. It does not claim wire compatibility, reproduce every upstream hook, or call a paid model API.

## Reduce the protocol until its lifecycle is visible

The lab model accepts a context and a transcript, and returns either text or one tool call. A tool call has an ID, a name, and raw JSON arguments. The tool registry maps names to functions. Each function receives the same context and returns text or an error.

The transcript uses explicit roles and a call identifier. A tool result without an identifier is ambiguous as soon as more than one request can exist. Even though this lab executes one tool per turn, it retains the identifier because it is part of the causal relationship, not an optimization for parallelism.

The result contains both messages and lifecycle events. Messages are the context for the next model step. Events explain what the program did. Combining these concepts into one generic log tends to make both uses awkward: a model does not need every diagnostic event, while a debugger needs transitions that should not be sent as conversational content.

A positive step budget limits model calls. A run that uses its final permitted model call to request another tool can execute that call and then terminate with a step-limit error. That convention is documented rather than hidden in an off-by-one assumption. There is no additional model call after the budget is exhausted.

## Read the loop as a sequence of commit points

<!-- lab: labs/go/agent/agent.go#loop -->

At each iteration, the loop checks its context, asks the model for a response, and checks the context again. The second check matters. The model function could return a valid response immediately after cancellation; accepting that response unconditionally could start a tool the user no longer wants.

A response containing text and no tool ends normally. A tool call must have a nonempty name and ID, and its ID must not have appeared earlier in this run. A repeated identifier is rejected before execution. This is a local transcript invariant. It is not durable idempotency across process restarts or a guarantee against the model requesting equivalent work under a different ID.

After validation, the loop appends the assistant's call and emits `tool_start`. It looks up the tool, executes it when available, and records a matching result. Ordinary tool errors become result text so that the scripted model can demonstrate recovery on the next step. Cancellation takes precedence over accepting a returned tool output.

The final event is emitted through a defer. A successful run ends with `complete`; an error ends with `failed`. This makes the terminal outcome observable on early returns as well as the normal path. The event model is intentionally small. A canceled tool can have a start event without an end event, followed by the run's failure event. Consumers must not interpret that as successful completion of the tool.

## Argument validation belongs at the execution boundary

The included `add` tool has no filesystem, shell, or network effects. It requires two integer arguments and rejects unknown fields, missing fields, null values, trailing JSON, and numbers outside a small teaching range. Restricting the range prevents an arithmetic-overflow distraction from weakening the example's contract.

Using pointers for the decoded integers distinguishes a missing argument from an explicit zero. Without that distinction, an absent field could silently acquire a zero value and change the operation's meaning. Disallowing unknown fields catches a misspelled argument instead of quietly ignoring it. Checking that the next decode returns EOF prevents accepting two JSON objects when one was expected.

A schema advertised to a model is helpful, but it does not replace runtime validation. The loop's caller can be a test, a provider adapter, a replay file, or a future protocol implementation. Each is capable of presenting malformed data. The tool boundary is where the program must enforce the contract that actual execution depends on.

For a side-effecting tool, validation is only one layer. A valid file path could still point outside the permitted workspace. A valid command string could still request an unauthorized action. Those authorization concerns are deliberately outside this arithmetic lab, and should be handled before execution in a real system.

## Recovery is a policy, not a catch-all

Some failures are useful feedback for another model step. An unknown tool name or a rejected argument can become a tool error message, allowing the model to choose an available tool or correct its input. The lab demonstrates this with a deterministic script: first request malformed arguments, then return a final explanation after seeing the error result.

Other failures end the run. A provider error means the model step itself did not produce a usable response. Cancellation means the owner wants the operation to stop. An exhausted budget means the system's resource policy has been reached. Returning these conditions as ordinary tool content would blur whether the system actually permits another attempt.

Even a recoverable error should not cause the host to retry a side effect automatically. Imagine that a payment-like tool commits an operation and then loses its response. A model might infer that retrying is appropriate, but the system needs an idempotency key and a way to discover the first operation's outcome. The transcript is not a transaction log.

The lab's duplicate-call check provides a small example of defensive bookkeeping while keeping this distinction explicit. It can prevent execution of the exact same local identifier twice. It cannot prove that two differently identified requests are semantically different. A real operation should use domain-specific deduplication where necessary.

## Keep state ownership simple

The model receives a copy of the message slice. The message elements contain strings, so the copy prevents the model substitute from replacing transcript entries in the loop's backing slice. If messages later contain maps, byte buffers, or nested slices, this shallow copy would no longer provide the same isolation. The type's shape is part of the ownership argument.

The loop is sequential. There is one model step and at most one active tool call at a time. Parallel tools would require deciding event ordering, partial-failure behavior, concurrency limits, and whether results are appended by completion order or request order. Those are meaningful features, but they would obscure the first lesson if introduced before the sequential contract is tested.

The tool registry should remain immutable for the run. Concurrently mutating a Go map used by the loop would violate its assumptions. A production registry can be constructed once or published as an immutable snapshot. Adding a lock everywhere is not a substitute for deciding when configuration is allowed to change.

The context is shared down the call chain. That does not make blocking functions cancelable by itself. A tool that ignores cancellation can keep the call blocked even after the context expires. Moving it into an unowned goroutine and returning early would merely hide the unfinished work. For untrusted or noncooperative execution, process-level isolation may be the appropriate boundary.

## Deterministic substitutes reveal more than a lucky live call

The model substitute is a sequence of responses. A successful test returns an addition call followed by the final answer. It verifies the tool's numerical result, the result's call ID, the transcript length, and the terminal event. The test is about the host loop's behavior; it makes no claim about a real model's likelihood of choosing the tool correctly.

Malformed-argument tests cover invalid JSON, missing values, unknown fields, trailing data, and nulls. Failure tests cover an unavailable tool, a model error, a duplicate identifier, budget exhaustion, cancellation after the model returns, and cancellation inside a tool. Each fixture reaches a particular transition deliberately.

Run the lab from the repository root:

```bash
cd labs/go
go test -race ./agent
```

The local tests pass with the race detector. They do not validate provider streaming formats, tool-schema support, token accounting, or the full pi-go protocol. Those require separate adapter and integration tests. A live model call is useful later, but a successful live response is poor evidence for cancellation paths it never exercised.

The most revealing test cancels the context inside the model function immediately before returning a tool request. Without the post-model cancellation check, the host would execute the tool. This is the kind of boundary bug that a polished demo rarely exposes and a small deterministic fixture can reproduce reliably.

## What changes when the model streams

A streaming adapter receives fragments before it has a complete assistant message. Tool names and JSON arguments can arrive in pieces. The host must distinguish provisional fragments from an executable tool request. Executing a partial request because it happens to parse at one moment is an unsafe commitment: later fragments may change the meaning or reveal truncation.

The adapter should produce a completed message with an explicit termination reason. The loop should refuse execution when the provider reports a failed or truncated response. This is a major area where the inspected pi-go implementation is richer than the companion lab. Keeping that boundary visible prevents the teaching code from being mistaken for a ready-made provider integration.

Streaming also affects events. UI progress can be provisional while the transcript remains uncommitted. A cancellation should stop further visible updates and prevent late chunks from reviving an old run. A session generation number or run identity can fence stale callbacks when a user starts a replacement operation. That is a separate concern from the local tool call ID.

## Use the small loop as a review lens

When reading a larger agent implementation, trace one request across three boundaries: provider output, tool execution, and transcript update. At each boundary, ask which values are provisional, which checks authorize the next step, and what event indicates termination. Then construct the smallest fixture that could falsify the expected behavior.

This approach turns “agent reliability” into a set of inspectable contracts. It also gives a clearer project story: the contribution is the state model, failure policy, and tests, rather than the existence of a loop that can call a model repeatedly. Good orchestration code makes its own limits understandable.

## References

- [pi-mono](https://github.com/earendil-works/pi-mono), the upstream project behind the local pi-go rewrite.
- [encoding/json](https://pkg.go.dev/encoding/json), including decoder validation behavior.
- [context](https://pkg.go.dev/context), for ownership of cancellation and deadlines.
- [Bounded concurrency](/articles/go-bounded-concurrency), for admission before spawning work.
