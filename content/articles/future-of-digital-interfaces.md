---
title: "Interfaces for Uncertain Work: Progress, Evidence, and Recovery"
date: "2024-10-24"
updatedAt: "2026-09-09"
category: "Interface"
excerpt: "AI interfaces need to distinguish activity from success. Make provisional output, cancellation, failures, and supporting evidence understandable to the person using the system."
lang: "en"
tags: ["interface design", "AI systems", "accessibility", "state"]
featured: false
draft: false
---

## A moving indicator is not an explanation

When a system performs uncertain or long-running work, a spinner communicates only that the interface is waiting. It does not tell the user whether the request was accepted, whether computation started, or whether a partial result is safe to use. Adding more animation does not supply the missing state model.

AI-oriented interfaces make this problem visible because output often arrives incrementally and may require external tool execution. The user can see text while the underlying operation is still incomplete. A good interface distinguishes what has happened from what the system merely intends to do next.

This article is a design analysis for technical tools and the accompanying engineering blog. It makes no forecast that a particular interaction style will replace all existing interfaces.

## Name the states that affect a decision

A useful operation might move through accepted, waiting, running, partially available, completed, failed, or canceled states. The interface does not need to expose every internal implementation detail, but it should communicate the distinctions that change the user's next action.

For example, “waiting for capacity” is more useful than “processing” when work has not started. “Partial result; connection ended” is more useful than presenting an incomplete stream as a finished answer. “Cancellation requested” may need to precede “stopped” when cleanup takes time.

Avoid making a state look more certain than the underlying protocol supports. If a server cannot determine whether an external side effect completed after a timeout, the interface should support checking the operation's status rather than inviting an unqualified retry.

## Separate provisional content from committed results

Streaming text can improve perceived responsiveness, but a fragment is not always a complete result. Tool arguments may arrive in pieces, and a generated explanation may refer to work that has not executed. The host should not treat visible text as authority to claim completion.

A technical interface can attach evidence to the completed result: a test report, a source file, a measurement record, or a verified operation identifier. That gives the user a way to inspect the claim. Evidence should be close enough to the claim that it does not become a disconnected “sources” panel nobody can map back to the result.

The blog follows the same principle. A runnable lab link accompanies an article that discusses an implementation. CPU measurements are identified as CPU measurements, and theoretical deployment guidance is separated from an actual deployment report.

## Cancellation needs honest feedback

A cancel button establishes an expectation that the system will stop consuming resources or changing state. In practice, cancellation can be cooperative and delayed. The interface should explain that transition without continuing to display late output as if the request were active.

A replacement request introduces another risk: old callbacks can update the new request's view. A run identity helps reject stale updates. The user-facing benefit is simple—the result on screen belongs to the operation the user is currently following.

Canceling a wait does not necessarily undo a completed side effect. For operations with external consequences, provide a separate status or recovery path. The visual state should not turn uncertain completion into a false promise that nothing happened.

## Recovery should preserve useful context

A failed form submission should retain the user's message. An unavailable clipboard should offer a clear alternative. A failed search should distinguish no matching results from a failure to load the index. These are small details that make an interface feel dependable.

Retry controls should state what will be retried. Retrying a read is different from repeating a side effect. When a stable operation identifier exists, the interface can use it to inspect or resume the same operation rather than accidentally creating another one.

Error text should be specific enough to guide the next step without exposing sensitive internals. A raw stack trace is rarely useful to the person filling in a contact form. A generic “something went wrong” is insufficient when a field can be corrected locally.

## Accessibility is part of the state model

A status that changes visually should also be available to assistive technology when it matters. Live regions can announce a successful submission or a failure without moving focus unexpectedly. They should not announce every streamed token and overwhelm the user with continuous interruption.

Keyboard users need visible focus and logical order. A menu's expanded state, a button's disabled state, and a selected filter should be represented semantically. Color can reinforce these distinctions, but should not be the only signal.

The blog's contact form keeps one persistent status region. Its code-copy control announces success or a clipboard limitation. These small interactions are easier to verify than a large animation sequence and directly support the reader's task.

## Measure outcomes, not visual excitement

Useful interface checks include whether a reader can locate the relevant article, copy a code sample, understand a failed submission, and navigate a long page by headings. A screenshot can reveal hierarchy and spacing, but not prove those behaviors.

Conversely, automated tests can verify labels and state transitions while missing a nearly invisible text color or a broken stylesheet. Combine behavioral tests with browser inspection at realistic widths and both themes. The implementation should work in the conditions the user actually encounters, not only in a carefully recorded demo.

## References

- [MDN aria-live](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-live), for announcing dynamic changes.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/), for accessibility requirements.
- [Motion and reading](/articles/mastering-framer-motion).
- [Agent-loop state transitions](/articles/go-agent-loop).
