---
title: "Distributed Training & Compute-Optimal Scaling: Megatron-LM, ZeRO, and Chinchilla Laws"
date: "2026-10-19"
updatedAt: "2026-10-19"
category: "Systems"
excerpt: "Account for every byte of the 16-byte mixed-precision training rule, eliminate Data Parallel redundancy via ZeRO-1/2/3, slice operators with Megatron-LM 3D parallelism, and reconcile Chinchilla optimality with inference-optimal over-training."
lang: "en"
tags: ["Distributed Training", "Megatron-LM", "ZeRO", "Scaling Laws", "Chinchilla", "AI Infra"]
featured: false
draft: false
series: "LLM & AI Infrastructure from First Principles"
seriesOrder: 3
papers:
  - title: "Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism"
    arxiv: "1909.08053"
    year: 2019
    tag: "Megatron-LM"
  - title: "ZeRO: Memory Optimizations Toward Training Trillion Parameter Models"
    arxiv: "1910.02054"
    year: 2019
    tag: "ZeRO"
  - title: "Training Compute-Optimal Large Language Models"
    arxiv: "2203.15556"
    year: 2022
    tag: "Chinchilla"
---

## Why an 8-billion parameter model overflows an 80 GB GPU

In `bfloat16` inference, an $8.03\text{B}$ parameter model (**Llama-3-8B**) occupies $8.03 \times 10^9 \times 2\text{ Bytes} \approx 14.96\text{ GB}$ of VRAM. In mixed-precision training with AdamW, that same model requires **$119.66\text{ GB}$ of static parameter-state memory** before a single token's activations are even allocated.

The culprit is the **$16\Psi$ Mixed-Precision Training Ledger** (Rajbhandari et al., **ZeRO**, arXiv:1910.02054). For every trainable parameter $\psi \in \{1, \dots, \Psi\}$:

1. **Working Weights (`bfloat16` / `float16`)**: $2\text{ Bytes}$ per parameter used in forward and backward GEMMs.
2. **Gradients (`bfloat16` / `float16`)**: $2\text{ Bytes}$ per parameter accumulated during backpropagation.
3. **Optimizer States (`float32` AdamW)**:
   - Master copy of weights $\theta_{\text{fp32}}$ ($4\text{ Bytes}$), required because small update steps $\Delta \theta = -\eta \hat{m}_t / \sqrt{\hat{v}_t}$ underflow in 16-bit precision.
   - First moment momentum buffer $m_t$ ($4\text{ Bytes}$).
   - Second moment variance buffer $v_t$ ($4\text{ Bytes}$).

$$
\text{Static Training Memory} = \underbrace{2\Psi}_{\text{BF16 Weights}} + \underbrace{2\Psi}_{\text{BF16 Grads}} + \underbrace{(4 + 4 + 4)\Psi}_{\text{FP32 AdamW States}} = \mathbf{16\Psi\text{ Bytes}}
$$

For a $70\text{B}$ model ($\Psi = 70 \times 10^9$), the static state alone requires $16 \times 70\text{ GB} = \mathbf{1,120\text{ GB}}$—fourteen $80\text{ GB}$ H100 GPUs just to hold the static buffers, before accounting for layer activations!

![Figure 3: Per-GPU static memory across Baseline DDP and ZeRO Stages 1–3 for a 70B model alongside Chinchilla compute-optimal versus Llama-3 inference-optimal token budgets.](/images/articles/llm-infra/fig3-zero-chinchilla-scaling.svg)

## ZeRO-1, ZeRO-2, and ZeRO-3: Sharding redundant data-parallel state

Standard Distributed Data Parallelism (**DDP**) replicates the entire $16\Psi$ byte state across all $N_d$ data-parallel GPUs. Since every rank holds identical weights and optimizer buffers, $N_d - 1$ copies are pure memory redundancy. **Zero Redundancy Optimizer (ZeRO)** (arXiv:1910.02054) partitions these three state components across the $N_d$ data-parallel ranks while preserving the exact mathematical semantics of synchronous mini-batch SGD:

