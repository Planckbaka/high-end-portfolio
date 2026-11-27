import Link from "next/link";
import { getAllArticles } from "@/lib/markdown";
import { llmInfraArticles, LLM_INFRA_SERIES, seriesChapterWord } from "@/lib/series";
import { pageMetadata } from "@/lib/page-metadata";
import { siteConfig } from "@/config/site";
import { breadcrumbJsonLd, collectionPageJsonLd, serializeJsonLd } from "@/lib/seo";

export const metadata = pageMetadata(
  LLM_INFRA_SERIES.title,
  "A nine-part research monograph synthesizing 50 foundational and frontier papers across modern Transformer architectures, Roofline & FlashAttention systems, distributed training, RL reasoning, 2026 flagship CED/Muon co-design, Looped Transformers, and Diffusion LLMs.",
  LLM_INFRA_SERIES.path
);

const CHAPTER_FIGURES: Record<number, string> = {
  1: "/images/articles/llm-infra/fig1-modern-transformer-evolution.svg",
  2: "/images/articles/llm-infra/fig2-roofline-flashattention.svg",
  3: "/images/articles/llm-infra/fig3-zero-chinchilla-scaling.svg",
  4: "/images/articles/llm-infra/fig4-rlhf-dpo-grpo-architecture.svg",
  5: "/images/articles/llm-infra/fig5-mla-and-distserve.svg",
  6: "/images/articles/llm-infra/fig6-long-context-vla.svg",
  7: "/images/articles/llm-infra/fig7-flagship-2026-codesign.svg",
  8: "/images/articles/llm-infra/fig8-looped-transformer-topology.svg",
  9: "/images/articles/llm-infra/fig9-block-diffusion-llm.svg",
};

const MONOGRAPH_PARTS = [
  {
    id: "part-1",
    roman: "Part I",
    title: "Foundations & Hardware Ledger",
    thesis:
      "Positional geometry, SRAM-tiled attention, and distributed memory-bandwidth bounds that govern transformer pretraining and serving.",
    orders: [1, 2, 3],
  },
  {
    id: "part-2",
    roman: "Part II",
    title: "Alignment & Frontier Co-Design",
    thesis:
      "Critic-free RL reasoning, low-rank latent KV compression, long-context agentic loops, and 2026 sub-kilobyte CED/AttnRes/Muon co-design.",
    orders: [4, 5, 6, 7],
  },
  {
    id: "part-3",
    roman: "Part III",
    title: "Latent Recurrence & Diffusion Paradigms",
    thesis:
      "Moving beyond fixed-depth autoregressive decoding via looped shared-weight recurrence and block-causal discrete diffusion.",
    orders: [8, 9],
  },
] as const;

