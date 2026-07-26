<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# articles/[slug]

## Purpose
Individual article detail page using Next.js dynamic routing. Renders pre-processed HTML content from the build-time generated articles data.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Server Component — looks up article by slug, renders HTML content |
| `ArticleClient.tsx` | Client Component — handles article page animations and interactivity |

## For AI Agents

### Working In This Directory
- `page.tsx` uses `generateStaticParams` to pre-render all article pages at build time
- Article content comes from `src/lib/articles-data.json` (already HTML, not markdown)
- If an article slug is not found, redirects or shows not-found
- The HTML content includes syntax-highlighted code blocks (processed by Shiki at build time)

### Common Patterns
- `params.slug` matches the markdown filename (without `.md` extension)
- Article metadata (title, date, category) comes from frontmatter

## Dependencies

### Internal
- `src/lib/articles-data.json` — pre-rendered article data
- `src/lib/animations.ts` — page transition animations

<!-- MANUAL: Custom project notes can be added below -->
