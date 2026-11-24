---
title: "The AI Infrastructure Ledger: Roofline Analysis, FlashAttention-2, and PagedAttention"
date: "2026-10-17"
updatedAt: "2026-10-17"
category: "Systems"
excerpt: "Derive the arithmetic intensity ridge point on an NVIDIA H100, eliminate quadratic HBM traffic via Online Softmax SRAM tiling, and reclaim fragmented KV cache memory with vLLM's PagedAttention."
lang: "en"
tags: ["AI Infra", "Roofline", "FlashAttention", "PagedAttention", "vLLM", "CUDA"]
featured: false
draft: false
series: "LLM & AI Infrastructure from First Principles"
seriesOrder: 2
labPath: "labs/llm/roofline-flash"
papers:
  - title: "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness"
    arxiv: "2205.14135"
    year: 2022
    tag: "FlashAttention-1"
  - title: "FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning"
    arxiv: "2307.08691"
    year: 2023
    tag: "FlashAttention-2"
  - title: "Efficient Memory Management for Large Language Model Serving with PagedAttention"
    arxiv: "2309.06180"
    year: 2023
    tag: "vLLM / PagedAttention"
---

## Why FLOPs alone cannot explain LLM latency

When engineers optimize deep learning models solely by counting floating-point operations (FLOPs), two paradoxes appear immediately:

1. **Autoregressive generation is orders of magnitude slower per token than prompt prefill**, even though the per-token linear algebra executes the exact same matrix weights.
2. **Standard self-attention spends most of its wall-clock time waiting on memory**, even when the GPU's Tensor Cores are less than $25\%$ utilized.

Both phenomena are governed by the **Roofline Model**, which relates an operator's **Arithmetic Intensity** ($\mathcal{I} = \text{FLOPs} / \text{Bytes transferred}$) to the hardware's **Ridge Point**:

$$
\mathcal{I}_{\text{ridge}} = \frac{\text{Peak Compute Throughput (FLOPs/s)}}{\text{Peak HBM Bandwidth (Bytes/s)}}
$$

For an **NVIDIA H100 SXM** GPU delivering $989\text{ TFLOPS}$ of dense `bfloat16` Tensor Core compute and $3.35\text{ TB/s}$ ($3350\text{ GB/s}$) of HBM3 bandwidth, the ridge point is:

$$
\mathcal{I}_{\text{ridge}}^{\text{H100}} = \frac{989 \times 10^{12}\text{ FLOPs/s}}{3350 \times 10^{9}\text{ Bytes/s}} \approx \mathbf{295.2\text{ FLOPs/Byte}}
$$

Any kernel with arithmetic intensity below $295.2\text{ FLOPs/Byte}$ is **Memory-bound** (bottlenecked by HBM3 bandwidth); any kernel above it is **Compute-bound** (bottlenecked by Tensor Core math pipes).

![Figure 2: H100 SXM Roofline operating regimes for LLM Prefill and Decode alongside single-layer HBM read/write traffic reduction in FlashAttention-2.](/images/articles/llm-infra/fig2-roofline-flashattention.svg)

## The Prefill versus Decode arithmetic intensity ledger

Using our first-principles calculator (`labs/llm/roofline-flash`), let us evaluate **Llama-3-8B** ($N = 8.03\text{B}$ parameters, $15.0\text{ GB}$ in `bfloat16`) at sequence length $S = 4096$ across batch sizes $B \in \{1, 16, 128\}$:

- **Prefill Phase ($B \times S$ tokens processed in parallel)**: Every weight matrix is loaded once from HBM and multiplied against $B \times S$ token vectors via dense GEMM:

$$
\mathcal{I}_{\text{prefill}} \approx \frac{2 N B S}{2 N + \text{Bytes}_{\text{KV}}(B, S)}
$$

- **Decode Phase ($B \times 1$ new tokens generated per step)**: Every single decoding step must reload all $2N$ bytes of model weights *plus* all $B \times S$ historical KV cache vectors from HBM just to compute $B$ token outputs:

$$
\mathcal{I}_{\text{decode}} \approx \frac{2 N B}{2 N + \text{Bytes}_{\text{KV}}(B, S)} \le B\text{ FLOPs/Byte}
$$

