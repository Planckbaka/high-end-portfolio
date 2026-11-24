import { selectArticles } from "../article-search";
import type { ArticleSummary } from "@/types";

const articles: ArticleSummary[] = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  slug: `article-${i}`,
  title: i === 0 ? "Cancellation in Go" : i === 2 ? "DeepSeek MLA & DualPipe" : `Article ${i}`,
  excerpt: "A reproducible experiment",
  date: "2026-09-09",
  category: i < 9 ? "Go" : "Python",
  tags: i === 1 ? ["admission"] : i === 2 ? ["MLA", "KV cache"] : [],
  series: i < 6 ? "Reliable systems" : undefined,
  toc:
    i === 2
      ? [{ id: "matrix-absorption", text: "1. Associative Matrix Absorption", depth: 2 }]
      : undefined,
  papers:
    i === 2
      ? [{ title: "DeepSeek-V2 Technical Report", arxiv: "2405.04434", year: 2024, tag: "MLA" }]
      : undefined,
}));

it("searches title, excerpt, tags and combines filters", () => {
  expect(selectArticles(articles, new URLSearchParams("q=admission")).total).toBe(1);
  expect(
    selectArticles(
      articles,
      new URLSearchParams("q=experiment&category=Go&series=Reliable+systems")
    ).total
  ).toBe(6);
});

it("supports multi-token queries across TOC headings and arXiv paper IDs", () => {
  const bySection = selectArticles(articles, new URLSearchParams("q=deepseek+absorption"));
  expect(bySection.total).toBe(1);
  expect(bySection.articles[0].slug).toBe("article-2");
  expect(bySection.matches["article-2"]?.matchedSections[0]?.id).toBe("matrix-absorption");

  const byArxiv = selectArticles(articles, new URLSearchParams("q=2405.04434"));
  expect(byArxiv.total).toBe(1);
  expect(byArxiv.matches["article-2"]?.matchedPapers[0]?.arxiv).toBe("2405.04434");
});

it("clamps pagination and handles no results", () => {
  expect(selectArticles(articles, new URLSearchParams("page=900")).page).toBe(3);
  expect(selectArticles(articles, new URLSearchParams("page=NaN")).page).toBe(1);
  expect(selectArticles(articles, new URLSearchParams("q=absent")).articles).toEqual([]);
});
