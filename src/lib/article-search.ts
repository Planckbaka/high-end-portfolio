import type { ArticleSummary } from "@/types";
export const ARTICLE_CATEGORIES = ["Go", "Python", "LLM", "Systems", "Interface"];
export function selectArticles(articles: ArticleSummary[], params: URLSearchParams) {
  const query = (params.get("q") || "").trim().toLowerCase();
  const category = params.get("category") || "";
  const series = params.get("series") || "";
  const filtered = articles.filter(
    (article) =>
      (!category || article.category === category) &&
      (!series || article.series === series) &&
      (!query ||
        [article.title, article.excerpt, ...(article.tags || [])]
          .join(" ")
          .toLowerCase()
          .includes(query))
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 8));
  const requested = Number(params.get("page") || 1);
  const page = Math.min(pages, Number.isSafeInteger(requested) && requested > 0 ? requested : 1);
  return {
    articles: filtered.slice((page - 1) * 8, page * 8),
    total: filtered.length,
    pages,
    page,
  };
}
