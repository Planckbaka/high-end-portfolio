#!/usr/bin/env python3
"""
Generate editorial SVG academic figures for the LLM & AI Infrastructure series.
Run via uv:
  uv run --with matplotlib --with numpy scripts/generate_paper_figures.py
"""

from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

# Editorial palette matching globals.css
BG = "#fdfcf9"
SURFACE = "#f7f6f2"
MUTED = "#eeede7"
BORDER = "#d8d9d0"
FG = "#232521"
MUTED_FG = "#62665e"
ACCENT = "#a33f2e"
ACCENT_SOFT = "#ee9b84"
TEAL = "#2d5a52"
SLATE = "#4a586e"
GOLD = "#b37b2c"

plt.rcParams.update({
    "font.family": "sans-serif",
    "font.sans-serif": ["DejaVu Sans", "Helvetica", "Arial"],
    "axes.edgecolor": BORDER,
    "axes.linewidth": 1.0,
    "axes.facecolor": BG,
    "figure.facecolor": BG,
    "text.color": FG,
    "axes.labelcolor": FG,
    "xtick.color": MUTED_FG,
    "ytick.color": MUTED_FG,
    "grid.color": BORDER,
    "grid.linestyle": "--",
    "grid.alpha": 0.7,
    "svg.fonttype": "none",  # Keep text selectable and crisp in SVG
})

OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "images" / "articles" / "llm-infra"
OUT_DIR.mkdir(parents=True, exist_ok=True)


def save_svg(fig: plt.Figure, filename: str) -> None:
    path = OUT_DIR / filename
    fig.savefig(path, format="svg", bbox_inches="tight", pad_inches=0.25)
    plt.close(fig)
    print(f"Generated {path.relative_to(OUT_DIR.parent.parent.parent)}")


# ------------------------------------------------------------------------------
# Figure 1: Modern Transformer Evolution (KV Cache & MoE Active vs Total Params)
# ------------------------------------------------------------------------------
def make_fig1_transformer() -> None:
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11.5, 4.4), gridspec_kw={"width_ratios": [1.15, 1]})
    fig.subplots_adjust(wspace=0.28)

    # Panel A: KV Cache Scaling across Sequence Lengths (Llama-3-8B, Batch=16, BF16)
    seq_lens = np.array([4, 8, 16, 32, 64, 128])  # in K tokens
    # 2 * L(32) * B(16) * S * n_kv * d_head(128) * 2B / 1024^3
    mha_gb = seq_lens * 8.0        # 32K -> 256 GB
    gqa_gb = seq_lens * 2.0        # 32K -> 64 GB
    mla_gb = seq_lens * (576 / 8192) * 8.0  # 32K -> 18 GB
    mqa_gb = seq_lens * 0.25       # 32K -> 8 GB

    ax1.plot(seq_lens, mha_gb, marker="o", linewidth=2.2, color=SLATE, label="Vanilla MHA (32 KV heads)")
    ax1.plot(seq_lens, gqa_gb, marker="s", linewidth=2.4, color=ACCENT, label="Llama-3 GQA (8 KV heads)")
    ax1.plot(seq_lens, mla_gb, marker="^", linewidth=2.2, color=TEAL, label="DeepSeek MLA (Rank 576)")
    ax1.plot(seq_lens, mqa_gb, marker="d", linewidth=1.8, linestyle=":", color=GOLD, label="MQA (1 KV head)")

    ax1.axhline(80, color=MUTED_FG, linestyle="--", linewidth=1.1)
    ax1.text(6, 86, "Single H100 80 GB VRAM Limit", fontsize=8.5, color=MUTED_FG, fontweight="bold")

    ax1.set_title("A. KV Cache Footprint vs. Context Length (Batch=16)", fontsize=11, fontweight="bold", loc="left", pad=10)
    ax1.set_xlabel("Context Length (Thousands of Tokens)", fontsize=9.5)
    ax1.set_ylabel("KV Cache Memory (GB, BF16)", fontsize=9.5)
    ax1.set_xticks(seq_lens)
    ax1.set_xticklabels([f"{k}K" for k in seq_lens])
    ax1.set_ylim(0, 340)
    ax1.grid(True)
    ax1.legend(frameon=True, facecolor=SURFACE, edgecolor=BORDER, fontsize=8.5, loc="upper left")

    # Panel B: Dense vs. Sparse MoE Total vs. Active Parameters per Token
    models = ["Llama-3 8B\n(Dense)", "Mixtral 8x7B\n(Top-2 of 8)", "DeepSeek-V2\n(Fine-Grained)", "DeepSeek-V3\n(256 Experts)"]
    total_params = [8.0, 46.7, 236.0, 671.0]
    active_params = [8.0, 12.9, 21.0, 37.0]

    x = np.arange(len(models))
    width = 0.36
    bars1 = ax2.bar(x - width / 2, total_params, width, color=MUTED, edgecolor=SLATE, linewidth=1.2, label="Total Parameters (B)")
    bars2 = ax2.bar(x + width / 2, active_params, width, color=ACCENT, edgecolor=ACCENT, linewidth=1.2, label="Active per Token (B)")

    for bar in bars1:
        h = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width() / 2, h + 12, f"{h:.0f}B", ha="center", va="bottom", fontsize=8, color=MUTED_FG)
    for bar in bars2:
        h = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width() / 2, h + 12, f"{h:.1f}B", ha="center", va="bottom", fontsize=8, color=ACCENT, fontweight="bold")

    ax2.set_title("B. Sparse MoE Capacity vs. Active Compute", fontsize=11, fontweight="bold", loc="left", pad=10)
    ax2.set_ylabel("Parameters (Billions)", fontsize=9.5)
    ax2.set_xticks(x)
    ax2.set_xticklabels(models, fontsize=8.5)
    ax2.set_ylim(0, 760)
    ax2.grid(True, axis="y")
    ax2.legend(frameon=True, facecolor=SURFACE, edgecolor=BORDER, fontsize=8.5, loc="upper left")

    save_svg(fig, "fig1-modern-transformer-evolution.svg")


