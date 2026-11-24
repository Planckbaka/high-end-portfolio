# Roofline & Online Tiled Attention Lab (`labs/llm/roofline-flash`)

CPU verification of two core AI Infrastructure mechanisms:

1. **Roofline & Memory Ledger Calculator**: Computes parameter breakdowns, the $16\Psi$ mixed-precision training memory rule, KV cache footprints across MHA/GQA/MLA, and Prefill vs. Decode arithmetic intensity against the NVIDIA H100 SXM ridge point ($295.2\text{ FLOPs/Byte}$).
2. **Online Softmax Tiled Attention (FlashAttention-1/2 Algorithm)**: Implements blockwise tiled attention maintaining running row maxima $m_i$ and rescaled denominators $\ell_i$ without materializing the $O(N^2)$ attention matrix, proving exact numerical equivalence to full attention.

## Run

```sh
labs/.venv/bin/python -m unittest discover -s labs/llm/roofline-flash -p 'test_*.py' -v
labs/.venv/bin/python labs/llm/roofline-flash/roofline_flash.py
```
