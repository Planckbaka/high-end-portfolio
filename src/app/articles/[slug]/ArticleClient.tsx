import Link from "next/link";
import type { Article, ArticleSummary } from "@/types";
import { TableOfContents, CodeCopyEnhancement } from "@/components/ui/ArticleTools";
import { ShareLinks } from "@/components/ui/ShareLinks";
import { ArticleMeta } from "@/components/ui/ArticleCard";
import { formatDate } from "@/lib/utils";
import { seriesPathForTitle } from "@/lib/series";
import { siteConfig } from "@/config/site";

function formatBibtex(article: Article): string {
  const year = article.date.slice(0, 4);
  const key = `akiwayne${year}${article.slug.replace(/[^a-zA-Z0-9]/g, "").slice(0, 18).toLowerCase()}`;
  const cleanTitle = article.title.replace(/[{}]/g, "");
  const cleanUrl = siteConfig.url.replace(/\/+$/, "");
  return `@article{${key},
  author  = {${siteConfig.author.name}},
  title   = {${cleanTitle}},
  journal = {${article.series || siteConfig.name}},
  year    = {${year}},
  url     = {${cleanUrl}/articles/${article.slug}}
}`;
}

// Kept under its historical filename; the article body is a Server Component.
export default function ArticleClient({
  article,
  previous,
  next,
  related = [],
}: {
  article: Article;
  previous?: ArticleSummary;
  next?: ArticleSummary;
  related?: ArticleSummary[];
}) {
  const seriesHref = seriesPathForTitle(article.series);
  const bibtex = formatBibtex(article);
  const hasPapers = Boolean(article.papers && article.papers.length > 0);
  const hasExistingRefHeading = article.toc?.some((item) => item.id === "references");
  const tocWithRefs =
    hasPapers && article.toc && !hasExistingRefHeading
      ? [...article.toc, { id: "references", text: "References", depth: 2 as const }]
      : article.toc;

  return (
    <div className="site-shell paper-shell">
      <div className="reading-progress-bar" aria-hidden="true" />

      <nav className="paper-breadcrumb-bar" aria-label="Article navigation and citation">
        <div className="paper-breadcrumb-left">
          <Link className="paper-crumb back-link" href="/articles">
            ← Writing
          </Link>
          {article.series && (
            <>
              <span className="paper-crumb-sep" aria-hidden="true">
                /
              </span>
              <Link
                className="paper-crumb"
                href={seriesHref}
                title={`${article.series}, chapter ${String(article.seriesOrder).padStart(2, "0")}`}
              >
                {article.series} · Ch. {String(article.seriesOrder).padStart(2, "0")}
              </Link>
            </>
          )}
        </div>
        <div className="paper-breadcrumb-actions">
          {hasPapers && (
            <a className="paper-util-link" href="#references">
              References ({article.papers!.length})
            </a>
          )}
          <button
            type="button"
            className="paper-util-btn"
            data-bibtex={bibtex}
            aria-label="Copy BibTeX citation"
          >
            Copy BibTeX
          </button>
        </div>
      </nav>

      <header className="article-heading paper-header">
        <p className="paper-category">{article.category}</p>
        <h1 className="paper-title">{article.title}</h1>
        <div className="article-meta paper-meta-row">
          <span className="author-name">{siteConfig.author.name}</span>
          <time className="paper-meta-item" dateTime={article.date}>
            {formatDate(article.date)}
          </time>
          {article.updatedAt && (
            <span className="paper-meta-item">Revised {formatDate(article.updatedAt)}</span>
          )}
          <span className="paper-meta-item">{article.readingTime}</span>
          {hasPapers && (
            <span className="paper-meta-item">
              {article.papers!.length} primary arXiv{" "}
              {article.papers!.length === 1 ? "source" : "sources"}
            </span>
          )}
        </div>
        {article.tags && article.tags.length > 0 && (
          <div className="article-header-tags paper-tags" aria-label="Article topics">
            {article.tags.map((tag) => (
              <Link key={tag} className="tag" href={`/articles?q=${encodeURIComponent(tag)}`}>
                {tag}
              </Link>
            ))}
          </div>
        )}
      </header>

      <div className="article-layout">
        <TableOfContents toc={tocWithRefs} />
        <article className="article-body">
          <section className="abstract-box" aria-label="Abstract">
            <div className="abstract-title">Abstract</div>
            <p className="summary">{article.excerpt}</p>
            {(article.labPath || hasPapers) && (
              <div className="abstract-footer">
                {article.labPath && (
                  <div className="abstract-lab-links">
                    <span className="abstract-meta-label">Artifact:</span>
                    <Link className="text-link" href={`/${article.labPath}`}>
                      Open Companion Lab (/{article.labPath}) ↗
                    </Link>
                    <span aria-hidden="true">·</span>
                    <a className="text-link" href="/labs/engineering-labs.zip" download>
                      Download All Labs (.zip) ↓
                    </a>
                  </div>
                )}
                {hasPapers && (
                  <div className="abstract-paper-chips">
                    <span className="abstract-meta-label">Synthesized Papers:</span>
                    {article.papers!.map((paper) => (
                      <a
                        key={paper.arxiv}
                        href={`https://arxiv.org/abs/${paper.arxiv}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="paper-source-badge"
                        title={paper.title}
                      >
                        [{paper.tag || `arXiv:${paper.arxiv}`}
                        {paper.year ? `, ${paper.year}` : ""}] ↗
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          <div className="prose" dangerouslySetInnerHTML={{ __html: article.content }} />

          {hasPapers && (
            <section id="references" className="paper-references" aria-label="References">
              <h2 className="paper-sec-heading">
                <span className="sec-num">References</span>
              </h2>
              <ol className="bib-list">
                {article.papers!.map((paper, idx) => (
                  <li key={paper.arxiv} id={`ref-${idx + 1}`} className="bib-item">
                    <span className="bib-index">[{idx + 1}]</span>
                    <div className="bib-body">
                      <div className="bib-header-line">
                        {paper.tag && <span className="bib-tag">{paper.tag}</span>}
                        {paper.year && <span className="bib-year">({paper.year})</span>}
                        <a
                          href={`https://arxiv.org/abs/${paper.arxiv}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bib-title"
                        >
                          {paper.title}
                        </a>
                      </div>
                      <div className="bib-links">
                        <a
                          href={`https://arxiv.org/abs/${paper.arxiv}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bib-arxiv-link"
                        >
                          arXiv:{paper.arxiv} [abs] ↗
                        </a>
                        <span aria-hidden="true">·</span>
                        <a
                          href={`https://arxiv.org/pdf/${paper.arxiv}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bib-arxiv-link"
                        >
                          PDF ↗
                        </a>
                        {paper.firstCiteId && (
                          <>
                            <span aria-hidden="true">·</span>
                            <a
                              href={`#${paper.firstCiteId}`}
                              className="bib-arxiv-link bib-backlink"
                              aria-label={`Jump back to first citation of ${paper.title}`}
                            >
                              ↩ Cited in text
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <CodeCopyEnhancement key={article.slug} />

          {(previous || next) && (
            <nav className="series-nav" aria-label="Series navigation">
              <div>
                {previous && (
                  <Link href={`/articles/${previous.slug}`}>
                    <small>← Previous in the series</small>
                    {previous.title}
                  </Link>
                )}
              </div>
              <div>
                {next && (
                  <Link href={`/articles/${next.slug}`}>
                    <small>Next in the series</small>
                    {next.title}
                  </Link>
                )}
              </div>
            </nav>
          )}

          {related.length > 0 && (
            <section className="related-writing" aria-labelledby="related-writing-heading">
              <div className="related-writing-header">
                <p className="eyebrow" id="related-writing-heading">
                  Related writing
                </p>
                <Link className="text-link" href="/articles">
                  Full archive ↗
                </Link>
              </div>
              <div className="related-writing-grid">
                {related.map((item) => (
                  <article key={item.slug} className="related-writing-card">
                    <ArticleMeta article={item} shortSeries />
                    <h3>
                      <Link href={`/articles/${item.slug}`}>{item.title}</Link>
                    </h3>
                    <p>{item.excerpt}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          <div className="section article-share">
            <ShareLinks title={article.title} slug={article.slug} />
          </div>
        </article>
      </div>
    </div>
  );
}
