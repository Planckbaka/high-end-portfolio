---
title: "2026 Flagship Co-Design: Sub-Kilobyte CED KV Cache, Depth-Wise Attention Residuals, and Muon"
date: "2026-11-18"
updatedAt: "2026-11-18"
category: "Systems"
excerpt: "How 2026 frontier models break the symmetric Decoder-only and Pre-RMSNorm mold: DeepSeek-V4.1-Flash asymmetric CED and 890 B/tok KV compression, Kimi K3 Attention Residuals, Qwen3.8-Next 4-branch gated residuals, and Muon orthogonalized momentum."
lang: "en"
tags: ["DeepSeek-V4.1", "Qwen3.8-Next", "Kimi-K3", "Attention Residuals", "Muon", "FP4"]
featured: true
draft: false
series: "LLM & AI Infrastructure from First Principles"
seriesOrder: 7
labPath: "labs/llm/flagship-2026"
papers:
  - title: "Muon is Scalable for LLM Training"
    arxiv: "2502.16982"
    year: 2025
    tag: "Muon Scaling"
  - title: "FlashAttention-4: Algorithm and Kernel Pipelining Co-Design for Asymmetric Hardware Scaling"
    arxiv: "2603.05451"
    year: 2026
    tag: "FlashAttention-4"
  - title: "Kimi K3: Open Frontier Intelligence"
    arxiv: "2607.24653"
    year: 2026
    tag: "Kimi K3 (AttnRes)"
  - title: "On the Design of Qwen3.8-Next Architecture: Evaluation, Efficiency, and Training Stability"
    arxiv: "2608.30320"
    year: 2026
    tag: "Qwen3.8-Next"
  - title: "DeepSeek-V4.1-Flash: Pushing the Limits of KV Cache Compression"
    arxiv: "2609.19969"
    year: 2026
    tag: "DeepSeek-V4.1-Flash (CED)"
  - title: "Complex KDA: Understanding and Enhancing the Expressivity of Kimi Delta Attention"
    arxiv: "2609.24797"
    year: 2026
    tag: "Complex KDA"
  - title: "Nemotron 3.5 Super and Lightning: Open, Efficient Mixture-of-Experts Hybrid Mamba-Transformer Models for Agentic AI"
    arxiv: "2610.38095"
    year: 2026
    tag: "Nemotron 3.5"
---

## Why symmetric Decoder-only + Pre-RMSNorm hit a wall

Between 2018 and 2024, frontier language models converged on a single template: a uniform stack of symmetric Decoder-only blocks connected by a `Pre-RMSNorm` residual bus (`modern-transformer-evolution`). Under **100K-to-1M-token agentic workloads**—where a coding or deep-research agent ingests an entire repository and emits only a few hundred tool-call tokens—that template breaks along three hardware axes:

1. **Prefill-to-Decode Asymmetry (`1000 : 1`)**: A symmetric Decoder-only model forces every input token through the exact same heavy active parameter budget required for complex next-token reasoning.
2. **Depth-Wise Representation Dilution**: Beyond $80\text{--}100$ layers, summing every layer's output onto one additive residual bus inflates deep-layer activation norms and drowns out sharp lexical features from early layers.
3. **Ill-Conditioned Second-Order Optimizer Overhead**: `AdamW` tracks two FP32/BF16 states per parameter while leaving gradient updates dominated by top singular directions.

Late-2026 open-weight flagships—**DeepSeek-V4.1-Flash** (arXiv:2609.19969), **Qwen3.8-Flash-Next** (arXiv:2608.30320), **Kimi K3** (arXiv:2607.24653), and **Nemotron 3.5** (arXiv:2610.38095)—independently converged on five coordinated mutations:

