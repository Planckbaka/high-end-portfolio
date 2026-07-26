<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# app

## Purpose
Next.js App Router directory. Contains pages, layouts, API routes, and error/loading states. Each route follows the Server Component wrapper → Client Component pattern.

## Key Files
| File | Description |
|------|-------------|
| `layout.tsx` | Root layout — applies theme provider, fonts, global CSS, smooth scroll, navbar |
| `page.tsx` | Home page — renders Hero, SelfIntro, ProjectList, GridBackground |
| `loading.tsx` | Global loading state with Loading component |
| `not-found.tsx` | Custom 404 page |
| `globals.css` | Global styles and TailwindCSS 4 theme configuration |
| `favicon.ico` | Site favicon |
| `robots.ts` | Dynamic robots.txt generation |
| `sitemap.ts` | Dynamic sitemap.xml generation |

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
- `layout.tsx` wraps children with ThemeProvider and Lenis smooth scroll
- Navigation items defined in `src/config/data.ts` (`navItems`)
- SEO metadata constructed via `src/config/seo.ts`

## Dependencies

### Internal
- `src/components/` — UI components used by pages
- `src/config/` — site data and configuration
- `src/lib/` — utilities and animations

<!-- MANUAL: Custom project notes can be added below -->
