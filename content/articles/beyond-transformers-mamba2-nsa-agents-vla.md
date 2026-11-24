---
title: "Beyond Fixed-Context Text: Ring Attention, Native Sparse Attention, Mamba-2, Agents, and Physical AI"
date: "2026-10-25"
updatedAt: "2026-10-25"
category: "LLM"
excerpt: "Scale contexts beyond millions of tokens with Ring Attention and Native Sparse Attention (NSA), prove the State Space Duality (SSD) in Mamba-2, design Agent-Computer Interfaces (SWE-agent), and bridge VLMs to 50Hz continuous robot control (Pi-Zero)."
lang: "en"
tags: ["Long Context", "Mamba-2", "NSA", "Ring Attention", "SWE-agent", "VLA", "Pi-Zero"]
featured: false
draft: false
series: "LLM & AI Infrastructure from First Principles"
seriesOrder: 6
papers:
  - title: "ReAct: Synergizing Reasoning and Acting in Language Models"
    arxiv: "2210.03629"
    year: 2022
    tag: "ReAct"
  - title: "RT-2: Vision-Language-Action Models Transfer Web Knowledge to Robotic Control"
    arxiv: "2307.15818"
    year: 2023
    tag: "RT-2"
  - title: "Ring Attention with Blockwise Transformers for Near-Infinite Context"
    arxiv: "2310.01889"
    year: 2023
    tag: "Ring Attention"
  - title: "SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering"
    arxiv: "2405.15793"
    year: 2024
    tag: "SWE-agent (ACI)"
  - title: "Transformers are SSMs: Generalized Models and Efficient Algorithms Through Structured State Space Duality"
    arxiv: "2405.21060"
    year: 2024
    tag: "Mamba-2 (SSD)"
  - title: "OpenVLA: An Open-Source Vision-Language-Action Model"
    arxiv: "2406.09246"
    year: 2024
    tag: "OpenVLA"
  - title: "DeepSeek-Prover-V1.5: Harnessing Proof Assistant Feedback for Reinforcement Learning and Monte-Carlo Tree Search"
    arxiv: "2408.08435"
    year: 2024
    tag: "DeepSeek-Prover-V1.5"
  - title: "pi_0: A Vision-Language-Action Flow Model for General Robot Control"
    arxiv: "2410.24164"
    year: 2024
    tag: "Pi-Zero (VLA Flow)"
  - title: "Native Sparse Attention: Hardware-Aligned and Natively Trainable Sparse Attention"
    arxiv: "2502.11089"
    year: 2025
    tag: "NSA"
---

## Breaking the million-token context wall: Ring Attention and NSA

Even when FlashAttention-2 eliminates quadratic HBM intermediate storage, two fundamental walls remain as sequence length $T$ scales from $32\text{K}$ to $1\text{M}+$ tokens:

1. **Single-GPU Activation & KV Capacity Wall**: The linear $O(T)$ activations and KV cache eventually exceed a single GPU's 80 GB HBM.
2. **Quadratic $O(T^2)$ Compute Wall**: At $T = 128\text{K}$, full causal attention requires $1,024\times$ the FLOPs of $T = 4\text{K}$, dominating pretraining and prefill latency.

### Ring Attention: Overlapping P2P communication with blockwise attention

Liu et al. (**Ring Attention**, arXiv:2310.01889) solved the single-GPU capacity wall by partitioning a long sequence of length $T$ across $N_{\text{hosts}}$ devices connected in a logical ring, where device $i$ holds a local chunk $Q_i, K_i, V_i$ of length $B_c = T / N_{\text{hosts}}$.

Using the **exact same Online Softmax rescaling identity** as FlashAttention, each device computes blockwise attention between its stationary local $Q_i$ and the currently resident $K_j, V_j$ chunk while **asynchronously sending $K_j, V_j$ to neighbor $(i + 1) \bmod N_{\text{hosts}}$ and receiving the next chunk from $(i - 1) \bmod N_{\text{hosts}}$**. As long as the per-block compute time exceeds the peer-to-peer transfer time:

$$
\frac{2 B_c^2 d}{\text{Peak FLOPs/s}} \ge \frac{2 B_c d \cdot \text{bytes}}{\text{Interconnect Bandwidth}} \implies \mathbf{B_c \ge \text{Hardware Ridge Point}}
$$

inter-device communication is $100\%$ hidden behind attention compute, scaling context length linearly with cluster size!

### Native Sparse Attention (NSA): Hardware-aligned trainable sparsity

Ring Attention distributes the work, but still pays $O(T^2)$ total FLOPs. Traditional sparse attention heuristics fail on modern GPUs because scattered token lookups destroy Tensor Core block-loads and non-differentiable pruning breaks pretraining.

