import Link from "next/link";
import type { ArticleSummary } from "@/types";
import type { ArticleSearchMatch } from "@/lib/article-search";
import { formatDate } from "@/lib/utils";
import { seriesPathForTitle } from "@/lib/series";
import { DisciplineInkPlate } from "@/components/visual/EditorialIllustrations";

export function ArticleMeta({
  article,
  shortSeries = false,
}: {
  article: ArticleSummary;
  shortSeries?: boolean;
}) {
  const seriesLabel = shortSeries
    ? `Ch. ${String(article.seriesOrder).padStart(2, "0")}`
    : `${article.series} · ${String(article.seriesOrder).padStart(2, "0")}`;
  return (
    <div className="article-meta">
      <span className="category">{article.category}</span>
      <span>{article.readingTime}</span>
      {article.series && (
        <Link
          className="meta-series-link"
          href={seriesPathForTitle(article.series)}
          title={article.series}
        >
          {seriesLabel}
        </Link>
      )}
      {article.papers && article.papers.length > 0 && (
        <span className="meta-paper-badge">{article.papers.length} papers</span>
      )}
    </div>
  );
}

export function ArticleDiagram({ category }: { category: string }) {
  return (
    <div className="article-diagram" aria-hidden="true">
      <DisciplineInkPlate category={category} />
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
            {article.labPath ? "Includes runnable companion lab" : "Long-form research note"}
          </span>
          <span aria-hidden="true">→</span>
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
      <span aria-hidden="true">→</span>
    </article>
  );
}
