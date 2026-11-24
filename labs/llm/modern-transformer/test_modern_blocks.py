import unittest
import torch
from modern_blocks import (
    RMSNorm,
    precompute_rope_cos_sin,
    apply_rope,
    GroupedQueryAttention,
    SparseMoEBlock,
)


class TestModernBlocks(unittest.TestCase):
    def test_rope_relative_distance_invariance(self):
        torch.manual_seed(7)
        cos, sin = precompute_rope_cos_sin(32, 64)
        q = torch.randn(1, 1, 1, 32).expand(1, 1, 50, 32)
        k = torch.randn(1, 1, 1, 32).expand(1, 1, 50, 32)
        qr, kr = apply_rope(q, cos, sin), apply_rope(k, cos, sin)
        dot_a = (qr[0, 0, 12] * kr[0, 0, 4]).sum()
        dot_b = (qr[0, 0, 41] * kr[0, 0, 33]).sum()
        self.assertTrue(torch.allclose(dot_a, dot_b, atol=1e-5))

    def test_gqa_cache_shrinks_with_kv_heads(self):
        x = torch.randn(2, 16, 64)
        cos, sin = precompute_rope_cos_sin(16, 16)
        mha = GroupedQueryAttention(64, num_q_heads=4, num_kv_heads=4, head_dim=16)
        gqa = GroupedQueryAttention(64, num_q_heads=4, num_kv_heads=1, head_dim=16)
        _, bytes_mha = mha(x, cos, sin)
        _, bytes_gqa = gqa(x, cos, sin)
        self.assertEqual(bytes_mha, 4 * bytes_gqa)

    def test_rmsnorm_and_moe_shapes(self):
        x = torch.randn(2, 8, 32)
        norm = RMSNorm(32)
        moe = SparseMoEBlock(32, 64, num_experts=4, top_k=2)
        y, ratio = moe(norm(x))
        self.assertEqual(y.shape, x.shape)
        self.assertAlmostEqual(ratio.sum().item(), 1.0, places=5)


if __name__ == "__main__":
    unittest.main()
