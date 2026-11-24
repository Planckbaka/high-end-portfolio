<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# high-end-portfolio

## Purpose
Personal portfolio website built with Next.js 16, React 19, and TailwindCSS 4. Features a blog/article system with markdown content, CSS-only motion with native scrolling (see docs/architecture/DESIGN_SYSTEM.md), and deploys to Cloudflare Workers via OpenNext. Showcases projects, articles, and a contact form with Resend email integration.

## Key Files
| File | Description |
|------|-------------|
| `package.json` | Dependencies and scripts (dev, build, deploy, test, lint) |
| `next.config.ts` | Next.js configuration |
| `open-next.config.ts` | OpenNext adapter config for Cloudflare Workers |
| `wrangler.toml` | Cloudflare Workers deployment configuration |
| `tsconfig.json` | TypeScript configuration with path aliases (`@/`) |
| `postcss.config.mjs` | PostCSS config (TailwindCSS 4) |
| `eslint.config.mjs` | ESLint flat config |
| `jest.config.mjs` | Jest test configuration |
| `jest.setup.ts` | Jest setup with Testing Library matchers |
| `CLAUDE.md` | Claude Code project instructions |
| `README.md` | Project documentation |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `src/` | Application source code (see `src/AGENTS.md`) |
| `content/` | Markdown article content (see `content/AGENTS.md`) |
| `public/` | Static assets (see `public/AGENTS.md`) |
| `scripts/` | Build-time scripts (see `scripts/AGENTS.md`) |
| `docs/` | Project documentation (see `docs/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Run `npm run generate:articles` after modifying markdown articles — Cloudflare Workers cannot read the filesystem at runtime
- Use `npm run build:cf` for Cloudflare Workers builds, not `npm run build`
- TypeScript path alias `@/` maps to `src/`
- TailwindCSS 4 uses CSS-first configuration (no `tailwind.config.js`)

### Testing Requirements
- `npm test` runs Jest with jsdom environment
- Tests co-locate in `__tests__/` subdirectories within each module

### Common Patterns
- Server Component wrapper → Client Component (e.g., `page.tsx` imports `*Client.tsx`)
- Articles use markdown frontmatter → pre-rendered JSON at build time
- `clsx` + `tailwind-merge` via `cn()` utility for conditional classes

## Dependencies

### External
- Next.js 16 + React 19 — framework
- TailwindCSS 4 — styling
- Resend — contact form email delivery
- `@opennextjs/cloudflare` + Wrangler — deployment
- unified/remark/rehype pipeline — markdown processing
- Shiki — code syntax highlighting
- Jest + Testing Library — tests

<!-- MANUAL: Custom project notes can be added below -->

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
