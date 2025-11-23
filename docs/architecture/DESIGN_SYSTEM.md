# Design System Guide

## 1. Core Philosophy
The design is built on three pillars:
- **Dark & Immersive**: A deep, almost black background (`#0a0a0a`) creates a premium feel.
- **Grid-Based**: Visible and invisible grids structure the content, providing order amidst dynamic animations.
- **Motion-First**: Elements should never just "appear". They should flow, slide, or reveal themselves.

## 2. Colors

| Token | Value | Usage |
|-------|-------|-------|
| `bg-background` | `#0a0a0a` | Main page background. |
| `text-foreground` | `#ededed` | Primary text color. |
| `text-accent` | `#ff4d4d` | Key highlights, hover states, and calls to action. |
| `bg-white/5` | `rgba(255,255,255,0.05)` | Grid lines and subtle borders. |

## 3. Typography

### Headings
- **Font**: `Outfit` (Variable)
- **Class**: `font-heading`
- **Style**: Bold, Uppercase, Tight Tracking (`tracking-tighter`), Leading (`leading-[0.85]`).
- **Usage**: Hero text, section titles, project names.

### Body
- **Font**: `Inter` (Variable)
- **Class**: `font-sans`
- **Style**: Clean, legible.
- **Usage**: Paragraphs, navigation, metadata.

## 4. Components & Patterns

### Grid Background
Always include `<GridBackground />` at the top of a page or section to maintain the visual rhythm.

### Animations (Framer Motion)
- **Text Reveal**: Use a parent with `overflow-hidden` and a child moving from `y: "100%"` to `y: 0`.
- **Stagger**: When showing lists (like projects), stagger the entry by `0.1s` or `0.2s`.
- **Hover**: Interactive elements should respond instantly but smoothly (e.g., `duration-500`).

### Smooth Scroll
The site uses `Lenis` for momentum scrolling. Ensure all scroll-trigger animations are tested with this behavior.
