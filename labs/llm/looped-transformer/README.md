# Looped Transformer: Elastic Depth & Terminal KV Lab (`labs/llm/looped-transformer`)

CPU verification of latent-space recurrence in modern **Looped Transformers** (**Dory1.0-4B**, **Looped Models Done Right I/II**, **Closing the Loop**, and **ARLoop**):

1. **Sandwich Topology (`Prelude -> Shared Block x K -> Coda`)**: Scales effective depth at test time without adding physical weights.
2. **Terminal-Loop Constant KV Cache**: Caches only the final recurrent iteration's Key/Value tensors so memory stays $O(1)$ across $K \in \{1, 2, 4, 8\}$.
3. **Input Injection, Hyperspherical Normalization & Cross-Loop `AttnRes`**: Prevents representation collapse across deep iterations.
4. **Truncated BPTT**: Retains autograd graphs only on the trailing $m$ iterations to bound training activation memory.

## Run

```sh
labs/.venv/bin/python -m unittest discover -s labs/llm/looped-transformer -p 'test_*.py' -v
labs/.venv/bin/python labs/llm/looped-transformer/looped_transformer.py
```
