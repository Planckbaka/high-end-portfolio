---
title: "From Vanilla Transformer to Llama-3 and Mixtral: Five Architectural Mutations"
date: "2026-10-15"
updatedAt: "2026-10-15"
category: "LLM"
excerpt: "Trace the five exact structural mutations—Pre-RMSNorm, RoPE, Grouped-Query Attention, SwiGLU, and Top-K Sparse MoE—that turned the 2017 Transformer into modern open-weights frontier models."
lang: "en"
tags: ["Transformer", "RoPE", "GQA", "SwiGLU", "MoE", "PyTorch"]
featured: false
draft: false
series: "LLM & AI Infrastructure from First Principles"
seriesOrder: 1
labPath: "labs/llm/modern-transformer"
papers:
  - title: "Attention Is All You Need"
    arxiv: "1706.03762"
    year: 2017
    tag: "Vanilla Transformer"
  - title: "Fast Transformer Decoding: One Write-Head is All You Need"
    arxiv: "1911.02150"
    year: 2019
    tag: "MQA"
  - title: "RoFormer: Enhanced Transformer with Rotary Position Embedding"
    arxiv: "2104.09864"
    year: 2021
    tag: "RoPE"
  - title: "Switch Transformers: Scaling to Trillion Parameter Models"
    arxiv: "2101.03961"
    year: 2021
    tag: "Switch MoE"
  - title: "GQA: Training Generalized Multi-Query Transformer Models"
    arxiv: "2305.13245"
    year: 2023
    tag: "GQA"
  - title: "Mixtral of Experts"
    arxiv: "2401.04088"
    year: 2024
    tag: "Mixtral 8x7B"
  - title: "The Llama 3 Herd of Models"
    arxiv: "2407.21783"
    year: 2024
    tag: "Llama 3"
---

## Five mutations between 2017 and modern frontier decoders

Every modern open-weights language model—whether Llama-3, Qwen, Mixtral, or DeepSeek—remains a decoder-only descendant of Vaswani et al.'s 2017 Transformer. Yet if you compare a 2017 block against a 2024–2026 production block line by line, not a single sub-layer is left untouched. Four distinct systems bottlenecks forced five standardized mutations:

1. **Deep residual gradient instability and memory-bound normalization** drove the shift from Post-LayerNorm to **Pre-RMSNorm**.
2. **Length extrapolation failure and entangled position-content projections** replaced additive sinusoidal embeddings with **Rotary Position Embeddings (RoPE)**.
3. **Autoregressive KV cache memory capacity and HBM bandwidth saturation** compressed Multi-Head Attention (MHA) into **Multi-Query (MQA)** and **Grouped-Query Attention (GQA)**.
4. **Expressivity bottlenecks in dense point-wise feed-forward layers** replaced two-matrix ReLU blocks with three-matrix bias-free **SwiGLU** gates.
5. **The strict coupling between total parameter capacity and per-token FLOPs** split dense feed-forward networks into **Top-$K$ Sparse Mixture-of-Experts (MoE)** layers.

| Architectural Component | 2017 Vanilla Transformer | Modern Standard (Llama-3 / Mixtral) | Primary Systems & Numerical Payoff |
| :--- | :--- | :--- | :--- |
| **Normalization Placement** | Post-LN: $\text{LN}(x + F(x))$ | Pre-RMSNorm: $x + F(\text{RMSNorm}(x))$ | Unimpeded identity gradient highway; single-pass variance reduction |
| **Positional Encoding** | Additive Sinusoidal at input | Multiplicative **RoPE** inside each $Q, K$ layer | Exact relative-distance dot product $\langle R_m q, R_n k \rangle = g(q, k, m-n)$ |
| **Attention KV Heads** | MHA ($n_{\text{kv}} = n_q$) | **GQA** ($n_{\text{kv}} = n_q / G$, e.g. $8$ vs $32$) | $4\times$ smaller KV cache footprint and $4\times$ less HBM decode traffic |
| **Feed-Forward Network** | $\text{ReLU}(xW_1 + b_1)W_2 + b_2$ | **SwiGLU**: $(\text{SiLU}(xW_{\text{gate}}) \odot xW_{\text{up}})W_{\text{down}}$ | Multiplicative gating with zero bias parameters |
| **Parameter Sparsity** | Dense ($100\%$ weights active) | **Top-$K$ Sparse MoE** (e.g. $K=2$ of $E=8$) | Decouples model knowledge capacity ($46.7\text{B}$) from active compute ($12.9\text{B}$) |

![Figure 1: Scaling comparison of KV cache memory across MHA, GQA, MLA, and MQA at Batch=16 alongside total versus active parameter counts in Sparse MoE models.](/images/articles/llm-infra/fig1-modern-transformer-evolution.svg)

## From Post-LayerNorm to Pre-RMSNorm

The 2017 Transformer applied LayerNorm *after* the residual addition:

$$
x_{\ell+1} = \text{LayerNorm}\big(x_\ell + F_\ell(x_\ell)\big)
$$