| Sharding Mode | Per-GPU Static Memory Formula | 70B Model on $N_d = 8$ GPUs | Collective Communication Pattern & Overhead |
| :--- | :--- | ---: | :--- |
| **Baseline DDP** | $16\Psi$ | $1,120.0\text{ GB}$ (OOM) | `AllReduce` gradients ($2 \times 2\Psi = 4\Psi$ bytes per step) |
| **ZeRO-1** ($P_{\text{os}}$) | $2\Psi + 2\Psi + \frac{12\Psi}{N_d}$ | $385.0\text{ GB}$ | `ReduceScatter` grads + `AllGather` updated weights ($4\Psi$ bytes—**zero extra traffic!**) |
| **ZeRO-2** ($P_{\text{os+g}}$) | $2\Psi + \frac{2\Psi + 12\Psi}{N_d}$ | $315.0\text{ GB}$ | Gradients freed immediately after `ReduceScatter` ($4\Psi$ bytes—**zero extra traffic!**) |
| **ZeRO-3 / FSDP** ($P_{\text{os+g+p}}$) | $\frac{16\Psi}{N_d}$ | $\mathbf{140.0\text{ GB}}$ ($8\times$ reduction) | Adds `AllGather` weights before forward & backward ($1.5\times$ total traffic: $6\Psi$ bytes) |

<details class="derivation-box">
<summary>Why ZeRO-1 and ZeRO-2 incur zero extra communication over DDP</summary>

A ring or tree `AllReduce` of $2\Psi$ bytes of `bfloat16` gradients is implemented under the hood as two phases:
1. A **`ReduceScatter`** ($2\Psi$ bytes transferred), after which each of the $N_d$ GPUs holds the fully summed gradient for its assigned $1/N_d$ shard of parameters.
2. An **`AllGather`** ($2\Psi$ bytes transferred), which broadcasts the summed gradients to every GPU.

In **ZeRO-2**, each rank *only* updates the $1/N_d$ slice of AdamW states it owns. Therefore, after `ReduceScatter` finishes, each rank immediately steps its local FP32 AdamW shard and discards the rest of the gradients, then executes the `AllGather` on the newly updated `bfloat16` weights instead of the gradients. Total network volume remains $2\Psi + 2\Psi = 4\Psi$ bytes per step—identical to DDP!
</details>

## Megatron-LM: Tensor Parallelism and Pipeline Parallelism

When a single layer's weight matrix or activation footprint is too large, or when ZeRO-3's inter-node `AllGather` latency exceeds interconnect bandwidth, **Megatron-LM** (Shoeybi et al., arXiv:1909.08053) slices the transformer operators themselves across fast intra-node NVLink ($900\text{ GB/s}$ on H100) using **Tensor Parallelism (TP)**.

The key design goal of Megatron-LM is to partition a two-layer MLP or multi-head attention block **without requiring communication in the middle of the nonlinear activation function**:

1. **Column-Parallel Linear First Layer ($W_1$)**: Split the weight matrix $A \in \mathbb{R}^{H \times d_{\text{ff}}}$ column-wise across $N_{\text{tp}}$ GPUs as $A = [A_1, A_2, \dots, A_{N_{\text{tp}}}]$. Because $\operatorname{GeLU}$ or $\operatorname{SiLU}$ is an element-wise nonlinearity, it applies independently to each column shard:

$$
\big[Y_1,\, Y_2\big] = \Big[\operatorname{GeLU}(X A_1),\, \operatorname{GeLU}(X A_2)\Big]
$$

2. **Row-Parallel Linear Second Layer ($W_2$)**: Split the down-projection matrix $B \in \mathbb{R}^{d_{\text{ff}} \times H}$ row-wise as $B = \begin{bmatrix} B_1 \\ B_2 \end{bmatrix}$. The block matrix product becomes a sum of partial matrices:

$$
Z = \big[Y_1,\, Y_2\big] \begin{bmatrix} B_1 \\ B_2 \end{bmatrix} = Y_1 B_1 + Y_2 B_2
$$

Each GPU computes $Y_i B_i \in \mathbb{R}^{B \times S \times H}$ locally, followed by a single **`AllReduce`** before the residual dropout and layer normalization. For Multi-Head Attention, $W_Q, W_K, W_V$ are partitioned column-wise across heads, and $W_O$ is partitioned row-wise—requiring **only two `AllReduce` operations per Transformer block** in the forward pass and two in the backward pass.

