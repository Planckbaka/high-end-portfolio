import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { loadArticles } from "./article-pipeline.mjs";
const articles = await loadArticles("content/articles", process.cwd());
assert.equal(articles.length, 18, "Expected twelve revised and six new articles");
assert.equal(articles.filter((a) => a.series).length, 6);
assert.equal(articles.filter((a) => a.featured).length, 3);
const paths = new Set([
  "/",
  "/articles",
  "/projects",
  "/about",
  "/contact",
  ...articles.map((a) => `/articles/${a.slug}`),
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
const generated = JSON.parse(await fs.readFile("src/lib/articles-data.json", "utf8"));
assert.deepEqual(generated, JSON.parse(JSON.stringify(articles)), "Generated content is stale");
console.log(
  "18 English articles, 6 lab links, unique headings, publication graph and generated output verified."
);
