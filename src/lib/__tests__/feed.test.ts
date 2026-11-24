import { renderFeed, sanitizeRssHtml } from "../feed";
import { modelSystemsArticles, MODEL_SYSTEMS_SERIES } from "../series";
import type { ArticleSummary } from "@/types";

const a: ArticleSummary & { content?: string } = {
  id: "a",
  slug: "a",
  title: "Shapes < masks & values",
  excerpt: "A & B",
  date: "2026-09-01",
  updatedAt: "2026-09-09",
  category: "LLM",
  series: MODEL_SYSTEMS_SERIES.title,
  seriesOrder: 2,
  papers: [{ title: "FlashAttention", arxiv: "2205.14135", year: 2022, tag: "FA1" }],
  content:
    '<h2 id="sec">1. Intro<a class="heading-anchor" href="#sec">#</a></h2>' +
    '<p><img src="/images/fig.svg" alt="Figure" />' +
    '<span class="katex"><span class="katex-mathml"><math><mi>x</mi></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="mord">x</span></span></span></span>' +
    '<span class="inline-cite-wrap"><a href="#ref-1" class="inline-cite">arXiv:2205.14135</a><span class="inline-cite-card"><span>Tooltip</span></span></span>' +
    "<code>]]&gt; and ]]></code></p>",
};

it("emits valid XML with full-text content:encoded, excludes drafts and preserves publication dates", () => {
  const xml = renderFeed([a, { ...a, slug: "draft", draft: true }], {
    url: "https://example.com",
    title: "A & B",
    description: "Notes < experiments",
  });
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  expect(doc.querySelector("parsererror")).toBeNull();
  expect(doc.querySelectorAll("item")).toHaveLength(1);
  expect(doc.querySelector("item title")?.textContent).toBe(a.title);
  expect(doc.querySelector("item pubDate")?.textContent).toBe("Tue, 01 Sep 2026 00:00:00 GMT");
  expect(doc.querySelector("lastBuildDate")?.textContent).toBe("Wed, 09 Sep 2026 00:00:00 GMT");

  const encoded = doc.getElementsByTagName("content:encoded")[0]?.textContent || "";
  expect(encoded).toContain("<math><mi>x</mi></math>");
  expect(encoded).not.toContain("katex-html");
  expect(encoded).not.toContain("inline-cite-card");
  expect(encoded).not.toContain("heading-anchor");
  expect(encoded).toContain('src="https://example.com/images/fig.svg"');
  expect(encoded).toContain('href="https://example.com/articles/a#ref-1"');
  expect(encoded).toContain('id="references"');
});

it("sanitizes nested katex-html spans without breaking surrounding markup", () => {
  const cleaned = sanitizeRssHtml(a.content!, "https://example.com/", "a", a.papers);
  expect(cleaned).toContain('<span class="katex"><span class="katex-mathml"><math><mi>x</mi></math></span></span>');
  expect(cleaned).not.toContain("Tooltip");
});

it("orders published series chapters by their explicit order", () => {
  expect(
    modelSystemsArticles([
      a,
      { ...a, slug: "first", seriesOrder: 1 },
      { ...a, slug: "draft", draft: true },
    ]).map((x) => x.slug)
  ).toEqual(["first", "a"]);
});
