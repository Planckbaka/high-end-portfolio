<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# config

## Purpose
Centralized configuration and static data for the portfolio site. All site metadata, navigation, project listings, and environment variables are defined here.

## Key Files
| File | Description |
|------|-------------|
| `site.ts` | Site name, URL, author info, social links, OG image |
| `data.ts` | Static data: `navItems`, `projects`, `technologies`, `articles` (fallback), `socialLinks`, `contactDetails`, `selfIntroData` |
| `env.ts` | Environment variable validation and access |
| `seo.ts` | SEO metadata generation helpers |
| `constants.ts` | Application-wide constants |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `__tests__/` | Unit tests for config modules |

## For AI Agents

### Working In This Directory
- `data.ts` contains the fallback article data used when articles-data.json hasn't been generated yet
- `projects` array in `data.ts` references image paths in `public/images/`
- `site.ts` reads `NEXT_PUBLIC_SITE_URL` env var with a Cloudflare Workers fallback
- When adding new pages, add nav items to `navItems` in `data.ts`

### Testing Requirements
- Tests in `__tests__/` — run via `npm test`
- `constants.test.ts` tests the constants module

## Dependencies

### Internal
- `src/types/` — TypeScript interfaces (`NavItem`, `Project`, `Technology`, `Article`, etc.)

<!-- MANUAL: Custom project notes can be added below -->
