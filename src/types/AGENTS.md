<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# types

## Purpose
Shared TypeScript type definitions and interfaces used across the entire application. Single source of truth for data shapes.

## Key Files
| File | Description |
|------|-------------|
| `index.ts` | All shared interfaces: `Project`, `Article`, `ArticleSummary`, `NavItem`, `SocialLink`, `ContactDetails` |

## For AI Agents

### Working In This Directory
- This is a types-only module — no runtime code
- All interfaces are exported from `index.ts` and imported via `@/types`
- When adding new data shapes, define interfaces here before implementing

### Common Patterns
- Import via `import type { ... } from "@/types"` (type-only imports)
- `Project` includes optional `description`, `tags`, `problem/tradeoff/validation` and `url` fields
- `Article` has both `id: string | number` and `slug` for flexibility
- `ArticleSummary` is `Article` minus `content` and `toc`

<!-- MANUAL: Custom project notes can be added below -->
