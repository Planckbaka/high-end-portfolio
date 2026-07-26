<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# lib

## Purpose
Utility functions, animation definitions, markdown processing, and pre-generated articles data. Core shared logic used across the application.

## Key Files
| File | Description |
|------|-------------|
| `utils.ts` | `cn()` utility (clsx + tailwind-merge), general helpers |
| `animations.ts` | Framer Motion animation variants and transition configs |
| `markdown.ts` | Markdown-to-HTML processing using unified/remark/rehype pipeline |
| `articles-data.json` | Pre-rendered article HTML generated at build time by `scripts/generate-articles-data.mjs` |
| `smooth-scroll.tsx` | Lenis smooth scroll provider component |
| `error-logger.ts` | Error logging utility |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `__tests__/` | Unit tests for utils, animations, and markdown modules |

## For AI Agents

### Working In This Directory
- `articles-data.json` is auto-generated — never edit manually; run `npm run generate:articles` to regenerate
- `cn()` from `utils.ts` is the standard way to merge Tailwind classes
- `animations.ts` exports named animation variants (e.g., `fadeIn`, `slideIn`) used by components
- `markdown.ts` processes article content at build time with Shiki syntax highlighting
- `smooth-scroll.tsx` wraps the app with Lenis for smooth scrolling behavior

### Testing Requirements
- Tests in `__tests__/` — run via `npm test`
- `utils.test.ts`, `animations.test.ts`, `markdown.test.ts`

## Dependencies

### Internal
- `src/types/` — TypeScript interfaces

### External
- `clsx` + `tailwind-merge` — className utilities
- `framer-motion` — animation types
- `lenis` — smooth scrolling
- `unified`/`remark`/`rehype`/`shiki` — markdown pipeline

<!-- MANUAL: Custom project notes can be added below -->