During backpropagation, the gradient with respect to the bottom layer $x_1$ must pass through the Jacobian of every intermediate LayerNorm operator. Near initialization, variance rescaling compounds across depth $L$, amplifying gradients near the output layer while attenuating gradients in early layers. Training deep Post-LN stacks required fragile learning-rate warmup schedules.

Moving normalization inside the residual branch (**Pre-Norm**) creates a clean identity path from the loss all the way to the embedding layer:

$$
x_{\ell+1} = x_\ell + F_\ell\big(\text{RMSNorm}(x_\ell)\big) \implies \frac{\partial x_L}{\partial x_1} = I + \sum_{\ell=1}^{L-1} \frac{\partial F_\ell(\text{RMSNorm}(x_\ell))}{\partial x_1}
$$

Simultaneously, Zhang and Sennrich showed that LayerNorm's mean-centering step ($\mu = \frac{1}{d}\sum_{i=1}^d x_i$) and additive bias $\beta$ contribute negligible accuracy gains while requiring two sequential reduction passes over High Bandwidth Memory (HBM). **RMSNorm** discards mean centering and normalizes strictly by the root mean square:

$$
\text{RMSNorm}(x) = \frac{x}{\sqrt{\frac{1}{d}\sum_{i=1}^d x_i^2 + \epsilon}} \odot \gamma
$$

A critical production detail appears in mixed-precision (`bfloat16` or `float16`) kernels: squaring activations $x_i^2$ can easily overflow the `float16` dynamic range ($\max \approx 65504$) or lose precision during reduction. Industrial implementations always cast $x$ to `float32` before computing the reciprocal square root `rsqrt`, then cast the normalized tensor back to the working precision before multiplying by $\gamma$.

## Rotary Position Embeddings and complex-plane invariance

Adding a positional vector $p_m$ to the input token embedding $x_m$ entangles semantics and position. Once $(x_m + p_m)$ is multiplied by $W_Q$ and $W_K$ across dozens of layers, the attention logit expands into four cross-terms where positional distance is mixed with arbitrary projection matrices.

Su et al. (**RoFormer**, arXiv:2104.09864) formulated a cleaner requirement: find an operator $f(q, m)$ and $f(k, n)$ such that the inner product depends *exclusively* on the vectors $q, k$ and their relative distance $m - n$:

$$
\big\langle f(q, m),\, f(k, n) \big\rangle = g(q, k, m - n)
$$

In two dimensions, rotation in the complex plane satisfies this identity immediately. If we rotate $q \in \mathbb{R}^2$ by angle $m\theta$ and $k \in \mathbb{R}^2$ by angle $n\theta$, the orthogonal rotation matrices $R_m, R_n$ obey $R_m^\top R_n = R_{n - m}$:

$$
\begin{pmatrix} q_0' \\ q_1' \end{pmatrix} = \begin{pmatrix} \cos m\theta & -\sin m\theta \\ \sin m\theta & \cos m\theta \end{pmatrix} \begin{pmatrix} q_0 \\ q_1 \end{pmatrix}
$$

For a head dimension $d_{\text{head}}$ (such as $128$ in Llama-3), RoPE partitions the feature vector into $d_{\text{head}}/2 = 64$ independent two-dimensional subspaces. Each pair $i \in \{0, \dots, d/2 - 1\}$ rotates at a geometric frequency $\theta_i = \text{base}^{-2i/d}$ (where $\text{base} = 10000$ in standard RoFormer and $500000$ in Llama-3 to support $128\text{K}$ context):

<details class="derivation-box">
<summary>Algebraic proof of RoPE relative-position invariance</summary>

Represent each 2D feature pair $(q_{2i}, q_{2i+1})$ as a complex number $z_{q,i} = q_{2i} + \mathrm{i}\,q_{2i+1} \in \mathbb{C}$. Applying RoPE at position $m$ multiplies $z_{q,i}$ by $e^{\mathrm{i} m \theta_i}$. The inner product between rotated query at position $m$ and rotated key at position $n$ is:

$$
\langle R_m q, R_n k \rangle = \sum_{i=0}^{d/2 - 1} \operatorname{Re}\!\left( \big(z_{q,i} e^{\mathrm{i} m \theta_i}\big) \overline{\big(z_{k,i} e^{\mathrm{i} n \theta_i}\big)} \right) = \sum_{i=0}^{d/2 - 1} \operatorname{Re}\!\left( z_{q,i} \overline{z_{k,i}}\, e^{\mathrm{i}(m - n)\theta_i} \right)
$$

Because the right-hand side depends on $m$ and $n$ strictly through their difference $(m - n)$, any two token pairs separated by the same offset $\Delta = m - n$ experience the exact same positional rotation operator.
</details>

<!-- lab: labs/llm/modern-transformer/modern_blocks.py#rmsnorm_rope -->

In our companion CPU verification (`labs/llm/modern-transformer`), evaluating $\langle R_{10} q, R_5 k \rangle$ versus $\langle R_{85} q, R_{80} k \rangle$ for identical vectors at distance $\Delta = 5$ yields inner products that agree to within $1.5 \times 10^{-5}$ in `float32` and $10^{-15}$ in `float64`. Notice also that RoPE is applied only to $Q$ and $K$ at every layer—never to $V$—preserving pure content aggregation in the value weighted sum.

