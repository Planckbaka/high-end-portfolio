---
title: "Hardware-Algorithm Co-Design at Frontier Scale: DeepSeek-V2/V3 MLA, DualPipe, and DistServe"
date: "2026-10-23"
updatedAt: "2026-10-23"
category: "Systems"
excerpt: "Prove how Multi-head Latent Attention (MLA) absorbs decompression matrices into Query and Output projections to slash KV cache by 93.3%, overlap all-to-all MoE traffic with DualPipe, and disaggregate Prefill from Decode."
lang: "en"
tags: ["DeepSeek-V3", "MLA", "DualPipe", "FP8", "DistServe", "Speculative Decoding"]
featured: false
draft: false
series: "LLM & AI Infrastructure from First Principles"
seriesOrder: 5
labPath: "labs/llm/deepseek-mla-grpo"
papers:
  - title: "Fast Inference from Transformers via Speculative Decoding"
    arxiv: "2211.17192"
    year: 2022
    tag: "Speculative Decoding"
  - title: "DistServe: Disaggregating Prefill and Decoding for Goodput-optimized LLM Serving"
    arxiv: "2401.09670"
    year: 2024
    tag: "DistServe (PD Disaggregation)"
  - title: "DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model"
    arxiv: "2405.04434"
    year: 2024
    tag: "DeepSeek-V2 (MLA)"
  - title: "DeepSeek-V3 Technical Report"
    arxiv: "2412.19437"
    year: 2024
    tag: "DeepSeek-V3 (DualPipe & FP8)"
---

## Why GQA was not the final word on KV cache compression

In Chapter 1, Grouped-Query Attention (GQA) reduced the KV cache of an 8B/70B model by $4\times\text{--}8\times$ by forcing groups of query heads to share identical Key and Value heads. Yet sharing heads reduces the expressive rank of the attention kernel. Can we give every single attention head its own distinct Key and Value representations while caching **even fewer bytes than GQA**?

**DeepSeek-V2** (arXiv:2405.04434) and **DeepSeek-V3** ($671\text{B}$ total parameters, $37\text{B}$ active per token, arXiv:2412.19437) answered yes with **Multi-head Latent Attention (MLA)**. Instead of projecting hidden state $h_t \in \mathbb{R}^d$ directly to $n_h$ heads of dimension $d_h$, MLA first projects $h_t$ down into a shared low-rank **latent vector** $c_t^{KV} \in \mathbb{R}^{d_c}$ (where $d_c = 512 \ll n_h d_h = 128 \times 128 = 16384$):

$$
c_t^{KV} = h_t W^{DKV}, \qquad k_{t,i}^C = c_t^{KV} (W_i^{UK})^\top, \qquad v_{t,i}^C = c_t^{KV} (W_i^{UV})^\top
$$

If we had to materialize $k_{t,i}^C$ and $v_{t,i}^C$ in HBM during decoding, no memory would be saved. The breakthrough of MLA is **associative matrix absorption**: during inference, the up-projection matrices $W_i^{UK}, W_i^{UV} \in \mathbb{R}^{d_h \times d_c}$ are absorbed directly into the Query projection and Output projection!

<details class="derivation-box">
<summary>Exact linear-algebraic proof of MLA Matrix Absorption and Decoupled RoPE</summary>

Consider the unscaled attention score between head $i$'s query $q_{t,i} \in \mathbb{R}^{1 \times d_h}$ at step $t$ and historical key $k_{s,i}^C = c_s^{KV} (W_i^{UK})^\top$ at step $s \le t$:

$$
q_{t,i} (k_{s,i}^C)^\top = q_{t,i} \Big(c_s^{KV} (W_i^{UK})^\top\Big)^\top = \underbrace{\big(q_{t,i} W_i^{UK}\big)}_{q_{t,i}^{\text{abs}} \in \mathbb{R}^{1 \times d_c}} (c_s^{KV})^\top
$$

