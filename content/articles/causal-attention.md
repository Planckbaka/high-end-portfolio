---
title: "Causal Attention from First Principles: Shapes, Masks, and Numerical Checks"
date: "2026-09-09"
updatedAt: "2026-09-09"
category: "LLM"
excerpt: "Implement causal attention on CPU, trace every tensor dimension, and test outputs and gradients against PyTorch before reasoning about performance."
lang: "en"
tags: ["PyTorch", "attention", "causal mask", "tensor shapes"]
featured: false
draft: false
series: "Engineering Reliable Model Systems"
seriesOrder: 5
labPath: "labs/llm/attention"
---

## Start with a claim you can falsify

Causal attention lets a position combine information from its own position and earlier positions while excluding later ones. That sentence is easy to repeat. A more useful understanding is an implementation whose output remains unchanged when future keys and values are modified, and whose gradients agree with a trusted reference.

The companion experiment uses random tensors on CPU. It does not train a language model or evaluate generated text. Its purpose is to make the dimensions, mask, normalization, and numerical assumptions visible. Starting at that scale keeps a fast GPU kernel from hiding an indexing mistake behind a plausible tensor shape.

The implementation covers ordinary multi-head attention with the same number of query, key, and value heads. Grouped-query attention requires a different relationship between those head counts. We will use the simpler case to establish the mechanics and explicitly identify the point where cached decoding changes the mask.

## Four dimensions, four distinct responsibilities

Queries have shape `[B, H, Tq, D]`: batch, heads, query positions, and features per head. Keys and values have shape `[B, H, Tk, D]`. The batch and head dimensions identify independent attention problems. The final feature dimension is reduced when a query is compared with a key.

Transposing the final two key dimensions gives `[B, H, D, Tk]`. Matrix multiplication with the queries produces scores of shape `[B, H, Tq, Tk]`. Each row contains one query position's scores against all visible key positions. Confusing `Tq` and `Tk` is easy when they happen to be equal, which is why the tests include a non-square case.

The scores are scaled by the square root of `D`. This controls the growth in dot-product magnitude associated with the feature dimension under the usual variance intuition. It is not a promise that every learned distribution has unit variance. The operation is part of the attention definition being tested, so omitting it changes both outputs and gradients.

After masking and softmax, the attention weights retain shape `[B, H, Tq, Tk]`. Multiplication by values produces `[B, H, Tq, D]`. The key-position dimension disappears through weighted summation. No operation here mixes different batch entries or heads; a later output projection combines head features.

## Implement the square and cached cases together

<!-- lab: labs/llm/attention/attention.py#attention -->

For a full sequence, the offset is zero and queries and keys have equal length. A query at position two may attend to keys zero, one, and two. The boolean mask is built from positions, rather than a memorized triangular-matrix expression, so the same logic can be extended to a cached prefix.

For a cached call, keys contain both the prefix and the newly appended positions. Queries contain only the newly processed positions. If the prefix length is four and two new tokens arrive, query positions are four and five while key positions run from zero through five. The first query must not see key five; the second may see all six keys.

The implementation enforces `offset + Tq == Tk`. That is the contract for this append-only cache experiment. It does not attempt to support sliding windows, gaps in cache positions, or arbitrary key sets. Those cases need an explicit position representation instead of deriving visibility from one prefix length.

The masked score is negative infinity. Softmax therefore assigns zero probability to prohibited entries in the finite, supported cases used by the lab. Every query has at least one permitted key. A row with no permitted keys would introduce an additional numerical edge case, so the input contract rules out that situation here.

## Mask before softmax, not after it

Suppose a query has three scores and the final key belongs to the future. If softmax runs over all three and the future probability is zeroed afterward, the remaining probabilities generally sum to less than one. The future score has already affected the normalization denominator. Merely removing the final contribution does not restore the desired distribution.

Masking logits before softmax changes the normalization domain itself. The visible positions compete only with other visible positions. This is the actual causal operation the test wants to establish. A post-softmax masking implementation might still produce a tensor of the expected shape and even look reasonable on a small printout.

Broadcasting also deserves inspection. The mask has shape `[Tq, Tk]` and broadcasts over batch and heads. That is appropriate because every example in this lab uses the same causal layout. Padding masks for variable-length examples introduce another per-example condition. Combining causal and padding restrictions requires checking both the shape and the meaning of each boolean value.

Different APIs use different conventions for boolean masks. The lab's comparison uses the documented convention for PyTorch's scaled-dot-product attention, where a true entry in the boolean attention mask participates. A mask copied from an API where true means “blocked” would invert the intended behavior. Matching variable names is not enough to establish compatibility.

## A reference comparison needs controlled settings

