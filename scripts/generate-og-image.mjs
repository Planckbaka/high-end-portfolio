/**
 * Generates the static Open Graph card at public/og-image.png (1200x630).
 *
 * The site's metadata has always pointed at /og-image.png, but the file did not
 * exist — every link shared to X, LinkedIn, Slack or iMessage rendered without
 * an image. Rendering it once at build time keeps it a plain static asset, which
 * matters on Cloudflare Workers where there is no filesystem at runtime and
 * runtime image generation costs a request.
 *
 * Run via `npm run generate:og` (also wired into prebuild).
 */

import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const OUT = join(root, "public", "og-image.png");

const WIDTH = 1200;
const HEIGHT = 630;

// Mirrors the dark theme in src/app/globals.css
const BG = "#0a0a0a";
const FG = "#ededed";
const ACCENT = "#f4633a";
const MUTED = "#9e9e9e";

const escape = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const NAME = "Akiwayne";
const LOCATION = "Shanghai, China";
const STACK = "Go · Kubernetes · Next.js · Distributed Systems";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <radialGradient id="glow" cx="50%" cy="42%" r="55%">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BG}"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>

  <!-- Vertical grid lines echoing GridBackground -->
  <g stroke="${FG}" stroke-opacity="0.05" stroke-width="1">
    <line x1="96" y1="0" x2="96" y2="${HEIGHT}"/>
    <line x1="372" y1="0" x2="372" y2="${HEIGHT}"/>
    <line x1="648" y1="0" x2="648" y2="${HEIGHT}"/>
    <line x1="924" y1="0" x2="924" y2="${HEIGHT}"/>
    <line x1="1104" y1="0" x2="1104" y2="${HEIGHT}"/>
  </g>

  <!-- Eyebrow -->
  <text x="96" y="150"
        font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="22" font-weight="600" letter-spacing="6"
        fill="${FG}" fill-opacity="0.75">${escape(NAME.toUpperCase())}</text>
  <line x1="${96 + NAME.length * 19 + 24}" y1="143" x2="${96 + NAME.length * 19 + 72}" y2="143"
        stroke="${ACCENT}" stroke-width="2" stroke-opacity="0.8"/>
  <text x="${96 + NAME.length * 19 + 92}" y="150"
        font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="22" font-weight="500" letter-spacing="6"
        fill="${MUTED}">${escape(LOCATION.toUpperCase())}</text>

  <!-- Display lockup -->
  <text x="90" y="300"
        font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="132" font-weight="700" letter-spacing="-5"
        fill="${FG}">CREATIVE</text>
  <text x="90" y="416"
        font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="132" font-weight="700" letter-spacing="-5"
        fill="${FG}">DEVELOPER</text>
  <text x="90" y="532"
        font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="132" font-weight="700" letter-spacing="-5"
        fill="${FG}" fill-opacity="0.32">&amp; DESIGNER</text>

  <!-- Accent rule + stack -->
  <line x1="96" y1="576" x2="640" y2="576" stroke="url(#rule)" stroke-width="2"/>
  <text x="96" y="606"
        font-family="ui-monospace, SFMono-Regular, Menlo, monospace"
        font-size="20" letter-spacing="1"
        fill="${MUTED}">${escape(STACK)}</text>
</svg>`;

await mkdir(dirname(OUT), { recursive: true });
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(OUT);

console.log(`✓ Generated OG image: ${OUT} (${WIDTH}x${HEIGHT})`);