# ------------------------------------------------------------------------------
# Figure 2: H100 Roofline Model & FlashAttention HBM Traffic Reduction
# ------------------------------------------------------------------------------
def make_fig2_roofline_flash() -> None:
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11.5, 4.4), gridspec_kw={"width_ratios": [1.2, 1]})
    fig.subplots_adjust(wspace=0.28)

    # Panel A: H100 SXM Roofline (Peak = 989 TFLOPS, BW = 3.35 TB/s, Ridge = 295.2 FLOPs/B)
    ai = np.logspace(-0.5, 4.2, 300)
    bw = 3.35  # TB/s -> TFLOPS per FLOP/B = 3.35
    peak = 989.0
    roofline = np.minimum(peak, ai * bw)

    ax1.loglog(ai, roofline, color=FG, linewidth=2.5, label="NVIDIA H100 SXM (989 TFLOPS, 3.35 TB/s)")
    ax1.axvline(295.2, color=MUTED_FG, linestyle="--", linewidth=1.1)
    ax1.text(330, 12, "Ridge Point\n(295 FLOPs/B)", fontsize=8.5, color=MUTED_FG)

    # Shaded regions
    ax1.fill_between(ai[ai <= 295.2], 1, roofline[ai <= 295.2], color=ACCENT_SOFT, alpha=0.18)
    ax1.fill_between(ai[ai >= 295.2], 1, roofline[ai >= 295.2], color=TEAL, alpha=0.10)

    # Operating points
    pts = [
        ("Decode (B=1)", 0.97, 0.97 * bw, ACCENT),
        ("Decode (B=16)", 14.3, 14.3 * bw, ACCENT),
        ("Decode (B=128)", 69.5, 69.5 * bw, GOLD),
        ("Prefill (B=16, S=4K)", 3963.0, peak * 0.82, TEAL),
    ]
    for label, x_val, y_val, col in pts:
        ax1.scatter([x_val], [y_val], color=col, s=55, zorder=5)
        offset_y = 1.45 if x_val < 500 else 0.62
        ax1.text(x_val, y_val * offset_y, label, fontsize=8.5, fontweight="bold", color=col, ha="center")

    ax1.set_title("A. LLM Inference on the H100 Roofline", fontsize=11, fontweight="bold", loc="left", pad=10)
    ax1.set_xlabel("Arithmetic Intensity (FLOPs / Byte)", fontsize=9.5)
    ax1.set_ylabel("Attainable Throughput (TFLOPS)", fontsize=9.5)
    ax1.set_xlim(0.4, 15000)
    ax1.set_ylim(1.5, 1600)
    ax1.grid(True, which="both", alpha=0.45)

    # Panel B: Standard Attention vs FlashAttention HBM R/W Traffic (Single Layer, B=4, H=32, d=128)
    seq_k = np.array([2, 4, 8, 16, 32])  # in K tokens
    S = seq_k * 1024
    B, H, d = 4, 32, 128
    # Standard: materializes SxS score and P matrices (read/write 4 * B * H * S^2 * 2B) + Q,K,V,O
    std_hbm_gb = (4 * B * H * (S ** 2) * 2 + 4 * B * H * S * d * 2) / (1024 ** 3)
    # FlashAttention: single HBM pass over Q, O andtiled passes over K, V
    flash_hbm_gb = (6 * B * H * S * d * 2) / (1024 ** 3)

    ax2.plot(seq_k, std_hbm_gb, marker="o", linewidth=2.4, color=ACCENT, label="Standard Attention O(N²) HBM Traffic")
    ax2.plot(seq_k, flash_hbm_gb, marker="s", linewidth=2.4, color=TEAL, label="FlashAttention-2 SRAM Tiling O(N)")

    for k_val, s_gb, f_gb in zip(seq_k[1:], std_hbm_gb[1:], flash_hbm_gb[1:]):
        if k_val in (16, 32):
            ratio = s_gb / f_gb
            ax2.annotate(
                f"{ratio:.0f}x fewer\nHBM bytes",
                xy=(k_val, s_gb),
                xytext=(k_val - 6, s_gb * 0.78),
                arrowprops=dict(arrowstyle="->", color=ACCENT, lw=1.0),
                fontsize=8,
                fontweight="bold",
                color=ACCENT,
            )

    ax2.set_title("B. Single-Layer HBM Read/Write Traffic (B=4, H=32)", fontsize=11, fontweight="bold", loc="left", pad=10)
    ax2.set_xlabel("Sequence Length (Thousands of Tokens)", fontsize=9.5)
    ax2.set_ylabel("HBM Bytes Transferred (GB)", fontsize=9.5)
    ax2.set_xticks(seq_k)
    ax2.set_xticklabels([f"{k}K" for k in seq_k])
    ax2.grid(True)
    ax2.legend(frameon=True, facecolor=SURFACE, edgecolor=BORDER, fontsize=8.5, loc="upper left")

    save_svg(fig, "fig2-roofline-flashattention.svg")