The reference call sets dropout probability to zero. A stochastic dropout path would make direct numerical comparison inappropriate unless random behavior were aligned. The lab uses ordinary CPU tensors and a fixed seed. The output and gradient comparison uses float64 to reduce rounding differences during this correctness check.

The manual implementation materializes the complete score matrix. A library can choose a different execution strategy while representing the same mathematical operation. Floating-point arithmetic is not associative, so mathematically equivalent paths can differ slightly. The tests use explicit absolute and relative tolerances rather than requiring bitwise equality.

The gradient test compares derivatives of the same scalar objective with respect to queries, keys, and values. It asks more than whether the forward values happen to match: an accidental detach or an incorrect backward path would become visible. It is still a comparison against a reference, not a replacement for all forms of numerical analysis.

Testing only square attention leaves an important gap. A cached query with a nonzero offset does not have the same visibility pattern as a top-left triangular mask on a short query matrix. The non-square test constructs an explicit mask from absolute positions and passes that to the reference. It avoids assuming that an `is_causal` flag automatically expresses this cache layout.

## Perturb the future

The causal test computes an output, then changes keys and values at later positions by a large amount. Earlier outputs must remain the same within the test tolerance. This is a behavioral property of the mask, independent of the particular random values chosen initially.

The perturbation is deliberately applied to keys and values, not only values. A future key can alter the softmax denominator if it is accidentally visible, even when its value contributes little. Changing both creates a stronger chance of exposing a missing or inverted mask.

The test does not claim that a complete decoder is causal merely because this function is causal. A model could leak future information through another operation, a wrongly shifted target, or a feature constructed from the full sequence. Function-level tests establish a building block. End-to-end tests must still inspect the surrounding model and data flow.

Run the lab:

```bash
labs/.venv/bin/python -m unittest discover -s labs/llm/attention -p 'test_*.py' -v
labs/.venv/bin/python labs/llm/attention/attention.py
```

The local CPU tests pass output and gradient comparisons, future-token perturbation, cached non-square masking, and invalid-offset rejection. The standalone script prints its device, output shape, and maximum absolute error. Its output is a correctness record, not a performance claim.

## Connect the tensor function to a decoder block

A decoder starts with hidden states shaped `[B, T, C]`, where `C = H × D`. Linear projections produce queries, keys, and values. Reshaping splits the feature dimension into heads, and a permutation arranges the tensors as `[B, H, T, D]`. After attention, another permutation and reshape concatenate head features back into `[B, T, C]`.

A permutation usually changes the view's strides rather than moving data immediately. A later operation that requires a contiguous arrangement can trigger a copy or require an explicit contiguous tensor. Treating every reshape as free misses a potential memory and performance cost. Conversely, adding copies everywhere can obscure the original layout issue.

The output projection mixes the concatenated head features. Residual connections, normalization, and a feed-forward network complete the small block used in the next article. They are not decorative details: cache-equivalence tests depend on holding their behavior and position handling consistent between full and incremental execution.

Keeping the attention function separate makes shape bugs easier to localize. If its output agrees with the reference but a decoder's incremental logits do not agree with full-prefix logits, investigate position offsets, cached state, projection layout, or model mode before rewriting the attention equation.

## Understand the memory before discussing optimization

The materialized score tensor contains `B × H × Tq × Tk` elements. For full attention, both position dimensions grow with sequence length, so the score storage grows quadratically. The simple implementation makes that cost visible and is useful as a reference, but it is not the memory behavior of every optimized attention kernel.

The query, key, and value tensors have a different growth pattern. Their storage is linear in their respective sequence lengths and feature width. During inference, a KV cache retains earlier keys and values across decoding steps. It avoids recomputing those projections, while introducing persistent state whose size grows with the sequence.

A fused implementation may avoid writing the whole score matrix to memory. That changes memory traffic and intermediate storage, not the need to define visibility correctly. A wrong causal mask remains wrong inside a fast kernel. Correctness comparisons should precede any interpretation of a speed difference.

This experiment does not benchmark FlashAttention, a GPU, or a serving engine. It provides the reference operation and tests that a later optimization can be compared against. The implementation's slowness at larger sizes is part of its teaching boundary, not evidence that an optimized library is unnecessary.

## References and next step

- [PyTorch scaled-dot-product attention](https://docs.pytorch.org/docs/2.14/generated/torch.nn.functional.scaled_dot_product_attention.html), the reference API used in the experiment.
- [PyTorch numerical accuracy](https://docs.pytorch.org/docs/stable/notes/numerical_accuracy.html), for floating-point comparison boundaries.
- [Attention Is All You Need](https://arxiv.org/abs/1706.03762), the original Transformer paper.
- Continue with [KV Cache through a tiny decoder](/articles/kv-cache-tiny-decoder), where absolute positions become persistent state.
