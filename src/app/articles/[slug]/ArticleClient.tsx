import Link from "next/link";
import type { Article, ArticleSummary } from "@/types";
import { TableOfContents, CodeCopyEnhancement } from "@/components/ui/ArticleTools";
import { ShareLinks } from "@/components/ui/ShareLinks";
// Kept under its historical filename; the article body is a Server Component.
export default function ArticleClient({
  article,
  previous,
  next,
}: {
  article: Article;
  previous?: ArticleSummary;
  next?: ArticleSummary;
}) {
  return (
    <div className="site-shell">
      <header className="article-heading">
        <Link className="back-link" href="/articles">
          ← Back to writing
        </Link>
        <p className="eyebrow">
          <span className="category">{article.category}</span>
          {article.series && (
            <>
              <span>/</span>
              <Link href="/series/reliable-model-systems">
                {article.series} · {article.seriesOrder}
              </Link>
            </>
          )}
        </p>
        <h1>{article.title}</h1>
        <p className="summary">{article.excerpt}</p>
        <div className="article-meta">
          <span>Akiwayne</span>
          <span aria-hidden="true">/</span>
          <time dateTime={article.date}>{article.date}</time>
          {article.updatedAt && <span>Updated {article.updatedAt}</span>}
          <span aria-hidden="true">/</span>
          <span>{article.readingTime}</span>
        </div>
      </header>
      <div className="article-layout">
        <TableOfContents toc={article.toc} />
        <article className="article-body">
          {article.labPath && (
            <div className="lab-callout">
              <a className="text-link" href={`/${article.labPath}/README.md`}>
                Open the lab instructions ↗
              </a>
              <span> · </span>
              <a className="text-link" href="/labs/engineering-labs.zip" download>
                Download all labs ↓
              </a>
              <p>Local CPU experiments · Source, tests, and reproduction commands included.</p>
            </div>
          )}
          <div className="prose" dangerouslySetInnerHTML={{ __html: article.content }} />
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
                    <small>Next in the series →</small>
                    {next.title}
                  </Link>
                )}
              </div>
            </nav>
          )}
          <div className="section">
            <ShareLinks title={article.title} slug={article.slug} />
          </div>
        </article>
      </div>
    </div>
  );
}
