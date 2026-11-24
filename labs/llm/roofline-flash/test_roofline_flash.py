import unittest
import torch
from roofline_flash import H100_SXM, ModelLedger, tiled_flash_attention


class TestRooflineFlash(unittest.TestCase):
    def test_online_tiled_attention_matches_sdpa(self):
        torch.manual_seed(19)
        for block_size in [7, 16, 32]:
            q, k, v = [torch.randn(2, 3, 48, 16, dtype=torch.float64) for _ in range(3)]
            actual = tiled_flash_attention(q, k, v, block_size=block_size)
            expected = torch.nn.functional.scaled_dot_product_attention(q, k, v, is_causal=True)
            self.assertTrue(torch.allclose(actual, expected, atol=1e-6, rtol=1e-6))

    def test_prefill_is_compute_bound_and_b1_decode_is_memory_bound(self):
        model = ModelLedger("Llama-3-8B", 32, 4096, 32, 8, 128, 14336, 128256)
        ai = model.arithmetic_intensity(batch_size=1, seq_len=4096)
        self.assertGreater(ai["prefill_flops_per_byte"], H100_SXM.ridge_point)
        self.assertLess(ai["decode_flops_per_byte"], H100_SXM.ridge_point)


if __name__ == "__main__":
    unittest.main()
