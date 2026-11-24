import math
import unittest
import torch
from flagship_blocks import (
    AttentionResidualRouter,
    GatedResidual4Branch,
    AsymmetricCEDLayer,
    muon_newton_schulz_5step,
)


class TestFlagshipBlocks(unittest.TestCase):
    def test_attention_residual_router_weights_and_grads(self):
        torch.manual_seed(11)
        router = AttentionResidualRouter(hidden_size=32)
        history = [torch.randn(2, 8, 32, requires_grad=True) for _ in range(5)]
        routed, weights = router(history)
        self.assertEqual(routed.shape, (2, 8, 32))
        self.assertAlmostEqual(weights.sum().item(), 1.0, places=5)
        routed.pow(2).mean().backward()
        self.assertIsNotNone(router.pseudo_query.grad)
        self.assertIsNotNone(router.key_proj.weight.grad)
        self.assertTrue(torch.isfinite(router.pseudo_query.grad).all())

    def test_gated_residual_4branch_shape_and_grads(self):
        torch.manual_seed(13)
        gr = GatedResidual4Branch(hidden_size=32, num_branches=4)
        streams = torch.randn(2, 8, 4, 32, requires_grad=True)
        sub_in = gr.aggregate_for_sublayer(streams)
        self.assertEqual(sub_in.shape, (2, 8, 32))
        out = gr.distribute_to_streams(streams, torch.tanh(sub_in))
        self.assertEqual(out.shape, (2, 8, 4, 32))
        out.pow(2).mean().backward()
        self.assertIsNotNone(streams.grad)
        self.assertTrue(torch.isfinite(streams.grad).all())

    def test_asymmetric_ced_and_csa2_zero_kv_reuse(self):
        torch.manual_seed(17)
        enc_full = AsymmetricCEDLayer(hidden_size=64, ffn_dim=128, mode="full")
        enc_reuse = AsymmetricCEDLayer(hidden_size=64, ffn_dim=128, mode="reuse")
        dec_heavy = AsymmetricCEDLayer(hidden_size=64, ffn_dim=256, mode="full")

        enc_params = sum(p.numel() for p in enc_full.ffn.parameters())
        dec_params = sum(p.numel() for p in dec_heavy.ffn.parameters())
        self.assertEqual(dec_params, 2 * enc_params)

        x = torch.randn(2, 12, 64)
        x, kv, b_full = enc_full(x)
        x, _, b_reuse = enc_reuse(x, shared_kv=kv)
        self.assertGreater(b_full, 0)
        self.assertEqual(b_reuse, 0)
        self.assertEqual(x.shape, (2, 12, 64))

    def test_muon_5step_flattens_singular_spectrum(self):
        torch.manual_seed(19)
        u, _ = torch.linalg.qr(torch.randn(48, 48))
        v, _ = torch.linalg.qr(torch.randn(48, 48))
        s_vals = torch.logspace(2, -1.3, steps=48)
        g_ill = u @ torch.diag(s_vals) @ v.T
        s_before = torch.linalg.svdvals(g_ill)
        cond_before = (s_before.max() / s_before.min()).item()
        self.assertGreater(cond_before, 1000.0)

        g_muon = muon_newton_schulz_5step(g_ill, steps=5)
        s_after = torch.linalg.svdvals(g_muon / (0.2 * math.sqrt(48)))
        cond_after = (s_after.max() / s_after.min()).item()
        self.assertLess(cond_after, 15.0)
        self.assertLess(cond_after, cond_before / 100.0)


if __name__ == "__main__":
    unittest.main()
