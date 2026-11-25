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
  const size = wrapped.length > 4 ? 44 : 54;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#faf9f5"/>
  <rect x="40" y="40" width="1120" height="550" rx="24" fill="#f0eee6" stroke="#e3e0d5" stroke-width="1.5"/>
  <circle cx="96" cy="96" r="7" fill="#d97757"/>
  <text x="116" y="103" font-family="Georgia,'Times New Roman',serif" font-size="26" fill="#141413">Akiwayne</text>
  <line x1="88" y1="136" x2="1112" y2="136" stroke="#e3e0d5" stroke-width="1"/>
  <text x="88" y="186" font-family="Helvetica,Arial,sans-serif" font-size="18" font-weight="500" fill="#c6613f">${escape(label)}</text>
  ${wrapped.map((line, index) => `<text x="88" y="${258 + index * (size + 12)}" font-family="Georgia,'Times New Roman',serif" font-size="${size}" font-weight="400" letter-spacing="-1.0" fill="#141413">${escape(line)}</text>`).join("")}
  <line x1="88" y1="516" x2="1112" y2="516" stroke="#e3e0d5" stroke-width="1"/>
  <text x="88" y="554" font-family="Helvetica,Arial,sans-serif" font-size="17" fill="#5e5d59">${escape(footer)}</text>
  <text x="1088" y="554" font-family="Georgia,'Times New Roman',serif" font-size="22" fill="#c6613f">→</text>
</svg>`;
}
await fs.mkdir(output, { recursive: true });
const expected = new Set(articles.map((article) => `${article.slug}.png`));
for (const file of await fs.readdir(output))
  if (file.endsWith(".png") && !expected.has(file)) await fs.unlink(path.join(output, file));
await sharp(
  Buffer.from(
    card(
      "Thinking clearly about systems, models, and what lies beneath.",
      "Notes on systems & machine intelligence",
      "Essays · Research Monograph · Reproducible CPU Labs"
    )
  )
)
  .png()
  .toFile(path.join(root, "public/og-image.png"));
for (const article of articles)
  await sharp(
    Buffer.from(
      card(article.title, article.category, `${article.date} · ${article.readingTime} · Akiwayne`)
    )
  )
    .png()
    .toFile(path.join(output, `${article.slug}.png`));
console.log(`Generated site card and ${articles.length} article cards.`);
