"""One-block decoder with learned positions and explicit append-only KV state."""

from __future__ import annotations
import importlib.util
from pathlib import Path
import torch
from torch import Tensor, nn

_spec = importlib.util.spec_from_file_location(
    "lab_attention", Path(__file__).parents[1] / "attention" / "attention.py"
)
_attention = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_attention)
causal_attention = _attention.causal_attention
Cache = tuple[Tensor, Tensor]


class TinyDecoder(nn.Module):
    def __init__(
        self, vocab: int = 64, width: int = 32, heads: int = 4, max_length: int = 256
    ):
        super().__init__()
        if width % heads:
            raise ValueError("width must divide evenly across heads")
        self.heads = heads
        self.width = width
        self.max_length = max_length
        self.token = nn.Embedding(vocab, width)
        self.position = nn.Embedding(max_length, width)
        self.norm1 = nn.LayerNorm(width)
        self.qkv = nn.Linear(width, 3 * width, bias=False)
        self.out = nn.Linear(width, width, bias=False)
        self.norm2 = nn.LayerNorm(width)
        self.mlp = nn.Sequential(
            nn.Linear(width, 2 * width), nn.GELU(), nn.Linear(2 * width, width)
        )
        self.final = nn.LayerNorm(width)
        self.head = nn.Linear(width, vocab, bias=False)

    # region:decode
    def forward(self, ids: Tensor, cache: Cache | None = None) -> tuple[Tensor, Cache]:
        batch, length = ids.shape
        if length < 1:
            raise ValueError("at least one token is required")
        offset = 0 if cache is None else cache[0].shape[-2]
        if offset + length > self.max_length:
            raise ValueError("position capacity exceeded")
        if cache is not None:
            k, v = cache
            if (
                k.shape != v.shape
                or k.shape[:2] != (batch, self.heads)
                or k.shape[-1] != self.width // self.heads
            ):
                raise ValueError("cache shape mismatch")
        positions = torch.arange(offset, offset + length, device=ids.device)
        x = self.token(ids) + self.position(positions)
        projected = self.qkv(self.norm1(x)).view(
            batch, length, 3, self.heads, self.width // self.heads
        )
        q, k, v = projected.permute(2, 0, 3, 1, 4).unbind(0)
        if cache is not None:
            k = torch.cat((cache[0], k), dim=-2)
            v = torch.cat((cache[1], v), dim=-2)
        attended = causal_attention(q, k, v, offset=offset)
        x = x + self.out(
            attended.transpose(1, 2).contiguous().view(batch, length, self.width)
        )
        x = x + self.mlp(self.norm2(x))
        return self.head(self.final(x)), (k, v)

    # endregion:decode


def cache_bytes(cache: Cache) -> int:
    return sum(t.numel() * t.element_size() for t in cache)
