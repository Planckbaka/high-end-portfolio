jest.mock("../articles-index.json", () => [
  {
    id: "test-article-1",
    slug: "test-article-1",
    title: "Test Article 1",
    date: "2024-01-01",
    category: "Test",
    excerpt: "Test excerpt 1",
    readingTime: "5 min",
    toc: [{ id: "intro", text: "1. Intro", depth: 2 }],
  },
  {
    id: "test-article-2",
    slug: "test-article-2",
    title: "Test Article 2",
    date: "2024-01-02",
    category: "Test",
    excerpt: "Test excerpt 2",
    readingTime: "3 min",
    toc: [],
  },
]);

jest.mock("../articles-content", () => ({
  articleContentLoaders: {
    "test-article-1": async () => ({ default: { content: "<p>Full content 1</p>" } }),
    "test-article-2": async () => ({ default: { content: "<p>Full content 2</p>" } }),
  },
}));

import {
  getAllArticles,
  getArticleBySlug,
  getArticleSummaryBySlug,
  getAllArticleSlugs,
} from "../markdown";

describe("Markdown Utilities", () => {
  describe("getAllArticles", () => {
    it("returns summaries without content or toc by default", () => {
      const articles = getAllArticles();
      expect(articles).toHaveLength(2);
      expect(articles[0].slug).toBe("test-article-1");
      expect(articles[0]).not.toHaveProperty("content");
      expect(articles[0]).not.toHaveProperty("toc");
    });

    it("includes toc when includeToc is requested for deep search", () => {
      const articles = getAllArticles({ includeToc: true });
      expect(articles[0].toc).toEqual([{ id: "intro", text: "1. Intro", depth: 2 }]);
    });

    it("preserves article metadata", () => {
      const articles = getAllArticles();
      expect(articles[0].title).toBe("Test Article 1");
      expect(articles[0].category).toBe("Test");
      expect(articles[0].excerpt).toBe("Test excerpt 1");
    });
  });

  describe("getArticleSummaryBySlug & getArticleBySlug", () => {
    it("returns summary synchronously without loading HTML content", () => {
      const summary = getArticleSummaryBySlug("test-article-1");
      expect(summary?.title).toBe("Test Article 1");
      expect(summary).not.toHaveProperty("content");
    });

    it("returns full article by slug", async () => {
      const article = await getArticleBySlug("test-article-1");
      expect(article).not.toBeNull();
      expect(article?.slug).toBe("test-article-1");
      expect(article?.content).toBe("<p>Full content 1</p>");
    });

    it("returns null for non-existent slug", async () => {
      const article = await getArticleBySlug("non-existent");
      expect(article).toBeNull();
    });
  });

  describe("getAllArticleSlugs", () => {
    it("returns all article slugs in order", () => {
      const slugs = getAllArticleSlugs();
      expect(slugs).toEqual(["test-article-1", "test-article-2"]);
    });
  });
});
