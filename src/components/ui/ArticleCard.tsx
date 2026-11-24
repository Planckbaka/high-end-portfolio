import Link from "next/link";
import type { ArticleSummary } from "@/types";
import type { ArticleSearchMatch } from "@/lib/article-search";
import { formatDate } from "@/lib/utils";
import { seriesPathForTitle } from "@/lib/series";

export function ArticleMeta({
  article,
  shortSeries = false,
}: {
  article: ArticleSummary;
  shortSeries?: boolean;
}) {
  /*
   * In a list, the full series title repeats on every row ("LLM & AI
   * Infrastructure from First Principles" ×8 is 72 words of the same fact).
   * The row keeps the chapter number, which is what distinguishes one row
   * from the next; the full name is one link away on the series page.
   */
  const seriesLabel = shortSeries
    ? `Ch. ${String(article.seriesOrder).padStart(2, "0")}`
    : `${article.series} · ${String(article.seriesOrder).padStart(2, "0")}`;
  return (
    <div className="article-meta">
      <span className="category">{article.category}</span>
      <span aria-hidden="true">/</span>
      <span>{article.readingTime}</span>
      {article.series && (
        <>
          <span aria-hidden="true">/</span>
          <Link
            className="meta-series-link"
            href={seriesPathForTitle(article.series)}
            title={article.series}
          >
            {seriesLabel}
          </Link>
        </>
      )}
      {article.papers && article.papers.length > 0 && (
        <>
          <span aria-hidden="true">/</span>
          <span className="meta-paper-badge">{article.papers.length} arXiv papers</span>
        </>
      )}
    </div>
  );
}
export function ArticleDiagram({ category }: { category: string }) {
  const items =
    category === "Go"
      ? ["Request", "Gate", "Worker"]
      : category === "Python"
        ? ["Queue", "Tasks", "Results"]
        : category === "Systems"
          ? ["HBM", "SRAM Tile", "Roofline"]
          : category === "Interface"
            ? ["State", "Layout", "Frame"]
            : ["c_KV", "W_UK · Q", "Softmax"];
  const discipline =
    category === "Python"
      ? "Py"
      : category === "Systems"
        ? "Sys"
        : category === "Interface"
          ? "UI"
          : category;
  const caption =
    category === "Go"
      ? "bounded work · explicit lifecycle"
      : category === "Python"
        ? "observe · measure · verify"
        : category === "Systems"
          ? "arithmetic intensity · hardware co-design"
          : category === "Interface"
            ? "perception · motion · clarity"
            : "shapes → proofs → evidence";
  return (
    <div className={`article-diagram diagram-${category.toLowerCase()}`} aria-hidden="true">
      <div className="diagram-orbit" />
      <span className="diagram-discipline">{discipline}</span>
      <div className="diagram-row">
        {items.map((item, i) => (
          <span className={`diagram-box ${i === 1 ? "accent" : ""}`} key={item}>
            {item}
          </span>
        ))}
      </div>
      <div className="diagram-caption">{caption}</div>
    </div>
  );
}
export function FeaturedArticle({ article }: { article: ArticleSummary }) {
  return (
    <article className="featured-card">
      <ArticleDiagram category={article.category} />
      <div>
        <ArticleMeta article={article} />
        <h3>
          <Link href={`/articles/${article.slug}`}>{article.title}</Link>
        </h3>
        <p>{article.excerpt}</p>
        <div className="article-meta">
          <span>
            {article.papers && article.papers.length > 0 && article.labPath
              ? `Synthesizes ${article.papers.length} papers · Runnable lab`
              : article.labPath
                ? "Includes a runnable lab"
                : "Engineering notes"}
          </span>
          <span aria-hidden="true">↗</span>
        </div>
      </div>
    </article>
  );
}
export function ArticleRow({
  article,
  compact = false,
  match,
}: {
  article: ArticleSummary;
  compact?: boolean;
  match?: ArticleSearchMatch;
}) {
  return (
    <article className={`article-row${compact ? " is-compact" : ""}`}>
      <time className="row-date" dateTime={article.date}>
        {formatDate(article.date)}
      </time>
      <div>
        <h2>
          <Link href={`/articles/${article.slug}`}>{article.title}</Link>
        </h2>
        {/*
         * An archive row is scanned, not read: the title and the routing facts
         * are what a reader picks from, and the excerpt belongs to the article
         * page. On a five-row screen the excerpts made 321 words of wall; the
         * list now carries one idea a row.
         */}
        {!compact && <p>{article.excerpt}</p>}
        <ArticleMeta article={article} shortSeries={compact} />
        {match && (match.matchedSections.length > 0 || match.matchedPapers.length > 0) && (
          <div className="search-match-hits" aria-label="Matched sections and references">
            {match.matchedSections.map((sec) => (
              <Link
                key={sec.id}
                className="search-hit-chip"
                href={`/articles/${article.slug}#${sec.id}`}
              >
                § {sec.text}
              </Link>
            ))}
            {match.matchedPapers.map((paper) => (
              <Link
                key={paper.arxiv}
                className="search-hit-chip is-paper"
                href={`/articles/${article.slug}#references`}
                title={paper.title}
              >
                [{paper.tag || `arXiv:${paper.arxiv}`}]
              </Link>
            ))}
          </div>
        )}
      </div>
      <span aria-hidden="true">↗</span>
    </article>
  );
}
