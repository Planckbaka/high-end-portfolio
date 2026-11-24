import Link from "next/link";
import { getAllArticles } from "@/lib/markdown";
import { llmInfraArticles, LLM_INFRA_SERIES, seriesChapterWord } from "@/lib/series";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata(
  LLM_INFRA_SERIES.title,
  "A nine-part research monograph synthesizing 50 foundational and frontier papers across modern Transformer architectures, Roofline & FlashAttention systems, distributed training, RL reasoning, 2026 flagship CED/Muon co-design, Looped Transformers, and Diffusion LLMs.",
  LLM_INFRA_SERIES.path
);

export default function LlmAiInfraSeries() {
  const articles = llmInfraArticles(getAllArticles());
  const word = seriesChapterWord(articles.length);
  const totalPapers = articles.reduce((sum, a) => sum + (a.papers?.length ?? 0), 0);

  return (
    <div className="site-shell page-bottom">
      <header className="page-heading">
        <h1>
          Models,
          <br />
          hardware, &amp; proofs.
        </h1>
        <p>
          {word.replace(/^./, (c) => c.toUpperCase())} in-depth chapters connecting first-principles
          mathematical derivations, HBM/SRAM Roofline ledgers, and runnable PyTorch CPU
          verifications. {totalPapers} arXiv papers synthesized.
        </p>
      </header>
      <section className="series-intro" aria-label="How to read this series">
        <div>
          <p className="eyebrow">First-principles methodology</p>
          <p>
            Every architectural mutation, from RoPE, FlashAttention-2, and DeepSeek MLA to V4.1
            asymmetric CED, depth-wise AttnRes, Muon, Looped Transformers, and Block Diffusion LLMs,
            was forced by a physical hardware bottleneck. Each chapter pairs closed-form LaTeX
            derivations with explicit compute-and-memory ledgers.
          </p>
        </div>
        <div>
          <p className="eyebrow">Reproducible CPU verifications</p>
          <p>
            Mathematical claims are accompanied by deterministic CPU PyTorch tests: verify complex-plane
            RoPE invariance, Online Softmax blockwise tiling, and MLA matrix absorption locally.
          </p>
          <Link className="text-link" href="/labs">
            Environment and reproduction guide ↗
          </Link>
        </div>
      </section>
      <ol className="series-chapters">
        {articles.map((a) => (
          <li key={a.slug}>
            <span className="chapter-number" aria-hidden="true">
              {String(a.seriesOrder).padStart(2, "0")}
            </span>
            <div>
              <p className="eyebrow">
                {a.category} · {a.readingTime}
                {a.papers && a.papers.length > 0 && ` · ${a.papers.length} papers`}
              </p>
              <h2>
                <Link href={`/articles/${a.slug}`}>{a.title}</Link>
              </h2>
              <p>{a.excerpt}</p>
              {a.papers && a.papers.length > 0 && (
                <div className="tags">
                  {a.papers.map((p) => (
                    <a
                      key={p.arxiv}
                      className="tag paper-chip"
                      href={`https://arxiv.org/abs/${p.arxiv}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {p.tag || p.title} ({p.year}) ↗
                    </a>
                  ))}
                </div>
              )}
            </div>
            {a.labPath && (
              <Link className="text-link series-chapter-lab" href={`/${a.labPath}`}>
                Companion lab ↗
              </Link>
            )}
          </li>
        ))}
      </ol>
      <div className="inline-links">
        <Link className="text-link" href="/series/reliable-model-systems">
          Companion series: Engineering Reliable Model Systems ↗
        </Link>
        <Link className="text-link" href="/articles">
          All writing ↗
        </Link>
        <a className="text-link" href="/feed.xml">
          Subscribe via RSS ↗
        </a>
      </div>
    </div>
  );
}