# ------------------------------------------------------------------------------
# Figure 3: Distributed Training (ZeRO Stages Memory & Chinchilla Scaling)
# ------------------------------------------------------------------------------
def make_fig3_zero_chinchilla() -> None:
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11.5, 4.4), gridspec_kw={"width_ratios": [1.1, 1]})
    fig.subplots_adjust(wspace=0.28)

    # Panel A: Per-GPU Static Memory for 70B Model across 8x H100 GPUs (Data Parallel = 8)
    # 70B params: Weights (BF16) = 140 GB, Grads (BF16) = 140 GB, Optimizer (FP32 master + m + v) = 840 GB
    stages = ["Baseline\nDDP", "ZeRO-1\n(Shard Opt)", "ZeRO-2\n(+Shard Grad)", "ZeRO-3\n(+Shard Param)"]
    weights = np.array([140.0, 140.0, 140.0, 140.0 / 8])
    grads = np.array([140.0, 140.0, 140.0 / 8, 140.0 / 8])
    opt = np.array([840.0, 840.0 / 8, 840.0 / 8, 840.0 / 8])

    x = np.arange(len(stages))
    width = 0.52
    ax1.bar(x, weights, width, label="BF16 Weights (2B/ψ)", color=TEAL)
    ax1.bar(x, grads, width, bottom=weights, label="BF16 Gradients (2B/ψ)", color=GOLD)
    ax1.bar(x, opt, width, bottom=weights + grads, label="FP32 AdamW State (12B/ψ)", color=ACCENT)

    totals = weights + grads + opt
    for i, total in enumerate(totals):
        ax1.text(i, total + 22, f"{total:.0f} GB", ha="center", va="bottom", fontsize=8.8, fontweight="bold", color=FG)

    ax1.axhline(80, color=FG, linestyle="--", linewidth=1.2)
    ax1.text(2.45, 92, "80 GB H100 Limit", fontsize=8.5, fontweight="bold", color=FG)

    ax1.set_title("A. 70B Model Per-GPU Memory Across 8 GPUs (16ψ Rule)", fontsize=11, fontweight="bold", loc="left", pad=10)
    ax1.set_ylabel("Per-GPU Static Memory (GB)", fontsize=9.5)
    ax1.set_xticks(x)
    ax1.set_xticklabels(stages, fontsize=8.5)
    ax1.set_ylim(0, 1250)
    ax1.grid(True, axis="y")
    ax1.legend(frameon=True, facecolor=SURFACE, edgecolor=BORDER, fontsize=8.5, loc="upper right")

    # Panel B: Chinchilla Compute-Optimal Frontier vs Modern Inference-Optimal Over-training
    params_b = np.array([8.0, 70.0])
    chinchilla_tokens_t = params_b * 20 / 1000.0  # 20 tokens per param -> 0.16T, 1.4T
    modern_tokens_t = np.array([15.0, 15.0])      # Llama-3 15T tokens

    y_pos = np.arange(len(params_b))
    h = 0.34
    ax2.barh(y_pos - h / 2, chinchilla_tokens_t, h, color=SLATE, label="Chinchilla Compute-Optimal (20 D/N)")
    ax2.barh(y_pos + h / 2, modern_tokens_t, h, color=ACCENT, label="Llama-3 Inference-Optimal (15T Tokens)")

    for i, (c_val, m_val) in enumerate(zip(chinchilla_tokens_t, modern_tokens_t)):
        ax2.text(c_val + 0.3, i - h / 2, f"{c_val:.2f}T (20x)", va="center", fontsize=8.5, color=SLATE, fontweight="bold")
        ratio = int(round(m_val * 1000 / (params_b[i])))
        ax2.text(m_val + 0.3, i + h / 2, f"{m_val:.0f}T ({ratio} tokens/param)", va="center", fontsize=8.5, color=ACCENT, fontweight="bold")

    ax2.set_title("B. Training Token Budgets: Chinchilla vs. Llama-3", fontsize=11, fontweight="bold", loc="left", pad=10)
    ax2.set_xlabel("Pretraining Tokens (Trillions)", fontsize=9.5)
    ax2.set_yticks(y_pos)
    ax2.set_yticklabels(["8B Model", "70B Model"], fontsize=9.5, fontweight="bold")
    ax2.set_xlim(0, 21)
    ax2.grid(True, axis="x")
    ax2.legend(frameon=True, facecolor=SURFACE, edgecolor=BORDER, fontsize=8.5, loc="lower right")

    save_svg(fig, "fig3-zero-chinchilla-scaling.svg")


