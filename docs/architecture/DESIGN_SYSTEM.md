# Editorial Design System (Cotton Paper & Letterpress Ink)

Updated 2026-11-24. `src/app/globals.css` is authoritative.

## Intent

A calm, human-centered research publication inspired by **Anthropic** (`anthropic.com`) and **Claude Overview** (`claude.com/product/overview`). Rather than dark-mode geek dashboards or heavy kinetic effects, the site treats every page like a thoughtfully typeset archival journal: warm ivory cotton paper (`#FAF9F5`), tactile oat-colored rounded islands (`#F0EEE6`), soft carbon letterpress ink (`#141413`), humanist serif typography, and fine-line ink illustrations.

## Tokens

| Role | Light (Default) | Warm Lamp Dark |
| --- | --- | --- |
| Background (Cotton Paper) | `#faf9f5` | `#141413` |
| Surface (Oat Island) | `#f0eee6` | `#1e1d1b` |
| Elevated Surface | `#e8e6dc` | `#262522` |
| Archival Plate | `#fdfcf9` | `#1a1917` |
| Foreground (Carbon Ink) | `#141413` | `#faf9f5` |
| Muted Text | `#5e5d59` | `#b0aea5` |
| Accent (Terracotta Text) | `#c6613f` | `#e0886b` |
| Signature Clay | `#d97757` | `#d97757` |
| Dormant Secondary | `#bcd1ca` (Sage) / `#6a9bcc` (Sky) | `#364943` / `#31475c` |
| Code Surface | `#f0eee6` | `#1c1b19` |

Theme selection defaults to `light` (`defaultTheme="light"`, `enableSystem={false}`) via `next-themes` using `[data-theme="dark"]`, matching Tailwind's custom `@custom-variant dark` selector.

## Typography

- **Newsreader** (`--font-display`, normal + italic, optical sizing): Display titles, section headings, wordmark, and essay titles.
- **Inter** (`--font-ui`): Calm sentence-case navigation, kickers, metadata, pills, and form controls.
- **Source Serif 4** (`--font-serif`, normal + italic): Long-form reading (`19px` / `1.8` line height), abstracts, figure captions, and bibliography.
- **JetBrains Mono** (`--font-code`): Strictly reserved for code blocks, inline code, equation numbers, and `arXiv` identifiers.

## Five-Room Homepage & Reading Sanctuary

1. **Cotton-Paper Hero**: Left `Newsreader` thesis with calm factual scope; right `24px`-rounded `#F0EEE6` frame hosting a bespoke fine-line ink topology illustration (`HeroTopologyPlate`) with a quiet Pause/Play motion toggle.
2. **Selected Reading**: 1+2 rounded oat essay cards with discipline-specific fine-line ink plates (`DisciplineInkPlate`).
3. **Monograph Dark Ink Room**: A `#141413` warm carbon island presenting the 9-chapter, 50-paper *LLM & AI Infrastructure from First Principles* monograph alongside an interactive 9-chapter contents sheet.
4. **Recent Writing**: Clean chronological book-index ledger.
5. **Companion Labs & Projects**: Three understated oat cards linking essays to the `pi-go` study and 12 runnable CPU labs.

The article reading route (`/articles/[slug]`) preserves native browser scrolling, a `760px` `Source Serif 4` prose column, a quiet `210px` sticky TOC rail, `#F0EEE6` rounded abstract/equation/code containers, `#FDFCF9` archival mounts for Matplotlib SVG figures, and ink-on-white `@media print` styling.
