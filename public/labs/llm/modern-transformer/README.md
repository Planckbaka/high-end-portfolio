# Modern Transformer Blocks Lab (`labs/llm/modern-transformer`)

CPU reference implementations and unit tests for the five core architectural mutations from the 2017 Vanilla Transformer to Llama-3 and Mixtral:

1. **Pre-RMSNorm** with explicit `float32` variance accumulation.
2. **Rotary Position Embeddings (RoPE)** verifying exact relative-distance invariance $\langle R_m q, R_n k \rangle = g(q, k, m - n)$.
3. **Unified MHA / GQA / MQA** measuring pre-expansion KV cache footprint.
4. **SwiGLU Feed-Forward Network** with gated element-wise projection.
5. **Top-K Sparse Mixture-of-Experts (MoE)** decoupling total capacity from active FLOPs per token.

## Run

```sh
labs/.venv/bin/python -m unittest discover -s labs/llm/modern-transformer -p 'test_*.py' -v
labs/.venv/bin/python labs/llm/modern-transformer/modern_blocks.py
```
