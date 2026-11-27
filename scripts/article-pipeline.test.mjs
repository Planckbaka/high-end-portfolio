import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import {
  loadArticles,
  validateMetadata,
  renderArticle,
  expandLabs,
  readingTime,
} from "./article-pipeline.mjs";
const metadata = {
  title: "Valid",
  date: "2026-09-09",
  category: "Go",
  excerpt: "A complete summary.",
};
test("bad metadata fails instead of silently dropping content", () => {
  for (const change of [
    { date: "2026-02-30" },
    { draft: "false" },
    { category: "Unknown" },
    { series: "A", seriesOrder: 0 },
    { labPath: "labs/../../.env" },
    { tags: "tag" },
    { related: ["fixture"] },
    { related: ["../bad"] },
  ])
    assert.throws(() => validateMetadata({ ...metadata, ...change }, "fixture"));
});
test("drafts and agent instructions never enter the publication graph", async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "portfolio-content-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const fm = (d) =>
    "---\n" +
    Object.entries(d)
      .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
      .join("\n") +
    "\n---\n## Visible\nBody";
  await fs.writeFile(path.join(root, "published.md"), fm(metadata));
  await fs.writeFile(path.join(root, "draft.md"), fm({ ...metadata, draft: true }));
  await fs.writeFile(path.join(root, "AGENTS.md"), "not an article");
  const articles = await loadArticles(root, root);
  assert.deepEqual(
    articles.map((a) => a.slug),
    ["published"]
  );
});
test("HTML is sanitized, duplicate heading anchors are unique, and h3 receives permalink anchors", async () => {
  const result = await renderArticle(
    "## Same\n\n### Subsection\n\n## Same\n\n<script>alert(1)</script>\n\n[bad](javascript:alert(1))"
  );
  assert.deepEqual(
    result.toc.map((h) => h.id),
    ["same", "subsection", "same-1"]
  );
  assert.match(result.content, /href="#subsection"/);
  assert.ok(!result.content.includes("<script"));
  assert.ok(!result.content.includes('href="javascript:'));
});
test("inline arXiv citations link to #ref-N with hover cards while code blocks stay untouched", async () => {
  const papers = [
    {
      title: "DeepSeek-V2: Mixture-of-Experts Language Model",
      arxiv: "2405.04434",
      year: 2024,
      tag: "DeepSeek-V2",
    },
  ];
  const result = await renderArticle(
    "See **DeepSeek-V2** (arXiv:2405.04434) and `arXiv:2405.04434` plus arXiv:2205.14135.",
    { papers }
  );
  assert.match(result.content, /href="#ref-1"/);
  assert.match(result.content, /inline-cite-card/);
  assert.equal(result.papers?.[0]?.firstCiteId, "cite-ref-1-1");
  assert.match(result.content, /<code>arXiv:2405\.04434<\/code>/);
  assert.match(result.content, /href="https:\/\/arxiv\.org\/abs\/2205\.14135"/);
});
test("code is highlighted at build time with two palettes", async () => {
  const result = await renderArticle("```go\nvar limit = 4\n```");
  assert.match(result.content, /shiki/);
  assert.match(result.content, /--shiki-dark/);
  assert.match(result.content, /code-toolbar/);
});
test("code snippets are extracted from actual source and traversal fails", async () => {
  const expanded = await expandLabs(
    "<!-- lab: labs/go/gateway/gateway.go#admission -->",
    process.cwd()
  );
  assert.match(expanded, /func \(g \*Gate\) Start/);
  assert.ok(!expanded.includes("func (g *Gate) Shutdown"));
  await assert.rejects(expandLabs("<!-- lab: labs/../package.json -->", process.cwd()));
});
test("reading time accounts for language rather than whitespace alone", () => {
  assert.equal(readingTime("短文"), "1 min read");
  assert.equal(readingTime("字".repeat(800)), "2 min read");
  assert.equal(readingTime("word ".repeat(440)), "2 min read");
});
test("LaTeX math and breakout figures are rendered at build time", async () => {
  const result = await renderArticle(
    "Inline $E = mc^2$ and display:\n\n$$\n\\sum_{i=1}^n x_i\n$$\n\n![Figure 1: Test caption](/images/articles/test.svg)"
  );
  assert.match(result.content, /katex/);
  assert.match(result.content, /academic-figure/);
  assert.match(result.content, /equation-row/);
  assert.match(
    result.content,
    /<figcaption class="fig-caption"><strong class="fig-label">Figure 1: <\/strong>Test caption<\/figcaption>/
  );
});
test("real PostCSS output contains page and theme rules", async () => {
  const file = "src/app/globals.css";
  const result = await postcss([tailwind()]).process(await fs.readFile(file, "utf8"), {
    from: file,
  });
  assert.match(result.css, /\.salon-hero-copy h1/);
  assert.match(result.css, /--background: #faf9f5/);
  assert.match(result.css, /\.site-shell/);
  assert.ok(!result.css.includes("@theme inline"));
});
