<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# types

## Purpose
Shared TypeScript type definitions and interfaces used across the entire application. Single source of truth for data shapes.

## Key Files
| File | Description |
|------|-------------|
| `index.ts` | All shared interfaces: `Project`, `Article`, `Technology`, `SocialLink`, `ContactDetails`, `SelfIntroData`, `NavItem`, `AnimationConfig`, `BaseComponentProps` |

## For AI Agents

### Working In This Directory
- This is a types-only module — no runtime code
- All interfaces are exported from `index.ts` and imported via `@/types`
- When adding new data shapes, define interfaces here before implementing

### Common Patterns
- Import via `import type { ... } from "@/types"` (type-only imports)
- `Project` includes optional `description`, `tags`, and `url` fields
- `Article` has both `id: string | number` and `slug` for flexibility
- `SelfIntroData` uses a nested structure with `heading.main` / `heading.sub`

<!-- MANUAL: Custom project notes can be added below -->
