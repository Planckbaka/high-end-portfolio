import unittest
import torch
from attention import causal_attention


class AttentionTests(unittest.TestCase):
    def setUp(self):
        torch.manual_seed(7)
        torch.set_num_threads(1)

    def test_reference_output_and_gradients(self):
        inputs = [
            torch.randn(2, 2, 5, 4, dtype=torch.float64, requires_grad=True)
            for _ in range(3)
        ]
        ours = causal_attention(*inputs)
        reference = torch.nn.functional.scaled_dot_product_attention(
            *inputs, is_causal=True, dropout_p=0.0
        )
        torch.testing.assert_close(ours, reference, atol=1e-10, rtol=1e-8)
        grad1 = torch.autograd.grad(ours.square().sum(), inputs, retain_graph=True)
        grad2 = torch.autograd.grad(reference.square().sum(), inputs)
        for a, b in zip(grad1, grad2):
            torch.testing.assert_close(a, b, atol=1e-10, rtol=1e-8)

    def test_future_is_invisible(self):
        q, k, v = [torch.randn(1, 2, 6, 4) for _ in range(3)]
        original = causal_attention(q, k, v)
        k2 = k.clone()
        v2 = v.clone()
        k2[:, :, 3:] += 100
        v2[:, :, 3:] -= 100
        torch.testing.assert_close(
            original[:, :, :3], causal_attention(q, k2, v2)[:, :, :3]
        )

    def test_cached_non_square_mask(self):
        q = torch.randn(1, 2, 2, 4)
        k = torch.randn(1, 2, 6, 4)
        v = torch.randn_like(k)
        mask = torch.arange(6)[None, :] <= torch.arange(4, 6)[:, None]
        reference = torch.nn.functional.scaled_dot_product_attention(
            q, k, v, attn_mask=mask, dropout_p=0.0
        )
        torch.testing.assert_close(causal_attention(q, k, v, offset=4), reference)

    def test_bad_offset(self):
        x = torch.randn(1, 1, 2, 4)
        with self.assertRaises(ValueError):
            causal_attention(x, x, x, offset=1)


if __name__ == "__main__":
    unittest.main()
