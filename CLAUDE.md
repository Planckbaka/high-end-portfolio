# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A personal portfolio website built with Next.js 16, React 19, and TailwindCSS 4, deployed to Cloudflare Workers. Features a blog/article system with markdown content. Motion is intentionally CSS-only and scrolling is native (see docs/architecture/DESIGN_SYSTEM.md) — do not reintroduce Lenis/Framer Motion.

## Common Commands

```bash
# Development
npm run dev                    # Start Next.js dev server
npm run generate:articles      # Regenerate articles JSON from markdown files

# Build & Deploy
npm run build                  # Build for standard deployment (includes article generation)
npm run build:cf               # Build for Cloudflare Workers
npm run deploy                 # Build and deploy to the site's Worker
npm run deploy:prod            # Verified production deploy (adds publication checks, mirrors CI)

# Testing
npm run test                   # Run Jest tests
npm run test:watch             # Watch mode
npm run test:coverage          # Generate coverage report

# Linting
npm run lint                   # Run ESLint
```

## Architecture

### Key Directories

- `src/app/` - Next.js App Router pages, layouts, and API routes
- `src/components/ui/` - Reusable UI components (Navbar, Hero, ProjectCard, etc.)
- `src/config/` - Site configuration (`site.ts`), static data (`data.ts`), shared constants (`constants.ts`)
- `src/lib/` - Utilities (`utils.ts`), markdown processing (`markdown.ts`), article search, feed generation
- `content/articles/` - Markdown articles with frontmatter (title, date, category required)
- `scripts/` - Build-time scripts for generating article data

### Articles System

Articles are markdown files in `content/articles/`. At build time, `scripts/generate-articles-data.mjs` processes them into `src/lib/articles-data.json` (pre-rendered HTML). This is necessary because Cloudflare Workers cannot read the filesystem at runtime.

**Required frontmatter:**
```yaml
---
title: "Article Title"
date: "2024-12-23"
category: "Category Name"
excerpt: "Optional summary"
---
```

When adding/modifying articles, run `npm run generate:articles` to update the JSON.

### Deployment

Uses `@opennextjs/cloudflare` to build Next.js for Cloudflare Workers. The build output goes to `.open-next/`. Configuration is in `wrangler.toml`.

### Client/Server Component Pattern

Many pages use a Server Component wrapper that imports a Client Component (e.g., `page.tsx` imports `ArticlesClient.tsx`). This pattern separates data fetching (server) from interactivity (client).

### Environment Variables

- `NEXT_PUBLIC_SITE_URL` - Site URL for SEO
- `NEXT_PUBLIC_SITE_NAME` - Site name
- `RESEND_API_KEY` - API key for contact form email (server-only)
- `CONTACT_EMAIL` - optional override for the delivery address (defaults to the site author's email)
- `CONTACT_FROM` - optional override for the email sender identity (server-only)
