<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# ui

## Purpose
Reusable UI components for the portfolio site. The design language is a quiet editorial system (see `docs/architecture/DESIGN_SYSTEM.md`): native scrolling, no custom cursor, no entrance animations — feedback is limited to hover/focus transitions, which reduced-motion disables.

## Key Files
| File | Description |
|------|-------------|
| `Navbar.tsx` | Sticky header — responsive, `aria-current` nav, details-based mobile menu |
| `Hero.tsx` | Home hero — editorial composition with framed artwork |
| `ArticleCard.tsx` | Featured article card + article row for listings |
| `ProjectList.tsx` | Numbered project rows on the home page |
| `ArticleTools.tsx` | Table of contents (scroll-spy) and code copy enhancement |
| `ShareLinks.tsx` | Share-to-X / copy-link controls with live-region feedback |
| `BackToTop.tsx` | Client scroll-to-top button (footer is a server component) |
| `ThemeToggle.tsx` | Light/dark switch with `aria-pressed` state |
| `button.tsx` / `input.tsx` / `textarea.tsx` | Shared primitives (shadcn-style, `data-slot` attributes) |

## For AI Agents

### Working In This Directory
- Server Components by default; add `"use client"` only for interactivity
- Use `cn()` from `@/lib/utils` for conditional className merging
- All styling is TailwindCSS 4 + the semantic tokens in `src/app/globals.css` — no CSS modules
- Decorative elements get `aria-hidden="true"`; icon-only controls get labels
- There is no framer-motion in this project anymore — do not reintroduce it without updating `DESIGN_SYSTEM.md` first

### Testing Requirements
- `src/components/ui/__tests__/structure.test.tsx` covers landmarks and affordances
- Run `npm test` from project root

## Dependencies

### Internal
- `src/lib/utils.ts` — `cn()` utility
- `src/types/` — shared interfaces (`Project`, `ArticleSummary`)
- `src/config/data.ts` — static data

### External
- `lucide-react` — icons
- `next-themes` — theme toggle

<!-- MANUAL: Custom project notes can be added below -->