# ------------------------------------------------------------------------------
# Figure 4: Post-Training Alignment & RL Architectures (PPO vs DPO vs GRPO)
# ------------------------------------------------------------------------------
def make_fig4_rlhf_dpo_grpo() -> None:
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11.5, 4.4), gridspec_kw={"width_ratios": [1.05, 1.15]})
    fig.subplots_adjust(wspace=0.28)

    # Panel A: Active Models in GPU Memory during Post-Training (70B Scale, BF16 Inference/Forward Weight Equivalent)
    algos = ["RLHF (PPO)\n4 Active Models", "GRPO (DeepSeek-R1)\nNo Value Critic", "DPO (Closed-Form)\nNo Reward / Critic"]
    policy_gb = np.array([140, 140, 140])
    ref_gb = np.array([140, 140, 140])
    reward_gb = np.array([140, 0, 0])   # GRPO uses rule-based verifier or lightweight reward
    critic_gb = np.array([140, 0, 0])   # Eliminated by group-relative baseline

    x = np.arange(len(algos))
    w = 0.48
    ax1.bar(x, policy_gb, w, color=ACCENT, label="Trainable Policy π_θ")
    ax1.bar(x, ref_gb, w, bottom=policy_gb, color=SLATE, label="Frozen Reference π_ref")
    ax1.bar(x, reward_gb, w, bottom=policy_gb + ref_gb, color=GOLD, label="Reward Model r_φ")
    ax1.bar(x, critic_gb, w, bottom=policy_gb + ref_gb + reward_gb, color=TEAL, label="Trainable Value Critic V_ψ")

    totals = policy_gb + ref_gb + reward_gb + critic_gb
    annotations = ["560 GB Weights\n(+2x Optimizer State)", "280 GB Weights\n(Group Z-Score Baseline)", "280 GB Weights\n(Offline Implicit Reward)"]
    for i, (tot, note) in enumerate(zip(totals, annotations)):
        ax1.text(i, tot + 18, note, ha="center", va="bottom", fontsize=8, fontweight="bold", color=FG)

    ax1.set_title("A. 70B Model Footprint Across Alignment Paradigms", fontsize=11, fontweight="bold", loc="left", pad=10)
    ax1.set_ylabel("Model Weight Footprint in VRAM (GB)", fontsize=9.5)
    ax1.set_xticks(x)
    ax1.set_xticklabels(algos, fontsize=8.5)
    ax1.set_ylim(0, 680)
    ax1.grid(True, axis="y")
    ax1.legend(frameon=True, facecolor=SURFACE, edgecolor=BORDER, fontsize=8, loc="upper right")

    # Panel B: DeepSeek-R1-Zero Emergent Test-Time Reasoning Length & Accuracy Trajectory
    steps = np.linspace(0, 8000, 50)
    # Synthetic trajectory faithfully reflecting DeepSeek-R1 paper Figure 2/3 trends
    response_tokens = 350 + 3800 * (1 / (1 + np.exp(-(steps - 3600) / 950)))
    aime_acc = 15.6 + 55.4 * (1 - np.exp(-steps / 2800))

    ax2_twin = ax2.twinx()
    l1 = ax2.plot(steps, aime_acc, color=ACCENT, linewidth=2.4, label="Reasoning Pass@1 Accuracy (%)")
    l2 = ax2_twin.plot(steps, response_tokens, color=TEAL, linewidth=2.2, linestyle="--", label="Avg. Thinking Chain Length (Tokens)")

    ax2.annotate(
        "Emergent Self-Verification\n& Backtracking Phase",
        xy=(4200, 58),
        xytext=(1600, 66),
        arrowprops=dict(arrowstyle="->", color=ACCENT, lw=1.1),
        fontsize=8.5,
        fontweight="bold",
        color=ACCENT,
    )

    ax2.set_title("B. RL Reasoning Scaling: Compute vs. Accuracy", fontsize=11, fontweight="bold", loc="left", pad=10)
    ax2.set_xlabel("GRPO Reinforcement Learning Steps", fontsize=9.5)
    ax2.set_ylabel("Benchmark Pass@1 (%)", fontsize=9.5, color=ACCENT)
    ax2_twin.set_ylabel("Mean Thinking Length (Tokens)", fontsize=9.5, color=TEAL)
    ax2.set_ylim(0, 85)
    ax2_twin.set_ylim(0, 4800)
    ax2.grid(True)

    lines = l1 + l2
    labels = [l.get_label() for l in lines]
    ax2.legend(lines, labels, frameon=True, facecolor=SURFACE, edgecolor=BORDER, fontsize=8, loc="lower right")

    save_svg(fig, "fig4-rlhf-dpo-grpo-architecture.svg")


