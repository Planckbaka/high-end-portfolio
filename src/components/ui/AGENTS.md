<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# ui

## Purpose
Reusable UI components for the portfolio site. Each component is a self-contained Client Component with its own animations and styling.

## Key Files
| File | Description |
|------|-------------|
| `Navbar.tsx` | Navigation bar — responsive, animated, with theme toggle |
| `Hero.tsx` | Hero section — main landing area with animations and CTA |
| `SelfIntro.tsx` | Self introduction section — bio, roles, stats |
| `ProjectCard.tsx` | Individual project card — image, metadata, hover effects |
| `ProjectList.tsx` | Project grid — renders ProjectCards with stagger animation |
| `ArticleSkeleton.tsx` | Loading skeleton for article cards |
| `CustomCursor.tsx` | Custom cursor effect — follows mouse with magnetic behavior |
| `MagneticButton.tsx` | Magnetic hover effect button — pulls toward cursor |
| `GridBackground.tsx` | Animated grid background pattern |
| `ThemeToggle.tsx` | Dark/light mode toggle button |
| `Noise.tsx` | Noise texture overlay effect |
| `Loading.tsx` | Loading spinner/indicator component |

## For AI Agents

### Working In This Directory
- All components are Client Components (`"use client"`)
- Use `cn()` from `@/lib/utils` for conditional className merging
- Animation variants are imported from `@/lib/animations`
- Components use Framer Motion's `motion` wrapper for enter/exit animations
- TailwindCSS 4 for all styling — no CSS modules or styled-components

### Common Patterns
- Props interfaces defined inline (not in `types/`) for component-specific props
- `framer-motion` `variants` prop for declarative animation states
- `whileHover` / `whileInView` for interactive animations
- `lucide-react` for icons

### Testing Requirements
- Visual testing via `npm run dev` — most components are visual/interactive
- No unit tests for UI components currently

## Dependencies

### Internal
- `src/lib/utils.ts` — `cn()` utility
- `src/lib/animations.ts` — Framer Motion variants
- `src/types/` — shared interfaces (`Project`, `SelfIntroData`)
- `src/config/data.ts` — static data

### External
- `framer-motion` — animations
- `lucide-react` — icons
- `next-themes` — theme toggle
- `clsx` + `tailwind-merge` — class merging

<!-- MANUAL: Custom project notes can be added below -->
