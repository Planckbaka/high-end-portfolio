---
title: "Post-Training Alignment & Test-Time Reasoning: RLHF, DPO, and DeepSeek-R1's GRPO"
date: "2026-10-21"
updatedAt: "2026-10-21"
category: "LLM"
excerpt: "Derive the closed-form Direct Preference Optimization (DPO) objective from the KL-constrained RLHF reward, eliminate the Value Critic via Group Relative Policy Optimization (GRPO), and examine how HybridFlow (veRL) orchestrates distributed RL dataflows."
lang: "en"
tags: ["RLHF", "DPO", "DeepSeek-R1", "GRPO", "veRL", "Reasoning"]
featured: false
draft: false
series: "LLM & AI Infrastructure from First Principles"
seriesOrder: 4
labPath: "labs/llm/deepseek-mla-grpo"
papers:
  - title: "Training language models to follow instructions with human feedback"
    arxiv: "2203.02155"
    year: 2022
    tag: "InstructGPT (RLHF)"
  - title: "Direct Preference Optimization: Your Language Model is Secretly a Reward Model"
    arxiv: "2305.18290"
    year: 2023
    tag: "DPO"
  - title: "HybridFlow: A Flexible and Efficient RLHF Framework"
    arxiv: "2409.19256"
    year: 2024
    tag: "HybridFlow / veRL"
  - title: "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning"
    arxiv: "2501.12948"
    year: 2025
    tag: "DeepSeek-R1 (GRPO)"
---

## The systems crisis of four-model PPO in RLHF

Pretraining minimizes next-token cross-entropy over internet text, producing a base model that completes documents rather than solving user instructions or verifying multi-step proofs. Ouyang et al. (**InstructGPT**, arXiv:2203.02155) established the three-stage **RLHF** pipeline: Supervised Fine-Tuning (SFT), fitting a Bradley-Terry Reward Model $r_\phi(x, y)$ on human preference pairs $(y_w \succ y_l \mid x)$, and optimizing the policy $\pi_\theta$ via **Proximal Policy Optimization (PPO)** under a reverse-KL penalty from the reference model $\pi_{\text{ref}}$:

$$
\max_{\pi_\theta}\; \mathbb{E}_{x \sim \mathcal{D},\, y \sim \pi_\theta(\cdot \mid x)}\!\Big[ r_\phi(x, y) - \beta\, \mathbb{D}_{\text{KL}}\!\big(\pi_\theta(y \mid x)\,\|\,\pi_{\text{ref}}(y \mid x)\big) \Big]
$$

While effective, online PPO creates a severe AI Infrastructure bottleneck: **four 70B-class models must reside and execute concurrently in GPU memory**:

1. **Actor Policy $\pi_\theta$** (trainable: weights + gradients + FP32 AdamW state).
2. **Value Critic $V_\psi$** (trainable: another full model of weights + gradients + AdamW state to estimate token-level Generalized Advantage Estimation baselines).
3. **Reference Policy $\pi_{\text{ref}}$** (frozen: forward-only log-probabilities).
4. **Reward Model $r_\phi$** (frozen: forward-only scalar scoring).

At $70\text{B}$ scale, holding two trainable models ($\pi_\theta, V_\psi$) and two inference models ($\pi_{\text{ref}}, r_\phi$) requires over **$2.5\text{ TB}$ of aggregate VRAM** before activation buffers, while alternating between memory-bound autoregressive rollout generation and compute-bound backward passes.

![Figure 4: GPU memory footprint comparison across four-model PPO, DeepSeek-R1 GRPO, and closed-form DPO alongside the emergent chain-of-thought length and accuracy trajectory under GRPO.](/images/articles/llm-infra/fig4-rlhf-dpo-grpo-architecture.svg)

## Direct Preference Optimization (DPO): Your LLM is secretly a reward model

Rafailov et al. (**DPO**, arXiv:2305.18290) asked whether we can optimize the exact KL-constrained RLHF objective **in closed form without ever training an explicit reward model or running online RL sampling**.

<details class="derivation-box">
<summary>Complete step-by-step derivation from the RLHF objective to the DPO loss</summary>

Start with the KL-constrained reward maximization objective at fixed prompt $x$:

