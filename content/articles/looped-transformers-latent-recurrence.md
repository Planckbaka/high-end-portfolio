---
title: "Looped Transformers: Latent-Space Recurrence, Constant Terminal KV Cache, and Elastic Depth"
date: "2026-11-21"
updatedAt: "2026-11-21"
category: "LLM"
excerpt: "Scale test-time reasoning depth without adding weights or inflating KV cache: Prelude-Recurrent-Coda topology, hyperspherical input injection, O(1) terminal-loop KV sharing, and fixed-point truncated BPTT."
lang: "en"
tags: ["Looped Transformer", "Latent Reasoning", "Terminal KV Cache", "Truncated BPTT", "Late Entry"]
featured: false
draft: false
series: "LLM & AI Infrastructure from First Principles"
seriesOrder: 8
labPath: "labs/llm/looped-transformer"
papers:
  - title: "Closing the Loop: Practical Training Recipes for Looped Language Models"
    arxiv: "2610.00673"
    year: 2026
    tag: "Closing the Loop"
  - title: "Towards Looped Models Done Right, Part I: Topology, Input Injection, Recurrent-State Design"
    arxiv: "2610.23036"
    year: 2026
    tag: "Looped Done Right I"
  - title: "Towards Looped Models Done Right, Part II: Rethinking at Fixed Points"
    arxiv: "2610.06833"
    year: 2026
    tag: "Looped Done Right II"
  - title: "Dory1.0-4B: A Looped Normalized-GPT"
    arxiv: "2611.03998"
    year: 2026
    tag: "Dory1.0-4B"
  - title: "ARLoop: Fully-Open Pre-trained Looped Transformers with Attention Residuals"
    arxiv: "2611.05234"
    year: 2026
    tag: "ARLoop"
  - title: "Looping Deeper Without Growing the KV Cache: Recurrent Depth for Causal Encoder-Decoders"
    arxiv: "2611.13378"
    year: 2026
    tag: "Looped CED"
  - title: "Late Entry in Looped Language Models"
    arxiv: "2611.24576"
    year: 2026
    tag: "Late Entry"
---

## Why fixed depth and verbalized CoT hit a bandwidth wall

A standard autoregressive Transformer binds **parameter storage** tightly to **computational depth**: achieving 64 layers of compositional reasoning requires storing 64 distinct sets of weights in HBM, and every trivial function word (`the`, `,`) pays the exact same depth cost as a multi-step arithmetic pivot. Meanwhile, **explicit Chain-of-Thought (CoT)** forces high-dimensional latent states through a narrow discrete vocabulary bottleneck, inflating decode steps and KV cache memory by $10\times\text{--}30\times$.

**Looped Transformers (LoopLMs)** introduce an orthogonal scaling axis: **weight-tied latent recurrence**. A single physical block iterates $K$ times in continuous hidden space before emitting a token, allowing test-time compute $K \in \{1, 2, 4, 8, \dots\}$ to scale elastically with problem difficulty while keeping parameter count fixed.

## The sandwich topology, input injection, and hyperspherical stability

Controlled ablations in **Towards Looped Models Done Right Part I** (arXiv:2610.23036) and **Dory1.0-4B** (arXiv:2611.03998) explain why early weight-tied Universal Transformers underperformed and establish the modern **Prelude–Recurrent–Coda** sandwich topology:

1. **Prelude ($L_{\text{pre}}$ unshared layers)**: Maps token embeddings into a stable semantic anchor $e_0 = \text{Prelude}(x)$.
2. **Shared Recurrent Block ($L_{\text{rec}}$ layers looped $K$ times)**: Refines the latent state $h^{(k)}$ via **Persistent Input Injection**—blending $h^{(k)}$ with the initial anchor $e_0$ before every iteration ($h_{\text{in}}^{(k)} = \alpha h^{(k)} + (1 - \alpha) e_0$) so deep recurrence never forgets the original prompt token.
3. **Hyperspherical Normalization (`nGPT`, Dory1.0-4B)**: Standard residual loops suffer exponential norm growth across $K \ge 4$ iterations. Constraining hidden states onto the unit hypersphere ($\|h\|_2 = \sqrt{H}$) keeps trajectories bounded across arbitrary loop counts.
4. **Cross-Loop Attention Residuals (`ARLoop`, arXiv:2611.05234)**: Applies depth-wise pseudo-query attention across intermediate loop states $\{e_0, h^{(1)}, \dots, h^{(K)}\}$ instead of discarding early iterations.
5. **Coda ($L_{\text{coda}}$ unshared layers)**: Projects the aggregated latent state to output logits.

<!-- lab: labs/llm/looped-transformer/looped_transformer.py#terminal_kv_block -->

## Constant $O(1)$ Terminal-Loop KV Cache

Unrolling an 8-layer block $K = 4$ times naively as a 32-layer Transformer would quadruple KV cache memory. **Dory1.0-4B** (arXiv:2611.03998), **Done Right Part II** (arXiv:2610.06833), and **Looped CED** (arXiv:2611.13378) eliminate this $O(K)$ memory tax with **Terminal-Loop KV Sharing**:

