---
title: "Kubernetes for Backend Developers: Readiness, Resources, and Shutdown"
date: "2024-04-10"
updatedAt: "2026-09-09"
category: "Systems"
excerpt: "A Deployment can restart a process without making its service correct. Connect probes, resource settings, and termination to the application lifecycle."
lang: "en"
tags: ["Kubernetes", "readiness", "shutdown", "resources"]
featured: false
draft: false
---

## A running Pod is not a completed request

Kubernetes manages desired workload state, but it does not know the meaning of a successful application operation. A process can be running while it rejects every useful request. A Pod can restart successfully after losing an in-memory job. A rollout can look healthy while long-running streams are repeatedly interrupted.

For a backend developer, the useful entry point is the application's lifecycle: when it may accept work, how much work it can handle, and what happens to accepted work during termination. The Kubernetes objects should express that lifecycle rather than substitute for it.

This article is a deployment review guide. No Kubernetes cluster was exercised during the blog revision. Examples describe intended behavior that must be verified in a target environment.

## Give each probe a distinct question

A readiness probe asks whether the workload should receive traffic. A liveness probe supports detecting a process that needs restarting. A startup probe provides a separate way to allow initialization before the other checks become active according to the configured behavior.

These should not all be aliases for a costly dependency check. If every application replica marks itself unhealthy whenever a shared database slows down, aggressive restarts can increase load without fixing the shared problem. Decide whether the process can recover locally or whether restarting it changes anything useful.

Readiness can include a local draining flag. When termination begins, the application stops admitting new work and reports that state. This still does not mean every routing component instantly stops sending requests; the process needs a policy for requests that arrive during propagation.

## Resource settings meet application admission

CPU and memory settings affect scheduling and runtime behavior, but they do not decide how many requests your application should admit. A service can accept more work than its memory budget supports even when its container has a memory limit.

For model-serving workloads, request cost can vary with context length and retained KV state. A count-based concurrency gate is a useful first boundary, but it may need a workload-aware memory estimate. The [KV Cache lab](/articles/kv-cache-tiny-decoder) explains one component of that estimate without claiming a complete GPU budget.

Memory pressure and CPU contention can also change latency. A benchmark recorded on an otherwise idle machine does not describe a constrained container sharing a node. Record resource configuration with performance results so that later comparisons have a meaningful baseline.

## Connect termination to a drain protocol

The desired sequence is conceptually simple:

```text
termination requested
  → stop admission
  → finish or cancel accepted work within budget
  → close shared resources
  → exit
```

The actual deployment includes routing propagation, process signal delivery, and the configured termination grace period. The application should keep its own budget consistent with the surrounding grace allowance rather than assume an unlimited wait.

A long-running stream is a useful test case. Start it, initiate termination, and observe whether it completes, receives a documented terminal outcome, or disappears unexpectedly. Repeat with an operation longer than the grace budget. Record forced termination separately from graceful completion.

The [Go gate experiment](/articles/go-bounded-concurrency) demonstrates the application-side admission and waiting contract. It does not prove Kubernetes routing or signal timing because it never starts a cluster.

## Configuration is part of compatibility

A ConfigMap provides configuration data; a Secret provides a mechanism for handling sensitive configuration. Neither removes the need to control access, avoid logging values, and define what a configuration change means to a running process.

Some settings are read only at startup. Others can be reloaded. A rollout strategy must reflect that distinction. If a new setting changes a protocol or database expectation, old and new replicas may coexist during deployment and must remain compatible during that overlap.

A readiness check that only verifies the process is listening may miss a migration incompatibility. Conversely, a check that performs destructive or expensive work on every probe can create its own failure. Keep health signals cheap, interpretable, and tied to a deliberate state model.

## Test the rollout as a workload experiment

A useful acceptance run sends representative requests while scaling, restarting, and rolling out the service. Track attempted, completed, failed, and canceled work alongside latency. A deployment that maintains a green Pod count but drops operations has not met an application-level objective.

For queued work, restart a worker after the effect commits but before acknowledgment. Verify that recovery does not duplicate an externally visible effect. For HTTP work, inspect connection handling and client retries. The orchestration platform does not choose the correct retry semantics for the business operation.

Keep manifests small enough to explain. Every probe threshold, resource setting, and termination parameter should have a workload or operational reason. Copying a production-looking YAML template without testing its behavior produces configuration, not deployment evidence.

## References

- [Kubernetes Pod probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/).
- [Kubernetes resource management](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/).
- [Kubernetes Pod lifecycle](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/).
- [Model workload cancellation](/articles/python-structured-concurrency).
