import Link from "next/link";
import { getAllArticles } from "@/lib/markdown";
import { modelSystemsArticles, MODEL_SYSTEMS_SERIES } from "@/lib/series";
import { pageMetadata } from "@/lib/page-metadata";
export const metadata = pageMetadata(
  MODEL_SYSTEMS_SERIES.title,
  "A guided sequence of Go, Python and CPU model experiments, from bounded work to cached decoding.",
  MODEL_SYSTEMS_SERIES.path
);
export default async function ModelSystemsSeries() {
  const articles = modelSystemsArticles(await getAllArticles());
  return (
    <div className="site-shell page-bottom">
      <header className="page-heading">
        <p className="eyebrow">A guided engineering series</p>
        <h1>
          Systems,
          <br />
          step by step.
        </h1>
        <p>
          Six explanations, six runnable experiments. Follow the boundaries between requests, tasks
          and tensors.
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
            or read Attention before KV Cache for the numerical path.
          </p>
          <a className="text-link" href="/labs/README.md">
            Environment and reproduction guide ↗
          </a>
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
              </p>
              <h2>
                <Link href={`/articles/${a.slug}`}>{a.title}</Link>
              </h2>
              <p>{a.excerpt}</p>
              {a.labPath && (
                <a className="text-link" href={`/${a.labPath}/README.md`}>
                  Companion lab ↗
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
      <div className="inline-links">
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
