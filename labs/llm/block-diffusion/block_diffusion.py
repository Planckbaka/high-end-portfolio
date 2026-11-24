"""CPU verification of Block Masked Diffusion Language Models (MDLM NELBO and confidence-aware parallel unmasking)."""

import math
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch import Tensor


# region:block_masked_diffusion_nelbo
class BlockMaskedDiffusionLM(nn.Module):
    """
    Block Masked Diffusion Language Model (dQwen3.5, arXiv:2609.20751; Mix-FT, arXiv:2611.02666):
    - Inter-block: strictly causal across blocks so clean prefix blocks are cacheable.
    - Intra-block: fully bidirectional within each block so multiple [MASK] tokens unmask in parallel.
    """

    def __init__(self, vocab_size: int = 128, hidden_size: int = 128, num_layers: int = 3, num_heads: int = 4):
        super().__init__()
        self.vocab_size = vocab_size
        self.mask_token_id = vocab_size - 1
        self.embed = nn.Embedding(vocab_size, hidden_size)
        self.pos_embed = nn.Embedding(512, hidden_size)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=hidden_size,
            nhead=num_heads,
            dim_feedforward=hidden_size * 2,
            activation="gelu",
            batch_first=True,
            norm_first=True,
        )
        self.backbone = nn.TransformerEncoder(
            encoder_layer, num_layers=num_layers, enable_nested_tensor=False
        )
        self.lm_head = nn.Linear(hidden_size, vocab_size - 1, bias=False)

    @staticmethod
    def build_block_causal_mask(seq_len: int, block_size: int, device: torch.device) -> Tensor:
        """Position i attends to j iff block_idx(j) <= block_idx(i); True masks out future blocks."""
        idx = torch.arange(seq_len, device=device)
        blk_i = idx.unsqueeze(1) // block_size
        blk_j = idx.unsqueeze(0) // block_size
        return blk_j > blk_i

    def forward(self, x_noisy: Tensor, block_size: int = 16) -> Tensor:
        b, s = x_noisy.shape
        pos = torch.arange(s, device=x_noisy.device).unsqueeze(0).expand(b, s)
        h = self.embed(x_noisy) + self.pos_embed(pos)
        attn_mask = self.build_block_causal_mask(s, block_size, x_noisy.device)
        h = self.backbone(h, mask=attn_mask)
        return self.lm_head(h)

    def compute_mdlm_nelbo_loss(self, clean_ids: Tensor, block_size: int = 16) -> Tensor:
        """Continuous-time masked diffusion NELBO: 1/t-weighted cross-entropy over masked positions."""
        b, s = clean_ids.shape
        t = torch.empty(b, 1, device=clean_ids.device).uniform_(0.05, 1.0)
        mask_flags = torch.rand(b, s, device=clean_ids.device) < t
        mask_flags[:, -1] = True

        x_t = torch.where(mask_flags, torch.full_like(clean_ids, self.mask_token_id), clean_ids)
        logits = self.forward(x_t, block_size=block_size)

        token_ce = F.cross_entropy(
            logits.view(-1, self.vocab_size - 1),
            clean_ids.view(-1),
            reduction="none",
        ).view(b, s)
        weighted_loss = (token_ce * mask_flags.float()) / t
        return weighted_loss.sum() / mask_flags.float().sum()
# endregion:block_masked_diffusion_nelbo

# region:parallel_confidence_unmasking
    @torch.no_grad()
    def sample_block_parallel(
        self, prefix_ids: Tensor, block_size: int = 16, denoise_steps: int = 4
    ) -> tuple[Tensor, list[int]]:
        """
        Confidence-aware parallel unmasking: decodes a block_size chunk in denoise_steps
        forward passes by committing the top-k highest-confidence [MASK] tokens per step.
        """
        if prefix_ids.shape[0] != 1:
            raise ValueError("sample_block_parallel expects batch size 1")
        cur_block = torch.full(
            (1, block_size), self.mask_token_id, dtype=torch.long, device=prefix_ids.device
        )
        tokens_per_step = math.ceil(block_size / denoise_steps)
        revealed_per_iter: list[int] = []

        for step in range(denoise_steps):
            full_seq = torch.cat([prefix_ids, cur_block], dim=1)
            logits = self.forward(full_seq, block_size=block_size)[:, -block_size:, :]
            probs = F.softmax(logits, dim=-1)
            confidences, pred_tokens = probs.max(dim=-1)

            still_masked = cur_block == self.mask_token_id
            num_remaining = int(still_masked.sum().item())
            if num_remaining == 0:
                break
            k = num_remaining if step == denoise_steps - 1 else min(tokens_per_step, num_remaining)

            masked_conf = confidences.masked_fill(~still_masked, -1.0)
            _, topk_pos = torch.topk(masked_conf, k=k, dim=-1)
            cur_block.scatter_(1, topk_pos, pred_tokens.gather(1, topk_pos))
            revealed_per_iter.append(k)

        return torch.cat([prefix_ids, cur_block], dim=1), revealed_per_iter
# endregion:parallel_confidence_unmasking


if __name__ == "__main__":
    torch.manual_seed(2026)
    model = BlockMaskedDiffusionLM(vocab_size=64, hidden_size=128, num_layers=2, num_heads=4)
    opt = torch.optim.AdamW(model.parameters(), lr=3e-3)

    pattern = (torch.arange(32) % 16).unsqueeze(0).repeat(8, 1)
    loss_start = model.compute_mdlm_nelbo_loss(pattern, block_size=16).item()
    for _ in range(40):
        opt.zero_grad()
        loss = model.compute_mdlm_nelbo_loss(pattern, block_size=16)
        loss.backward()
        opt.step()
    loss_end = model.compute_mdlm_nelbo_loss(pattern, block_size=16).item()

    prefix = (torch.arange(16) % 16).unsqueeze(0)
    generated, step_counts = model.sample_block_parallel(prefix, block_size=16, denoise_steps=4)
    print({
        "nelbo_loss_start": round(loss_start, 4),
        "nelbo_loss_end": round(loss_end, 4),
        "parallel_steps": len(step_counts),
        "revealed_per_step": step_counts,
        "generated_tail": generated[0, 16:].tolist(),
    })
