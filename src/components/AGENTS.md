<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# components

## Purpose
React components shared across the application. Contains top-level providers and a `ui/` subdirectory with all visual components.

## Key Files
| File | Description |
|------|-------------|
| `ErrorBoundary.tsx` | React error boundary wrapper for graceful error handling |
| `ThemeProvider.tsx` | next-themes provider wrapper for dark/light mode |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `ui/` | Reusable UI components (see `ui/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- `ThemeProvider` must wrap the app in the root layout
- `ErrorBoundary` should wrap component subtrees that may throw
- Both providers are Client Components (`"use client"`)

## Dependencies

### Internal
- `src/lib/utils.ts` — `cn()` utility for className merging
- `src/lib/animations.ts` — Framer Motion animation variants

### External
- `next-themes` — ThemeProvider
- `framer-motion` — animation components in `ui/`

<!-- MANUAL: Custom project notes can be added below -->
