"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ArticleSummary } from "@/types";
import { ArticleRow } from "@/components/ui/ArticleCard";
import { ARTICLE_CATEGORIES, selectArticles } from "@/lib/article-search";
import {
  modelSystemsArticles,
  llmInfraArticles,
  seriesChapterWord,
  MODEL_SYSTEMS_SERIES,
  LLM_INFRA_SERIES,
} from "@/lib/series";

const QUICK_TOPICS = ["RoPE", "FlashAttention", "MLA", "GRPO", "ZeRO", "KV cache", "Go", "asyncio"];

export default function ArticlesClient({
  articles,
  labCount = 12,
}: {
  articles: ArticleSummary[];
  labCount?: number;
}) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sync = () => setSearch(window.location.search);
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  // Press `/` anywhere outside editable controls to jump into the search box.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      event.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const params = new URLSearchParams(search);
  const selection = selectArticles(articles, params);
  const series = [
    ...new Set(
      articles.map((article) => article.series).filter((value): value is string => !!value)
    ),
  ];
  const chapters = modelSystemsArticles(articles).length;
  const infraList = llmInfraArticles(articles);
  const infraChapters = infraList.length;
  const infraPapers = infraList.reduce((sum, a) => sum + (a.papers?.length ?? 0), 0);

  /*
   * Filters stay controlled instead of remounting with `key={search}`: a
   * remount dropped focus after every submit or back/forward navigation.
   * `query` tracks the URL's q param, re-synced during render when `search`
   * changes (the React-adjust-state-on-prop-change pattern — no effect).
   */
  const [query, setQuery] = useState(() => new URLSearchParams(search).get("q") ?? "");
  const [lastSearch, setLastSearch] = useState(search);
  if (lastSearch !== search) {
    setLastSearch(search);
    setQuery(new URLSearchParams(search).get("q") ?? "");
  }

  const updateUrl = useCallback((next: URLSearchParams, replace = false) => {
    const queryString = next.toString();
    const url = queryString ? `?${queryString}` : "/articles";
    if (replace) {
      window.history.replaceState(null, "", url);
    } else {
      window.history.pushState(null, "", url);
    }
    setSearch(queryString);
  }, []);

  function change(key: string, value: string, replace = false) {
    const next = new URLSearchParams(search);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    updateUrl(next, replace);
  }

  function onQueryInput(value: string) {
    setQuery(value);
    const trimmed = value.trim();
    const next = new URLSearchParams(search);
    if (trimmed) next.set("q", trimmed);
    else next.delete("q");
    next.delete("page");
    const nextStr = next.toString();
    setLastSearch(nextStr);
    window.history.replaceState(null, "", nextStr ? `?${nextStr}` : "/articles");
    setSearch(nextStr);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = new URLSearchParams();
    for (const key of ["q", "category", "series"]) {
      const value = String(form.get(key) || "").trim();
      if (value) next.set(key, value);
    }
    updateUrl(next, false);
  }

  function pageHref(page: number) {
    const next = new URLSearchParams(search);
    next.set("page", String(page));
    return `/articles?${next}`;
  }

  return (
    <div className="site-shell page-bottom">
      <header className="page-heading">
        <p className="eyebrow">
          <span className="eyebrow-dot" />
          Archive · {articles.length} essays and research notes
        </p>
        <h1>Writing.</h1>
        <div>
          <p>
            Working through systems, architectures, and mathematical proofs one implementation at a
            time. Explanations, Roofline ledgers, and reproducible CPU experiments.
          </p>
          <p className="writing-labs-callout">
            <Link className="text-link" href="/labs">
              Browse all {labCount} Companion CPU Labs ↗
            </Link>
          </p>
        </div>
      </header>
      <div className="series-showcase" aria-label="Guided reading tracks">
        <Link className="series-track-card" href={LLM_INFRA_SERIES.path}>
          <span className="series-track-kind">
            Research monograph · {seriesChapterWord(infraChapters)} chapters
          </span>
          <strong>{LLM_INFRA_SERIES.title}</strong>
          <span>
            {infraPapers > 0
              ? `${infraPapers} foundational and frontier arXiv papers synthesized with LaTeX proofs, Roofline ledgers, and PyTorch CPU verifications ↗`
              : "Foundational and frontier arXiv papers synthesized with LaTeX proofs, Roofline ledgers, and PyTorch CPU verifications ↗"}
          </span>
        </Link>
        <Link className="series-track-card" href={MODEL_SYSTEMS_SERIES.path}>
          <span className="series-track-kind">
            Engineering series · {seriesChapterWord(chapters)} chapters
          </span>
          <strong>{MODEL_SYSTEMS_SERIES.title}</strong>
          <span>
            Start the {seriesChapterWord(chapters)}-part engineering series from bounded Go workers
            to a tiny cached decoder ↗
          </span>
        </Link>
      </div>
      <form className="filters" role="search" action="/articles" onSubmit={submit}>
        <div className="field search-field">
          <label htmlFor="article-search">
            Search writing, sections &amp; arXiv IDs <kbd className="search-kbd">/</kbd>
          </label>
          <Input
            ref={inputRef}
            id="article-search"
            name="q"
            type="search"
            value={query}
            onChange={(event) => onQueryInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                if (query) {
                  event.preventDefault();
                  onQueryInput("");
                } else {
                  event.currentTarget.blur();
                }
              }
            }}
            placeholder="MLA absorption, 2405.04434, FlashAttention, concurrency…"
          />
        </div>
        <div className="field">
          <label htmlFor="category">Topic</label>
          <select
            name="category"
            id="category"
            value={params.get("category") || ""}
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
            value={params.get("series") || ""}
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
      <div className="quick-topic-chips" aria-label="Filter by concept">
        <span className="eyebrow">Quick filter:</span>
        {QUICK_TOPICS.map((topic) => {
          const isActive = (params.get("q") || "").toLowerCase() === topic.toLowerCase();
          return (
            <button
              key={topic}
              type="button"
              className="topic-chip"
              aria-pressed={isActive}
              onClick={() => change("q", isActive ? "" : topic)}
            >
              {topic}
            </button>
          );
        })}
      </div>
      <p className="results-count" role="status" id="results-count" tabIndex={-1}>
        {selection.total} article{selection.total !== 1 ? "s" : ""} · Page {selection.page} of{" "}
        {selection.pages}
      </p>
      {selection.articles.map((article) => (
        <ArticleRow
          key={article.slug}
          article={article}
          compact
          match={selection.matches[article.slug]}
        />
      ))}
      {selection.total === 0 && (
        <div className="empty-state">
          <h2>No articles found.</h2>
          <p>
            Try a broader term or{" "}
            <Link
              className="text-link"
              href="/articles"
              onClick={() => {
                setQuery("");
                setSearch("");
              }}
            >
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
                /*
                 * Move focus with the results instead of scrolling away from
                 * the pointer: the status line re-announces the new count, and
                 * keyboard users stay oriented.
                 */
                document.getElementById("results-count")?.focus({
                  preventScroll: true,
                });
                document.getElementById("results-count")?.scrollIntoView({
                  /*
                   * A specified behavior overrides the reduced-motion CSS
                   * kill-switch, so honor the preference explicitly.
                   */
                  behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                    ? "auto"
                    : "smooth",
                  block: "start",
                });
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