| Batch Size ($B$) | Sequence Length ($S$) | Prefill Intensity ($\text{FLOPs/B}$) | Prefill Hardware Regime | Decode Intensity ($\text{FLOPs/B}$) | Decode Hardware Regime |
| :--- | :--- | ---: | :--- | ---: | :--- |
| $B = 1$ | $4096$ | $3,891.0$ | **Compute-bound** ($13.2\times$ ridge) | $0.97$ | **Extreme Memory-bound** ($0.3\%$ peak) |
| $B = 16$ | $4096$ | $3,963.0$ | **Compute-bound** ($13.4\times$ ridge) | $14.31$ | **Memory-bound** ($4.8\%$ peak) |
| $B = 128$ | $4096$ | $3,254.5$ | **Compute-bound** ($11.0\times$ ridge) | $69.50$ | **Memory-bound** (KV cache dominates) |

<!-- lab: labs/llm/roofline-flash/roofline_flash.py#roofline_ledger -->

At $B = 1$, decoding achieves $0.97\text{ FLOPs/Byte}$—leaving $99.6\%$ of the H100's Tensor Cores idle while waiting on HBM reads. Even when batching $B = 128$ concurrent requests, the growing KV cache denominator prevents decode intensity from crossing the $295.2\text{ FLOPs/Byte}$ ridge point.

## FlashAttention: IO-aware SRAM tiling and Online Softmax

During training and long-context prefill, the linear projections are compute-bound, but **self-attention itself is severely memory-bound**. Given $Q, K, V \in \mathbb{R}^{N \times d}$ in HBM, standard attention executes three separate kernel stages:

1. Read $Q, K$ from HBM, compute $S = QK^\top / \sqrt{d} \in \mathbb{R}^{N \times N}$, and **write $S$ back to HBM** ($O(N^2)$ writes).
2. Read $S$ from HBM, compute $P = \operatorname{Softmax}(S) \in \mathbb{R}^{N \times N}$, and **write $P$ back to HBM** ($O(N^2)$ reads and writes).
3. Read $P$ and $V$ from HBM, compute $O = PV \in \mathbb{R}^{N \times d}$, and write $O$ to HBM.

At $N = 32768$, $B = 4$, and $H = 32$ heads, materializing $S$ and $P$ transfers over **$1,024\text{ GB}$ of intermediate HBM traffic per layer**! Yet each Streaming Multiprocessor (SM) on an A100/H100 has fast on-chip **SRAM** ($192\text{ KB}\text{--}256\text{ KB}$ per SM) operating at $\sim 19\text{ TB/s}$—nearly $6\times$ faster than HBM3.

Dao et al. (**FlashAttention**, arXiv:2205.14135) fused all three steps into a single CUDA kernel by tiling $Q$ into blocks $Q_i \in \mathbb{R}^{B_r \times d}$ in SRAM and streaming blocks $K_j, V_j \in \mathbb{R}^{B_c \times d}$ across them. The mathematical obstacle is that `Softmax` couples every column in a row through its global maximum $m(x) = \max_k x_k$ and denominator $\ell(x) = \sum_k e^{x_k - m(x)}$.

**Online Softmax** resolves this by maintaining a running row maximum $m_i^{(j)}$ and a rescaled running sum $\ell_i^{(j)}$ as each key/value tile $j$ arrives in SRAM:

$$
m_i^{\text{new}} = \max\!\big(m_i^{\text{old}},\, \operatorname{rowmax}(S_{ij})\big), \qquad \alpha_i = \exp\!\big(m_i^{\text{old}} - m_i^{\text{new}}\big)
$$

$$
\ell_i^{\text{new}} = \alpha_i \ell_i^{\text{old}} + \operatorname{rowsum}\!\Big(\exp(S_{ij} - m_i^{\text{new}})\Big), \qquad \tilde{O}_i^{\text{new}} = \alpha_i \tilde{O}_i^{\text{old}} + \exp(S_{ij} - m_i^{\text{new}}) V_j
$$

<details class="derivation-box">
<summary>Exactness proof of Online Softmax blockwise recursion</summary>

Suppose after processing tiles $1 \dots j-1$, our unnormalized output accumulator satisfies $\tilde{O}_i^{(j-1)} = \sum_{t < j} \exp(S_{it} - m_i^{(j-1)}) V_t$. When tile $j$ updates the row maximum from $m_i^{(j-1)}$ to $m_i^{(j)}$, multiplying $\tilde{O}_i^{(j-1)}$ by $\alpha_i = \exp(m_i^{(j-1)} - m_i^{(j)})$ uses the exponential law $e^a \cdot e^b = e^{a+b}$:

$$
\alpha_i \tilde{O}_i^{(j-1)} + \exp(S_{ij} - m_i^{(j)}) V_j = \sum_{t \le j} \exp\!\big(S_{it} - m_i^{(j)}\big) V_t
$$

