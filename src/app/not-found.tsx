import Link from "next/link";
import { ArticleRow } from "@/components/ui/ArticleCard";
import { getAllArticles } from "@/lib/markdown";
export const metadata = {
  // The root layout's canonical "/" would otherwise leak onto every 404.
  robots: { index: false, follow: false },
};
export default function NotFound() {
  /*
   * "There is still plenty to explore" should be demonstrated, not asserted:
   * surface the three newest notes right on the error page.
   */
  const recent = getAllArticles().slice(0, 3);
  return (
    <div className="site-shell page-bottom">
      <header className="page-heading">
        <p className="eyebrow">
          <span className="eyebrow-dot" />
          Page not found
        </p>
        <h1>This page isn’t here.</h1>
        <div>
          <p>The address may be incorrect. There is still plenty to explore.</p>
          <div className="inline-links">
            <Link className="button primary" href="/articles">
              Browse the writing ↗
            </Link>
            <Link className="text-link" href="/">
              Back home
            </Link>
          </div>
        </div>
      </header>
      <section className="section" aria-labelledby="not-found-notes">
        <div className="section-heading">
          <h2 id="not-found-notes">Recent notes</h2>
          <Link className="text-link" href="/articles">
            All articles ↗
          </Link>
        </div>
        {recent.map((article) => (
          <ArticleRow key={article.slug} article={article} />
        ))}
      </section>
    </div>
  );
}