- During the $K$ recurrent iterations for token $t$, Keys and Values are recomputed for the current token, **but only the final ($K$-th) iteration's $(k_t^{(K)}, v_t^{(K)})$ is committed to the global KV cache**.
- When token $t+1$ runs its own iterations $k = 1 \dots K$, every iteration attends to the exact same frozen terminal KV cache of historical tokens $1 \dots t$.
- In **Looped CED** (arXiv:2611.13378), applying this invariant to a 552B asymmetric Causal Encoder-Decoder cuts per-token KV cache by **$36.8\times$** and boosts $8\text{K}$-context throughput by **$3.6\times$**.

![Figure 8: Terminal-loop O(1) KV cache invariance across loop depth K alongside activation and FLOP savings from Truncated BPTT and Late Entry.](/images/articles/llm-infra/fig8-looped-transformer-topology.svg)

<!-- lab: labs/llm/looped-transformer/looped_transformer.py#prelude_recurrent_coda -->

## Fixed-point truncated BPTT, recipes, and `Late Entry`

Full backpropagation through $K$ unrolled loops stores $K\times$ activation graphs in HBM. **Done Right Part II** (arXiv:2610.06833) resolves this from an implicit-differentiation viewpoint:

<details class="derivation-box">
<summary>Neumann-series fixed-point view of Truncated BPTT ($m$-step tail gradients)</summary>

Suppose the recurrent transition $h^{(k+1)} = \mathcal{F}_\theta(h^{(k)}, e_0)$ is locally contractive around a fixed point $h^* = \mathcal{F}_\theta(h^*, e_0)$ with Jacobian spectral radius $\rho(J_h) < 1$ where $J_h = \frac{\partial \mathcal{F}_\theta}{\partial h}\big|_{h^*}$. By the Implicit Function Theorem, differentiating $h^* = \mathcal{F}_\theta(h^*, e_0)$ with respect to $\theta$ yields:

$$
\frac{\mathrm{d}h^*}{\mathrm{d}\theta} = (I - J_h)^{-1} \frac{\partial \mathcal{F}_\theta}{\partial \theta} = \left(\sum_{j=0}^{\infty} J_h^j\right) \frac{\partial \mathcal{F}_\theta}{\partial \theta}
$$

Because $\|J_h^j\| \le c\,\rho(J_h)^j$ decays geometrically, truncating the Neumann series to just the final $m \in \{1, 2\}$ iterations (`torch.no_grad()` for steps $0 \dots K-m-1$, retaining autograd only for the last $m$ steps) captures the dominant gradient signal while slashing training activation memory by over $60\%$.

</details>

Three practical engineering recipes complete the LoopLM stack:

- **310B-Token Scratch & Dense Retrofitting (`Closing the Loop`, arXiv:2610.00673)**: Exit-gate entropy regularization prevents depth collapse at 310B tokens, and existing dense checkpoints (such as `Qwen`) can be retrofitted into elastic-depth LoopLMs by tying middle layers with a single learnable mixing scalar $\alpha$.
- **Difficulty-Aware RLVR (`Dory1.0-4B`)**: During GRPO post-training, easy prompts sample $K \in \{1, 2\}$ while hard math/coding prompts allocate $K = 4$, teaching the model to trade latent compute for accuracy.
- **Lossless `Late Entry` Inference (arXiv:2611.24576)**: Skips early loop iterations at inference by entering directly at the trailing $K < T$ steps and running a static CUDA-graph parallel verification step—achieving **$8.4\times$ lossless greedy speedup** on `Huginn-3.5B` ($T = 64$).

In `labs/llm/looped-transformer`, unit tests verify that `count_kv_bytes(cache)` remains bit-for-bit identical across $K \in \{1, 2, 4, 8\}$ while `truncated_bptt_last_m=2` backpropagates finite gradients through `prelude`, `recurrent_block`, `inject_alpha`, and `coda`.

## References

- [Closing the Loop: Practical Training Recipes for Looped Language Models](https://arxiv.org/abs/2610.00673) (2026).
- [Towards Looped Models Done Right, Part I](https://arxiv.org/abs/2610.23036) and [Part II: Rethinking at Fixed Points](https://arxiv.org/abs/2610.06833) (2026).
- NVIDIA, [Dory1.0-4B: A Looped Normalized-GPT](https://arxiv.org/abs/2611.03998) (2026).
- [ARLoop: Fully-Open Pre-trained Looped Transformers with Attention Residuals](https://arxiv.org/abs/2611.05234) (2026).
- [Looping Deeper Without Growing the KV Cache: Recurrent Depth for Causal Encoder-Decoders](https://arxiv.org/abs/2611.13378) (2026).
- [Late Entry in Looped Language Models](https://arxiv.org/abs/2611.24576) (2026).
- Continue to Chapter 9: [Diffusion Language Models: Block-Causal Parallel Decoding, Hybrid Migration, and Prefix-Block RL](/articles/diffusion-llms-block-decoding-pbpo).