After the final tile completes, dividing $\tilde{O}_i$ by $\ell_i$ yields the exact full-sequence attention output $O_i = \operatorname{Softmax}(S_i) V$ without ever writing $S$ or $P$ to HBM. Furthermore, during backpropagation, FlashAttention avoids storing the $O(N^2)$ matrices by saving only the compact log-sum-exp vector $L_i = m_i + \log \ell_i \in \mathbb{R}^N$ and recomputing attention tiles on-chip in SRAM.
</details>

<!-- lab: labs/llm/roofline-flash/roofline_flash.py#online_tiled_attention -->

## FlashAttention-2: Loop inversion and warp partitioning

While FlashAttention-1 eliminated $O(N^2)$ HBM traffic, it achieved only $25\%\text{--}40\%$ of theoretical peak FLOPs on A100. **FlashAttention-2** (Dao, arXiv:2307.08691) identified three GPU microarchitectural bottlenecks and fixed them:

1. **Inverting the outer and inner loops**: FlashAttention-1 placed $K, V$ blocks in the outer loop and $Q$ blocks in the inner loop, forcing every inner step to read and atomically accumulate partial updates to $O_i$ and $\ell_i$ in HBM. FlashAttention-2 moves **$Q_i$ to the outer loop** and streams $K_j, V_j$ in the inner loop so the accumulator $\tilde{O}_i$ stays entirely inside registers/SRAM for the full lifetime of the loop.
2. **Warp partitioning (Split-$Q$ over Split-$K$)**: Instead of splitting $K$ across 4 warps in a threadblock (which requires shared-memory barrier synchronization after every GEMM to sum $Q K_j^\top$), FlashAttention-2 assigns disjoint rows of $Q_i$ to each warp. Every warp streams the shared $K_j, V_j$ tiles from SRAM with zero inter-warp communication.
3. **Causal block skipping**: For any tile where all column indices exceed all row indices ($j_{\text{start}} > i_{\text{end}}$), the entire block is skipped instead of computing and masking zeros, saving nearly $50\%$ of causal attention FLOPs.

## PagedAttention (vLLM): Virtual memory for the KV cache

Even with GQA and FlashAttention-2, production serving engines wasted **$60\%\text{--}80\%$ of GPU memory** on KV cache fragmentation. Because an LLM's output length is unknown ahead of time, early serving frameworks pre-allocated a contiguous HBM slab of size $S_{\max}$ (e.g., $4096$ or $32768$ tokens) for every active request. This caused three forms of waste:

- **Internal fragmentation**: Reserved slots for future tokens that a short completion never uses.
- **Reservation waste**: Slots held idle while waiting for future decoding steps.
- **External fragmentation**: Contiguous slabs of varying sequence lengths cannot pack cleanly into HBM.

Kwon et al. (**vLLM / PagedAttention**, arXiv:2309.06180) mapped operating-system virtual memory directly onto the KV cache:

1. **Fixed-size physical KV blocks**: HBM is partitioned into small, uniform physical pages (e.g., $B_{\text{block}} = 16$ tokens per block).
2. **Logical-to-physical Page Table**: Each sequence appends to logical blocks on demand; a block table maps logical block IDs to non-contiguous physical HBM blocks, driving internal fragmentation below $4\%$ (at most $15$ unused token slots at the tail of a sequence).
3. **Copy-on-Write (CoW) prefix sharing**: When multiple requests share a system prompt or conduct parallel sampling ($n > 1$), their page tables point to the *exact same physical KV blocks* with reference counting. Only when a branch mutates a partially filled block does vLLM allocate a new physical page and copy those 16 tokens.

Run the Roofline and Online Softmax tiled attention lab on CPU:

```bash
labs/.venv/bin/python -m unittest discover -s labs/llm/roofline-flash -p 'test_*.py' -v
labs/.venv/bin/python labs/llm/roofline-flash/roofline_flash.py
```

## References and next chapter

- Dao et al., [FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness](https://arxiv.org/abs/2205.14135) (2022).
- Dao, [FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning](https://arxiv.org/abs/2307.08691) (2023).
- Kwon et al., [Efficient Memory Management for Large Language Model Serving with PagedAttention](https://arxiv.org/abs/2309.06180) (2023).
- Continue to Chapter 3: [Distributed Training & Compute-Optimal Scaling: Megatron-LM, ZeRO, and Chinchilla Laws](/articles/distributed-training-zero-megatron-chinchilla).