# ------------------------------------------------------------------------------
# Figure 5: DeepSeek MLA Low-Rank Compression & DistServe PD Disaggregation
# ------------------------------------------------------------------------------
def make_fig5_mla_distserve() -> None:
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11.5, 4.4), gridspec_kw={"width_ratios": [1, 1.15]})
    fig.subplots_adjust(wspace=0.28)

    # Panel A: Per-Token Per-Layer KV Cache Elements (BF16 Bytes)
    archs = ["DeepSeek-67B\n(MHA: 64 Heads)", "Llama-3 70B\n(GQA: 8 Heads)", "DeepSeek-V2/V3\n(MLA: d_c=512, d_R=64)"]
    # Elements per token per layer:
    # MHA: 2 * 64 * 128 = 16384 elems (32 KB)
    # GQA: 2 * 8 * 128 = 2048 elems (4 KB)
    # MLA: 512 + 64 = 576 elems (1.125 KB)
    kb_per_token_layer = [32.0, 4.0, 1.125]
    colors = [SLATE, GOLD, ACCENT]

    bars = ax1.bar(archs, kb_per_token_layer, width=0.48, color=colors, edgecolor=FG, linewidth=0.9)
    for bar, val in zip(bars, kb_per_token_layer):
        ax1.text(
            bar.get_x() + bar.get_width() / 2,
            val + 1.0,
            f"{val:.2f} KB\n({val/32.0*100:.1f}%)",
            ha="center",
            va="bottom",
            fontsize=8.5,
            fontweight="bold",
            color=FG,
        )

    ax1.set_title("A. Per-Token Per-Layer KV Cache State (BF16)", fontsize=11, fontweight="bold", loc="left", pad=10)
    ax1.set_ylabel("Cached State per Layer (KB / Token)", fontsize=9.5)
    ax1.set_ylim(0, 39)
    ax1.grid(True, axis="y")

    # Panel B: Colocated Continuous Batching vs DistServe Prefill-Decode Disaggregation
    ax2.set_xlim(0, 100)
    ax2.set_ylim(0, 10)
    ax2.axis("off")
    ax2.set_title("B. Colocated Interference vs. DistServe PD Disaggregation", fontsize=11, fontweight="bold", loc="left", pad=10)

    # Timeline 1: Colocated Batching
    ax2.text(0, 8.3, "1. Colocated Continuous Batching (Prefill Stalls Decode TPOT)", fontsize=9, fontweight="bold", color=FG)
    blocks_colocated = [
        (0, 12, "Decode\nStep 1", TEAL),
        (12, 12, "Decode\nStep 2", TEAL),
        (24, 48, "Long Prompt Prefill (S=4096)\n[Compute-Bound Stall: +180ms]", ACCENT),
        (72, 12, "Decode\nStep 3", TEAL),
        (84, 12, "Decode\nStep 4", TEAL),
    ]
    for start, width, text_lbl, col in blocks_colocated:
        rect = mpatches.FancyBboxPatch((start, 5.8), width - 1, 1.9, boxstyle="round,pad=0.1", facecolor=col, edgecolor=FG, alpha=0.88)
        ax2.add_patch(rect)
        ax2.text(start + (width - 1) / 2, 6.75, text_lbl, ha="center", va="center", fontsize=7.8, color="white", fontweight="bold")

    # Timeline 2: DistServe Disaggregated
    ax2.text(0, 4.3, "2. DistServe Disaggregated (Dedicated Prefill & Decode Pools)", fontsize=9, fontweight="bold", color=FG)
    # Prefill Pool
    rect_p = mpatches.FancyBboxPatch((0, 2.3), 52, 1.4, boxstyle="round,pad=0.1", facecolor=GOLD, edgecolor=FG, alpha=0.9)
    ax2.add_patch(rect_p)
    ax2.text(26, 3.0, "Prefill Cluster: Compute-Optimal GEMM", ha="center", va="center", fontsize=7.8, color="white", fontweight="bold")
    ax2.annotate("KV DMA", xy=(62, 1.2), xytext=(53, 2.8), arrowprops=dict(arrowstyle="->", color=ACCENT, lw=1.5), fontsize=7.5, fontweight="bold", color=ACCENT)

    # Decode Pool
    for idx in range(7):
        start = idx * 14
        rect_d = mpatches.FancyBboxPatch((start, 0.3), 12.5, 1.4, boxstyle="round,pad=0.1", facecolor=TEAL, edgecolor=FG, alpha=0.9)
        ax2.add_patch(rect_d)
        ax2.text(start + 6.25, 1.0, f"Dec {idx+1}", ha="center", va="center", fontsize=7.5, color="white", fontweight="bold")

    save_svg(fig, "fig5-mla-and-distserve.svg")


