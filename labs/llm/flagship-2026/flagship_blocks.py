"""CPU verification of 2026 flagship LLM co-design operators: AttnRes, 4-Branch Gated Residual, CED+CSA2, and Muon."""

import math
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch import Tensor


# region:attn_res_and_gated_residual
class AttentionResidualRouter(nn.Module):
    """
    Depth-wise Attention Residuals (Kimi K3, arXiv:2607.24653; ARLoop, arXiv:2611.05234).
    Instead of summing all previous layers onto a single residual bus, a learned pseudo-query
    scores historical layer representations along the depth axis via softmax routing.
    """

    def __init__(self, hidden_size: int):
        super().__init__()
        self.pseudo_query = nn.Parameter(torch.randn(hidden_size) * 0.02)
        self.key_proj = nn.Linear(hidden_size, hidden_size, bias=False)
        self.scale = 1.0 / math.sqrt(hidden_size)

    def forward(self, layer_history: list[Tensor]) -> tuple[Tensor, Tensor]:
        stacked = torch.stack(layer_history, dim=2)  # [B, S, L_prev, H]
        keys = self.key_proj(stacked)
        logits = torch.einsum("bslh,h->bsl", keys, self.pseudo_query) * self.scale
        depth_weights = F.softmax(logits.float(), dim=-1).to(stacked.dtype)
        routed = torch.einsum("bsl,bslh->bsh", depth_weights, stacked)
        return routed, depth_weights.mean(dim=(0, 1))


class GatedResidual4Branch(nn.Module):
    """
    Four-branch Gated Residual stream (Qwen3.8-Next, arXiv:2608.30320).
    Maintains M=4 parallel residual substreams [B, S, 4, H], reading a gated combination
    before each sublayer and writing gated updates back to each branch.
    """

    def __init__(self, hidden_size: int, num_branches: int = 4):
        super().__init__()
        self.num_branches = num_branches
        self.read_gate = nn.Linear(hidden_size, num_branches, bias=False)
        self.write_gate = nn.Linear(hidden_size, num_branches, bias=False)

    def aggregate_for_sublayer(self, streams: Tensor) -> Tensor:
        mean_ctx = streams.mean(dim=2)
        alpha = F.softmax(self.read_gate(mean_ctx).float(), dim=-1).to(streams.dtype)
        return torch.einsum("bsm,bsmh->bsh", alpha, streams)

    def distribute_to_streams(self, streams: Tensor, sublayer_out: Tensor) -> Tensor:
        beta = torch.sigmoid(self.write_gate(sublayer_out)) * (2.0 / self.num_branches)
        return streams + beta.unsqueeze(-1) * sublayer_out.unsqueeze(2)
# endregion:attn_res_and_gated_residual


# region:ced_csa2_and_muon
class AsymmetricCEDLayer(nn.Module):
    """
    Asymmetric Causal Encoder-Decoder (CED) layer with CSA2 cross-layer KV reuse
    (DeepSeek-V4.1-Flash, arXiv:2609.19969).
    - mode='full': projects and stores compressed KV state (simulated at FP4 = 0.5 B/elem).
    - mode='reuse': reuses the preceding full layer's KV cache with zero additional KV memory.
    """

    def __init__(self, hidden_size: int, ffn_dim: int, mode: str = "full"):
        super().__init__()
        if mode not in ("full", "reuse"):
            raise ValueError("mode must be 'full' or 'reuse'")
        self.mode = mode
        self.kv_dim = hidden_size // 4
        self.norm1 = nn.RMSNorm(hidden_size)
        self.wq = nn.Linear(hidden_size, self.kv_dim, bias=False)
        if mode == "full":
            self.wk = nn.Linear(hidden_size, self.kv_dim, bias=False)
            self.wv = nn.Linear(hidden_size, self.kv_dim, bias=False)
        self.wo = nn.Linear(self.kv_dim, hidden_size, bias=False)
        self.norm2 = nn.RMSNorm(hidden_size)
        self.ffn = nn.Sequential(
            nn.Linear(hidden_size, ffn_dim, bias=False),
            nn.SiLU(),
            nn.Linear(ffn_dim, hidden_size, bias=False),
        )

    def forward(
        self, x: Tensor, shared_kv: tuple[Tensor, Tensor] | None = None
    ) -> tuple[Tensor, tuple[Tensor, Tensor], int]:
        _, seq_len, _ = x.shape
        h = self.norm1(x)
        q = self.wq(h)
        if self.mode == "full":
            k, v = self.wk(h), self.wv(h)
            new_kv_bytes = int((k.numel() + v.numel()) * 0.5)
        else:
            if shared_kv is None:
                raise ValueError("reuse layer requires shared_kv from a preceding full layer")
            k, v = shared_kv
            new_kv_bytes = 0

        scores = torch.matmul(q, k.transpose(-2, -1)) / math.sqrt(self.kv_dim)
        mask = torch.triu(torch.full((seq_len, seq_len), float("-inf"), device=x.device), diagonal=1)
        attn = F.softmax((scores + mask).float(), dim=-1).to(x.dtype)
        x = x + self.wo(torch.matmul(attn, v))
        x = x + self.ffn(self.norm2(x))
        return x, (k, v), new_kv_bytes


