import unittest
import torch
from decoder import TinyDecoder, cache_bytes


class CacheTests(unittest.TestCase):
    def setUp(self):
        torch.manual_seed(11)
        torch.set_num_threads(1)
        self.model = TinyDecoder().eval()
        self.ids = torch.randint(0, 64, (2, 12))

    def test_incremental_matches_full_prefix(self):
        cache = None
        with torch.inference_mode():
            for position in range(self.ids.shape[1]):
                full, _ = self.model(self.ids[:, : position + 1])
                incremental, cache = self.model(
                    self.ids[:, position : position + 1], cache
                )
                torch.testing.assert_close(
                    full[:, -1], incremental[:, -1], atol=1e-5, rtol=1e-5
                )
                self.assertEqual(cache[0].shape, (2, 4, position + 1, 8))
                self.assertEqual(cache_bytes(cache), 2 * 2 * 4 * (position + 1) * 8 * 4)

    def test_chunked_prefill(self):
        with torch.inference_mode():
            full, _ = self.model(self.ids)
            _, cache = self.model(self.ids[:, :7])
            chunk, _ = self.model(self.ids[:, 7:], cache)
            torch.testing.assert_close(full[:, 7:], chunk, atol=1e-5, rtol=1e-5)

    def test_request_isolation(self):
        with torch.inference_mode():
            a, _ = self.model(self.ids)
            self.model(self.ids.flip(1))
            b, _ = self.model(self.ids)
            torch.testing.assert_close(a, b)

    def test_position_capacity(self):
        model = TinyDecoder(max_length=3)
        with self.assertRaises(ValueError):
            model(self.ids[:, :4])


if __name__ == "__main__":
    unittest.main()