export default function LlmAiInfraSeries() {
  const articles = llmInfraArticles(getAllArticles());
  const word = seriesChapterWord(articles.length);
  const totalPapers = articles.reduce((sum, a) => sum + (a.papers?.length ?? 0), 0);
  const collectionLd = collectionPageJsonLd({
    name: LLM_INFRA_SERIES.title,
    description:
      "A nine-part research monograph synthesizing foundational and frontier papers across modern Transformer architectures, Roofline & FlashAttention systems, distributed training, RL reasoning, 2026 flagship CED/Muon co-design, Looped Transformers, and Diffusion LLMs.",
    path: LLM_INFRA_SERIES.path,
    items: articles.map((a) => ({
      name: a.title,
      url: `${siteConfig.url}/articles/${a.slug}`,
      description: a.excerpt,
    })),
  });
  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", url: siteConfig.url },
    { name: "Writing", url: `${siteConfig.url}/articles` },
    { name: LLM_INFRA_SERIES.title, url: `${siteConfig.url}${LLM_INFRA_SERIES.path}` },
  ]);

  return (
    <div className="site-shell page-bottom">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbLd) }}
      />
      <nav className="paper-breadcrumb-bar" aria-label="Monograph navigation">
        <div className="paper-breadcrumb-left">
          <Link className="paper-crumb back-link" href="/articles">
            ← Writing
          </Link>
          <span className="paper-crumb-sep" aria-hidden="true">
            /
          </span>
          <span className="paper-crumb">Research Monograph</span>
        </div>
        <div className="paper-breadcrumb-actions">
          <Link className="paper-util-link" href="/labs">
            Companion Labs →
          </Link>
        </div>
      </nav>
      <header className="page-heading">
        <p className="eyebrow">
          <span className="eyebrow-dot" />
          Research monograph · {articles.length} chapters · {totalPapers} arXiv papers
        </p>
        <h1>
          Models,
          {" "}
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
            Environment and reproduction guide →
          </Link>
        </div>
      </section>

      <nav className="monograph-part-nav" aria-label="Monograph parts">
        {MONOGRAPH_PARTS.map((part) => (
          <a key={part.id} className="monograph-part-pill" href={`#${part.id}`}>
            <span className="monograph-part-roman">{part.roman}</span>
            <span>{part.title}</span>
          </a>
        ))}
      </nav>

      <div className="monograph-parts">
        {MONOGRAPH_PARTS.map((part) => {
          const partChapters = articles.filter((a) =>
            (part.orders as readonly number[]).includes(a.seriesOrder ?? 0)
          );
          if (partChapters.length === 0) return null;
          return (
            <section
              key={part.id}
              id={part.id}
              className="monograph-part"
              aria-labelledby={`${part.id}-heading`}
            >
              <header className="monograph-part-header">
                <p className="monograph-part-kicker">{part.roman}</p>
                <div className="monograph-part-title-group">
                  <h2 id={`${part.id}-heading`}>{part.title}</h2>
                  <p>{part.thesis}</p>
                </div>
              </header>

              <ol className="series-chapters">
                {partChapters.map((a) => {
                  const order = a.seriesOrder ?? 0;
                  const figSrc = CHAPTER_FIGURES[order];
                  const papers = a.papers ?? [];
                  const shownPapers = papers.slice(0, 3);
                  const hiddenCount = Math.max(0, papers.length - shownPapers.length);
                  return (
                    <li key={a.slug} className="series-chapter-card">
                      <span className="chapter-number" aria-hidden="true">
                        {String(order).padStart(2, "0")}
                      </span>
                      <div className="series-chapter-main">
                        <p className="eyebrow">
                          {a.category} · {a.readingTime}
                          {papers.length > 0 && ` · ${papers.length} primary arXiv papers`}
                        </p>
                        <h3>
                          <Link href={`/articles/${a.slug}`}>{a.title}</Link>
                        </h3>
                        <p>{a.excerpt}</p>
                        {papers.length > 0 && (
                          <div className="tags series-paper-row">
                            {shownPapers.map((p) => (
                              <a
                                key={p.arxiv}
                                className="tag paper-chip"
                                href={`https://arxiv.org/abs/${p.arxiv}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {p.tag || p.title} ({p.year}) ↗{" "}
                                <span className="sr-only">(opens in a new tab)</span>
                              </a>
                            ))}
                            {hiddenCount > 0 && (
                              <Link
                                className="tag paper-chip is-more"
                                href={`/articles/${a.slug}#references`}
                              >
                                +{hiddenCount} more in chapter
                              </Link>
                            )}
                          </div>
                        )}
                        <div className="series-chapter-actions">
                          <Link className="text-link" href={`/articles/${a.slug}`}>
                            Read chapter →
                          </Link>
                          {a.labPath && (
                            <Link className="text-link" href={`/${a.labPath}`}>
                              Companion lab →
                            </Link>
                          )}
                        </div>
                      </div>
                      {figSrc && (
                        <Link
                          href={`/articles/${a.slug}#fig-1`}
                          className="series-fig-thumb"
                          aria-hidden="true"
                          tabIndex={-1}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={figSrc} alt="" width={320} height={200} loading="lazy" />
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>

      <div className="inline-links">
        <Link className="text-link" href="/series/reliable-model-systems">
          Companion series: Engineering Reliable Model Systems →
        </Link>
        <Link className="text-link" href="/articles">
          All writing →
        </Link>
        <a className="text-link" href="/feed.xml">
          Subscribe via RSS →
        </a>
      </div>
    </div>
  );
}
