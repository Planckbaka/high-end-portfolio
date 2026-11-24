import type { ArticleSummary } from "@/types";
export const MODEL_SYSTEMS_SERIES = {
  title: "Engineering Reliable Model Systems",
  path: "/series/reliable-model-systems",
} as const;
export const LLM_INFRA_SERIES = {
  title: "LLM & AI Infrastructure from First Principles",
  path: "/series/llm-ai-infra",
} as const;
export function modelSystemsArticles(articles: ArticleSummary[]) {
  return articles
    .filter((a) => !a.draft && a.series === MODEL_SYSTEMS_SERIES.title)
    .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0));
}
export function llmInfraArticles(articles: ArticleSummary[]) {
  return articles
    .filter((a) => !a.draft && a.series === LLM_INFRA_SERIES.title)
    .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0));
}
export function seriesPathForTitle(seriesTitle?: string): string {
  if (seriesTitle === LLM_INFRA_SERIES.title) return LLM_INFRA_SERIES.path;
  return MODEL_SYSTEMS_SERIES.path;
}
/*
 * Copy reads small counts as words ("six-part"), digits beyond that — one
 * source of truth so prose never drifts from the actual chapter list.
 */
const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve",
];
export function seriesChapterWord(count: number) {
  return NUMBER_WORDS[count] ?? String(count);
}
