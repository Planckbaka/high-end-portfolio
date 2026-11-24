<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# lib

## Purpose
Utility functions, markdown processing, search, feed generation, and pre-generated articles data. Core shared logic used across the application.

## Key Files
| File | Description |
|------|-------------|
| `utils.ts` | `cn()` utility (clsx + tailwind-merge), `formatDate()` |
| `markdown.ts` | Markdown-to-HTML processing using unified/remark/rehype pipeline |
| `article-search.ts` | Filtering, search, and pagination for the articles index |
| `articles-data.json` | Pre-rendered article HTML generated at build time by `scripts/generate-articles-data.mjs` |
| `series.ts` | Reliable Model Systems series helpers |
| `feed.ts` | RSS feed generation |
| `reading-position.ts` | Article scroll-position helpers |
| `contact-schema.ts` | Zod schema shared by the contact form and API route |
| `error-logger.ts` | Structured console error logging (console-only by design) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `__tests__/` | Unit tests for utils, search, feed, markdown, contact schema |

## For AI Agents

### Working In This Directory
- `articles-data.json` is auto-generated — never edit manually; run `npm run generate:articles` to regenerate
- `cn()` from `utils.ts` is the standard way to merge Tailwind classes
- `markdown.ts` processes article content at build time with Shiki syntax highlighting
- There is no animation module: motion is CSS-only by design (`docs/architecture/DESIGN_SYSTEM.md`)

### Testing Requirements
- Tests in `__tests__/` — run via `npm test`

## Dependencies

### Internal
- `src/types/` — TypeScript interfaces

### External
- `clsx` + `tailwind-merge` — className utilities
- `unified`/`remark`/`rehype`/`shiki` — markdown pipeline (build-time)

<!-- MANUAL: Custom project notes can be added below -->
