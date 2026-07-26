/**
 * Generates the Open Graph cards:
 *   public/og-image.png                  — site-wide card
 *   public/og/articles/<slug>.png        — one per article
 *
 * The site's metadata has always pointed at /og-image.png, but the file did not
 * exist — every link shared to X, LinkedIn, Slack or iMessage rendered without
 * an image. Rendering these at build time keeps them plain static assets, which
 * matters on Cloudflare Workers where there is no filesystem at runtime and
 * runtime image generation costs a request.
 *
 * Run via `npm run generate:og` (also wired into prebuild, after
 * generate:articles so the article list is current).
 */

import { mkdir, readFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const PUBLIC = join(root, "public");
const ARTICLE_OUT_DIR = join(PUBLIC, "og", "articles");
const ARTICLES_JSON = join(root, "src", "lib", "articles-data.json");

const WIDTH = 1200;
const HEIGHT = 630;

// Mirrors the dark theme in src/app/globals.css
const BG = "#0a0a0a";
const FG = "#ededed";
const ACCENT = "#f4633a";
const MUTED = "#9e9e9e";

const SANS = "Helvetica Neue, Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

const escape = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const NAME = "Akiwayne";
const LOCATION = "Shanghai, China";
const STACK = "Go · Kubernetes · Next.js · Distributed Systems";

/** Shared backdrop: ink field, warm accent bloom, column rules. */
const backdrop = (seed) => `
  <defs>
    <radialGradient id="glow${seed}" cx="50%" cy="42%" r="55%">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="rule${seed}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BG}"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow${seed})"/>

  <g stroke="${FG}" stroke-opacity="0.05" stroke-width="1">
    <line x1="96" y1="0" x2="96" y2="${HEIGHT}"/>
    <line x1="372" y1="0" x2="372" y2="${HEIGHT}"/>
    <line x1="648" y1="0" x2="648" y2="${HEIGHT}"/>
    <line x1="924" y1="0" x2="924" y2="${HEIGHT}"/>
    <line x1="1104" y1="0" x2="1104" y2="${HEIGHT}"/>
  </g>
`;

/* ---------------------------------------------------------------- site card */

const siteSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  ${backdrop("s")}

  <text x="96" y="150" font-family="${SANS}" font-size="22" font-weight="600"
        letter-spacing="6" fill="${FG}" fill-opacity="0.75">${escape(NAME.toUpperCase())}</text>
  <line x1="${96 + NAME.length * 19 + 24}" y1="143" x2="${96 + NAME.length * 19 + 72}" y2="143"
        stroke="${ACCENT}" stroke-width="2" stroke-opacity="0.8"/>
  <text x="${96 + NAME.length * 19 + 92}" y="150" font-family="${SANS}" font-size="22"
        font-weight="500" letter-spacing="6" fill="${MUTED}">${escape(LOCATION.toUpperCase())}</text>

  <text x="90" y="300" font-family="${SANS}" font-size="132" font-weight="700"
        letter-spacing="-5" fill="${FG}">CREATIVE</text>
  <text x="90" y="416" font-family="${SANS}" font-size="132" font-weight="700"
        letter-spacing="-5" fill="${FG}">DEVELOPER</text>
  <text x="90" y="532" font-family="${SANS}" font-size="132" font-weight="700"
        letter-spacing="-5" fill="${FG}" fill-opacity="0.32">&amp; DESIGNER</text>

  <line x1="96" y1="576" x2="640" y2="576" stroke="url(#rules)" stroke-width="2"/>
  <text x="96" y="606" font-family="${MONO}" font-size="20" letter-spacing="1"
        fill="${MUTED}">${escape(STACK)}</text>
</svg>`;

/* ------------------------------------------------------------- article card */

/**
 * Full-width scripts: CJK ideographs, kana, Hangul, and CJK punctuation.
 * Written with explicit escapes so the ranges survive any re-encoding of
 * this file.
 */
const WIDE =
  /[\u1100-\u115F\u2E80-\uA4CF\uA960-\uA97F\uAC00-\uD7A3\uF900-\uFAFF\uFE10-\uFE19\uFE30-\uFE6F\uFF00-\uFF60\uFFE0-\uFFE6]|[\u{20000}-\u{3FFFD}]/u;

/**
 * Greedy wrapper measured in *display columns*: CJK glyphs occupy roughly a full
 * em where Latin averages about half, and these titles mix both. Counting raw
 * characters overflows the card on Chinese titles and underfills it on English
 * ones.
 */
/** Per-glyph advance as a fraction of the font size, deliberately generous. */
const advance = (ch) => (WIDE.test(ch) ? 1.02 : 0.58);
const estimate = (text, size) =>
  [...text].reduce((n, c) => n + advance(c), 0) * size;

/**
 * Greedy wrapper measured in *display columns*: CJK glyphs occupy roughly a full
 * em where Latin averages a little over half, and these titles mix both.
 * Counting raw characters overflows the card on Chinese titles and underfills it
 * on English ones.
 */
function wrapByWidth(text, maxUnits) {
  const lines = [];
  let line = "";
  let units = 0;

  for (const ch of String(text).trim()) {
    // Latin words should not be split mid-token; break at the last space.
    if (units + advance(ch) > maxUnits) {
      const breakAt = /\s/.test(ch) ? -1 : line.lastIndexOf(" ");
      if (breakAt > maxUnits * 0.35) {
        lines.push(line.slice(0, breakAt));
        line = line.slice(breakAt + 1);
        units = [...line].reduce((n, c) => n + advance(c), 0);
      } else {
        lines.push(line);
        line = "";
        units = 0;
      }
      if (/\s/.test(ch)) continue;
    }
    line += ch;
    units += advance(ch);
  }
  if (line.trim()) lines.push(line);
  return lines;
}

function articleSvg({ title, category, date, readingTime }, seed) {
  const raw = String(title).trim();
  const LEFT = 92;
  const AVAILABLE = WIDTH - LEFT - 96;

  // Shrink the type as the title grows so long titles still fit the card.
  const weight = [...raw].reduce((n, c) => n + advance(c), 0);
  const size = weight > 30 ? 58 : weight > 20 ? 68 : weight > 12 ? 84 : 100;
  const maxUnits = (AVAILABLE / size) * 0.98;
  const lines = wrapByWidth(raw, maxUnits).slice(0, 4);

  const lineHeight = Math.round(size * 1.24);
  // Vertically centre the title block between the eyebrow and the footer rule.
  const blockTop = 190;
  const blockSpace = 320;
  const startY =
    blockTop + Math.max(0, (blockSpace - lines.length * lineHeight) / 2) + size;

  const meta = [category, date, readingTime].filter(Boolean).join("   ·   ");

  /*
   * Hard-clamp each line with textLength.
   *
   * The rasteriser (librsvg via sharp) has no Helvetica Neue and no bundled CJK
   * face, so it substitutes whatever the host provides. Those fallbacks are
   * wider than the metrics any estimate here assumes, which pushed long Chinese
   * titles clean off the right edge. textLength makes the rendered width
   * authoritative instead of advisory, so a card can never overflow regardless
   * of which font the host resolves.
   */
  const renderLine = (line, i) => {
    const est = estimate(line, size);
    const clamp =
      est > AVAILABLE
        ? ` textLength="${AVAILABLE}" lengthAdjust="spacingAndGlyphs"`
        : "";
    return `<text x="${LEFT}" y="${startY + i * lineHeight}" font-family="${SANS}" font-size="${size}" font-weight="700" letter-spacing="-1.5" fill="${FG}"${clamp}>${escape(line)}</text>`;
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  ${backdrop(seed)}

  <text x="96" y="132" font-family="${SANS}" font-size="21" font-weight="700"
        letter-spacing="5" fill="${ACCENT}">${escape(String(category).toUpperCase())}</text>

  ${lines.map(renderLine).join("\n  ")}

  <line x1="96" y1="548" x2="700" y2="548" stroke="url(#rule${seed})" stroke-width="2"/>

  <text x="96" y="586" font-family="${MONO}" font-size="19" letter-spacing="1"
        fill="${MUTED}">${escape(meta)}</text>

  <text x="${WIDTH - 96}" y="586" text-anchor="end" font-family="${SANS}" font-size="19"
        font-weight="600" letter-spacing="4" fill="${FG}" fill-opacity="0.6">${escape(NAME.toUpperCase())}</text>
</svg>`;
}

/* -------------------------------------------------------------------- build */

await mkdir(PUBLIC, { recursive: true });
await sharp(Buffer.from(siteSvg))
  .png({ compressionLevel: 9 })
  .toFile(join(PUBLIC, "og-image.png"));
console.log(`✓ og-image.png (${WIDTH}x${HEIGHT})`);

let articles = [];
try {
  articles = JSON.parse(await readFile(ARTICLES_JSON, "utf8"));
} catch {
  console.warn("! articles-data.json not found — run generate:articles first");
}

if (Array.isArray(articles) && articles.length > 0) {
  // Rebuild from scratch so cards for deleted articles do not linger.
  await rm(ARTICLE_OUT_DIR, { recursive: true, force: true });
  await mkdir(ARTICLE_OUT_DIR, { recursive: true });

  let i = 0;
  for (const article of articles) {
    if (!article?.slug) continue;
    const svg = articleSvg(article, `a${i++}`);
    await sharp(Buffer.from(svg))
      .png({ compressionLevel: 9 })
      .toFile(join(ARTICLE_OUT_DIR, `${article.slug}.png`));
  }
  console.log(`✓ ${i} per-article OG cards → public/og/articles/`);
}
