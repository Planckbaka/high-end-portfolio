"""Roofline arithmetic intensity calculator and Online Softmax tiled attention (FlashAttention mechanics)."""

import math
from dataclasses import dataclass
import torch
from torch import Tensor


# region:roofline_ledger
@dataclass
class GPUConfig:
    name: str
    fp16_tflops: float
    hbm_bandwidth_gbps: float
    vram_gb: float

    @property
    def ridge_point(self) -> float:
        return (self.fp16_tflops * 1e12) / (self.hbm_bandwidth_gbps * 1e9)


H100_SXM = GPUConfig("NVIDIA H100 SXM (80GB)", fp16_tflops=989.0, hbm_bandwidth_gbps=3350.0, vram_gb=80.0)


@dataclass
class ModelLedger:
    name: str
    num_layers: int
    hidden_size: int
    num_q_heads: int
    num_kv_heads: int
    head_dim: int
    intermediate_size: int
    vocab_size: int
    mla_kv_lora_rank: int = 0

    def total_params(self) -> int:
        emb = 2 * self.vocab_size * self.hidden_size
        attn = self.hidden_size * (2 * self.num_q_heads + 2 * self.num_kv_heads) * self.head_dim
        ffn = 3 * self.hidden_size * self.intermediate_size
        norm = 2 * self.hidden_size
        return emb + self.num_layers * (attn + ffn + norm)

    def kv_cache_bytes(self, batch_size: int, seq_len: int, bytes_per_elem: int = 2) -> int:
        if self.mla_kv_lora_rank > 0:
            return self.num_layers * batch_size * seq_len * self.mla_kv_lora_rank * bytes_per_elem
        return 2 * self.num_layers * batch_size * seq_len * self.num_kv_heads * self.head_dim * bytes_per_elem

    def arithmetic_intensity(self, batch_size: int, seq_len: int) -> dict[str, float]:
        params = self.total_params()
        weight_bytes = params * 2
        kv_bytes = self.kv_cache_bytes(batch_size, seq_len)
        prefill_ai = (2.0 * params * batch_size * seq_len) / (weight_bytes + kv_bytes)
        decode_ai = (2.0 * params * batch_size) / (weight_bytes + kv_bytes)
        return {"prefill_flops_per_byte": prefill_ai, "decode_flops_per_byte": decode_ai}
# endregion:roofline_ledger


# region:online_tiled_attention
def tiled_flash_attention(q: Tensor, k: Tensor, v: Tensor, block_size: int = 16) -> Tensor:
    """
    Exact blockwise attention using Online Softmax rescaling without materializing the N x N matrix.
    Shapes: q, k, v of shape [B, H, N, D].
    """
    b, h, n, d = q.shape
    scale = 1.0 / math.sqrt(d)
    out = torch.zeros_like(q, dtype=torch.float32)

    for i_start in range(0, n, block_size):
        i_end = min(i_start + block_size, n)
        q_block = q[:, :, i_start:i_end, :].float()  # [B, H, Br, D]
        br = i_end - i_start

        m_i = torch.full((b, h, br, 1), float("-inf"), device=q.device, dtype=torch.float32)
        l_i = torch.zeros((b, h, br, 1), device=q.device, dtype=torch.float32)
        acc_o = torch.zeros((b, h, br, d), device=q.device, dtype=torch.float32)

        q_pos = torch.arange(i_start, i_end, device=q.device)[:, None]

        for j_start in range(0, i_end, block_size):
            j_end = min(j_start + block_size, n)
            k_block = k[:, :, j_start:j_end, :].float()
            v_block = v[:, :, j_start:j_end, :].float()
            k_pos = torch.arange(j_start, j_end, device=q.device)[None, :]

            scores = (q_block @ k_block.transpose(-2, -1)) * scale
            scores = scores.masked_fill(k_pos > q_pos, float("-inf"))

            block_max = scores.max(dim=-1, keepdim=True).values
            m_new = torch.maximum(m_i, block_max)
            # Rescale previous accumulator and denominator to the new running maximum m_new.
            alpha = torch.exp(m_i - m_new)
            p_tilde = torch.exp(scores - m_new)

            l_i = alpha * l_i + p_tilde.sum(dim=-1, keepdim=True)
            acc_o = alpha * acc_o + (p_tilde @ v_block)
            m_i = m_new

        out[:, :, i_start:i_end, :] = acc_o / l_i

    return out.to(q.dtype)
# endregion:online_tiled_attention


if __name__ == "__main__":
    torch.manual_seed(13)
    q, k, v = [torch.randn(2, 4, 64, 32) for _ in range(3)]
    tiled = tiled_flash_attention(q, k, v, block_size=16)
    ref = torch.nn.functional.scaled_dot_product_attention(q, k, v, is_causal=True)
    llama8b = ModelLedger("Llama-3-8B", 32, 4096, 32, 8, 128, 14336, 128256)
    print({
        "max_abs_err": (tiled - ref).abs().max().item(),
        "h100_ridge": round(H100_SXM.ridge_point, 1),
        "b1_decode_ai": round(llama8b.arithmetic_intensity(1, 4096)["decode_flops_per_byte"], 2),
    })