# ------------------------------------------------------------------------------
# Figure 6: Long-Context Complexity (Full vs NSA vs Mamba-2 SSD)
# ------------------------------------------------------------------------------
def make_fig6_long_context() -> None:
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11.5, 4.4), gridspec_kw={"width_ratios": [1.15, 1]})
    fig.subplots_adjust(wspace=0.28)

    # Panel A: Attention Compute Scaling from 4K to 128K Tokens
    seq_k = np.array([4, 8, 16, 32, 64, 128])
    # Normalized relative FLOPs at 4K = 1.0
    full_attn = (seq_k / 4.0) ** 2
    nsa_attn = (seq_k / 4.0) * (1.0 + 0.12 * (seq_k / 4.0))  # Compression + Blockwise Selection + Sliding Window
    mamba_ssd = seq_k / 4.0  # Purely linear O(T) state space duality

    ax1.plot(seq_k, full_attn, marker="o", linewidth=2.4, color=ACCENT, label="Full Causal Attention O(T²)")
    ax1.plot(seq_k, nsa_attn, marker="s", linewidth=2.4, color=GOLD, label="Native Sparse Attention (NSA)")
    ax1.plot(seq_k, mamba_ssd, marker="^", linewidth=2.4, color=TEAL, label="Mamba-2 State Space Duality O(T)")

    ax1.annotate(
        "11.6x Decode & 9.0x Forward\nSpeedup at 64K (NSA vs. Full)",
        xy=(64, nsa_attn[4]),
        xytext=(36, 420),
        arrowprops=dict(arrowstyle="->", color=GOLD, lw=1.2),
        fontsize=8.2,
        fontweight="bold",
        color=FG,
    )

    ax1.set_title("A. Sequence Compute Scaling (4K to 128K Context)", fontsize=11, fontweight="bold", loc="left", pad=10)
    ax1.set_xlabel("Context Length (Thousands of Tokens)", fontsize=9.5)
    ax1.set_ylabel("Relative Forward Compute (4K = 1x)", fontsize=9.5)
    ax1.set_yscale("log")
    ax1.set_xticks(seq_k)
    ax1.set_xticklabels([f"{k}K" for k in seq_k])
    ax1.grid(True, which="both", alpha=0.45)
    ax1.legend(frameon=True, facecolor=SURFACE, edgecolor=BORDER, fontsize=8.5, loc="upper left")

    # Panel B: Embodied VLA Control Frequency vs Action Chunking Horizon (RT-2 vs OpenVLA vs Pi-Zero)
    systems = ["RT-2 (55B)\nAutoregressive\nDiscrete Tokens", "OpenVLA (7B)\nLoRA Fine-Tuned\n256-Bin Tokens", "π_0 (Pi-Zero)\nFlow Matching\nAction Expert (H=50)"]
    control_hz = [3.0, 6.5, 50.0]
    cols = [SLATE, GOLD, ACCENT]

    bars = ax2.bar(systems, control_hz, width=0.48, color=cols, edgecolor=FG, linewidth=0.9)
    for bar, hz in zip(bars, control_hz):
        ax2.text(
            bar.get_x() + bar.get_width() / 2,
            hz + 1.5,
            f"{hz:.1f} Hz",
            ha="center",
            va="bottom",
            fontsize=9,
            fontweight="bold",
            color=FG,
        )

    ax2.set_title("B. Embodied VLA Closed-Loop Dexterous Control Rate", fontsize=11, fontweight="bold", loc="left", pad=10)
    ax2.set_ylabel("Effective Control Frequency (Hz)", fontsize=9.5)
    ax2.set_ylim(0, 60)
    ax2.grid(True, axis="y")

    save_svg(fig, "fig6-long-context-vla.svg")


