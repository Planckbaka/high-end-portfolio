<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# src

## Purpose
Application source code. Contains Next.js App Router pages, API routes, reusable components, configuration, utility libraries, and TypeScript type definitions.

## Key Files

_(No standalone files at this level — all code is organized into subdirectories.)_

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js App Router pages, layouts, and API routes (see `app/AGENTS.md`) |
| `components/` | React components including ErrorBoundary and ThemeProvider (see `components/AGENTS.md`) |
| `config/` | Site configuration, static data, shared constants (see `config/AGENTS.md`) |
| `lib/` | Utilities, markdown processing, articles data, feed (see `lib/AGENTS.md`) |
| `types/` | Shared TypeScript interfaces (see `types/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- TypeScript path alias `@/` maps to this directory
- Follow the Server Component → Client Component pattern for pages with interactivity
- All components use TailwindCSS for styling with the `cn()` utility from `lib/utils`

### Testing Requirements
- Tests live in `__tests__/` subdirectories within each module
- Run `npm test` from project root

### Common Patterns
- Barrel imports via `@/config/data`, `@/lib/utils`, etc.
- CSS-only motion; scrolling is native (`docs/architecture/DESIGN_SYSTEM.md`)
- `next-themes` for dark/light mode

## Dependencies

### Internal
- All subdirectories reference `types/` for shared interfaces

### External
- React 19, Next.js 16, TailwindCSS 4, next-themes

<!-- MANUAL: Custom project notes can be added below -->
