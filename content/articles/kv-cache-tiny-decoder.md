---
title: "KV Cache Explained Through a Tiny Decoder"
date: "2026-09-09"
updatedAt: "2026-09-09"
category: "LLM"
excerpt: "Compare full-prefix and incremental decoding in the same CPU model. Verify positions, logits, cache growth, and measurement boundaries before claiming a speedup."
lang: "en"
tags: ["KV cache", "decoder", "PyTorch", "CPU benchmark"]
featured: false
draft: false
series: "Engineering Reliable Model Systems"
seriesOrder: 6
labPath: "labs/llm/kv-cache"
---

## The repeated computation hiding in generation

At decoding step ten, a decoder needs information from the previous positions. A straightforward implementation passes the entire prefix through the model again. That recomputes key and value projections for positions whose hidden states are already determined by the same causal prefix. A KV cache retains those earlier keys and values and appends only the new ones.

The optimization introduces state. Once state survives between calls, correctness depends on which request owns it, which positions it represents, and whether the model configuration remains the same. A cache that saves arithmetic but silently changes logits is not a successful optimization.

The companion experiment uses one random-weight decoder block on CPU. It includes token embeddings, learned position embeddings, normalization, multi-head attention, residual connections, a feed-forward network, and an output head. Full and cached execution use the same model object. No trained weights or language-quality claims are involved.

## Keep the baseline and the optimization comparable

The full-prefix path receives all tokens up to the current position and returns logits for that prefix. The incremental path receives only the new token plus the previous key and value tensors. Both paths use the same attention implementation and evaluation mode.

The test compares the last-position logits after every incremental step. Comparing generated text alone would be weaker: different logits can still produce the same argmax token. Conversely, a tiny numerical change near a tie could alter greedy generation while the underlying computation remains close. Numerical equivalence is the direct claim this lab can test.

The benchmark uses teacher-forced token IDs: both paths consume the same predetermined input sequence. That prevents generation decisions from changing the workload between modes. It is a computation comparison, not a test of whether the random model produces useful text.

One cache belongs to one request and is returned explicitly. The model does not store a mutable cache on itself. This makes independent calls easier to reason about and prevents a second request from inheriting the first request's prefix accidentally. It also makes the lifecycle visible in the caller's local variable.

## Positions are part of the cache contract

<!-- lab: labs/llm/kv-cache/decoder.py#decode -->

The previous key length supplies the offset. Learned position embeddings begin at that offset for new tokens. If every incremental call started positions at zero, token content might look correct while positional information was repeatedly reset. The result would generally disagree with full-prefix execution.

After projecting the new hidden states, the implementation concatenates previous and new keys and values along the sequence dimension. Queries remain limited to the newly processed positions. Attention uses the explicit offset-aware mask from the preceding article.

The residual and feed-forward operations apply to the new positions. Because this is a causal block, earlier positions do not need to change when future positions arrive. That causal invariance is what makes retaining their key and value projections valid for this model. A bidirectional operation would not support the same argument.

The cache shape is checked against batch size, head count, and feature width. The total position length must remain within the embedding table's capacity. These checks do not make the cache portable across different model weights or dtypes; they catch a useful subset of local mistakes. In this lab, the caller is responsible for keeping a cache with the model and request that created it.

## Why a rectangular mask is easy to get wrong

During ordinary one-token decoding, the new query sits after every cached prefix position. It should attend to the entire prefix and itself. A top-left triangular mask over a one-by-many score matrix would instead expose only the earliest key. The shape is valid, so this error can survive casual inspection.

The lab builds visibility from absolute query and key positions. With a prefix length of seven and a new chunk of five tokens, the first new query can see positions zero through seven; later queries in the chunk see progressively more of the chunk. This is also why the tests cover chunked prefill rather than only single-token steps.

The companion attention function supports a contiguous prefix followed by contiguous new positions. Sliding-window caches, evicted blocks, packed sequences, and shared prefixes require additional position metadata. Representing those systems with only a tensor length would lose information needed to decide what a query may attend to.

When a cached decoder disagrees with its baseline, inspect the earliest diverging position. A constant position reset often fails immediately after the first step. A bad chunk mask may pass single-token tests and fail only on multi-token appends. The shape of the failure can narrow the search before inspecting every tensor operation.

## Count the bytes that actually persist

For this ordinary multi-head cache, the key and value tensors each have shape `[B, H, T, D]`. Their combined element storage is `2 × B × H × T × D × bytes_per_element`. The factor two counts keys and values. A multi-layer decoder adds one such cache per layer, assuming the same dimensions for this simplified estimate.

At batch one, four heads, head width eight, and float32 storage, each retained position adds 256 bytes in this one-layer model. At 128 positions, the two cache tensors contain 32,768 bytes. The test calculates storage from tensor element counts and compares it with the formula after each incremental append.

That number is not total process memory. It excludes model weights, activations, allocator bookkeeping, Python objects, and temporary allocations. The concatenation operation also allocates a new combined tensor and copies earlier entries. A memory monitor can therefore observe a larger peak than the final cache's element storage.

