import { getRelatedArticles } from "../related-articles";
import type { ArticleSummary } from "@/types";

const pool: ArticleSummary[] = [
  {
    id: "curr",
    slug: "curr",
    title: "Current",
    date: "2026-10-01",
    category: "Systems",
    excerpt: "...",
    tags: ["Kafka", "Distributed", "Go"],
  },
  {
    id: "high-overlap",
    slug: "high-overlap",
    title: "High Overlap",
    date: "2026-09-01",
    category: "Systems",
    excerpt: "...",
    tags: ["Kafka", "Distributed"],
  },
  {
    id: "cat-only",
    slug: "cat-only",
    title: "Category Match",
    date: "2026-09-05",
    category: "Systems",
    excerpt: "...",
    tags: ["Redis"],
  },
  {
    id: "manual",
    slug: "manual",
    title: "Manual Pick",
    date: "2026-08-01",
    category: "Interface",
    excerpt: "...",
    tags: ["CSS"],
  },
];

describe("getRelatedArticles", () => {
  it("ranks articles by shared tags and category while excluding current and excluded slugs", () => {
    const related = getRelatedArticles(pool[0], pool, { excludeSlugs: ["cat-only"], limit: 3 });
    expect(related.map((a) => a.slug)).toEqual(["high-overlap"]);
  });

  it("prioritizes explicit frontmatter related slugs before algorithmic fallback", () => {
    const related = getRelatedArticles({ ...pool[0], related: ["manual"] }, pool, { limit: 2 });
    expect(related.map((a) => a.slug)).toEqual(["manual", "high-overlap"]);
  });
});