When scaling across multiple nodes connected by slower InfiniBand fabric, **Pipeline Parallelism (PP)** assigns contiguous groups of layers (stages) to different nodes. Naive sequential pipelining leaves $N_{\text{pp}} - 1$ stages idle at any moment, creating a **Pipeline Bubble** fraction of $\frac{N_{\text{pp}} - 1}{M + N_{\text{pp}} - 1}$ for $M$ micro-batches. The **1F1B (One-Forward-One-Backward)** schedule interleaves forward and backward micro-batches so that in-flight activation memory stays bounded by $N_{\text{pp}}$ micro-batches rather than $M$, while **Sequence Parallelism (SP)** shards the `RMSNorm` and `Dropout` activations along the sequence dimension $S$ by replacing TP's `AllReduce` with `ReduceScatter` + `AllGather`.

## Chinchilla Compute-Optimal Scaling vs. Inference-Optimal Models

How should a fixed training compute budget $C \approx 6 N D$ (where $N$ is parameters and $D$ is training tokens) be divided between model size $N$ and dataset size $D$?

Kaplan et al. (2020) originally suggested scaling $N \propto C^{0.73}$ and $D \propto C^{0.27}$, leading to massive, under-trained models such as GPT-3 ($175\text{B}$ parameters trained on $300\text{B}$ tokens) and Gopher ($280\text{B}$). Hoffmann et al. (**Chinchilla**, arXiv:2203.15556) discovered that Kaplan's experiments used a fixed cosine learning-rate schedule length instead of matching the decay horizon to each token budget. By fitting the parametric loss surface across over 400 training runs:

$$
L(N, D) = E + \frac{A}{N^\alpha} + \frac{B}{D^\beta}, \qquad \alpha \approx 0.34,\; \beta \approx 0.28
$$

and minimizing $L(N, D)$ subject to $\text{FLOPs}(N, D) = 6ND = C$, Chinchilla proved that **model parameters $N$ and training tokens $D$ must scale in equal proportion**:

$$
N_{\text{opt}} \propto C^{\frac{\beta}{\alpha + \beta}} \approx C^{0.50}, \qquad D_{\text{opt}} \propto C^{\frac{\alpha}{\alpha + \beta}} \approx C^{0.50} \implies \mathbf{D_{\text{opt}} \approx 20 N}
$$

Trained on $1.4\text{T}$ tokens, the $70\text{B}$ Chinchilla model outperformed the $280\text{B}$ Gopher model across virtually every benchmark while requiring $4\times$ less inference memory and compute.

### Why Llama-3 trains an 8B model on 15 Trillion tokens

Notice that Chinchilla optimizes strictly for **pretraining FLOPs $C_{\text{train}}$**, ignoring **lifetime inference cost $C_{\text{infer}}$**. Under the $D \approx 20N$ rule, an $8\text{B}$ model is "compute-optimal" at just $160\text{B}$ tokens. Yet Meta trained **Llama-3-8B** on **$15\text{ Trillion}$ tokens** ($D / N \approx 1,875\times$—nearly $94\times$ beyond the Chinchilla ratio!).

Why? Because a popular open-weights or production model is trained once, then served across billions of inference requests. Spending extra pretraining compute to compress the loss of a $70\text{B}$ Chinchilla-optimal model into an $8\text{B}$ parameter footprint permanently slashes every downstream user's KV cache footprint and decode HBM traffic by nearly $9\times$. Modern frontier training therefore follows an **Inference-Adjusted Scaling Law**:

$$
\min_{N, D}\; L(N, D) \quad \text{subject to} \quad 6 N D + 2 N \cdot T_{\text{lifetime\_infer}} \le C_{\text{total}}
$$

## References and next chapter

- Shoeybi et al., [Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism](https://arxiv.org/abs/1909.08053) (2019).
- Rajbhandari et al., [ZeRO: Memory Optimizations Toward Training Trillion Parameter Models](https://arxiv.org/abs/1910.02054) (2019).
- Hoffmann et al., [Training Compute-Optimal Large Language Models](https://arxiv.org/abs/2203.15556) (2022).
- Continue to Chapter 4: [Post-Training Alignment & Test-Time Reasoning: RLHF, DPO, and DeepSeek-R1's GRPO](/articles/alignment-dpo-deepseek-r1-grpo).