Similarly, for the value weighted sum across historical positions $s \le t$ with attention weights $\alpha_{t,s}^{(i)}$:

$$
o_{t,i} = \sum_{s \le t} \alpha_{t,s}^{(i)} v_{t,s}^C = \sum_{s \le t} \alpha_{t,s}^{(i)} \Big(c_s^{KV} (W_i^{UV})^\top\Big) = \left(\sum_{s \le t} \alpha_{t,s}^{(i)} c_s^{KV}\right) (W_i^{UV})^\top
$$

Thus **only the single compressed latent vector $c_s^{KV} \in \mathbb{R}^{d_c}$ is ever stored in the KV cache**!

**Why Decoupled RoPE is mandatory**: If we applied position-dependent rotation $\mathcal{R}_m$ between $W^{DKV}$ and $W_i^{UK}$, the intermediate matrix would become $W_i^{UK} \mathcal{R}_{t - s}$, which depends on $s$ and **cannot be absorbed into $q_{t,i}$** without recomputing keys for every historical token $s$. DeepSeek-V2 solves this via **Decoupled RoPE**: it splits off a tiny shared rotary key $k_t^R = \mathcal{R}_t(h_t W^{KR}) \in \mathbb{R}^{d_R}$ ($d_R = 64$) alongside per-head rotary queries $q_{t,i}^R = \mathcal{R}_t(q_{t,i}^{\text{rope}})$. The total cached state per token per layer is simply $(c_t^{KV}, k_t^R)$ of width $d_c + d_R = 512 + 64 = \mathbf{576}$ elements—a **$93.3\%$ KV cache reduction** compared to MHA!
</details>

<!-- lab: labs/llm/deepseek-mla-grpo/mla_grpo.py#mla_absorption -->

In our companion CPU verification (`labs/llm/deepseek-mla-grpo`), `forward_explicit` and `forward_absorbed` match to within $10^{-12}$ in `float64` while compressing the cached tensor footprint by more than an order of magnitude.

![Figure 5: Per-token per-layer KV cache comparison across MHA, GQA, and DeepSeek MLA alongside colocated interference versus DistServe Prefill-Decode disaggregation.](/images/articles/llm-infra/fig5-mla-and-distserve.svg)

## DeepSeek-V3: Auxiliary-Loss-Free MoE, DualPipe, and FP8 Co-Design

Training the $671\text{B}$-parameter **DeepSeek-V3** model on just $2.788\text{M}$ H800 GPU hours ($\sim \text{USD } 5.57\text{M}$) required three additional systems breakthroughs:

1. **Fine-Grained DeepSeekMoE with Auxiliary-Loss-Free Load Balancing**: Instead of 8 coarse experts, DeepSeek-V3 uses $1$ shared expert and $256$ routed experts per layer ($8$ routed active per token). Traditional MoE models add an auxiliary load-balancing loss to prevent routing collapse, but large auxiliary penalties degrade language modeling quality. DeepSeek-V3 introduces a dynamic per-expert bias term $b_i$ added *only* during Top-$K$ selection ($\operatorname{Top-}K(s_{i,t} + b_i)$) while weighting the output by the unperturbed affinity $s_{i,t}$. After every step, $b_i$ is decremented by $\gamma$ for overloaded experts and incremented by $\gamma$ for underloaded experts—achieving balanced expert routing with zero gradient interference!
2. **DualPipe Bidirectional Pipeline Parallelism**: Cross-node Expert Parallelism (EP) introduces heavy `Dispatch` and `Combine` `All-to-All` network communication across InfiniBand. **DualPipe** feeds micro-batches from both ends of the pipeline simultaneously and splits backward computation into input gradients ($B$) and weight gradients ($W$), completely overlapping bidirectional `All-to-All` communication inside fine-grained compute chunks while cutting pipeline bubbles in half.
3. **Fine-Grained FP8 Mixed-Precision Training**: To double Tensor Core throughput over `bfloat16` without activation outliers causing overflow in E4M3 FP8, DeepSeek-V3 quantizes activations in **$1 \times 128$ tile blocks** and weights in **$128 \times 128$ blocks**, periodically accumulating partial sums from Tensor Cores into FP32 CUDA registers every $N_C = 128$ elements.