| Architectural Axis | DeepSeek-V4.1-Flash | Qwen3.8-Flash-Next | Kimi K3 / K3.1 Pro | Nemotron 3.5 Super |
| :--- | :--- | :--- | :--- | :--- |
| **Scale & Active Ratio** | 552B backbone + 196B Engram; **8B Prefill / 16B Decode** | 125B MoE + 51B N-gram table; **6B active / token** | **2.78T total / 104.2B active**; 93 layers, 896 experts | 120B total / **12B active** (Lightning: 30B-A3B) |
| **Backbone Topology** | **Asymmetric CED** (20 Causal Encoder + 20 Decoder layers) | Hybrid linear-sparse Decoder-only | Ultra-deep hybrid Decoder-only | Mamba-2 + Attention hybrid MoE |
| **Sequence Mixing** | **CSA2** (cross-layer KV reuse + sparse indexer) + SWA replay | **Gated DeltaNet (GDN)** + **Qwen Sparse Attention (QSA)** | **3:1 hybrid**: 3 KDA linear layers + 1 Gated MLA | **Mamba-2 SSM** + grouped-query attention |
| **Residual Bus** | Single-Pass `mHC` fused manifold hyper-connection | **4-Branch Gated Residual (`GR`)** | **Attention Residuals (`AttnRes`)** along depth | Scaled Pre-RMSNorm |
| **Precision & Optimizer** | **FP4 (E2M1)** KV cache (**890 B/tok**) + Muon | **Muon** + off-accelerator Host DRAM N-gram lookup | **MXFP4 weights + MXFP8 activations QAT** + Muon | FP8 / NVFP4 deployment-friendly quantization |

## Asymmetric CED and sub-kilobyte `CSA2` KV compression

**DeepSeek-V4.1-Flash** (arXiv:2609.19969) splits its 40-layer network into a **Causal Encoder-Decoder (CED)**:

- **Causal Encoder (first 20 layers)**: Processes the entire prompt at **8B active parameters per token**, distilling contextual representations into shared latent KV states. Once prefill finishes, the Encoder is **never executed again during autoregressive decoding**.
- **Autoregressive Decoder (last 20 layers)**: Concentrates **16B active parameters per token**—doubling per-layer expert capacity exclusively for token-by-token reasoning and synthesis.

To push memory below $1\text{ KB/token}$, `CSA2` partitions layers into static roles (`Full`, `Reindex`, and `Reuse`). Only `Full` layers materialize and store compressed KV latents quantized to **native FP4 (`E2M1` with `E4M3` block scales)**, while `Reuse` layers attend directly over the preceding `Full` layer's cached tensors at **zero marginal KV bytes**. Combined with **SWA Bounded Replay**—which drops sliding-window KV from SSD prefix caches and recomputes only the trailing suffix on cache hit—global HBM KV footprint drops to **890 Bytes/token** (a $147\times$ reduction vs. Llama-3-8B's `131,072 B/tok`, fitting a $1\text{M}$-token trajectory in **$0.83\text{ GB}$**).

In parallel, **Qwen3.8-Next** (arXiv:2608.30320) pairs **Gated DeltaNet** ($S_t = \alpha_t S_{t-1}(I - \beta_t k_t k_t^\top) + \beta_t v_t k_t^\top$) with sparse attention and offloads a **51B N-gram embedding table** to Host DRAM via asynchronous prefetch—matching DeepSeek's **196B Engram** lookup memory and cleanly separating *compute parameters* (MoE) from *static memory parameters* (off-accelerator lookup tables). **Complex KDA** (arXiv:2609.24797) extends rank-1 Delta updates into the complex eigenvalue domain so a single step can represent 2D state rotations for formal state-tracking.

![Figure 7: Per-token KV cache compression down to 890 Bytes/token alongside Muon 5-step Newton-Schulz singular-value spectrum flattening.](/images/articles/llm-infra/fig7-flagship-2026-codesign.svg)

## Depth-wise `AttnRes` and 4-branch gated residuals

When depth reaches 93 layers (**Kimi K3**, arXiv:2607.24653) or sparsity reaches $1:21$ (**Qwen3.8-Next**, arXiv:2608.30320), standard `x + f(RMSNorm(x))` residual addition dilutes early-layer signal and causes late-pretraining loss spikes. Both flagships replace blind summation with **learned routing across the depth axis**:

1. **Attention Residuals (`AttnRes`, Kimi K3)**: Layer $l$ carries a learned pseudo-query vector $q_l \in \mathbb{R}^d$ that computes softmax attention weights $\alpha_{l,i}$ over historical layer outputs $\{h_0, \dots, h_{l-1}\}$:
   $$
   \tilde{x}_l = \sum_{i=0}^{l-1} \alpha_{l, i} h_i, \qquad \alpha_{l, i} = \frac{\exp\!\big(q_l^\top k(h_i) / \sqrt{d}\big)}{\sum_{j=0}^{l-1} \exp\!\big(q_l^\top k(h_j) / \sqrt{d}\big)}
   $$
