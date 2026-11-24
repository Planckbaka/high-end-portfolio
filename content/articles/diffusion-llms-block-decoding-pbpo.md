---
title: "Diffusion Language Models: Block-Causal Parallel Decoding, Hybrid Migration, and Prefix-Block RL"
date: "2026-11-24"
updatedAt: "2026-11-24"
category: "LLM"
excerpt: "Break the 1-token-per-forward-pass Roofline wall with Block Masked Diffusion: continuous-time NELBO derivations, migrating Gated DeltaNet hybrids in dQwen3.5 and Clover-35B-A3B, Mix-FT sampler alignment, and PBPO reinforcement learning."
lang: "en"
tags: ["Diffusion LLM", "Block Diffusion", "NELBO", "dQwen3.5", "PBPO", "Clover"]
featured: false
draft: false
series: "LLM & AI Infrastructure from First Principles"
seriesOrder: 9
labPath: "labs/llm/block-diffusion"
papers:
  - title: "dQwen3.5: Hybrid-Attention Diffusion Language Models"
    arxiv: "2609.20751"
    year: 2026
    tag: "dQwen3.5"
  - title: "Large Language Continuous Diffusion Models"
    arxiv: "2610.02665"
    year: 2026
    tag: "Sigma Continuous dLLM"
  - title: "Train the Sampler You Run: Few-Step Masked Diffusion Language Models via Mixture-Likelihood Fine-Tuning"
    arxiv: "2611.02666"
    year: 2026
    tag: "Mix-FT"
  - title: "PBPO: Prefix-Block Policy Optimization for Diffusion Language Models"
    arxiv: "2611.07783"
    year: 2026
    tag: "PBPO"
  - title: "Clover-35B-A3B-Preview Technical Report"
    arxiv: "2611.24636"
    year: 2026
    tag: "Clover-35B-A3B"
  - title: "dLoop: Looped Diffusion Language Models via Recurrent Latent Refinement"
    arxiv: "2611.26275"
    year: 2026
    tag: "dLoop"
---

## Breaking the `1 forward pass = 1 token` Roofline wall

Autoregressive (AR) decoding factorizes $\log p(x_{1:L}) = \sum_{i=1}^L \log p(x_i \mid x_{<i})$. While trivial to train, decoding at small batch sizes sits on the flat memory-bound slope of the Roofline (`roofline-flashattention-pagedattention`): streaming gigabytes of weights from HBM yields a **single token per forward pass**.

**Diffusion Language Models (dLLMs)** replace serial token-by-token emission with iterative parallel denoising across two converging paradigms:

1. **Block Masked Diffusion (`dQwen3.5`, `Clover-35B-A3B`)**: Partitions output sequences into blocks of size $B$ (e.g., $B = 16 \dots 64$). **Inter-block** attention remains strictly causal so clean prefix blocks stay cached in KV memory, while **intra-block** attention is fully bidirectional—allowing $T \ll B$ forward passes to unmask an entire block in parallel and raise arithmetic intensity by $B/T\times$.
2. **Continuous Latent ODE/SDE Diffusion (`Sigma`, arXiv:2610.02665)**: Discrete unmasking cannot smoothly revise an early mistaken commit or apply continuous value-gradient guidance. `Sigma` constructs a smooth low-dimensional latent manifold above token embeddings, warm-starting from pretrained AR weights and supporting high-order ODE solvers plus Classifier-Free Guidance (CFG) for math and code.

## Continuous-time Masked Diffusion NELBO

In discrete absorbing-state masked diffusion, each token in a block is independently replaced with `[MASK]` at noise level $t \sim \mathcal{U}(0, 1]$. Evaluating the exact variational bound reduces to a remarkably clean time-weighted cross-entropy objective:

<details class="derivation-box">
<summary>Continuous-time Masked Diffusion NELBO reduction to $1/t$-weighted cross-entropy</summary>

