"""CPU verification of DeepSeek-V2/V3 Multi-head Latent Attention (MLA) matrix absorption and DeepSeek-R1 GRPO."""

import math
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch import Tensor


# region:mla_absorption
class MultiHeadLatentAttention(nn.Module):
    """
    Demonstrates the algebraic equivalence between:
      1. Explicit Up-Projection (training path): materialize K = c_kv @ W_uk^T, V = c_kv @ W_uv^T
      2. Matrix-Absorbed Inference (decoding path): cache only c_kv (dimension d_c << H * d_h),
         absorb W_uk into q_absorbed = q @ W_uk, and absorb W_uv after softmax.
    """

    def __init__(self, d_model: int, num_heads: int, head_dim: int, d_c: int):
        super().__init__()
        self.num_heads = num_heads
        self.head_dim = head_dim
        self.d_c = d_c

        self.wq = nn.Linear(d_model, num_heads * head_dim, bias=False)
        self.w_dkv = nn.Linear(d_model, d_c, bias=False)
        # Per-head up-projection weights stored as [H, head_dim, d_c]
        self.w_uk = nn.Parameter(torch.randn(num_heads, head_dim, d_c) / math.sqrt(d_c))
        self.w_uv = nn.Parameter(torch.randn(num_heads, head_dim, d_c) / math.sqrt(d_c))
        self.wo = nn.Linear(num_heads * head_dim, d_model, bias=False)

    def forward_explicit(self, x: Tensor) -> tuple[Tensor, int]:
        b, s, _ = x.shape
        q = self.wq(x).view(b, s, self.num_heads, self.head_dim).transpose(1, 2)  # [B, H, S, D]
        c_kv = self.w_dkv(x)  # [B, S, d_c]

        # Materialize full per-head K and V: [B, H, S, D]
        k = torch.einsum("bsd,hcd->bhsc", c_kv, self.w_uk)
        v = torch.einsum("bsd,hcd->bhsc", c_kv, self.w_uv)
        explicit_cache_elems = 2 * k.numel()

        scores = (q @ k.transpose(-2, -1)) / math.sqrt(self.head_dim)
        mask = torch.triu(torch.full((s, s), float("-inf"), device=x.device), diagonal=1)
        probs = F.softmax(scores + mask, dim=-1)
        out = (probs @ v).transpose(1, 2).contiguous().view(b, s, -1)
        return self.wo(out), explicit_cache_elems

    def forward_absorbed(self, x: Tensor) -> tuple[Tensor, int]:
        b, s, _ = x.shape
        q = self.wq(x).view(b, s, self.num_heads, self.head_dim).transpose(1, 2)  # [B, H, S, D]
        c_kv = self.w_dkv(x)  # [B, S, d_c] -- ONLY this compressed latent tensor is cached!
        compressed_cache_elems = c_kv.numel()

        # Absorb W_uk into Q: q_abs [B, H, S, d_c] = q [B, H, S, D] @ W_uk [H, D, d_c]
        q_abs = torch.einsum("bhsd,hdc->bhsc", q, self.w_uk)
        # Dot product directly against shared latent cache c_kv [B, S, d_c]
        scores = torch.einsum("bhsc,btc->bhst", q_abs, c_kv) / math.sqrt(self.head_dim)
        mask = torch.triu(torch.full((s, s), float("-inf"), device=x.device), diagonal=1)
        probs = F.softmax(scores + mask, dim=-1)

        # Aggregate latent vectors first: [B, H, S, d_c], then project up with W_uv
        latent_context = torch.einsum("bhst,btc->bhsc", probs, c_kv)
        head_out = torch.einsum("bhsc,hdc->bhsd", latent_context, self.w_uv)
        out = head_out.transpose(1, 2).contiguous().view(b, s, -1)
        return self.wo(out), compressed_cache_elems
# endregion:mla_absorption


# region:grpo_dpo_loss
def grpo_step_loss(
    logp_new: Tensor,
    logp_old: Tensor,
    logp_ref: Tensor,
    rewards: Tensor,
    eps_clip: float = 0.2,
    beta_kl: float = 0.04,
) -> tuple[Tensor, Tensor]:
    """
    Compute DeepSeek-R1 Group Relative Policy Optimization (GRPO) loss over a group of G completions.
    Shapes: logp_* [G, T], rewards [G].
    """
    # 1. Group-relative normalized advantage (eliminates the separate Value Critic network)
    mean_r = rewards.mean()
    std_r = rewards.std(unbiased=False)
    advantages = ((rewards - mean_r) / (std_r + 1e-8)).unsqueeze(-1)  # [G, 1] broadcast across tokens

    # 2. Importance sampling ratio & PPO clipped surrogate objective
    ratio = torch.exp(logp_new - logp_old.detach())
    surr1 = ratio * advantages
    surr2 = torch.clamp(ratio, 1.0 - eps_clip, 1.0 + eps_clip) * advantages
    policy_objective = torch.minimum(surr1, surr2)

    # 3. Unbiased non-negative Schulman k3 KL penalty estimator: exp(log_ref - log_new) - (log_ref - log_new) - 1
    log_diff = logp_ref.detach() - logp_new
    kl_penalty = torch.exp(log_diff) - log_diff - 1.0

    loss = -(policy_objective - beta_kl * kl_penalty).mean()
    return loss, advantages.squeeze(-1)


def dpo_preference_loss(
    policy_chosen_logp: Tensor,
    policy_rejected_logp: Tensor,
    ref_chosen_logp: Tensor,
    ref_rejected_logp: Tensor,
    beta: float = 0.1,
) -> tuple[Tensor, Tensor]:
    """Closed-form Direct Preference Optimization (DPO) loss and implicit reward margin."""
    chosen_logratios = policy_chosen_logp - ref_chosen_logp
    rejected_logratios = policy_rejected_logp - ref_rejected_logp
    logits = beta * (chosen_logratios - rejected_logratios)
    loss = -F.logsigmoid(logits).mean()
    reward_margin = (beta * chosen_logratios - beta * rejected_logratios).detach()
    return loss, reward_margin
# endregion:grpo_dpo_loss


if __name__ == "__main__":
    torch.manual_seed(29)
    mla = MultiHeadLatentAttention(d_model=128, num_heads=8, head_dim=16, d_c=32)
    x = torch.randn(2, 24, 128)
    out_exp, kv_exp = mla.forward_explicit(x)
    out_abs, kv_abs = mla.forward_absorbed(x)
    print({
        "mla_absorption_max_err": (out_exp - out_abs).abs().max().item(),
        "kv_compression_ratio": kv_exp / kv_abs,
    })