Grouped-query attention uses fewer key/value heads than query heads, so the relevant cache head count is the KV head count. Quantized caches alter element representation and may add scales or metadata. A formula is useful when its assumptions are attached; reusing a full-MHA float32 estimate for a different cache format can produce a misleading capacity budget.

## Concatenation is clear, but it has a cost

This implementation uses `torch.cat` on every append. That makes the data flow easy to read and tests easy to construct, but it repeatedly copies the retained prefix. A production cache often uses preallocated storage or a block-based allocation scheme to avoid that repeated work.

Preallocation introduces its own choices: maximum capacity, current valid length, ownership of unused storage, and behavior when the limit is reached. Block-based caches add allocation and addressing metadata. Those mechanisms should preserve the same numerical semantics while changing how keys and values are stored and accessed.

The small implementation is therefore a reference point. It shows why retaining old projections can reduce repeated computation, while making clear that the cache mechanism itself is not free. A speed difference on this model reflects the balance among projections, attention, concatenation, and Python overhead at the tested sizes.

Do not extrapolate its result into a universal speedup factor. At short prefixes, fixed overhead can dominate. At longer prefixes, attention still has to read a growing set of keys and values. Eliminating recomputation does not eliminate the cost of attending to the prefix.

## Verify equivalence before measuring time

The first test walks a twelve-token, two-example input one position at a time. At each position it compares incremental last-token logits against full-prefix logits using explicit tolerances. It also checks the cache shape and expected bytes. This combines numerical and state-growth assertions.

The chunked-prefill test builds a seven-token cache, appends the remaining chunk, and compares all new logits against full-sequence execution. The request-isolation test calls the same model on another sequence between two identical calls; the results must match. A position-capacity test verifies that an oversized sequence fails explicitly.

```bash
labs/.venv/bin/python -m unittest discover -s labs/llm/kv-cache -p 'test_*.py' -v
```

All four tests pass on the recorded local CPU environment. Float32 comparisons use an absolute and relative tolerance of `1e-5`. This establishes the tested model's equivalence for those fixtures, not every precision, shape, or optimized kernel a larger system might use.

The tests execute under inference mode for the cache comparisons. Retaining a cache while building an autograd graph would retain additional graph state and change the memory behavior. Training-time attention and inference-time caching have different lifecycle requirements even when they share projection code.

## Record a controlled CPU measurement

The benchmark fixes the random seed, batch size, model dimensions, dtype, and CPU thread count. It performs one warmup for each mode, then seven repetitions. It alternates which mode runs first to reduce a systematic ordering advantage. Each recorded duration covers the entire teacher-forced decode loop at the selected sequence length.

```bash
labs/.venv/bin/python labs/llm/kv-cache/benchmark.py --output labs/results/cache-results.json
```

The recorded environment is Python 3.14.7 and PyTorch 2.14.0, with CPU execution and one Torch thread. The complete environment, raw repetitions, and medians are available in the [measurement record](/labs/results/cache-results.json). The table below is generated from that record during the site build.

<!-- result: cache -->

The cached path was faster at the measured lengths on this machine. The gap grew with prefix length in this run. That observation is consistent with avoiding repeated prefix work, but it does not isolate a single hardware bottleneck. This benchmark also includes the explicit cache concatenation cost and Python loop overhead.

The warmup policy excludes some first-use costs by design. The result is not a cold-start latency benchmark. It also does not include a network, request queue, tokenizer, trained-model sampling policy, or serving scheduler. Keeping those omissions visible makes the result useful without making it larger than its evidence.

## From tensor state to a serving-system budget

In a real service, each active request may retain a different amount of KV state. A limit on request count alone can be a poor memory budget if prompt and output lengths vary widely. Admission may need an estimate based on retained tokens and the model's cache representation, along with capacity for weights and temporary workspace.

Cancellation should release the request's cache ownership. A response path that returns to the client while a background decode loop continues can retain memory and computation beyond the request's visible lifetime. The bounded-work and cancellation principles from the Go and Python articles apply here to tensor state.

Prefix sharing can reduce duplicate cache storage, but then reference lifetimes and position identity matter. Eviction cannot remove a block still in use by another request. Those are systems problems built on the same small question the lab asks: which state belongs to this computation, and when is it no longer needed?

The next useful experiment is a real single-GPU model with a fixed workload, explicit context lengths, and client-visible measurements. This CPU lab supplies the conceptual baseline and numerical tests. It does not stand in for that hardware experiment.

## References

- [Causal attention](/articles/causal-attention), including offset-aware masking and reference comparisons.
- [PyTorch inference mode](https://docs.pytorch.org/docs/stable/generated/torch.autograd.grad_mode.inference_mode.html).
- [PyTorch tensor element size](https://docs.pytorch.org/docs/stable/generated/torch.Tensor.element_size.html).
- [PagedAttention paper](https://arxiv.org/abs/2309.06180), for a different, serving-oriented KV storage design.
