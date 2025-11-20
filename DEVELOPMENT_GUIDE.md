# Development Guide

## Project Structure
- `src/app`: Next.js App Router pages.
- `src/components/ui`: Reusable UI components (Hero, ProjectCard, GridBackground).
- `src/lib`: Utilities (smooth-scroll, utils).

## Adding a New Page

1. **Create the Page File**:
   Create `src/app/your-page/page.tsx`.

2. **Basic Template**:
   ```tsx
   import { GridBackground } from "@/components/ui/GridBackground";

   export default function YourPage() {
     return (
       <main className="relative w-full min-h-screen">
         <GridBackground />
         <section className="pt-32 px-4 md:px-12 lg:px-24">
           {/* Your Content */}
         </section>
       </main>
     );
   }
   ```

3. **Smooth Scroll**:
   The `SmoothScroll` wrapper in `layout.tsx` automatically handles scrolling for all pages. You don't need to add it manually.

## Animation Guidelines

We use **Framer Motion** for all animations.

### Entrance Animations
Use the `initial`, `animate`, `transition` pattern.
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  Content
</motion.div>
```

### Scroll Triggered
Use `whileInView` for elements that should animate when scrolled into view.
```tsx
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{ once: true }}
>
  Content
</motion.div>
```

## Styling
- Use **Tailwind CSS** for all styling.
- Use `font-heading` for titles and `font-sans` for body text.
- Use `text-accent` sparingly for impact.
