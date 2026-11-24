const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

export const escapeXml = (value) =>
  String(value).replace(
    /[<>&"']/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]
  );

/**
 * Balanced HTML element remover for specific CSS classes (such as `.katex-html`,
 * `.inline-cite-card`, and `.heading-anchor`) so RSS readers without external
 * stylesheets receive clean semantic MathML and prose without duplicate text.
 */
export function stripRssNoiseElements(
  html,
  targetClasses = ["katex-html", "inline-cite-card", "heading-anchor"]
) {
  if (!html) return "";
  const classSet = new Set(targetClasses);
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9:-]*)(\s[^>]*)?>/g;
  let result = "";
  let cursor = 0;
  let skipTag = "";
  let skipDepth = 0;

  for (const match of html.matchAll(tagRegex)) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    const attrs = match[2] || "";
    const isClosing = fullTag.startsWith("</");
    const isSelfClosing = fullTag.endsWith("/>") || VOID_TAGS.has(tagName);

    if (skipDepth === 0) {
      if (!isClosing) {
        const classMatch = attrs.match(/\bclass="([^"]*)"/);
        const classes = classMatch ? classMatch[1].split(/\s+/) : [];
        if (classes.some((c) => classSet.has(c))) {
          result += html.slice(cursor, match.index);
          if (!isSelfClosing) {
            skipTag = tagName;
            skipDepth = 1;
          }
          cursor = match.index + fullTag.length;
        }
      }
    } else if (tagName === skipTag) {
      if (isClosing) {
        skipDepth -= 1;
        if (skipDepth === 0) {
          cursor = match.index + fullTag.length;
        }
      } else if (!isSelfClosing) {
        skipDepth += 1;
      }
    }
  }

  if (skipDepth === 0) {
    result += html.slice(cursor);
  }
  return result;
}

export function sanitizeRssHtml(html, siteUrl, slug, papers = []) {
  if (!html) return "";
  const cleanBase = siteUrl.replace(/\/+$/, "");
  const articleUrl = `${cleanBase}/articles/${slug}`;
  let cleaned = stripRssNoiseElements(html);

  // Convert root-relative URLs to absolute URLs and fragment links to canonical anchors
  cleaned = cleaned
    .replace(/\b(href|src)="\/(?!\/)([^"]*)"/g, (_, attr, rest) => `${attr}="${cleanBase}/${rest}"`)
    .replace(/\bhref="#([^"]*)"/g, (_, hash) => `href="${articleUrl}#${hash}"`);

  if (Array.isArray(papers) && papers.length > 0 && !cleaned.includes('id="references"')) {
    const items = papers
      .map((p, idx) => {
        const label = p.tag ? `<strong>${escapeXml(p.tag)}</strong> ` : "";
        const year = p.year ? `(${p.year}) ` : "";
        return `<li id="ref-${idx + 1}">${label}${year}<a href="https://arxiv.org/abs/${escapeXml(p.arxiv)}">${escapeXml(p.title)}</a> — arXiv:${escapeXml(p.arxiv)}</li>`;
      })
      .join("");
    cleaned += `\n<section id="references"><h2>References</h2><ol>${items}</ol></section>`;
  }

  return cleaned;
}

function wrapCdata(html) {
  return `<![CDATA[${String(html).replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;
}

export function renderFeed(articles, site) {
  const cleanUrl = site.url.replace(/\/+$/, "");
  const published = articles
    .filter((a) => !a.draft)
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  const latest = published
    .map((a) => a.updatedAt || a.date)
    .sort()
    .at(-1);
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel>
<title>${escapeXml(site.title)}</title><link>${escapeXml(cleanUrl)}</link>
<description>${escapeXml(site.description)}</description><language>en</language>
<atom:link href="${escapeXml(cleanUrl)}/feed.xml" rel="self" type="application/rss+xml"/>
${latest ? `<lastBuildDate>${new Date(latest + "T00:00:00Z").toUTCString()}</lastBuildDate>` : ""}
${published
  .map((a) => {
    const url = escapeXml(`${cleanUrl}/articles/${a.slug}`);
    const encoded =
      typeof a.content === "string" && a.content.trim()
        ? `<content:encoded>${wrapCdata(sanitizeRssHtml(a.content, cleanUrl, a.slug, a.papers))}</content:encoded>`
        : "";
    return `<item><title>${escapeXml(a.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><description>${escapeXml(a.excerpt)}</description><pubDate>${new Date(a.date + "T00:00:00Z").toUTCString()}</pubDate><category>${escapeXml(a.category)}</category>${encoded}</item>`;
  })
  .join("\n")}
</channel></rss>`;
}
