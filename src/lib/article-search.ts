import type { ArticleSummary, PaperReference, TocEntry } from "@/types";

export const ARTICLE_CATEGORIES = ["Go", "Python", "LLM", "Systems", "Interface"];

export interface ArticleSearchMatch {
  matchedSections: TocEntry[];
  matchedPapers: PaperReference[];
}

interface ScoredArticle {
  article: ArticleSummary;
  score: number;
  index: number;
  match?: ArticleSearchMatch;
}

function scoreArticle(
  article: ArticleSummary,
  rawQuery: string,
  tokens: string[],
  index: number
): ScoredArticle | null {
  if (tokens.length === 0) {
    return { article, score: 0, index };
  }

  const titleLower = article.title.toLowerCase();
  const excerptLower = article.excerpt.toLowerCase();
  const categoryLower = article.category.toLowerCase();
  const seriesLower = (article.series || "").toLowerCase();
  const tagsLower = (article.tags || []).map((t) => t.toLowerCase());
  const tocEntries = article.toc || [];
  const paperEntries = article.papers || [];

  const fullCorpus = [
    titleLower,
    excerptLower,
    categoryLower,
    seriesLower,
    ...tagsLower,
    ...tocEntries.map((h) => h.text.toLowerCase()),
    ...paperEntries.map((p) => `${p.arxiv} ${p.tag || ""} ${p.title}`.toLowerCase()),
  ].join(" ");

  // Every query token must match somewhere in the article's metadata, headings, or papers.
  for (const token of tokens) {
    if (!fullCorpus.includes(token)) {
      return null;
    }
  }

  let score = 0;
  if (titleLower.includes(rawQuery)) score += 60;
  if (tagsLower.some((t) => t === rawQuery)) score += 45;

  for (const token of tokens) {
    if (titleLower.includes(token)) score += 25;
    if (tagsLower.some((t) => t === token)) score += 30;
    else if (tagsLower.some((t) => t.includes(token))) score += 18;
    if (categoryLower === token) score += 15;
    if (excerptLower.includes(token)) score += 8;
  }

  const matchedSections = tocEntries
    .filter((entry) => {
      const hLower = entry.text.toLowerCase();
      return tokens.some((token) => hLower.includes(token));
    })
    .slice(0, 3);
  score += matchedSections.length * 14;

  const matchedPapers = paperEntries
    .filter((paper) => {
      const pLower = `${paper.arxiv} ${paper.tag || ""} ${paper.title}`.toLowerCase();
      return tokens.some((token) => pLower.includes(token));
    })
    .slice(0, 2);
  score += matchedPapers.length * 20;

  return {
    article,
    score,
    index,
    match:
      matchedSections.length > 0 || matchedPapers.length > 0
        ? { matchedSections, matchedPapers }
        : undefined,
  };
}

export function selectArticles(articles: ArticleSummary[], params: URLSearchParams) {
  const query = (params.get("q") || "").trim().toLowerCase();
  const tokens = query ? query.split(/\s+/).filter(Boolean) : [];
  const category = params.get("category") || "";
  const series = params.get("series") || "";

  const scored: ScoredArticle[] = [];
  articles.forEach((article, index) => {
    if (category && article.category !== category) return;
    if (series && article.series !== series) return;
    const result = scoreArticle(article, query, tokens, index);
    if (result) scored.push(result);
  });

  if (tokens.length > 0) {
    scored.sort((a, b) => b.score - a.score || a.index - b.index);
  }

  const pages = Math.max(1, Math.ceil(scored.length / 8));
  const requested = Number(params.get("page") || 1);
  const page = Math.min(pages, Number.isSafeInteger(requested) && requested > 0 ? requested : 1);
  const pageSlice = scored.slice((page - 1) * 8, page * 8);

  const matches: Record<string, ArticleSearchMatch> = {};
  for (const item of pageSlice) {
    if (item.match) {
      matches[item.article.slug] = item.match;
    }
  }

  return {
    articles: pageSlice.map((item) => item.article),
    matches,
    total: scored.length,
    pages,
    page,
  };
}
