import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { loadArticles } from "./article-pipeline.mjs";

const articles = await loadArticles("content/articles", process.cwd());
assert.equal(articles.length, 27, "Expected twelve revised and fifteen series articles");
assert.equal(articles.filter((a) => a.series).length, 15);
assert.equal(articles.filter((a) => a.featured).length, 3);

const labsManifest = JSON.parse(await fs.readFile("src/lib/labs-data/manifest.json", "utf8"));
assert.equal(labsManifest.labs.length, 12, "Expected twelve companion labs");

const paths = new Set([
  "/",
  "/articles",
  "/projects",
  "/about",
  "/contact",
  "/labs",
  "/series/reliable-model-systems",
  "/series/llm-ai-infra",
  ...articles.map((a) => `/articles/${a.slug}`),
  ...labsManifest.labs.map((l) => `/${l.labPath}`),
]);

for (const article of articles) {
  assert.ok(
    !/[\u3400-\u9fff]/.test(article.content + article.title + article.excerpt),
    `${article.slug}: untranslated text`
  );
  assert.ok(!/<!-- (lab|result):/.test(article.content), `${article.slug}: unexpanded directive`);
  for (const match of article.content.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)) {
    const url = match[1].split("?")[0];
    if (!url.startsWith("/")) continue;
    if (url.startsWith("/articles/"))
      assert.ok(paths.has(url), `${article.slug}: broken article ${url}`);
    else if (!paths.has(url)) await fs.access(path.join("public", decodeURIComponent(url)));
  }
  assert.equal(new Set(article.toc.map((h) => h.id)).size, article.toc.length);
}

const generatedIndex = JSON.parse(await fs.readFile("src/lib/articles-index.json", "utf8"));
const expectedIndex = JSON.parse(
  JSON.stringify(
    articles.map(({ content: _content, ...summary }) => {
      void _content;
      return summary;
    })
  )
);
assert.deepEqual(generatedIndex, expectedIndex, "Generated articles-index.json is stale");

for (const article of articles) {
  const generatedBody = JSON.parse(
    await fs.readFile(`src/lib/articles-content/${article.slug}.json`, "utf8")
  );
  assert.equal(
    generatedBody.content,
    article.content,
    `Generated content chunk for ${article.slug} is stale`
  );
}

const feedXml = await fs.readFile("public/feed.xml", "utf8");
assert.equal((feedXml.match(/<item>/g) || []).length, articles.length, "RSS item count mismatch");
assert.match(feedXml, /<content:encoded>/, "RSS must include full-text content:encoded");
assert.ok(!feedXml.includes("katex-html"), "RSS must strip .katex-html duplicate spans");

console.log(
  "27 English articles, split index/content bundles, 12 interactive labs, full-text MathML RSS, and publication graph verified."
);
