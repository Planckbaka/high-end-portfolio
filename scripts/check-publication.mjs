// Inspect static HTML, independent of client hydration or SPA navigation.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import matter from "gray-matter";

const articles = JSON.parse(await fs.readFile("src/lib/articles-index.json", "utf8"));
const labsManifest = JSON.parse(await fs.readFile("src/lib/labs-data/manifest.json", "utf8"));
const withoutScripts = (html) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");

for (const article of articles) {
  const html = await fs.readFile(`.next/server/app/articles/${article.slug}.html`, "utf8");
  const readable = withoutScripts(html);
  assert(readable.includes('class="prose"'), `${article.slug}: body must exist without JS`);
  for (const heading of article.toc) assert(readable.includes(`id="${heading.id}"`));
  assert(readable.includes(`/articles/${article.slug}"`), `${article.slug}: canonical absent`);
  assert(readable.includes('name="citation_title"'), `${article.slug}: Zotero citation meta absent`);
  assert(!readable.includes("Loading article"));
  const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(
    (match) => JSON.parse(match[1])
  );
  assert(jsonLd.some((item) => item["@type"] === "BlogPosting" && item.dateModified));
}

for (const route of ["about", "projects", "contact", "articles", "labs"]) {
  const html = await fs.readFile(`.next/server/app/${route}.html`, "utf8");
  assert(
    new RegExp(`<link rel="canonical" href="https://[^"]+/${route}"`).test(html),
    `${route}: canonical`
  );
}

for (const lab of labsManifest.labs) {
  const html = await fs.readFile(`.next/server/app/${lab.labPath}.html`, "utf8");
  const readable = withoutScripts(html);
  assert(
    readable.includes('class="lab-file-panel"'),
    `${lab.labPath}: lab source files must exist without JS`
  );
  assert(
    new RegExp(`<link rel="canonical" href="https://[^"]+/${lab.labPath}"`).test(html),
    `${lab.labPath}: canonical`
  );
}

const listing = withoutScripts(await fs.readFile(".next/server/app/articles.html", "utf8"));
for (const article of articles)
  assert(listing.includes(`/articles/${article.slug}`), "No-JS listing must expose every article");

// Immutable pre-rebuild dates also work in CI's shallow checkout, after new articles commit.
const { dates } = JSON.parse(await fs.readFile("scripts/original-article-dates.json", "utf8"));
let preserved = 0;
for (const [file, originalDate] of Object.entries(dates)) {
  const current = matter(await fs.readFile(file, "utf8")).data;
  assert.equal(String(current.date), originalDate, `${file}: original date changed`);
  preserved++;
}
assert.equal(preserved, 12);

console.log(
  `${articles.length} server-rendered articles, ${labsManifest.labs.length} interactive lab pages, Zotero & canonical metadata, no-JS listing and ${preserved} original dates verified.`
);
