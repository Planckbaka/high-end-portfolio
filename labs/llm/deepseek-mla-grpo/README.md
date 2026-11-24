# DeepSeek MLA Matrix Absorption & GRPO Advantage Lab (`labs/llm/deepseek-mla-grpo`)

CPU verification of two frontier algorithmic-hardware co-design formulations from **DeepSeek-V2/V3** and **DeepSeek-R1**:

1. **Multi-head Latent Attention (MLA) Weight Absorption**: Proves that compressing Keys and Values into a shared latent vector $c_t^{KV} \in \mathbb{R}^{d_c}$ and absorbing the up-projection matrices $W^{UK}, W^{UV}$ into Query and Output projections produces **bit-for-bit identical attention outputs** while reducing cached KV state by over $90\%$.
2. **Group Relative Policy Optimization (GRPO) & DPO**: Implements critic-free group-normalized advantage estimation $\hat{A}_{i,t} = \frac{r_i - \mu_r}{\sigma_r + \epsilon}$ with clipped surrogate loss and the exact $k_3$ non-negative KL estimator, alongside closed-form Direct Preference Optimization (DPO) gradients.

## Run

```sh
labs/.venv/bin/python -m unittest discover -s labs/llm/deepseek-mla-grpo -p 'test_*.py' -v
labs/.venv/bin/python labs/llm/deepseek-mla-grpo/mla_grpo.py
```
