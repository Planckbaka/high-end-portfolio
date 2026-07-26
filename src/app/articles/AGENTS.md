<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# articles

## Purpose
Article listing page and individual article detail pages. Uses Next.js dynamic routing with `[slug]` for individual articles.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Server Component — article list page, imports ArticlesClient |
| `ArticlesClient.tsx` | Client Component — renders article grid with animations |
| `loading.tsx` | Loading state for article list |
| `error.tsx` | Error boundary for article list (Client Component) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `[slug]/` | Dynamic article detail page (see `[slug]/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- `page.tsx` reads from `src/lib/articles-data.json` (generated at build time)
- `ArticlesClient.tsx` handles interactive article card hover effects and animations
- `error.tsx` must be a Client Component (Next.js requirement)
- The `[slug]` directory handles individual article rendering with `generateStaticParams`

### Common Patterns
- Server page fetches data → passes to Client Component for rendering
- Article slugs are derived from markdown filenames

## Dependencies

### Internal
- `src/lib/articles-data.json` — pre-rendered article data
- `src/components/ui/ArticleSkeleton.tsx` — loading skeleton
- `src/lib/animations.ts` — Framer Motion variants
- `src/lib/utils.ts` — `cn()` utility

<!-- MANUAL: Custom project notes can be added below -->