def muon_newton_schulz_5step(grad: Tensor, steps: int = 5, eps: float = 1e-7) -> Tensor:
    """
    Muon 5-step Newton-Schulz matrix orthogonalization (arXiv:2502.16982).
    Applies the tuned quintic odd polynomial to flatten singular values toward 1,
    approximating the polar factor U @ V^T with Moonlight RMS scaling.
    """
    if grad.ndim != 2:
        raise ValueError("grad must be a 2D matrix")
    a, b, c = (3.4445, -4.7750, 2.0315)
    x = grad.float()
    transposed = x.size(0) > x.size(1)
    if transposed:
        x = x.T
    x = x / (x.norm() + eps)
    for _ in range(steps):
        gram = x @ x.T
        poly = b * gram + c * (gram @ gram)
        x = a * x + poly @ x
    if transposed:
        x = x.T
    scale = 0.2 * math.sqrt(max(grad.size(0), grad.size(1)))
    return x.to(grad.dtype) * scale
# endregion:ced_csa2_and_muon


if __name__ == "__main__":
    torch.manual_seed(42)
    b, s, h = 2, 32, 128

    attn_res = AttentionResidualRouter(h)
    routed, depth_weights = attn_res([torch.randn(b, s, h) for _ in range(6)])

    gr = GatedResidual4Branch(h, num_branches=4)
    streams = torch.randn(b, s, 4, h)
    streams_next = gr.distribute_to_streams(streams, torch.tanh(gr.aggregate_for_sublayer(streams)))

    enc_full = AsymmetricCEDLayer(h, ffn_dim=256, mode="full")
    enc_reuse = AsymmetricCEDLayer(h, ffn_dim=256, mode="reuse")
    dec_heavy = AsymmetricCEDLayer(h, ffn_dim=512, mode="full")
    x = torch.randn(b, s, h)
    x, kv, b1 = enc_full(x)
    x, _, b2 = enc_reuse(x, shared_kv=kv)
    x, _, b3 = dec_heavy(x)

    u_mat, _ = torch.linalg.qr(torch.randn(64, 64))
    v_mat, _ = torch.linalg.qr(torch.randn(64, 64))
    ill_grad = u_mat @ torch.diag(torch.logspace(2, -1.3, steps=64)) @ v_mat.T
    muon_update = muon_newton_schulz_5step(ill_grad, steps=5)
    s_before = torch.linalg.svdvals(ill_grad)
    s_after = torch.linalg.svdvals(muon_update / (0.2 * math.sqrt(64)))

    print({
        "attn_res_shape": tuple(routed.shape),
        "depth_weights_sum": round(depth_weights.sum().item(), 6),
        "gated_residual_shape": tuple(streams_next.shape),
        "ced_ffn_ratio": sum(p.numel() for p in dec_heavy.ffn.parameters()) / sum(p.numel() for p in enc_full.ffn.parameters()),
        "kv_bytes": {"full": b1, "reuse": b2, "decoder": b3},
        "muon_cond_before": round((s_before.max() / s_before.min()).item(), 2),
        "muon_cond_after": round((s_after.max() / s_after.min()).item(), 3),
    })
