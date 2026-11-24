import type { ArticleSummary } from "@/types";

export function escapeXml(value: string): string;
export function stripRssNoiseElements(html: string, targetClasses?: string[]): string;
export function sanitizeRssHtml(
  html: string,
  siteUrl: string,
  slug: string,
  papers?: ArticleSummary["papers"]
): string;
export function renderFeed(
  articles: Array<ArticleSummary & { content?: string }>,
  site: { url: string; title: string; description: string }
): string;
