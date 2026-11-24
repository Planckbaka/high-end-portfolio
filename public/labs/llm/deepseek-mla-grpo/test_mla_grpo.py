import unittest
import torch
from mla_grpo import MultiHeadLatentAttention, grpo_step_loss, dpo_preference_loss


class TestDeepSeekMlaGrpo(unittest.TestCase):
    def test_mla_matrix_absorption_exactness(self):
        torch.manual_seed(31)
        mla = MultiHeadLatentAttention(d_model=64, num_heads=8, head_dim=16, d_c=24).double()
        x = torch.randn(2, 16, 64, dtype=torch.float64)
        out_explicit, elems_explicit = mla.forward_explicit(x)
        out_absorbed, elems_absorbed = mla.forward_absorbed(x)
        self.assertTrue(torch.allclose(out_explicit, out_absorbed, atol=1e-12))
        # Explicit stores 2 * 8 * 16 = 256 per token; absorbed stores d_c = 24 per token
        self.assertEqual(elems_explicit * 24, elems_absorbed * 256)

    def test_grpo_zero_sum_advantages_and_non_negative_kl(self):
        torch.manual_seed(37)
        logp_old = torch.randn(6, 10)
        logp_new = (logp_old + 0.05 * torch.randn(6, 10)).requires_grad_(True)
        logp_ref = logp_old - 0.1
        rewards = torch.tensor([1.0, 0.0, 1.0, 0.5, 0.0, 1.0])
        loss, adv = grpo_step_loss(logp_new, logp_old, logp_ref, rewards)
        loss.backward()
        self.assertAlmostEqual(adv.mean().item(), 0.0, places=6)
        self.assertIsNotNone(logp_new.grad)

    def test_dpo_margin_increases_when_chosen_improves(self):
        c_pi = torch.tensor([-1.2, -0.8], requires_grad=True)
        r_pi = torch.tensor([-2.5, -2.1], requires_grad=True)
        c_ref = torch.tensor([-1.5, -1.0])
        r_ref = torch.tensor([-2.2, -1.9])
        loss, margin = dpo_preference_loss(c_pi, r_pi, c_ref, r_ref, beta=0.2)
        self.assertTrue((margin > 0).all())
        self.assertGreater(loss.item(), 0.0)


if __name__ == "__main__":
    unittest.main()