Yuan et al. (**Native Sparse Attention / NSA**, arXiv:2502.11089) introduced an end-to-end trainable, hardware-aligned architecture that replaces full keys and values $\tilde{K}_t, \tilde{V}_t$ with three parallel branches gated by learned per-branch weights $g_t^c \in [0, 1]$:

$$
o_t^* = \sum_{c \in \{\text{cmp},\, \text{slc},\, \text{win}\}} g_t^c \cdot \operatorname{Attn}\!\big(q_t,\, \tilde{K}_t^c,\, \tilde{V}_t^c\big)
$$

1. **Token Compression ($\text{cmp}$)**: An MLP with intra-block positional encoding compresses contiguous blocks of length $l$ (stride $d$) into coarse summary tokens, capturing global context.
2. **Blockwise Token Selection ($\text{slc}$)**: Using the importance scores already computed during compression Attention, NSA selects the top-$n$ most relevant contiguous blocks of length $l'$. Crucially, **all query heads within a GQA group share the exact same selected KV blocks**, enabling contiguous HBM-to-SRAM block loads that keep Tensor Core arithmetic intensity balanced!
3. **Sliding Window ($\text{win}$)**: A local window of recent tokens preserves fine-grained nearby syntax without dominating global selection.

At $T = 64\text{K}$, NSA matches or outperforms Full Attention across reasoning benchmarks while achieving **$9.0\times$ faster forward propagation, $6.0\times$ faster backward propagation, and $11.6\times$ faster decoding**.

![Figure 6: Sequence compute scaling across Full Causal Attention, Native Sparse Attention (NSA), and Mamba-2 State Space Duality alongside closed-loop dexterous control frequencies in Embodied VLA systems.](/images/articles/llm-infra/fig6-long-context-vla.svg)

## Mamba-2 and Structured State Space Duality (SSD)

Can we eliminate the growing KV cache altogether and achieve strictly linear $O(T)$ training and $O(1)$-memory decoding? Dao and Gu (**Mamba-2**, arXiv:2405.21060) proved a deep mathematical equivalence—**Structured State Space Duality (SSD)**—showing that Selective State Space Models (SSMs) and Linear Attention are two dual views of the **exact same semiseparable matrix multiplication**.

Consider the discrete recurrence of a selective SSM with scalar decay $a_t \in [0, 1]$ (diagonal $A_t = a_t I$):

$$
h_t = a_t h_{t-1} + B_t x_t, \qquad y_t = C_t^\top h_t
$$

<details class="derivation-box">
<summary>Proof of State Space Duality: O(T) recurrence equals 1-semiseparable Masked Attention</summary>

Unrolling the recurrence $h_t = a_t h_{t-1} + B_t x_t$ from $s = 0$ to $t$ yields:

$$
y_t = \sum_{s=0}^t \left(\prod_{k=s+1}^t a_k\right) C_t^\top B_s x_s
$$

Define the lower-triangular **1-semiseparable mask matrix** $L \in \mathbb{R}^{T \times T}$ with entries $L_{t,s} = \prod_{k=s+1}^t a_k$ for $t \ge s$ and $0$ for $t < s$. Stacking $X, Y, B, C$ along the sequence dimension reveals that the entire sequence transformation $Y = M X$ is simultaneously:
1. **Linear Recurrent Form ($O(T)$ sequential/scan)**: State-space recurrence over $h_t$.
2. **Quadratic Attention Form ($O(T^2)$ matmul)**: Causal linear attention with query $Q = C$, key $K = B$, value $V = X$, and multiplicative decay mask $L$:

$$
Y = \big(L \odot (C B^\top)\big) X = \big(L \odot (Q K^\top)\big) V
$$

By partitioning the sequence into chunks of length $Q_{\text{chunk}}$, **Mamba-2's SSD algorithm** evaluates intra-chunk tokens via parallel Tensor Core GEMMs (the quadratic view) and passes inter-chunk state via linear SSM recurrence—running **$2\times\text{--}8\times$ faster than Mamba-1** while utilizing hardware Tensor Cores at full efficiency!
</details>

## Agent-Computer Interfaces (ReAct & SWE-agent) and Formal Reasoning

When LLMs step outside static text completion to act in external environments, system reliability shifts from tensor kernels to the **interaction loop and interface contract**:

- **ReAct (Yao et al., arXiv:2210.03629)** interleaved explicit `Thought` traces with external `Action` calls and `Observation` feedback. Reasoning traces maintain working-memory plans, while observations ground the model against external truth and halt hallucination cascades.
- **SWE-agent and the Agent-Computer Interface (ACI) (Yang et al., arXiv:2405.15793)** proved that giving an LLM a raw Linux bash shell is like forcing a human developer to code without an IDE: `grep` dumps thousands of lines that pollute the context window, and `sed` edits silently corrupt syntax. SWE-agent designed a dedicated **ACI**:
  1. A **100-line windowed file viewer** with explicit line numbers and navigation commands (`scroll_down`, `goto`).
  2. A **lint-guarded `edit` command** that automatically runs a syntax/flake8 checker before applying any patch—rejecting syntactically broken edits immediately so the agent never wastes 10 turns debugging a missing parenthesis.
  3. **Context-compressed search and observation folding** that collapses stale terminal outputs to preserve effective context capacity.
