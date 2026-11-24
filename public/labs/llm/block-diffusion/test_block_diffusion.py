import unittest
import torch
from block_diffusion import BlockMaskedDiffusionLM


class TestBlockDiffusion(unittest.TestCase):
    def test_block_causal_mask_geometry(self):
        mask = BlockMaskedDiffusionLM.build_block_causal_mask(
            seq_len=8, block_size=4, device=torch.device("cpu")
        )
        # Block 0 sees Block 0 bidirectionally, but cannot see Block 1
        self.assertFalse(mask[:4, :4].any().item())
        self.assertTrue(mask[:4, 4:].all().item())
        # Block 1 sees both Block 0 and Block 1
        self.assertFalse(mask[4:, :8].any().item())

    def test_mdlm_nelbo_training_reduces_loss(self):
        torch.manual_seed(2026)
        model = BlockMaskedDiffusionLM(vocab_size=32, hidden_size=64, num_layers=2, num_heads=4)
        opt = torch.optim.AdamW(model.parameters(), lr=3e-3)
        pattern = (torch.arange(16) % 8).unsqueeze(0).repeat(6, 1)

        loss_start = model.compute_mdlm_nelbo_loss(pattern, block_size=8).item()
        for _ in range(35):
            opt.zero_grad()
            loss = model.compute_mdlm_nelbo_loss(pattern, block_size=8)
            loss.backward()
            opt.step()
        loss_end = model.compute_mdlm_nelbo_loss(pattern, block_size=8).item()
        self.assertLess(loss_end, loss_start * 0.6)

    def test_parallel_unmasking_completes_in_four_steps(self):
        torch.manual_seed(42)
        model = BlockMaskedDiffusionLM(vocab_size=32, hidden_size=64, num_layers=2, num_heads=4)
        prefix = torch.arange(16).unsqueeze(0)
        generated, revealed = model.sample_block_parallel(prefix, block_size=16, denoise_steps=4)
        self.assertEqual(generated.shape, (1, 32))
        self.assertEqual(len(revealed), 4)
        self.assertEqual(sum(revealed), 16)
        self.assertFalse((generated == model.mask_token_id).any().item())


if __name__ == "__main__":
    unittest.main()
