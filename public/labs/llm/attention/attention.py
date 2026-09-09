"""CPU causal attention. Random tensors demonstrate mechanics, not model quality."""

import math
import torch
from torch import Tensor


# region:attention
def causal_attention(q: Tensor, k: Tensor, v: Tensor, *, offset: int = 0) -> Tensor:
    # Shapes: q [B,H,Tq,D], k/v [B,H,Tk,D]. Offset is the prefix length.
    if q.ndim != 4 or k.ndim != 4 or v.ndim != 4:
        raise ValueError("expected rank-four tensors")
    if q.shape[:2] != k.shape[:2] or k.shape != v.shape or q.shape[-1] != k.shape[-1]:
        raise ValueError("incompatible batch, head, or feature dimensions")
    if offset < 0 or offset + q.shape[-2] != k.shape[-2] or q.shape[-2] == 0:
        raise ValueError("keys must cover prefix plus current queries")
    scores = q @ k.transpose(-2, -1) / math.sqrt(q.shape[-1])
    query_positions = torch.arange(q.shape[-2], device=q.device) + offset
    key_positions = torch.arange(k.shape[-2], device=q.device)
    allowed = key_positions[None, :] <= query_positions[:, None]
    probabilities = scores.masked_fill(~allowed, float("-inf")).softmax(dim=-1)
    return probabilities @ v


# endregion:attention

if __name__ == "__main__":
    torch.manual_seed(7)
    q, k, v = [torch.randn(2, 4, 8, 16) for _ in range(3)]
    result = causal_attention(q, k, v)
    reference = torch.nn.functional.scaled_dot_product_attention(
        q, k, v, is_causal=True, dropout_p=0.0
    )
    print(
        {
            "device": str(q.device),
            "shape": list(result.shape),
            "max_absolute_error": (result - reference).abs().max().item(),
        }
    )