## DistServe: Prefill-Decode (PD) Disaggregation

Even with MLA and PagedAttention, colocating **Prefill** and **Decode** requests on the same GPU pool creates severe latency interference (Zhong et al., **DistServe**, arXiv:2401.09670):

- **Prefill optimizes for Time-To-First-Token (TTFT)** and is **Compute-bound** even at $B = 1$.
- **Decode optimizes for Time-Per-Output-Token (TPOT)** and is **Memory-bound**, requiring large batches.

When a continuous batching scheduler injects a $4096$-token prefill into an active decoding batch, the compute-bound prefill monopolizes the GPU for $100\text{ms}+$, stalling every active user's streaming token generation (TPOT spike). Worse, colocated instances must use identical Tensor/Pipeline parallelism for both phases.

**DistServe** physically disaggregates serving into two specialized pools:

1. **Prefill Instances** configured with higher Tensor Parallelism to minimize single-request TTFT near the compute roofline.
2. **Decode Instances** configured with higher Pipeline/Data Parallelism to maximize concurrent batch capacity and KV cache bandwidth.

Once a Prefill instance computes the prompt's KV cache (which MLA shrinks by $93.3\%$), it streams the KV blocks over high-speed NVLink or RDMA directly into the Decode instance's PagedAttention pool—improving goodput (requests/sec meeting strict TTFT and TPOT SLOs) by $2.0\times\text{--}4.48\times$.

## Speculative Decoding: Turning GEMV into parallel GEMM

At low batch sizes ($B = 1 \dots 4$), Decode remains memory-bound because streaming $2N$ bytes of target model weights from HBM yields only $1$ token. **Speculative Decoding** (Leviathan et al., arXiv:2211.17192) breaks this bottleneck without altering the output distribution:

1. A lightweight draft model $q(x_t \mid x_{<t})$ rapidly proposes $\gamma$ candidate tokens $\tilde{x}_1, \dots, \tilde{x}_\gamma$.
2. The large target model $p(x_t \mid x_{<t})$ evaluates all $\gamma + 1$ positions **in a single parallel forward pass**—costing nearly the exact same HBM weight read time as generating 1 token, because arithmetic intensity moves from $1$ up to $\gamma + 1$ along the flat memory-bound slope of the Roofline!
3. Using **rejection sampling**, each drafted token $\tilde{x}_t$ is accepted with probability $\min\!\big(1,\, \frac{p(\tilde{x}_t)}{q(\tilde{x}_t)}\big)$; if rejected at step $t$, a corrected token is sampled from the residual distribution $\operatorname{norm}\!\big(\max(0,\, p(x) - q(x))\big)$, guaranteeing **exact mathematical equivalence** to sampling from $p(x)$ alone while delivering $2\times\text{--}3\times$ wall-clock speedups.

## References and next chapter

- DeepSeek-AI, [DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model](https://arxiv.org/abs/2405.04434) (2024).
- DeepSeek-AI, [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437) (2024).
- Zhong et al., [DistServe: Disaggregating Prefill and Decoding for Goodput-optimized LLM Serving](https://arxiv.org/abs/2401.09670) (2024).
- Leviathan et al., [Fast Inference from Transformers via Speculative Decoding](https://arxiv.org/abs/2211.17192) (2022).
- Continue to Chapter 6: [Beyond Fixed-Context Text: Ring Attention, Native Sparse Attention, Mamba-2, Agents, and Physical AI](/articles/beyond-transformers-mamba2-nsa-agents-vla).