# ------------------------------------------------------------------------------
# Figure 7: 2026 Flagship Co-Design (Sub-Kilobyte KV Cache & Muon NS-5)
# ------------------------------------------------------------------------------
def make_fig7_flagship_2026() -> None:
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11.5, 4.4), gridspec_kw={"width_ratios": [1.05, 1.1]})
    fig.subplots_adjust(wspace=0.28)

    # Panel A: Per-token KV cache bytes across generations (log scale)
    methods = [
        "MHA\n(32 KV heads)",
        "Llama-3 GQA\n(8 KV heads)",
        "DeepSeek-V3\nMLA (BF16)",
        "DeepSeek-V4.1\nCED+CSA2+FP4",
    ]
    kv_bytes = [16384, 4096, 1152, 890]
    cols = [SLATE, GOLD, TEAL, ACCENT]

    bars = ax1.bar(methods, kv_bytes, width=0.5, color=cols, edgecolor=FG, linewidth=0.9)
    for bar, b in zip(bars, kv_bytes):
        ax1.text(
            bar.get_x() + bar.get_width() / 2,
            b * 1.15,
            f"{b:,} B",
            ha="center",
            va="bottom",
            fontsize=8.8,
            fontweight="bold",
            color=FG,
        )

    ax1.axhline(1024, color=MUTED_FG, linestyle="--", linewidth=1.1)
    ax1.text(0.05, 1180, "1 KB/token Sub-Kilobyte Barrier", fontsize=8.2, color=MUTED_FG, fontweight="bold")
    ax1.set_yscale("log")
    ax1.set_ylim(300, 35000)
    ax1.set_title("A. Per-Token KV Cache Footprint (Log Scale)", fontsize=11, fontweight="bold", loc="left", pad=10)
    ax1.set_ylabel("Bytes per Token (Log Scale)", fontsize=9.5)
    ax1.grid(True, axis="y", which="both", alpha=0.5)

    # Panel B: Muon 5-Step Newton-Schulz Quintic Polynomial Contraction toward Polar Factor
    x = np.linspace(0.0, 1.0, 400)
    a, b, c = 3.4445, -4.7750, 2.0315

    def ns_step(v: np.ndarray) -> np.ndarray:
        return a * v + b * (v ** 3) + c * (v ** 5)

    y1 = ns_step(x)
    y3 = ns_step(ns_step(y1))
    y5 = ns_step(ns_step(y3))

    ax2.plot(x, x, linestyle=":", color=MUTED_FG, linewidth=1.5, label="Unorthogonalized (k = 0)")
    ax2.plot(x, y1, color=GOLD, linewidth=2.0, label="After 1 NS Step")
    ax2.plot(x, y3, color=TEAL, linewidth=2.2, label="After 3 NS Steps")
    ax2.plot(x, y5, color=ACCENT, linewidth=2.6, label="After 5 NS Steps (Muon)")
    ax2.axhline(1.0, color=FG, linestyle="--", linewidth=0.9, alpha=0.6)

    ax2.set_title("B. Muon Newton-Schulz Singular-Value Flattening", fontsize=11, fontweight="bold", loc="left", pad=10)
    ax2.set_xlabel("Normalized Input Singular Value σ / ||G||_F", fontsize=9.5)
    ax2.set_ylabel("Mapped Singular Value", fontsize=9.5)
    ax2.set_xlim(0, 1.02)
    ax2.set_ylim(0, 1.25)
    ax2.grid(True)
    ax2.legend(frameon=True, facecolor=SURFACE, edgecolor=BORDER, fontsize=8.3, loc="lower right")

    save_svg(fig, "fig7-flagship-2026-codesign.svg")


# ------------------------------------------------------------------------------
# Figure 8: Looped Transformer Topology & Terminal-Loop Constant KV Cache
# ------------------------------------------------------------------------------
def make_fig8_looped_transformer() -> None:
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11.5, 4.4), gridspec_kw={"width_ratios": [1.05, 1.05]})
    fig.subplots_adjust(wspace=0.28)

    # Panel A: KV Cache Footprint vs Loop Depth K (Unrolled O(K) vs Terminal-Loop O(1))
    loops = np.array([1, 2, 4, 8, 16])
    # Normalized to K=1 (Prelude + 1 Recurrent + Coda = 3 layers)
    naive_unrolled_kv = (2 + loops) / 3.0
    terminal_kv = np.ones_like(loops, dtype=float)

    ax1.plot(loops, naive_unrolled_kv, marker="o", linewidth=2.3, color=SLATE, label="Naive Unrolled / Per-Loop KV O(K)")
    ax1.plot(loops, terminal_kv, marker="s", linewidth=2.6, color=ACCENT, label="Terminal-Loop KV Sharing O(1)")
    ax1.fill_between(loops, terminal_kv, naive_unrolled_kv, color=ACCENT_SOFT, alpha=0.18)
    ax1.annotate(
        "Dory1.0 / Looped CED:\nConstant KV at K = 16",
        xy=(16, 1.0),
        xytext=(9.0, 2.3),
        arrowprops=dict(arrowstyle="->", color=ACCENT, lw=1.2),
        fontsize=8.5,
        fontweight="bold",
        color=FG,
    )
    ax1.set_title("A. KV Cache Memory vs. Recurrent Loop Depth K", fontsize=11, fontweight="bold", loc="left", pad=10)
    ax1.set_xlabel("Test-Time Recurrent Iterations (K)", fontsize=9.5)
    ax1.set_ylabel("Relative KV Cache Memory (K=1 = 1x)", fontsize=9.5)
    ax1.set_xticks(loops)
    ax1.set_ylim(0, 6.8)
    ax1.grid(True)
    ax1.legend(frameon=True, facecolor=SURFACE, edgecolor=BORDER, fontsize=8.5, loc="upper left")

    # Panel B: Compute & Memory Footprint of Elastic Depth + Truncated BPTT
    recipes = [
        "Full BPTT\n(K=8, All Graphs)",
        "Truncated BPTT\n(K=8, Last m=2)",
        "Late Entry\n(Start at K-2 + Verify)",
    ]
    activation_mem = [100.0, 25.0, 18.0]
    compute_cost = [100.0, 100.0, 28.0]
    x_idx = np.arange(len(recipes))
    w = 0.34

    b1 = ax2.bar(x_idx - w / 2, activation_mem, width=w, color=TEAL, edgecolor=FG, linewidth=0.9, label="Activation / State Memory (%)")
    b2 = ax2.bar(x_idx + w / 2, compute_cost, width=w, color=GOLD, edgecolor=FG, linewidth=0.9, label="Forward/Backward FLOPs (%)")
    for bars in (b1, b2):
        for bar in bars:
            h = bar.get_height()
            ax2.text(bar.get_x() + bar.get_width() / 2, h + 2.0, f"{h:.0f}%", ha="center", va="bottom", fontsize=8.3, fontweight="bold")

    ax2.set_title("B. Memory & Compute Savings in Looped Training/Inference", fontsize=11, fontweight="bold", loc="left", pad=10)
    ax2.set_xticks(x_idx)
    ax2.set_xticklabels(recipes, fontsize=8.6)
    ax2.set_ylabel("Relative Cost (% of Full Unrolled Loop)", fontsize=9.5)
    ax2.set_ylim(0, 118)
    ax2.grid(True, axis="y")
    ax2.legend(frameon=True, facecolor=SURFACE, edgecolor=BORDER, fontsize=8.3, loc="upper right")

    save_svg(fig, "fig8-looped-transformer-topology.svg")


