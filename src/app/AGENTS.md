<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# app

## Purpose
Next.js App Router directory. Contains pages, layouts, API routes, and error/loading states. Each route follows the Server Component wrapper → Client Component pattern.

## Key Files
| File | Description |
|------|-------------|
| `layout.tsx` | Root layout — fonts, theme provider, error boundary, navbar/footer, JSON-LD |
| `page.tsx` | Home page — Hero, featured writing, series banner, project list, recent notes |
| `error.tsx` | Root route error boundary (reset + home link) |
| `global-error.tsx` | Last-resort boundary that owns `<html>/<body>` |
| `not-found.tsx` | Custom 404 page |
| `globals.css` | Global styles, theme tokens, TailwindCSS 4 configuration |
| `manifest.ts` | Web app manifest |
| `robots.ts` / `sitemap.ts` / `feed.xml/route.ts` | SEO + RSS endpoints |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `api/contact/` | Contact form API route using Resend (see `api/contact/AGENTS.md`) |
| `articles/` | Articles list page and individual article pages (see `articles/AGENTS.md`) |
| `contact/` | Contact page with form (see `contact/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Follow Next.js App Router conventions: `page.tsx` for routes, `layout.tsx` for wrappers
- Pages with interactivity use the pattern: `page.tsx` (Server) → `*Client.tsx` (Client with `"use client"`)
- `error.tsx` files must be Client Components
- Metadata is exported from Server Components (layout/page) for SEO

### Common Patterns
- `layout.tsx` wraps children with ThemeProvider and ErrorBoundary (no smooth-scroll wrapper — scrolling is native by design, see `docs/architecture/DESIGN_SYSTEM.md`)
- Navigation items defined in `src/config/data.ts` (`navItems`)
- SEO metadata constructed via `src/lib/page-metadata.ts`

## Dependencies

### Internal
- `src/components/` — UI components used by pages
- `src/config/` — site data and configuration
- `src/lib/` — utilities, markdown processing, feed generation

<!-- MANUAL: Custom project notes can be added below -->