$$
\max_{\pi}\; \sum_y \pi(y \mid x) r(x, y) - \beta \sum_y \pi(y \mid x) \log \frac{\pi(y \mid x)}{\pi_{\text{ref}}(y \mid x)} = -\beta\, \mathbb{D}_{\text{KL}}\!\left( \pi(y \mid x) \,\middle\|\, \frac{1}{Z(x)} \pi_{\text{ref}}(y \mid x) \exp\!\Big(\frac{1}{\beta} r(x, y)\Big) \right) + \beta \log Z(x)
$$

where $Z(x) = \sum_y \pi_{\text{ref}}(y \mid x) \exp\big(\frac{1}{\beta} r(x, y)\big)$ is the partition function independent of $\pi$. Because the KL divergence is minimized at $0$ when the two distributions are identical, the unique global optimal policy $\pi^*(y \mid x)$ is the Gibbs distribution:

$$
\pi^*(y \mid x) = \frac{1}{Z(x)} \pi_{\text{ref}}(y \mid x) \exp\!\left(\frac{1}{\beta} r(x, y)\right)
$$

Take the logarithm and solve algebraically for the ground-truth reward $r(x, y)$ in terms of $\pi^*$:

$$
r(x, y) = \beta \log \frac{\pi^*(y \mid x)}{\pi_{\text{ref}}(y \mid x)} + \beta \log Z(x)
$$

Now substitute this reparameterized reward into the **Bradley-Terry preference model** $P(y_w \succ y_l \mid x) = \sigma\big(r(x, y_w) - r(x, y_l)\big)$. Because the intractable partition term $\beta \log Z(x)$ depends only on the prompt $x$, **it cancels out identically in the difference $r(x, y_w) - r(x, y_l)$**! Replacing $\pi^*$ with our parameterized policy $\pi_\theta$ yields the exact **DPO Loss**:

$$
\mathcal{L}_{\text{DPO}}(\pi_\theta; \pi_{\text{ref}}) = -\mathbb{E}_{(x, y_w, y_l) \sim \mathcal{D}}\!\left[ \log \sigma\!\left( \beta \log \frac{\pi_\theta(y_w \mid x)}{\pi_{\text{ref}}(y_w \mid x)} - \beta \log \frac{\pi_\theta(y_l \mid x)}{\pi_{\text{ref}}(y_l \mid x)} \right) \right]
$$
</details>

Furthermore, taking the gradient with respect to $\theta$ reveals why DPO behaves like a self-normalizing contrastive update:

$$
\nabla_\theta \mathcal{L}_{\text{DPO}} = -\beta\, \mathbb{E}_{(x, y_w, y_l)}\!\Big[ \underbrace{\sigma\big(\hat{r}_\theta(x, y_l) - \hat{r}_\theta(x, y_w)\big)}_{\text{Higher weight when implicit reward is wrong}} \Big( \nabla_\theta \log \pi_\theta(y_w \mid x) - \nabla_\theta \log \pi_\theta(y_l \mid x) \Big) \Big]
$$

where $\hat{r}_\theta(x, y) = \beta \log \frac{\pi_\theta(y \mid x)}{\pi_{\text{ref}}(y \mid x)}$ is the implicit reward margin.

## DeepSeek-R1 and Group Relative Policy Optimization (GRPO)

While offline DPO excels at stylistic and instruction alignment, unlocking frontier **multi-step mathematical, coding, and scientific reasoning** requires online exploration where the model generates its own chain-of-thought trajectories and learns from verifiable outcomes.

To make large-scale online RL economically tractable, **DeepSeek-R1** (arXiv:2501.12948) replaces PPO with **Group Relative Policy Optimization (GRPO)** and replaces neural reward models (which suffer from reward hacking on long reasoning chains) with deterministic **rule-based verifiers** (exact answer matching, compiler/unit-test execution, and format checks).

Instead of maintaining a $70\text{B}$/$671\text{B}$ Value Critic $V_\psi$ to predict baseline returns, GRPO samples a group of $G$ completions $\{o_1, o_2, \dots, o_G\}$ from the old policy $\pi_{\theta_{\text{old}}}$ for each prompt $q$, scores them to obtain scalar rewards $\{r_1, r_2, \dots, r_G\}$, and uses the **group z-score** directly as the advantage $\hat{A}_{i,t}$ for every token $t$ in completion $o_i$:

