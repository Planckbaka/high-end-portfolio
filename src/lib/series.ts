import type { ArticleSummary } from "@/types";
export const MODEL_SYSTEMS_SERIES = {
  title: "Engineering Reliable Model Systems",
  path: "/series/reliable-model-systems",
} as const;
export function modelSystemsArticles(articles: ArticleSummary[]) {
  return articles
    .filter((a) => !a.draft && a.series === MODEL_SYSTEMS_SERIES.title)
    .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0));
}
