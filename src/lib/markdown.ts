import type { Article, ArticleSummary } from "@/types";
import articlesIndexJson from "./articles-index.json";
import { articleContentLoaders } from "./articles-content";

const articlesIndex = (articlesIndexJson as ArticleSummary[]).filter((article) => !article.draft);

// Listing queries stay synchronous so index routes inline their content into
// static HTML with zero streaming fallback shell and without pulling full
// article HTML bodies into listing chunks.
export function getAllArticles(options?: { includeToc?: boolean }): ArticleSummary[] {
  const includeToc = options?.includeToc === true;
  return articlesIndex.map((article) => {
    if (includeToc) return article;
    const { toc: _toc, ...summary } = article;
    void _toc;
    return summary;
  });
}

export function getArticleSummaryBySlug(slug: string): ArticleSummary | null {
  return articlesIndex.find((article) => article.slug === slug) || null;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const summary = getArticleSummaryBySlug(slug);
  const loader = articleContentLoaders[slug];
  if (!summary || !loader) return null;
  const loaded = await loader();
  return {
    ...summary,
    content: loaded.default.content,
  };
}

export function getAllArticleSlugs(): string[] {
  return articlesIndex.map((article) => article.slug);
}