$$
\hat{A}_{i,t} = \frac{r_i - \operatorname{mean}(r_1, \dots, r_G)}{\operatorname{std}(r_1, \dots, r_G) + \epsilon}
$$

The GRPO objective combines PPO's clipped importance-sampling ratio with Schulman's unbiased, strictly non-negative $k_3$ KL divergence estimator placed directly outside the clip operator:

$$
\mathcal{J}_{\text{GRPO}}(\theta) = \mathbb{E}_{q,\, \{o_i\}_{i=1}^G \sim \pi_{\theta_{\text{old}}}}\!\left[ \frac{1}{G} \sum_{i=1}^G \frac{1}{|o_i|} \sum_{t=1}^{|o_i|} \left( \min\!\Big( \rho_{i,t}(\theta) \hat{A}_{i,t},\, \operatorname{clip}(\rho_{i,t}(\theta), 1-\epsilon, 1+\epsilon) \hat{A}_{i,t} \Big) - \beta\, \mathbb{D}_{\text{KL}}(\pi_\theta \,\|\, \pi_{\text{ref}}) \right) \right]
$$

where $\rho_{i,t}(\theta) = \frac{\pi_\theta(o_{i,t} \mid q, o_{i,<t})}{\pi_{\theta_{\text{old}}}(o_{i,t} \mid q, o_{i,<t})}$ and the per-token KL penalty is:

$$
\mathbb{D}_{\text{KL}}\big(\pi_\theta \,\|\, \pi_{\text{ref}}\big) = \frac{\pi_{\text{ref}}(o_{i,t} \mid q, o_{i,<t})}{\pi_\theta(o_{i,t} \mid q, o_{i,<t})} - \log \frac{\pi_{\text{ref}}(o_{i,t} \mid q, o_{i,<t})}{\pi_\theta(o_{i,t} \mid q, o_{i,<t})} - 1 \ge 0
$$

<!-- lab: labs/llm/deepseek-mla-grpo/mla_grpo.py#grpo_dpo_loss -->

In **DeepSeek-R1-Zero**, applying pure GRPO directly to the base model without any supervised warm-start triggered an emergent phase transition: average thinking length scaled naturally from hundreds to thousands of tokens as the model autonomously discovered self-verification, backtracking, and reflection ("aha moments"). Adding a small cold-start SFT stage followed by reasoning RL, rejection sampling SFT, and a second all-scenario RL pass produced the final **DeepSeek-R1**.

## HybridFlow (veRL): 3D-HybridEngine for RLHF dataflows

Even after GRPO deletes the Value Critic, an online RL step alternates between two conflicting parallel execution layouts for the Actor $\pi_\theta$:

- **Rollout Generation ($y \sim \pi_{\theta_{\text{old}}}$)** is memory-bound autoregressive decoding: it demands smaller Tensor Parallel groups (e.g., $\text{TP}=2$ or $4$ with vLLM PagedAttention) and large Data Parallelism across prompts.
- **Policy Training ($\nabla_\theta \mathcal{J}_{\text{GRPO}}$)** is compute-bound and memory-capacity-bound: it requires wide 3D parallelism ($\text{TP} \times \text{PP} \times \text{ZeRO/FSDP}$) across nodes.

Sheng et al. (**HybridFlow / veRL**, arXiv:2409.19256) solved this mismatch by decoupling a **single-controller control plane** (coordinating inter-node RL dataflow graphs) from a **multi-controller SPMD computation plane** powered by the **3D-HybridEngine**. Between the training step and the rollout step, 3D-HybridEngine gathers and reshards Actor weights across heterogeneous parallelism topologies (`Micro-AllGather` over TP/PP groups) with zero redundant weight copies, cutting transition overhead by up to $89\%$ and boosting end-to-end RL throughput by $1.5\times\text{--}3.7\times$.

## References and next chapter

- Ouyang et al., [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155) (2022).
- Rafailov et al., [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290) (2023).
- Sheng et al., [HybridFlow: A Flexible and Efficient RLHF Framework](https://arxiv.org/abs/2409.19256) (2024).
- DeepSeek-AI, [DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning](https://arxiv.org/abs/2501.12948) (2025).
- Continue to Chapter 5: [Hardware-Algorithm Co-Design at Frontier Scale: DeepSeek-V2/V3 MLA, DualPipe, and DistServe](/articles/deepseek-v3-mla-dualpipe-distserve).
