import type { NavItem, Project, SocialLink, ContactDetails } from "@/types";
import { siteConfig } from "@/config/site";
export const navItems: NavItem[] = [
  { name: "Writing", path: "/articles" },
  { name: "Projects", path: "/projects" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];
export const projects: Project[] = [
  {
    id: "gemini-research",
    title: "LLM & AI Infra Research",
    category: "Systems & mathematical monograph",
    description:
      "A 50-paper first-principles research synthesis spanning modern Transformer blocks, Roofline & FlashAttention ledgers, distributed training, GRPO reasoning, DeepSeek MLA & V4.1 CED, Attention Residuals, Muon, Looped Transformers, and Diffusion LLMs.",
    tags: ["PyTorch", "Roofline", "DeepSeek V4.1", "Muon", "Looped LM", "Diffusion LLM"],
    problem:
      "Architectural papers and systems papers are often studied in isolation: model equations omit HBM bandwidth constraints, while kernel benchmarks omit algebraic invariants.",
    contribution:
      "Synthesizes 50 foundational and 2026 frontier papers into nine mathematical and systems chapters, paired with an H100 Roofline calculator, publication-grade SVG figures, and CPU PyTorch verifications.",
    tradeoff:
      "Uses exact algebraic and algorithmic equivalence tests (such as MLA weight absorption, Online Softmax tiling, Muon Newton-Schulz orthogonalization, terminal-loop KV sharing, and block-causal MDLM unmasking) on deterministic CPU tensors so every mechanism can be verified without a multi-node GPU cluster.",
    validation:
      "Unit tests verify RoPE relative-position invariance, Online Softmax vs. SDPA equivalence, MLA matrix absorption, GRPO zero-sum advantages, depth-routed AttnRes, Muon singular-spectrum flattening, constant O(1) terminal-loop KV caching, and block-causal parallel unmasking.",
    limitations:
      "Roofline models use analytical HBM and Tensor Core bounds; local CPU tests prove mathematical and algorithmic equivalence rather than multi-node InfiniBand or CUDA kernel throughput.",
    articles: [
      "modern-transformer-evolution",
      "roofline-flashattention-pagedattention",
      "distributed-training-zero-megatron-chinchilla",
      "alignment-dpo-deepseek-r1-grpo",
      "deepseek-v3-mla-dualpipe-distserve",
      "beyond-transformers-mamba2-nsa-agents-vla",
      "flagship-2026-ced-attnres-muon",
      "looped-transformers-latent-recurrence",
      "diffusion-llms-block-decoding-pbpo",
    ],
  },
  {
    id: "pi-go",
    title: "pi-go",
    category: "Agent engineering",
    description:
      "Exploring the internals of a terminal coding agent through a Go rewrite: tools, sessions, and explicit failure handling.",
    tags: ["Go", "Agent loops", "Protocol compatibility"],
    problem:
      "An agent coordinates model output, tool execution, and session state. Errors at those boundaries can outlive the request that caused them.",
    contribution:
      "The local pi-go project rewrites the upstream pi agent in Go. This site examines its agent loop and extracts a smaller, independently tested teaching implementation. It does not claim authorship of the upstream design.",
    tradeoff:
      "Behavioral compatibility is more useful than an attractive new abstraction when porting an existing protocol. The lab deliberately reduces the protocol surface so its lifecycle is inspectable.",
    validation:
      "The accompanying agent-loop lab tests tool results, malformed arguments, model errors, cancellation, and bounded termination using a deterministic model substitute.",
    limitations:
      "The teaching lab is not the complete pi-go application. Provider compatibility and production behavior require their own validation.",
    articles: ["go-agent-loop"],
    url: "https://github.com/earendil-works/pi-mono",
  },
  {
    id: "engineering-labs",
    title: "Engineering Labs",
    category: "Executable explanations",
    description:
      "Twelve small experiments connecting backend reliability, Python concurrency, and the mechanics of model inference and AI infrastructure.",
    tags: ["Go", "Python", "CPU PyTorch"],
    problem:
      "An explanation is difficult to trust when its code, assumptions, and measurements cannot be inspected together.",
    contribution:
      "A companion lab collection built for these articles: bounded admission, an agent loop, structured concurrency, streaming measurements, causal attention, a cached decoder, modern transformer blocks, online tiled attention, MLA/GRPO, 2026 flagship CED/Muon blocks, looped transformers, and block masked diffusion.",
    tradeoff:
      "Small, deterministic fixtures make correctness visible. CPU runs keep the first iteration reproducible without paid APIs or downloaded model weights.",
    validation:
      "Behavioral tests cover failure paths; numerical comparisons check attention, RoPE, MLA weight absorption, and cached decoding. Reproduction commands and raw measurement records accompany the labs.",
    limitations:
      "Synthetic streams are not model tokens. Tiny random-weight decoders do not demonstrate language quality, GPU throughput, or a production serving stack.",
    articles: [
      "go-bounded-concurrency",
      "python-structured-concurrency",
      "python-streaming-measurement",
      "causal-attention",
      "kv-cache-tiny-decoder",
    ],
  },
];
// Identity data lives in siteConfig; these views keep their shape stable for
// the footer, contact page, and about page without duplicating the URLs.
export const socialLinks: SocialLink[] = [
  { name: "GitHub", url: siteConfig.author.github },
  { name: "LinkedIn", url: siteConfig.author.linkedin },
];
export const contactDetails: ContactDetails = {
  email: siteConfig.author.email,
  phone: "+86 13960233985",
  location: "Shanghai, China",
};
