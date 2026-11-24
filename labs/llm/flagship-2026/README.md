# 2026 Flagship Co-Design: CED KV Sharing, Depth Routing & Muon Lab (`labs/llm/flagship-2026`)

CPU verification of four architectural and optimization primitives powering 2026 frontier models (**DeepSeek-V4.1-Flash**, **Qwen3.8-Next**, and **Kimi K3**):

1. **Depth-Wise Attention Residuals (`AttnRes`)**: Routes over prior layer outputs along the depth axis with a learned pseudo-query to prevent Pre-RMSNorm representation dilution.
2. **4-Branch Gated Residual (`GR`)**: Maintains four parallel residual streams with learned read/write gates for sparse MoE stability.
3. **Asymmetric CED & `CSA2` KV Sharing**: Pairs a lightweight Causal Encoder with a double-capacity Decoder while sharing compressed KV tensors across reuse layers at zero additional KV cache memory.
4. **Muon 5-Step Newton-Schulz Orthogonalization**: Applies the tuned quintic odd polynomial to flatten ill-conditioned momentum singular spectra toward the polar factor $U V^\top$.

## Run

```sh
labs/.venv/bin/python -m unittest discover -s labs/llm/flagship-2026 -p 'test_*.py' -v
labs/.venv/bin/python labs/llm/flagship-2026/flagship_blocks.py
```
