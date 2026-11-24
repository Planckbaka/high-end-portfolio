# Development Guide

## Project Structure
- `src/app`: Next.js App Router pages.
- `src/components/ui`: Reusable UI components (Hero, ArticleCard, ProjectList, Navbar).
- `src/lib`: Utilities (utils, article-search, feed, markdown).

## Adding a New Page

1. **Create the Page File**:
   Create `src/app/your-page/page.tsx`.

2. **Basic Template**:
   Pages are Server Components by default; export `metadata` via `pageMetadata()` (`src/lib/page-metadata.ts`) and add a Client Component only where interactivity is needed.
   ```tsx
   import { pageMetadata } from "@/lib/page-metadata";

   export const metadata = pageMetadata("Your page", "One-line description.", "/your-page");

   export default function YourPage() {
     return (
       <div className="site-shell page-bottom">
         <header className="page-heading">
           <p className="eyebrow">Section</p>
           <h1>Your page.</h1>
         </header>
         {/* Your content */}
       </div>
     );
   }
   ```

3. **Scrolling**:
   Native browser scrolling, by design. Do not add a smooth-scroll library without updating `docs/architecture/DESIGN_SYSTEM.md` first; in-page anchors rely on CSS `scroll-behavior: smooth`, which reduced-motion disables.

## Motion Guidelines

Motion is CSS-only (transitions in `globals.css`); there is no animation library. Hover/focus feedback uses short color transitions, and the global `prefers-reduced-motion` block disables them. Do not gate content behind entrance animations.

## Styling
- Use **Tailwind CSS** for all styling.
- Semantic theme tokens live in `src/app/globals.css` (`--background`, `--foreground`, `--accent`, `--surface`, `--muted`, `--border`, `--input`); map new ones through `@theme inline`.
- `--border` is a decorative hairline; interactive control boundaries use `--input` (WCAG 1.4.11).
- Use `font-heading` for titles and `font-sans` for body text.
- Use `text-accent` sparingly for impact.