# ------------------------------------------------------------------------------
# Figure 9: Block Masked Diffusion Language Models (Mask Structure & Speedup)
# ------------------------------------------------------------------------------
def make_fig9_block_diffusion() -> None:
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11.5, 4.4), gridspec_kw={"width_ratios": [1.0, 1.15]})
    fig.subplots_adjust(wspace=0.28)

    # Panel A: Block-Causal Attention Mask (12 tokens = 3 blocks of 4)
    n = 12
    blk = 4
    idx = np.arange(n)
    blk_i = idx[:, None] // blk
    blk_j = idx[None, :] // blk
    visible = (blk_j <= blk_i).astype(float)
    # Distinguish causal prefix visibility (0.55) vs bidirectional active block (1.0)
    matrix = np.where(blk_j == blk_i, 1.0, np.where(blk_j < blk_i, 0.45, 0.0))

    ax1.imshow(matrix, cmap="YlOrBr", vmin=0.0, vmax=1.15, aspect="equal")
    for edge in (3.5, 7.5):
        ax1.axhline(edge, color=FG, linewidth=1.3)
        ax1.axvline(edge, color=FG, linewidth=1.3)

    ax1.text(1.5, 1.5, "Blk 0\nBidir", ha="center", va="center", fontsize=8.2, fontweight="bold", color=BG)
    ax1.text(5.5, 5.5, "Blk 1\nBidir", ha="center", va="center", fontsize=8.2, fontweight="bold", color=BG)
    ax1.text(9.5, 9.5, "Blk 2\nBidir", ha="center", va="center", fontsize=8.2, fontweight="bold", color=BG)
    ax1.text(1.5, 5.5, "Cached\nPrefix", ha="center", va="center", fontsize=8.0, fontweight="bold", color=FG)
    ax1.text(7.5, 1.5, "Masked (-∞)", ha="center", va="center", fontsize=8.5, fontweight="bold", color=MUTED_FG)

    ax1.set_title("A. Block-Causal Mask (Inter-Block Causal, Intra-Block Bidir)", fontsize=10.5, fontweight="bold", loc="left", pad=10)
    ax1.set_xlabel("Key Position (Blocks of 4 Tokens)", fontsize=9.5)
    ax1.set_ylabel("Query Position", fontsize=9.5)
    ax1.set_xticks([1.5, 5.5, 9.5])
    ax1.set_xticklabels(["Block 0", "Block 1", "Block 2"])
    ax1.set_yticks([1.5, 5.5, 9.5])
    ax1.set_yticklabels(["Block 0", "Block 1", "Block 2"])

    # Panel B: Serial Autoregressive Steps vs Few-Step Block Diffusion
    decoders = [
        "Autoregressive\n(1 tok / step)",
        "Block dLLM\n(T=8 steps)",
        "Mix-FT / PBPO\n(T=4 steps)",
    ]
    forward_passes = [32, 8, 4]
    cols = [SLATE, GOLD, ACCENT]
    bars = ax2.bar(decoders, forward_passes, width=0.48, color=cols, edgecolor=FG, linewidth=0.9)
    for bar, steps in zip(bars, forward_passes):
        speedup = 32 / steps
        ax2.text(
            bar.get_x() + bar.get_width() / 2,
            steps + 0.9,
            f"{steps} passes ({speedup:.0f}x)",
            ha="center",
            va="bottom",
            fontsize=8.8,
            fontweight="bold",
            color=FG,
        )

    ax2.set_title("B. Forward Passes Required per 32-Token Output Block", fontsize=10.5, fontweight="bold", loc="left", pad=10)
    ax2.set_ylabel("Sequential Model Forward Passes", fontsize=9.5)
    ax2.set_ylim(0, 38)
    ax2.grid(True, axis="y")

    save_svg(fig, "fig9-block-diffusion-llm.svg")


if __name__ == "__main__":
    make_fig1_transformer()
    make_fig2_roofline_flash()
    make_fig3_zero_chinchilla()
    make_fig4_rlhf_dpo_grpo()
    make_fig5_mla_distserve()
    make_fig6_long_context()
    make_fig7_flagship_2026()
    make_fig8_looped_transformer()
    make_fig9_block_diffusion()
