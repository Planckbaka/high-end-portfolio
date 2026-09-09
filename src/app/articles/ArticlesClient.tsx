"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import type { ArticleSummary } from "@/types";
import { ArticleRow } from "@/components/ui/ArticleCard";
import { ARTICLE_CATEGORIES, selectArticles } from "@/lib/article-search";
export default function ArticlesClient({ articles }: { articles: ArticleSummary[] }) {
  const [search, setSearch] = useState("");
  useEffect(() => {
    const sync = () => setSearch(window.location.search);
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  const params = new URLSearchParams(search);
  const selection = selectArticles(articles, params);
  const series = [
    ...new Set(
      articles.map((article) => article.series).filter((value): value is string => !!value)
    ),
  ];
  function change(key: string, value: string) {
    const next = new URLSearchParams(search);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    const query = next.toString();
    window.history.pushState(null, "", query ? `?${query}` : "/articles");
    setSearch(query);
  }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = new URLSearchParams();
    for (const key of ["q", "category", "series"]) {
      const value = String(form.get(key) || "").trim();
      if (value) next.set(key, value);
    }
    const query = next.toString();
    window.history.pushState(null, "", query ? `?${query}` : "/articles");
    setSearch(query);
  }
  function pageHref(page: number) {
    const next = new URLSearchParams(search);
    next.set("page", String(page));
    return `/articles?${next}`;
  }
  return (
    <div className="site-shell page-bottom">
      <header className="page-heading">
        <p className="eyebrow">The notebook</p>
        <h1>Writing.</h1>
        <p>
          Working through systems, one implementation at a time. Explanations, experiments, and the
          details that change the outcome.
        </p>
      </header>
      <p className="series-entry">
        <Link className="text-link" href="/series/reliable-model-systems">
          Start the six-part engineering series ↗
        </Link>
      </p>
      <form className="filters" role="search" action="/articles" onSubmit={submit} key={search}>
        <div className="field search-field">
          <label htmlFor="article-search">Search the writing</label>
          <Input
            id="article-search"
            name="q"
            type="search"
            defaultValue={params.get("q") || ""}
            placeholder="Concurrency, attention, failure recovery…"
          />
        </div>
        <div className="field">
          <label htmlFor="category">Topic</label>
          <select
            name="category"
            id="category"
            defaultValue={params.get("category") || ""}
            onChange={(event) => event.currentTarget.form?.requestSubmit()}
          >
            <option value="">All topics</option>
            {ARTICLE_CATEGORIES.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="series">Series</label>
          <select
            name="series"
            id="series"
            defaultValue={params.get("series") || ""}
            onChange={(event) => event.currentTarget.form?.requestSubmit()}
          >
            <option value="">All writing</option>
            {series.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </div>
        <Button type="submit">Search</Button>
      </form>
      <p className="results-count" role="status">
        {selection.total} article{selection.total !== 1 ? "s" : ""} · Page {selection.page} of{" "}
        {selection.pages}
      </p>
      {selection.articles.map((article) => (
        <ArticleRow key={article.slug} article={article} />
      ))}
      {selection.total === 0 && (
        <div className="empty-state">
          <h2>No articles found.</h2>
          <p>
            Try a broader term or{" "}
            <Link className="text-link" href="/articles" onClick={() => setSearch("")}>
              clear the filters
            </Link>
            .
          </p>
        </div>
      )}
      {selection.pages > 1 && (
        <nav aria-label="Article pagination" className="pagination">
          {Array.from({ length: selection.pages }, (_, i) => i + 1).map((page) => (
            <a
              className="button"
              key={page}
              href={pageHref(page)}
              aria-current={page === selection.page ? "page" : undefined}
              onClick={(event) => {
                event.preventDefault();
                change("page", String(page));
                document.querySelector(".filters")?.scrollIntoView();
              }}
            >
              {page}
            </a>
          ))}
        </nav>
      )}
      <noscript>
        <p>Search and pagination use JavaScript. The complete archive follows:</p>
        <ul>
          {articles.map((article) => (
            <li key={article.slug}>
              <a href={`/articles/${article.slug}`}>{article.title}</a>
            </li>
          ))}
        </ul>
      </noscript>
    </div>
  );
}
