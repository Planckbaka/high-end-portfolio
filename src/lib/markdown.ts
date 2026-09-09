import type { Article, ArticleSummary } from "@/types";
import articlesDataJson from "./articles-data.json";
const articlesData = (articlesDataJson as Article[]).filter((article) => !article.draft);
export async function getAllArticles(): Promise<ArticleSummary[]> {
  return articlesData.map((article) => {
    const { content: _content, toc: _toc, ...summary } = article;
    void _content;
    void _toc;
    return summary;
  });
}
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return articlesData.find((article) => article.slug === slug) || null;
}
export function getAllArticleSlugs(): string[] {
  return articlesData.map((article) => article.slug);
}