2. **4-Branch Gated Residual (`GR`, Qwen3.8-Next)**: Maintains $M = 4$ parallel residual substreams $\mathbf{X} \in \mathbb{R}^{B \times S \times 4 \times H}$. Each sublayer reads a softmax-gated mixture across the 4 streams and writes updates back through a bounded sigmoid gate $\beta = 2\sigma(W_{\text{write}} y) / M$.

<!-- lab: labs/llm/flagship-2026/flagship_blocks.py#attn_res_and_gated_residual -->

## Muon 5-step Newton-Schulz and Blackwell FP4 co-design

On NVIDIA Blackwell (`B200`/`GB200`), 4-bit Tensor Core `MMA` throughput scales far faster than Special Function Units (`SFU`) that compute `exp2`, turning Softmax exponentials into a kernel bottleneck (**FlashAttention-4**, arXiv:2603.05451, mitigates this via polynomial `exp` emulation on CUDA cores and asynchronous `TMEM` pipelines). At the optimizer level, `AdamW`'s second-moment variance accumulator struggles with low-bit quantization and wastes HBM.

**Muon** (arXiv:2502.16982), adopted across DeepSeek-V4.1, Qwen3.8-Next, and Kimi K3, replaces diagonal preconditioning on 2D weight matrices with **matrix orthogonalization**: mapping the momentum matrix $G = U \Sigma V^\top$ toward its nearest semi-orthogonal polar factor $U V^\top$ so every singular subspace receives equal update magnitude.

<details class="derivation-box">
<summary>Exact mechanics of Muon's 5-step odd quintic Newton-Schulz orthogonalization</summary>

Given a 2D gradient or momentum matrix $G \in \mathbb{R}^{m \times n}$ (transposed if $m > n$ so $X_0 \in \mathbb{R}^{r \times c}$ with $r \le c$), first normalize by Frobenius norm $X_0 = G / (\|G\|_F + \epsilon)$ so every singular value satisfies $\sigma_i(X_0) \in (0, 1]$. Any odd polynomial $p(X) = a X + b (X X^\top) X + c (X X^\top)^2 X$ acts elementwise on the singular values while preserving singular vectors $U$ and $V$:

$$
p(U \Sigma V^\top) = U \big(a \Sigma + b \Sigma^3 + c \Sigma^5\big) V^\top
$$

With minimax-tuned coefficients $(a, b, c) = (3.4445, -4.7750, 2.0315)$, iterating $X_{k+1} = p(X_k)$ for $k = 0, \dots, 4$ uses only pure Tensor Core `GEMM`s (zero SVD calls) to push small singular values rapidly toward $1$ while contracting values above $1$ back into $(0.7, 1.15)$. Finally, multiplying by the Moonlight RMS scale $0.2 \sqrt{\max(m, n)}$ matches `AdamW`'s step-size variance across layer widths.

</details>

<!-- lab: labs/llm/flagship-2026/flagship_blocks.py#ced_csa2_and_muon -->

In our companion CPU verification (`labs/llm/flagship-2026`), `AsymmetricCEDLayer` confirms zero marginal KV bytes on `Reuse` layers with a $1:2$ Encoder/Decoder FFN parameter ratio, while `muon_newton_schulz_5step` collapses an ill-conditioned gradient matrix (condition number $\approx 2000$) by more than two orders of magnitude in five pure matrix multiplications.

## References

- Jordan et al., [Muon is Scalable for LLM Training](https://arxiv.org/abs/2502.16982) (2025).
- Shah et al., [FlashAttention-4: Algorithm and Kernel Pipelining Co-Design for Asymmetric Hardware Scaling](https://arxiv.org/abs/2603.05451) (2026).
- Moonshot AI, [Kimi K3: Open Frontier Intelligence](https://arxiv.org/abs/2607.24653) (2026) and [Complex KDA](https://arxiv.org/abs/2609.24797) (2026).
- Qwen Team, [On the Design of Qwen3.8-Next Architecture: Evaluation, Efficiency, and Training Stability](https://arxiv.org/abs/2608.30320) (2026).
- DeepSeek-AI, [DeepSeek-V4.1-Flash: Pushing the Limits of KV Cache Compression](https://arxiv.org/abs/2609.19969) (2026).
- NVIDIA, [Nemotron 3.5 Super and Lightning](https://arxiv.org/abs/2610.38095) (2026).
- Continue to Chapter 8: [Looped Transformers: Latent-Space Recurrence, Constant Terminal KV Cache, and Elastic Depth](/articles/looped-transformers-latent-recurrence).
