/**
 * Generates the placeholder artwork for the "Selected Works" cards.
 *
 * The originals were near-black radial gradients (#1a1a1a → #333) with a faint
 * circle. Against the near-black theme, behind a grayscale filter and a
 * background-tinted overlay, they read as failed image loads rather than as
 * artwork — the flagship section of the page looked broken.
 *
 * These are geometric compositions in the site's vermilion, distinct per
 * project, and legible in both themes. They also give the grayscale → colour
 * hover transition something to actually reveal.
 *
 * REPLACE THESE with real project screenshots when available:
 *   public/images/project-{1..4}.svg
 *
 * Run via `npm run generate:placeholders`.
 */

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "images");

const W = 1200;
const H = 900;

const INK = "#0d0d0d";
const ACCENT = "#f4633a";
const PAPER = "#ebe8e3";

/** Shared scaffolding: ink field, hairline grid, film-grain-ish texture. */
const frame = (body, { seed = 1 } = {}) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="field${seed}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#121212"/>
      <stop offset="100%" stop-color="${INK}"/>
    </linearGradient>
    <radialGradient id="warm${seed}" cx="72%" cy="22%" r="70%">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#field${seed})"/>
  <rect width="${W}" height="${H}" fill="url(#warm${seed})"/>

  <!-- Hairline grid, echoing GridBackground -->
  <g stroke="${PAPER}" stroke-opacity="0.06" stroke-width="1">
    ${[1, 2, 3, 4, 5]
      .map((i) => `<line x1="${(W / 6) * i}" y1="0" x2="${(W / 6) * i}" y2="${H}"/>`)
      .join("\n    ")}
    ${[1, 2, 3]
      .map((i) => `<line x1="0" y1="${(H / 4) * i}" x2="${W}" y2="${(H / 4) * i}"/>`)
      .join("\n    ")}
  </g>

  ${body}
</svg>`;

/** 1 — Concentric arcs: "Golden Canon" / editorial grid study. */
const lumina = frame(
  `
  <g fill="none" stroke="${ACCENT}" stroke-width="2">
    ${[120, 220, 320, 420]
      .map(
        (r, i) =>
          `<circle cx="760" cy="430" r="${r}" stroke-opacity="${(0.9 - i * 0.2).toFixed(2)}"/>`
      )
      .join("\n    ")}
  </g>
  <g stroke="${PAPER}" stroke-opacity="0.5" stroke-width="1.5">
    <line x1="180" y1="700" x2="1020" y2="700"/>
    <line x1="180" y1="700" x2="180" y2="620"/>
    <line x1="1020" y1="700" x2="1020" y2="620"/>
  </g>
  <rect x="180" y="180" width="180" height="180" fill="${ACCENT}" fill-opacity="0.9"/>
`,
  { seed: 1 }
);

/** 2 — Stacked bars: "12 Column" / branding system. */
const apex = frame(
  `
  <g>
    ${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => {
        const x = 200 + i * 104;
        const h = 90 + ((i * 137) % 5) * 92;
        const isAccent = i % 3 === 1;
        return `<rect x="${x}" y="${740 - h}" width="56" height="${h}" fill="${
          isAccent ? ACCENT : PAPER
        }" fill-opacity="${isAccent ? 0.95 : 0.16}"/>`;
      })
      .join("\n    ")}
  </g>
  <line x1="160" y1="740" x2="1040" y2="740" stroke="${PAPER}" stroke-opacity="0.45" stroke-width="2"/>
  <circle cx="960" cy="200" r="64" fill="none" stroke="${ACCENT}" stroke-width="2"/>
`,
  { seed: 2 }
);

/** 3 — Nested rotated squares: "Modular" / systems + services. */
const vortex = frame(
  `
  <g transform="translate(600 450)">
    ${[0, 1, 2, 3, 4]
      .map((i) => {
        const s = 460 - i * 84;
        const rot = i * 12;
        const accent = i === 0 || i === 3;
        return `<rect x="${-s / 2}" y="${-s / 2}" width="${s}" height="${s}" transform="rotate(${rot})" fill="none" stroke="${
          accent ? ACCENT : PAPER
        }" stroke-opacity="${accent ? 0.85 : 0.2}" stroke-width="2"/>`;
      })
      .join("\n    ")}
    <rect x="-28" y="-28" width="56" height="56" fill="${ACCENT}"/>
  </g>
`,
  { seed: 3 }
);

/** 4 — Baseline rhythm: "Baseline" / art direction. */
const echo = frame(
  `
  <g stroke="${PAPER}" stroke-opacity="0.14" stroke-width="1">
    ${Array.from({ length: 16 }, (_, i) => `<line x1="160" y1="${150 + i * 40}" x2="1040" y2="${150 + i * 40}"/>`).join("\n    ")}
  </g>
  <g fill="${ACCENT}">
    <rect x="160" y="270" width="420" height="40" fill-opacity="0.95"/>
    <rect x="160" y="390" width="640" height="40" fill-opacity="0.55"/>
    <rect x="160" y="510" width="280" height="40" fill-opacity="0.3"/>
  </g>
  <circle cx="920" cy="620" r="110" fill="none" stroke="${PAPER}" stroke-opacity="0.35" stroke-width="2"/>
  <circle cx="920" cy="620" r="10" fill="${ACCENT}"/>
`,
  { seed: 4 }
);

const files = [
  ["project-1.svg", lumina],
  ["project-2.svg", apex],
  ["project-3.svg", vortex],
  ["project-4.svg", echo],
];

await mkdir(OUT_DIR, { recursive: true });

for (const [name, svg] of files) {
  await writeFile(join(OUT_DIR, name), svg.trim() + "\n", "utf8");
  console.log(`✓ ${name}`);
}

console.log(`✓ Wrote ${files.length} placeholders to ${OUT_DIR}`);
