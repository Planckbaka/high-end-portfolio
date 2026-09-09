import Link from "next/link";
import type { ArticleSummary } from "@/types";
export function ArticleMeta({ article }: { article: ArticleSummary }) {
  return (
    <div className="article-meta">
      <span className="category">{article.category}</span>
      <span aria-hidden="true">/</span>
      <span>{article.readingTime}</span>
    </div>
  );
}
export function ArticleDiagram({ category }: { category: string }) {
  const items =
    category === "Go"
      ? ["Request", "Gate", "Worker"]
      : category === "Python"
        ? ["Queue", "Tasks", "Results"]
        : ["Q · Kᵀ", "Mask", "Softmax"];
  return (
    <div className={`article-diagram diagram-${category.toLowerCase()}`} aria-hidden="true">
      <div className="diagram-orbit" />
      <span className="diagram-discipline">{category === "Python" ? "Py" : category}</span>
      <div className="diagram-row">
        {items.map((item, i) => (
          <span className={`diagram-box ${i === 1 ? "accent" : ""}`} key={item}>
            {item}
          </span>
        ))}
      </div>
      <div className="diagram-caption">
        {category === "Go"
          ? "bounded work · explicit lifecycle"
          : category === "Python"
            ? "observe · measure · verify"
            : "shapes → operations → evidence"}
      </div>
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
          <span>{article.labPath ? "Includes a runnable lab" : "Engineering notes"}</span>
          <span aria-hidden="true">↗</span>
        </div>
      </div>
    </article>
  );
}
export function ArticleRow({ article }: { article: ArticleSummary }) {
  return (
    <article className="article-row">
      <time className="row-date" dateTime={article.date}>
        {new Date(article.date + "T00:00:00Z").toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        })}
      </time>
      <div>
        <h2>
          <Link href={`/articles/${article.slug}`}>{article.title}</Link>
        </h2>
        <p>{article.excerpt}</p>
        <ArticleMeta article={article} />
      </div>
      <span aria-hidden="true">↗</span>
    </article>
  );
}
