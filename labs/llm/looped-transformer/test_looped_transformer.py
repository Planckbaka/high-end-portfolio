import unittest
import torch
import torch.nn.functional as F
from looped_transformer import PreludeRecurrentCodaLM, count_kv_bytes


class TestLoopedTransformer(unittest.TestCase):
    def test_terminal_kv_cache_is_constant_across_loop_depths(self):
        torch.manual_seed(23)
        model = PreludeRecurrentCodaLM(vocab_size=128, hidden_size=64)
        prompt = torch.randint(0, 128, (1, 16))
        next_tok = torch.randint(0, 128, (1, 1))

        kv_sizes = []
        outputs = []
        with torch.no_grad():
            for k in (1, 2, 4, 8):
                _, cache = model.forward_step(prompt, num_loops=k)
                logits_next, cache = model.forward_step(next_tok, num_loops=k, kv_cache=cache)
                kv_sizes.append(count_kv_bytes(cache))
                outputs.append(logits_next)

        self.assertEqual(len(set(kv_sizes)), 1)
        self.assertFalse(torch.allclose(outputs[0], outputs[-1]))

    def test_truncated_bptt_produces_finite_gradients(self):
        torch.manual_seed(29)
        model = PreludeRecurrentCodaLM(vocab_size=128, hidden_size=64)
        tokens = torch.randint(0, 128, (2, 12))
        logits, _ = model.forward_step(tokens, num_loops=6, truncated_bptt_last_m=2)
        loss = F.cross_entropy(logits.view(-1, 128), tokens.view(-1))
        loss.backward()

        for param in (
            model.prelude.wq.weight,
            model.recurrent_block.wq.weight,
            model.inject_alpha,
            model.coda.wq.weight,
        ):
            self.assertIsNotNone(param.grad)
            self.assertTrue(torch.isfinite(param.grad).all())
            self.assertGreater(param.grad.abs().sum().item(), 0.0)


if __name__ == "__main__":
    unittest.main()
