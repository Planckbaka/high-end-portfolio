import { selectArticles } from "../article-search";
import type { ArticleSummary } from "@/types";
const articles: ArticleSummary[] = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  slug: `article-${i}`,
  title: i === 0 ? "Cancellation in Go" : `Article ${i}`,
  excerpt: "A reproducible experiment",
  date: "2026-09-09",
  category: i < 9 ? "Go" : "Python",
  tags: i === 1 ? ["admission"] : [],
  series: i < 6 ? "Reliable systems" : undefined,
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
it("clamps pagination and handles no results", () => {
  expect(selectArticles(articles, new URLSearchParams("page=900")).page).toBe(3);
  expect(selectArticles(articles, new URLSearchParams("page=NaN")).page).toBe(1);
  expect(selectArticles(articles, new URLSearchParams("q=absent")).articles).toEqual([]);
});
