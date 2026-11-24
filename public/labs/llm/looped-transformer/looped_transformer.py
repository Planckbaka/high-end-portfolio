"""CPU verification of Looped Transformer sandwich topology, terminal-loop constant KV cache, and truncated BPTT."""

import math
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch import Tensor


# region:terminal_kv_block
class CausalBlockWithTerminalKV(nn.Module):
    """
    Shared causal transformer block supporting Terminal-Loop KV Sharing
    (Dory1.0-4B, arXiv:2611.03998; Done Right Part II, arXiv:2610.06833).
    Regardless of the current token's loop iteration k, historical tokens only
    expose their finalized terminal-loop KV vectors from past_terminal_kv.
    """

    def __init__(self, hidden_size: int, num_heads: int = 4):
        super().__init__()
        self.num_heads = num_heads
        self.head_dim = hidden_size // num_heads
        self.norm1 = nn.RMSNorm(hidden_size)
        self.wq = nn.Linear(hidden_size, hidden_size, bias=False)
        self.wk = nn.Linear(hidden_size, hidden_size, bias=False)
        self.wv = nn.Linear(hidden_size, hidden_size, bias=False)
        self.wo = nn.Linear(hidden_size, hidden_size, bias=False)
        self.norm2 = nn.RMSNorm(hidden_size)
        self.ffn = nn.Sequential(
            nn.Linear(hidden_size, hidden_size * 2, bias=False),
            nn.SiLU(),
            nn.Linear(hidden_size * 2, hidden_size, bias=False),
        )

    def forward(
        self,
        x: Tensor,
        past_terminal_kv: tuple[Tensor, Tensor] | None = None,
    ) -> tuple[Tensor, tuple[Tensor, Tensor]]:
        b, s, h = x.shape
        normed = self.norm1(x)
        q = self.wq(normed).view(b, s, self.num_heads, self.head_dim).transpose(1, 2)
        k_cur = self.wk(normed).view(b, s, self.num_heads, self.head_dim).transpose(1, 2)
        v_cur = self.wv(normed).view(b, s, self.num_heads, self.head_dim).transpose(1, 2)

        if past_terminal_kv is not None:
            k_all = torch.cat([past_terminal_kv[0], k_cur], dim=2)
            v_all = torch.cat([past_terminal_kv[1], v_cur], dim=2)
        else:
            k_all, v_all = k_cur, v_cur

        scores = torch.matmul(q, k_all.transpose(-2, -1)) / math.sqrt(self.head_dim)
        if s > 1:
            total_len = k_all.shape[2]
            mask = torch.triu(
                torch.full((s, total_len), float("-inf"), device=x.device),
                diagonal=total_len - s + 1,
            )
            scores = scores + mask
        attn = F.softmax(scores.float(), dim=-1).to(x.dtype)
        out = torch.matmul(attn, v_all).transpose(1, 2).contiguous().view(b, s, h)
        x = x + self.wo(out)
        x = x + self.ffn(self.norm2(x))
        return x, (k_all, v_all)
# endregion:terminal_kv_block


# region:prelude_recurrent_coda
class PreludeRecurrentCodaLM(nn.Module):
    """
    Modern Looped Transformer sandwich topology:
      Prelude -> Shared Recurrent Block x K (with Input Injection + Cross-Loop AttnRes) -> Coda.
    Writes only the final loop's KV state to the global cache so KV memory is O(1) in K.
    """

    def __init__(self, vocab_size: int = 512, hidden_size: int = 128):
        super().__init__()
        self.embed = nn.Embedding(vocab_size, hidden_size)
        self.prelude = CausalBlockWithTerminalKV(hidden_size)
        self.recurrent_block = CausalBlockWithTerminalKV(hidden_size)
        self.coda = CausalBlockWithTerminalKV(hidden_size)
        self.inject_alpha = nn.Parameter(torch.tensor(0.5))
        self.loop_query = nn.Parameter(torch.randn(hidden_size) * 0.02)
        self.lm_head = nn.Linear(hidden_size, vocab_size, bias=False)

    def forward_step(
        self,
        input_ids: Tensor,
        num_loops: int = 4,
        kv_cache: dict[str, tuple[Tensor, Tensor] | None] | None = None,
        truncated_bptt_last_m: int | None = None,
    ) -> tuple[Tensor, dict[str, tuple[Tensor, Tensor] | None]]:
        if kv_cache is None:
            kv_cache = {"prelude": None, "recurrent_terminal": None, "coda": None}

        x0 = self.embed(input_ids)
        e0, kv_pre = self.prelude(x0, kv_cache["prelude"])

        h = e0
        loop_states = [e0]
        latest_rec_kv: tuple[Tensor, Tensor] | None = None
        alpha = torch.sigmoid(self.inject_alpha)

        for k in range(num_loops):
            use_grad = True
            if truncated_bptt_last_m is not None and k < (num_loops - truncated_bptt_last_m):
                use_grad = False
            with torch.set_grad_enabled(use_grad and torch.is_grad_enabled()):
                h_in = alpha * h + (1.0 - alpha) * e0
                h_out, rec_kv = self.recurrent_block(h_in, kv_cache["recurrent_terminal"])
                h = F.normalize(h_out, p=2, dim=-1) * math.sqrt(h_out.shape[-1])
                loop_states.append(h)
                latest_rec_kv = rec_kv

        stacked_loops = torch.stack(loop_states, dim=2)  # [B, S, K+1, H]
        loop_scores = torch.einsum("bskh,h->bsk", stacked_loops, self.loop_query) / math.sqrt(h.shape[-1])
        loop_weights = F.softmax(loop_scores, dim=-1)
        h_final = torch.einsum("bsk,bskh->bsh", loop_weights, stacked_loops)

        out, kv_coda = self.coda(h_final, kv_cache["coda"])
        new_cache: dict[str, tuple[Tensor, Tensor] | None] = {
            "prelude": kv_pre,
            "recurrent_terminal": latest_rec_kv,
            "coda": kv_coda,
        }
        return self.lm_head(out), new_cache


def count_kv_bytes(cache: dict[str, tuple[Tensor, Tensor] | None]) -> int:
    total_elems = sum(kv[0].numel() + kv[1].numel() for kv in cache.values() if kv is not None)
    return total_elems * 2  # BF16 = 2 bytes/element
# endregion:prelude_recurrent_coda


if __name__ == "__main__":
    torch.manual_seed(7)
    model = PreludeRecurrentCodaLM(vocab_size=256, hidden_size=128)
    prompt = torch.randint(0, 256, (1, 24))
    next_tok = torch.randint(0, 256, (1, 1))

    kv_by_depth = {}
    for k in [1, 2, 4, 8]:
        with torch.no_grad():
            _, cache = model.forward_step(prompt, num_loops=k)
            _, cache = model.forward_step(next_tok, num_loops=k, kv_cache=cache)
        kv_by_depth[f"K={k}"] = count_kv_bytes(cache)

    logits, _ = model.forward_step(prompt, num_loops=6, truncated_bptt_last_m=2)
    loss = F.cross_entropy(logits.view(-1, 256), prompt.view(-1))
    loss.backward()
    print({
        "kv_bytes_across_depths": kv_by_depth,
        "truncated_bptt_loss": round(loss.item(), 4),
        "recurrent_wq_grad_norm": round(model.recurrent_block.wq.weight.grad.norm().item(), 4),
    })
