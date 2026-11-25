import Link from "next/link";
import { getAllArticles } from "@/lib/markdown";
import { modelSystemsArticles, MODEL_SYSTEMS_SERIES, seriesChapterWord } from "@/lib/series";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata(
  MODEL_SYSTEMS_SERIES.title,
  "A guided sequence of Go, Python and CPU model experiments, from bounded work to cached decoding.",
  MODEL_SYSTEMS_SERIES.path
);

export default function ModelSystemsSeries() {
  const articles = modelSystemsArticles(getAllArticles());
  const word = seriesChapterWord(articles.length);

  return (
    <div className="site-shell page-bottom">
      <header className="page-heading">
        <p className="eyebrow">
          <span className="eyebrow-dot" />
          Guided engineering series · {articles.length} chapters
        </p>
        <h1>
          Systems,
          {" "}
          <br />
          step by step.
        </h1>
        <p>
          {seriesChapterWord(articles.length).replace(/^./, (c) => c.toUpperCase())} explanations,{" "}
          {word} runnable experiments. Follow the boundaries between requests, tasks and tensors.
        </p>
      </header>
      <section className="series-intro" aria-label="How to read this series">
        <div>
          <p className="eyebrow">Before you begin</p>
          <p>
            Working familiarity with Go and Python helps. The tensor articles introduce their shapes
            and assumptions as they go. All experiments run on CPU.
          </p>
        </div>
        <div>
          <p className="eyebrow">Choose your route</p>
          <p>
            Start with Go for lifecycle and cancellation, Python for orchestration and measurement,
            or read Attention before KV&nbsp;Cache for the numerical path.
          </p>
          <Link className="text-link" href="/labs">
            Environment and reproduction guide ↗
          </Link>
        </div>
      </section>
      <ol className="series-chapters">
        {articles.map((a) => (
          <li key={a.slug} className="series-chapter-card is-compact-series">
            <span className="chapter-number" aria-hidden="true">
              {String(a.seriesOrder).padStart(2, "0")}
            </span>
            <div className="series-chapter-main">
              <p className="eyebrow">
                {a.category} · {a.readingTime}
              </p>
              <h2>
                <Link href={`/articles/${a.slug}`}>{a.title}</Link>
              </h2>
              <p>{a.excerpt}</p>
              <div className="series-chapter-actions">
                <Link className="text-link" href={`/articles/${a.slug}`}>
                  Read chapter →
                </Link>
                {a.labPath && (
                  <Link className="text-link" href={`/${a.labPath}`}>
                    Companion lab ↗
                  </Link>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
      <div className="inline-links">
        <Link className="text-link" href="/series/llm-ai-infra">
          Research monograph: LLM &amp; AI Infrastructure ↗
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
