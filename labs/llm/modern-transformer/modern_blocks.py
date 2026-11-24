"""CPU reference blocks for modern Decoder-only Transformers: RMSNorm, RoPE, GQA, SwiGLU, and Top-K MoE."""

import math
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch import Tensor


# region:rmsnorm_rope
class RMSNorm(nn.Module):
    def __init__(self, dim: int, eps: float = 1e-6):
        super().__init__()
        self.eps = eps
        self.weight = nn.Parameter(torch.ones(dim))

    def forward(self, x: Tensor) -> Tensor:
        # Accumulate mean-square in float32 to prevent BF16/FP16 overflow before scaling.
        orig_dtype = x.dtype
        x_fp32 = x.float()
        rms = torch.rsqrt(x_fp32.pow(2).mean(dim=-1, keepdim=True) + self.eps)
        return (x_fp32 * rms).to(orig_dtype) * self.weight


def precompute_rope_cos_sin(head_dim: int, max_seq_len: int, base: float = 10000.0) -> tuple[Tensor, Tensor]:
    if head_dim % 2 != 0:
        raise ValueError("head_dim must be even for 2D complex-plane rotation")
    inv_freq = 1.0 / (base ** (torch.arange(0, head_dim, 2, dtype=torch.float32) / head_dim))
    positions = torch.arange(max_seq_len, dtype=torch.float32)
    angles = torch.outer(positions, inv_freq)
    return torch.cos(angles), torch.sin(angles)


def apply_rope(x: Tensor, cos: Tensor, sin: Tensor) -> Tensor:
    # x shape: [B, H, T, D]
    seq_len = x.shape[2]
    cos_t = cos[:seq_len, :][None, None, :, :]
    sin_t = sin[:seq_len, :][None, None, :, :]
    x_even = x[..., 0::2]
    x_odd = x[..., 1::2]
    rot_even = x_even * cos_t - x_odd * sin_t
    rot_odd = x_even * sin_t + x_odd * cos_t
    return torch.stack([rot_even, rot_odd], dim=-1).flatten(-2)
# endregion:rmsnorm_rope


# region:gqa_moe
class GroupedQueryAttention(nn.Module):
    def __init__(self, hidden_size: int, num_q_heads: int, num_kv_heads: int, head_dim: int):
        super().__init__()
        if num_q_heads % num_kv_heads != 0:
            raise ValueError("num_q_heads must be divisible by num_kv_heads")
        self.num_q_heads = num_q_heads
        self.num_kv_heads = num_kv_heads
        self.group_size = num_q_heads // num_kv_heads
        self.head_dim = head_dim
        self.wq = nn.Linear(hidden_size, num_q_heads * head_dim, bias=False)
        self.wk = nn.Linear(hidden_size, num_kv_heads * head_dim, bias=False)
        self.wv = nn.Linear(hidden_size, num_kv_heads * head_dim, bias=False)
        self.wo = nn.Linear(num_q_heads * head_dim, hidden_size, bias=False)

    def forward(self, x: Tensor, cos: Tensor, sin: Tensor) -> tuple[Tensor, int]:
        b, s, _ = x.shape
        q = self.wq(x).view(b, s, self.num_q_heads, self.head_dim).transpose(1, 2)
        k = self.wk(x).view(b, s, self.num_kv_heads, self.head_dim).transpose(1, 2)
        v = self.wv(x).view(b, s, self.num_kv_heads, self.head_dim).transpose(1, 2)
        q = apply_rope(q, cos, sin)
        k = apply_rope(k, cos, sin)
        # Only the unexpanded KV heads are stored in the persistent KV cache (2 bytes per BF16 element).
        kv_cache_bytes = 2 * k.numel() * 2
        if self.group_size > 1:
            k = k.repeat_interleave(self.group_size, dim=1)
            v = v.repeat_interleave(self.group_size, dim=1)
        scores = (q @ k.transpose(-2, -1)) / math.sqrt(self.head_dim)
        mask = torch.triu(torch.full((s, s), float("-inf"), device=x.device), diagonal=1)
        probs = F.softmax((scores + mask).float(), dim=-1).to(x.dtype)
        out = (probs @ v).transpose(1, 2).contiguous().view(b, s, -1)
        return self.wo(out), kv_cache_bytes


class SwiGLUFFN(nn.Module):
    def __init__(self, hidden_size: int, intermediate_size: int):
        super().__init__()
        self.w_gate = nn.Linear(hidden_size, intermediate_size, bias=False)
        self.w_up = nn.Linear(hidden_size, intermediate_size, bias=False)
        self.w_down = nn.Linear(intermediate_size, hidden_size, bias=False)

    def forward(self, x: Tensor) -> Tensor:
        return self.w_down(F.silu(self.w_gate(x)) * self.w_up(x))


class SparseMoEBlock(nn.Module):
    def __init__(self, hidden_size: int, intermediate_size: int, num_experts: int = 8, top_k: int = 2):
        super().__init__()
        self.num_experts = num_experts
        self.top_k = top_k
        self.router = nn.Linear(hidden_size, num_experts, bias=False)
        self.experts = nn.ModuleList([SwiGLUFFN(hidden_size, intermediate_size) for _ in range(num_experts)])

    def forward(self, x: Tensor) -> tuple[Tensor, Tensor]:
        b, s, h = x.shape
        flat = x.view(-1, h)
        logits = self.router(flat)
        top_logits, top_indices = torch.topk(logits, self.top_k, dim=-1)
        weights = F.softmax(top_logits.float(), dim=-1).to(x.dtype)
        out = torch.zeros_like(flat)
        for idx in range(self.num_experts):
            token_idx, k_pos = torch.where(top_indices == idx)
            if token_idx.numel() > 0:
                expert_out = self.experts[idx](flat[token_idx])
                out.index_add_(0, token_idx, expert_out * weights[token_idx, k_pos].unsqueeze(-1))
        counts = torch.bincount(top_indices.view(-1), minlength=self.num_experts).float()
        return out.view(b, s, h), counts / counts.sum()
# endregion:gqa_moe


if __name__ == "__main__":
    torch.manual_seed(42)
    cos, sin = precompute_rope_cos_sin(64, 128)
    q = torch.randn(1, 1, 1, 64).expand(1, 1, 100, 64)
    k = torch.randn(1, 1, 1, 64).expand(1, 1, 100, 64)
    q_r, k_r = apply_rope(q, cos, sin), apply_rope(k, cos, sin)
    d1 = (q_r[0, 0, 10] * k_r[0, 0, 5]).sum().item()
    d2 = (q_r[0, 0, 85] * k_r[0, 0, 80]).sum().item()
    print({"rope_delta_5_error": abs(d1 - d2)})
