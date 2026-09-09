// Inspect static HTML, independent of client hydration or SPA navigation.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { execFileSync } from "node:child_process";
import matter from "gray-matter";
const articles = JSON.parse(await fs.readFile("src/lib/articles-data.json", "utf8"));
const withoutScripts = (html) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
for (const article of articles) {
  const html = await fs.readFile(`.next/server/app/articles/${article.slug}.html`, "utf8");
  const readable = withoutScripts(html);
  assert(readable.includes('class="prose"'), `${article.slug}: body must exist without JS`);
  for (const heading of article.toc) assert(readable.includes(`id="${heading.id}"`));
  assert(readable.includes(`/articles/${article.slug}"`), `${article.slug}: canonical absent`);
  assert(!readable.includes("Loading article"));
  const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(
    (match) => JSON.parse(match[1])
  );
  assert(jsonLd.some((item) => item["@type"] === "BlogPosting" && item.dateModified));
}
for (const route of ["about", "projects", "contact", "articles"]) {
  const html = await fs.readFile(`.next/server/app/${route}.html`, "utf8");
  assert(
    new RegExp(`<link rel="canonical" href="https://[^\"]+/${route}"`).test(html),
    `${route}: canonical`
  );
}
const listing = withoutScripts(await fs.readFile(".next/server/app/articles.html", "utf8"));
for (const article of articles)
  assert(listing.includes(`/articles/${article.slug}`), "No-JS listing must expose every article");
const originalFiles = execFileSync("git", ["ls-tree", "--name-only", "HEAD", "content/articles/"])
  .toString()
  .trim()
  .split("\n")
  .filter((file) => file.endsWith(".md") && !file.endsWith("AGENTS.md"));
let preserved = 0;
for (const file of originalFiles) {
  const original = matter(execFileSync("git", ["show", `HEAD:${file}`]).toString()).data;
  if (!original.title) continue;
  const current = matter(await fs.readFile(file, "utf8")).data;
  assert.equal(String(current.date), String(original.date), `${file}: original date changed`);
  preserved++;
}
assert.equal(preserved, 12);
console.log(
  `${articles.length} server-rendered articles, canonical metadata, no-JS listing and ${preserved} original dates verified.`
);