Under an absorbing forward kernel $q(x_t \mid x_0) = \prod_{i=1}^L \big[(1 - \alpha_t)\,\mathbf{1}_{x_{t,i}=\text{[MASK]}} + \alpha_t\,\mathbf{1}_{x_{t,i}=x_{0,i}}\big]$ with linear schedule $\alpha_t = 1 - t$ (so the mask rate is $t$ and $\alpha_t' = -1$), the continuous-time Negative Evidence Lower Bound (NELBO) integrates the instantaneous KL divergence between the true posterior $q(x_{s} \mid x_t, x_0)$ and the learned reverse denoiser $p_\theta(x_0 \mid x_t)$:

$$
\mathcal{L}_{\text{NELBO}}(\theta) = \int_0^1 \frac{-\alpha_t'}{1 - \alpha_t} \, \mathbb{E}_{q(x_t \mid x_0)} \!\left[ \sum_{i : x_{t,i} = \text{[MASK]}} -\log p_\theta(x_{0,i} \mid x_t) \right] \mathrm{d}t = \mathbb{E}_{t \sim \mathcal{U}(0,1],\, x_t \sim q(\cdot \mid x_0)} \!\left[ \frac{1}{t} \sum_{i \in \text{Masked}(x_t)} -\log p_\theta(x_{0,i} \mid x_t) \right]
$$

Notice two critical properties: (1) unmasked positions contribute zero loss because they are already revealed, and (2) the $1/t$ factor upweights low-noise regimes where only a few `[MASK]` tokens remain and high-confidence context resolves subtle syntactic dependencies.

</details>

<!-- lab: labs/llm/block-diffusion/block_diffusion.py#block_masked_diffusion_nelbo -->

![Figure 9: Block-causal attention mask (inter-block causal prefix caching + intra-block bidirectional context) and forward-pass reduction per 32-token block.](/images/articles/llm-infra/fig9-block-diffusion-llm.svg)

## Hybrid linear-RNN migration (`dQwen3.5` & `Clover-35B-A3B`)

A major 2026 architectural collision emerged when frontier AR backbones (`Qwen3.5`, `Qwen3.8-Next`, `Kimi K3`) replaced 75% of attention layers with **strictly unidirectional linear RNNs** such as `Gated DeltaNet`. Standard diffusion adaptation assumed full bidirectional attention everywhere—incompatible with causal recurrent state $S_t$.

- **`dQwen3.5` (arXiv:2609.20751)** resolves this via **hybrid block adaptation**: clean prefix blocks retain fast $O(1)$ unidirectional `Gated DeltaNet` recurrence $S_{\text{prefix}}$, while inside the active noisy block, attention layers open to full bidirectional masks and linear RNN layers apply lightweight bidirectional state fusion with causal annealing.
- **`Clover-35B-A3B` (arXiv:2611.24636)** scales this hybrid MoE + Gated DeltaNet block-diffusion recipe to 35B total / 3B active parameters, reaching **73.6 on SWE-bench Verified** at **$680\text{ tok/s}$** on a single GB300.
- **`dLoop` (arXiv:2611.26275)** further embeds Looped Transformer latent refinement (`looped-transformers-latent-recurrence`) inside each diffusion step so uncommitted tokens exchange global context before hard unmasking.

## Few-step sampler alignment (`Mix-FT`) and `PBPO` RL

Why does naive confidence-based parallel unmasking degrade when compressed to $T = 4\text{--}8$ steps? Because standard MDLM trains **independent per-token marginals** $p_\theta(x_i \mid x_t)$. Unmasking multiple tokens simultaneously without modeling their joint correlation can emit incompatible pairs (e.g., `"New"` + `"Francisco"`).

- **`Mix-FT` (arXiv:2611.02666)**—*Train the Sampler You Run*—optimizes an importance-weighted mixture-likelihood lower bound directly over the few-step sampler's actual reveal trajectories, closing the quality gap at $2\text{--}8$ steps.
- **`PBPO` (Prefix-Block Policy Optimization, arXiv:2611.07783)** solves the RLVR bottleneck for dLLMs. In autoregressive GRPO, computing $\pi_\theta(y \mid x)$ is a single forward pass. In block diffusion, a $B$-token block can be unmasked along $B!$ distinct reveal orders, making the marginal block likelihood $\pi_\theta(y_{\text{blk}} \mid y_{\text{prefix}})$ **intractable**. `PBPO` models the concrete **unmasking transition trajectory** conditioned on the clean prefix block as a Markov sub-process, decomposing the policy ratio across actual unmasking steps so PPO/GRPO importance ratios remain exact and low-variance.

<!-- lab: labs/llm/block-diffusion/block_diffusion.py#parallel_confidence_unmasking -->

In our companion CPU lab (`labs/llm/block-diffusion`), `BlockMaskedDiffusionLM` verifies the block-causal mask geometry, converges under $1/t$-weighted MDLM NELBO training, and decodes a 16-token block in 4 confidence-ranked parallel unmasking passes.

## References

- [dQwen3.5: Hybrid-Attention Diffusion Language Models](https://arxiv.org/abs/2609.20751) (2026).
- [Large Language Continuous Diffusion Models (Sigma)](https://arxiv.org/abs/2610.02665) (2026).
- [Train the Sampler You Run: Few-Step Masked Diffusion LM via Mixture-Likelihood Fine-Tuning (Mix-FT)](https://arxiv.org/abs/2611.02666) (2026).
- [PBPO: Prefix-Block Policy Optimization for Diffusion Language Models](https://arxiv.org/abs/2611.07783) (2026).
- [Clover-35B-A3B-Preview Technical Report](https://arxiv.org/abs/2611.24636) (2026).
- [dLoop: Looped Diffusion Language Models via Recurrent Latent Refinement](https://arxiv.org/abs/2611.26275) (2026).
- Return to Chapter 1: [From Vanilla Transformer to Llama-3 and Mixtral: Five Architectural Mutations](/articles/modern-transformer-evolution).