- **DeepSeek-Prover-V1.5 (Xin et al., arXiv:2408.08435)** applied this closed-loop interaction paradigm to formal mathematics in **Lean 4**. By combining GRPO reinforcement learning on compiler verification feedback (**RLPAF**) with **RMaxTS** (a Monte-Carlo Tree Search variant driven by intrinsic exploration rewards and Lean 4 tactic state truncation), it unified continuous LLM intuition with deterministic formal proof checking.

## Embodied AI and Vision-Language-Action Models: RT-2, OpenVLA, and $\pi_0$

The final frontier extends multimodal foundation models into the physical world via **Vision-Language-Action (VLA)** architectures:

| VLA Architecture | Backbone Scale | Action Representation & Decoding | Effective Control Rate | Key Engineering Tradeoff |
| :--- | :--- | :--- | ---: | :--- |
| **RT-2** (arXiv:2307.15818) | $55\text{B}$ (PaLI-X) | 256 discrete text bins per DoF ($\Delta x, \Delta y, \Delta z, \dots$), autoregressive tokens | $1\text{--}3\text{ Hz}$ | Transfers web VQA semantics directly into robotic control, but limited by slow autoregressive token quantization |
| **OpenVLA** (arXiv:2406.09246) | $7\text{B}$ (Llama-2 + DINOv2 + SigLIP) | 256 discrete action tokens in vocabulary; supports LoRA & 4-bit quantization | $\sim 6\text{ Hz}$ | Dual vision encoders fuse spatial geometry (DINOv2) + semantics (SigLIP); beats 55B RT-2 with $7\times$ fewer parameters |
| **$\pi_0$ (Pi-Zero)** (arXiv:2410.24164) | $3\text{B}$ VLM + $300\text{M}$ Action Expert | **Conditional Flow Matching** over continuous action chunks ($H = 50$ steps) | **$50\text{ Hz}$** | Replaces discrete token quantization with an ODE flow vector field $v_\theta(A_t^\tau, o_t)$, unlocking dexterous laundry folding and bimanual assembly |

Why did **$\pi_0$ (Pi-Zero)** abandon RT-2 and OpenVLA's discrete 256-bin tokenization? Because high-frequency dexterous manipulation ($50\text{ Hz}$ bimanual control) cannot tolerate quantization jitter or slow token-by-token decoding. By coupling a pretrained VLM backbone with a dedicated **Flow Matching Action Expert** via blockwise causal attention, $\pi_0$ learns a continuous vector field $v_\theta(A_t^\tau, o_t)$ that transports Gaussian noise $\epsilon \sim \mathcal{N}(0, I)$ to a smooth $50$-step continuous motor trajectory $A_t = [a_t, \dots, a_{t+49}]$ in just $10$ lightweight Euler integration steps:

$$
\mathcal{L}_{\text{Flow}}(\theta) = \mathbb{E}_{\tau \sim \mathcal{U}[0, 1],\, \epsilon \sim \mathcal{N}(0, I)}\!\left[ \Big\| v_\theta\big(\tau A_t + (1 - \tau)\epsilon,\, o_t\big) - (A_t - \epsilon) \Big\|_2^2 \right]
$$

## Series synthesis

Across the first six chapters of this monograph, a single engineering principle recurs: **breakthroughs in modern AI happen at the boundary where mathematical formulation meets hardware reality**—whether rotating queries in the complex plane (RoPE), tiling Online Softmax into SRAM (FlashAttention-2), absorbing low-rank decompression matrices into queries (DeepSeek MLA), normalizing group rewards to drop the Critic (GRPO), or integrating flow-matching ODEs for 50Hz physical control ($\pi_0$).

## References

- Liu et al., [Ring Attention with Blockwise Transformers for Near-Infinite Context](https://arxiv.org/abs/2310.01889) (2023).
- Yuan et al., [Native Sparse Attention: Hardware-Aligned and Natively Trainable Sparse Attention](https://arxiv.org/abs/2502.11089) (2025).
- Dao & Gu, [Transformers are SSMs: Generalized Models and Efficient Algorithms Through Structured State Space Duality](https://arxiv.org/abs/2405.21060) (2024).
- Yang et al., [SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering](https://arxiv.org/abs/2405.15793) (2024).
- Black et al., [$\pi_0$: A Vision-Language-Action Flow Model for General Robot Control](https://arxiv.org/abs/2410.24164) (2024).
- Continue to Chapter 7: [2026 Flagship Co-Design: Sub-Kilobyte CED KV Cache, Depth-Wise Attention Residuals, and Muon](/articles/flagship-2026-ced-attnres-muon).