## Breaking the KV cache wall: MHA to MQA and GQA

Autoregressive inference splits into two hardware regimes. During **Prefill**, all $S$ prompt tokens are processed in parallel via dense matrix-matrix multiplications (GEMM), easily saturating GPU Tensor Cores. During **Decode**, the model generates one token at a time; every step must stream the entire model weight parameters plus all historical Key and Value tensors (**KV Cache**) from HBM for a single token's matrix-vector product (GEMV).

The exact BF16 KV cache capacity ledger is:

$$
\text{Bytes}_{\text{KV}} = 2 \text{ (K and V)} \times L \times B \times S \times n_{\text{kv}} \times d_{\text{head}} \times 2\text{ Bytes}
$$

Consider a 32-layer **Llama-3-8B** architecture ($L=32, n_q=32, d_{\text{head}}=128$) serving a batch of $B=16$ sequences at context length $S=32768$:

- **Vanilla MHA ($n_{\text{kv}} = 32$)**: Requires $2 \times 32 \times 16 \times 32768 \times 32 \times 128 \times 2 = \mathbf{256.0\text{ GB}}$ of KV cache—more than $16\times$ the $15\text{ GB}$ footprint of the model weights themselves, overflowing three 80 GB H100 GPUs.
- **Multi-Query Attention (MQA, Shazeer 2019, $n_{\text{kv}} = 1$)**: All $32$ query heads share a single Key and Value head. The KV cache drops $32\times$ to $\mathbf{8.0\text{ GB}}$, at the cost of measurable quality degradation on complex reasoning tasks.
- **Grouped-Query Attention (GQA, Ainslie et al. 2023, $n_{\text{kv}} = 8$)**: Queries are partitioned into $G = 8$ groups of $4$ heads each; every group shares one Key and Value head. The KV cache shrinks by $75\%$ to $\mathbf{64.0\text{ GB}}$, matching MHA perplexity while cutting decode HBM traffic by $4\times$.

## SwiGLU and Top-K Sparse Mixture-of-Experts

In a Llama-3-8B block, the GQA module holds $41.94\text{M}$ parameters ($W_Q, W_O \in \mathbb{R}^{4096 \times 4096}$ and $W_K, W_V \in \mathbb{R}^{4096 \times 1024}$), whereas the **SwiGLU** feed-forward network holds $176.16\text{M}$ parameters—over $80\%$ of every transformer layer:

$$
\text{SwiGLU}(x) = \Big(\operatorname{SiLU}(x W_{\text{gate}}) \odot (x W_{\text{up}})\Big) W_{\text{down}}, \quad \operatorname{SiLU}(z) = \frac{z}{1 + e^{-z}}
$$

Because the feed-forward network stores the vast majority of parametric knowledge, scaling a dense model forces compute FLOPs ($\approx 2N$ per token) to grow linearly with total parameter count $N$. **Sparse Mixture-of-Experts (MoE)**—pioneered at trillion-parameter scale by **Switch Transformer** ($K=1$) and standardized for open weights by **Mixtral 8x7B** ($E=8, K=2$)—replaces the single dense FFN with $E$ parallel SwiGLU experts gated by a lightweight router $W_r \in \mathbb{R}^{H \times E}$:

$$
y = \sum_{i \in \operatorname{Top-}K(x W_r)} \operatorname{Softmax}\!\big(\operatorname{Top-}K(x W_r)\big)_i \cdot E_i(x)
$$

<!-- lab: labs/llm/modern-transformer/modern_blocks.py#gqa_moe -->

In **Mixtral 8x7B**, each layer contains $8$ experts, but every token routes to only $K=2$ experts. Total model parameters reach $\mathbf{46.7\text{B}}$ (which must reside in HBM), yet each token executes only $\mathbf{12.9\text{B}}$ active parameters—delivering the knowledge capacity of a $47\text{B}$ model at the latency and FLOP budget of a $13\text{B}$ model.

Run the complete CPU verification suite to inspect RoPE invariance, GQA cache compression, and Top-$K$ MoE routing:

```bash
labs/.venv/bin/python -m unittest discover -s labs/llm/modern-transformer -p 'test_*.py' -v
labs/.venv/bin/python labs/llm/modern-transformer/modern_blocks.py
```

## References and next chapter

- Vaswani et al., [Attention Is All You Need](https://arxiv.org/abs/1706.03762) (2017).
- Su et al., [RoFormer: Enhanced Transformer with Rotary Position Embedding](https://arxiv.org/abs/2104.09864) (2021).
- Ainslie et al., [GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints](https://arxiv.org/abs/2305.13245) (2023).
- Jiang et al., [Mixtral of Experts](https://arxiv.org/abs/2401.04088) (2024) & Dubey et al., [The Llama 3 Herd of Models](https://arxiv.org/abs/2407.21783) (2024).
- Continue to Chapter 2: [The AI Infrastructure Ledger: Roofline Analysis, FlashAttention-2, and PagedAttention](/articles/roofline-flashattention-pagedattention).
