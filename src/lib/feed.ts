import type { ArticleSummary } from "@/types";
const escapeXml = (value: string) =>
  value.replace(
    /[<>&"']/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]!
  );
export function renderFeed(
  articles: ArticleSummary[],
  site: { url: string; title: string; description: string }
) {
  const published = articles
    .filter((a) => !a.draft)
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  const latest = published
    .map((a) => a.updatedAt || a.date)
    .sort()
    .at(-1);
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
<title>${escapeXml(site.title)}</title><link>${escapeXml(site.url)}</link>
<description>${escapeXml(site.description)}</description><language>en</language>
<atom:link href="${escapeXml(site.url)}/feed.xml" rel="self" type="application/rss+xml"/>
${latest ? `<lastBuildDate>${new Date(latest + "T00:00:00Z").toUTCString()}</lastBuildDate>` : ""}
${published
  .map((a) => {
    const url = escapeXml(`${site.url}/articles/${a.slug}`);
    return `<item><title>${escapeXml(a.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><description>${escapeXml(a.excerpt)}</description><pubDate>${new Date(a.date + "T00:00:00Z").toUTCString()}</pubDate><category>${escapeXml(a.category)}</category></item>`;
  })
  .join("\n")}
</channel></rss>`;
}
