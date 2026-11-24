import type { Article, ArticleSummary } from "@/types";
import {
  renderFeed as renderFeedCore,
  sanitizeRssHtml as sanitizeRssHtmlCore,
  stripRssNoiseElements as stripRssNoiseElementsCore,
} from "./feed-core.mjs";

export type FeedArticleInput = ArticleSummary & { content?: Article["content"] };

export function stripRssNoiseElements(html: string, targetClasses?: string[]): string {
  return stripRssNoiseElementsCore(html, targetClasses);
}

export function sanitizeRssHtml(
  html: string,
  siteUrl: string,
  slug: string,
  papers?: ArticleSummary["papers"]
): string {
  return sanitizeRssHtmlCore(html, siteUrl, slug, papers);
}

export function renderFeed(
  articles: FeedArticleInput[],
  site: { url: string; title: string; description: string }
): string {
  return renderFeedCore(articles, site);
}
