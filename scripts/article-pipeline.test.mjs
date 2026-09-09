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
test("HTML is sanitized and duplicate heading anchors are unique", async () => {
  const result = await renderArticle(
    "## Same\n\n## Same\n\n<script>alert(1)</script>\n\n[bad](javascript:alert(1))"
  );
  assert.deepEqual(
    result.toc.map((h) => h.id),
    ["same", "same-1"]
  );
  assert.ok(!result.content.includes("<script"));
  assert.ok(!result.content.includes('href="javascript:'));
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
test("real PostCSS output contains page and theme rules", async () => {
  const file = "src/app/globals.css";
  const result = await postcss([tailwind()]).process(await fs.readFile(file, "utf8"), {
    from: file,
  });
  assert.match(result.css, /\.hero h1/);
  assert.match(result.css, /--background: #f7f6f2/);
  assert.match(result.css, /\.site-shell/);
  assert.ok(!result.css.includes("@theme inline"));
});
