import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadArticles } from "./article-pipeline.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const articles = await loadArticles(path.join(root, "content/articles"), root);
await fs.writeFile(path.join(root, "src/lib/articles-data.json"), JSON.stringify(articles));
console.log(`Generated ${articles.length} published articles; drafts excluded.`);
