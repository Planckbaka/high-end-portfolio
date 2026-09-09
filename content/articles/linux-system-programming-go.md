---
title: "Linux System Programming in Go: Own the Process Lifecycle"
date: "2024-02-15"
updatedAt: "2026-09-09"
category: "Systems"
excerpt: "File descriptors, subprocesses, signals, and cancellation cross the boundary between Go and the operating system. Trace their ownership before building a supervisor."
lang: "en"
tags: ["Linux", "Go", "processes", "resource lifecycle"]
featured: false
draft: false
---

## The runtime does not own everything for you

Go manages goroutines and memory, but operating-system resources still have lifetimes. A file descriptor can remain open after the function that created it returns. A child process can continue after its parent stops waiting. A pipe can keep a read blocked because some process still holds its write end.

System programming becomes easier to reason about when each resource has an owner, a termination condition, and a cleanup path. This is the same discipline used for backend requests, applied below the HTTP layer.

This note explains process and descriptor boundaries. Its Linux-specific discussion is source-reviewed; the blog revision was performed on macOS and does not claim a Linux namespace or container-runtime experiment.

## Start with descriptors and blocking operations

A file descriptor is a process-local handle to an operating-system resource. The Go wrapper object does not remove the need to close it. Use a cleanup path that covers both successful processing and early errors, and decide how close errors matter for the operation.

For output files, a successful write does not necessarily mean the data has reached durable storage. Buffering and synchronization policy are part of the storage contract. For network connections, closing can be necessary to interrupt blocked activity, but the behavior depends on the resource and API being used.

A blocked goroutine is not always a CPU problem. It may be waiting on a descriptor, a channel, a mutex, or another process. A useful diagnosis combines goroutine stacks with an understanding of the external resource; simply increasing `GOMAXPROCS` does not unblock a pipe whose writer never closes.

## An executable and a shell command are different inputs

Go's `os/exec` package normally starts an executable with an argument list. It does not interpret shell pipelines, redirections, or wildcard expansion. That distinction is useful because arguments can remain separate values instead of being assembled into a shell program.

A conceptual invocation has this shape:

```text
executable: /usr/bin/example
arguments:  ["--format", "json", "a value containing spaces"]
```

Introducing a shell changes the interpretation boundary. Characters that were ordinary argument content can become shell syntax. Use a shell only when its language is actually required, and avoid interpolating untrusted values into command text.

Executable lookup is also a policy. Relying on an unexpected working directory or an uncontrolled search path can run a different program than intended. A service should make that environment part of its configuration and tests.

## Starting is not reaping

Starting a process and waiting for it are separate operations. The owner must arrange to observe termination and release process resources. Returning from an HTTP handler does not automatically wait for a subprocess it launched.

When stdout and stderr are piped, consume them in a way that avoids deadlock. A child can block writing one full pipe while the parent waits for the other. Collecting all output into memory also needs a size bound; a faulty child can otherwise consume the parent's memory through diagnostic output.

A supervisor should preserve exit status and relevant error classification. “Command failed” loses the distinction between failure to start, a nonzero child exit, cancellation, and an output-handling failure. Those distinctions affect retry and debugging decisions.

## Cancellation must reach the right boundary

`CommandContext` connects context completion to cancellation behavior for a command. It is useful, but it should not be treated as a universal process-tree supervisor. Child processes, inherited descriptors, and platform-specific process groups can extend the lifecycle beyond the direct child.

If a child launches grandchildren that retain pipe handles, the parent may still wait for output closure after the direct child exits. A robust design needs a policy for process groups, termination grace, forced termination, and bounded waiting. The exact implementation is operating-system-specific.

Do not hide unfinished process work behind a goroutine that is never joined. Returning early can make the caller look responsive while the resource leak remains. An explicit job or supervisor owns work that is intended to outlive a request.

## Signals are requests for a state transition

A service receiving a termination signal should stop admitting new work, let accepted work finish within a budget, and release resources in a defined order. A signal handler that immediately closes every shared resource can cause admitted work to fail mid-operation.

Use the signal to trigger normal control flow rather than placing complex business logic in an improvised global callback. Go's signal-aware context facilities provide a convenient bridge into that flow. The [bounded admission lab](/articles/go-bounded-concurrency) isolates the draining portion without requiring real signals or a server.

A grace timeout should produce an observable outcome. It may be necessary to force close resources after the budget expires, but record that this was forced termination rather than a clean drain. Those outcomes have different implications for recovery.

## Containers add isolation mechanisms, not automatic safety

Linux namespaces and cgroups address different aspects of isolation and resource control. A namespace view alone does not supply a complete sandbox, and a resource limit alone does not restrict access to sensitive files. A container-runtime tutorial that only launches a process in one namespace is a mechanism demonstration.

For untrusted execution, filesystem access, capabilities, system calls, networking, user identity, and lifecycle controls need a coherent boundary. This article intentionally does not provide a minimal container implementation and label it secure.

## Validation and references

A practical test suite for a process supervisor would include excessive output, nonzero exit, cancellation, a child that ignores graceful termination, and inherited pipes held open by descendants. Run those tests on the target operating system and record the actual behavior.

- [Go os/exec](https://pkg.go.dev/os/exec), for process execution and pipe lifecycle.
- [Go os/signal](https://pkg.go.dev/os/signal), for signal integration.
- [Linux namespaces overview](https://man7.org/linux/man-pages/man7/namespaces.7.html).
- [Linux cgroups overview](https://man7.org/linux/man-pages/man7/cgroups.7.html).
