# Block Masked Diffusion LM: NELBO & Parallel Unmasking Lab (`labs/llm/block-diffusion`)

CPU verification of **Block Masked Diffusion Language Models** (**dQwen3.5**, **Mix-FT**, and **PBPO**):

1. **Block-Causal Attention Mask**: Preserves causal prefix caching across blocks while enabling full bidirectional context inside the active denoising block.
2. **Continuous-Time MDLM NELBO**: Trains with $1/t$-weighted masked cross-entropy over randomly masked token subsets.
3. **Confidence-Aware Parallel Unmasking**: Generates an entire 16-token block in 4 forward passes by committing the highest-confidence `[MASK]` predictions each step.

## Run

```sh
labs/.venv/bin/python -m unittest discover -s labs/llm/block-diffusion -p 'test_*.py' -v
labs/.venv/bin/python labs/llm/block-diffusion/block_diffusion.py
```
