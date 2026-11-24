import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "public/og/articles");
const articles = JSON.parse(
  await fs.readFile(path.join(root, "src/lib/articles-index.json"), "utf8")
).filter((article) => !article.draft);
const escape = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
function lines(title, max = 34) {
  const result = [];
  let line = "";
  for (const word of title.split(/\s+/)) {
    if (line.length + word.length + 1 > max && line) {
      result.push(line);
      line = word;
    } else line += (line ? " " : "") + word;
  }
  if (line) result.push(line);
  return result;
}
function card(title, label, footer) {
  const wrapped = lines(title);
  const size = wrapped.length > 4 ? 46 : 56;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#f7f6f2"/><rect x="64" y="58" width="42" height="42" rx="4" fill="#a33f2e"/><text x="74" y="87" font-family="Helvetica,Arial,sans-serif" font-size="30" fill="white">a.</text><text x="125" y="87" font-family="Helvetica,Arial,sans-serif" font-size="24" fill="#232521">akiwayne / engineering notes</text><line x1="64" y1="126" x2="1136" y2="126" stroke="#d8d9d0"/><text x="64" y="183" font-family="Menlo,monospace" font-size="17" fill="#a33f2e">${escape(label.toUpperCase())}</text>${wrapped.map((line, index) => `<text x="60" y="${262 + index * (size + 10)}" font-family="Helvetica,Arial,sans-serif" font-size="${size}" font-weight="500" letter-spacing="-1.5" fill="#232521">${escape(line)}</text>`).join("")}<line x1="64" y1="552" x2="1136" y2="552" stroke="#d8d9d0"/><text x="64" y="592" font-family="Menlo,monospace" font-size="17" fill="#62665e">${escape(footer)}</text><text x="1102" y="592" font-family="Helvetica,Arial,sans-serif" font-size="24" fill="#a33f2e">↗</text></svg>`;
}
await fs.mkdir(output, { recursive: true });
const expected = new Set(articles.map((article) => `${article.slug}.png`));
for (const file of await fs.readdir(output))
  if (file.endsWith(".png") && !expected.has(file)) await fs.unlink(path.join(output, file));
await sharp(
  Buffer.from(
    card(
      "Building systems. Understanding what’s underneath.",
      "Backend & AI engineering",
      "Go · Python · Model inference"
    )
  )
)
  .png()
  .toFile(path.join(root, "public/og-image.png"));
for (const article of articles)
  await sharp(
    Buffer.from(
      card(article.title, article.category, `${article.date} / ${article.readingTime} / Akiwayne`)
    )
  )
    .png()
    .toFile(path.join(output, `${article.slug}.png`));
console.log(`Generated site card and ${articles.length} article cards.`);
