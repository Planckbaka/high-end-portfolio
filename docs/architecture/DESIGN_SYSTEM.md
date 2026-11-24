# Engineering Notes design system

Updated 2026-09-09. `src/app/globals.css` is authoritative.

## Intent

A quiet technical publication: clear hierarchy, generous reading space and a small amount of warm colour. The homepage identifies backend systems, Python engineering and model inference immediately. Evidence comes from articles and runnable code, not decorative portfolio claims.

## Current editorial composition (2026-09-09)

This iteration supersedes the earlier offset-headline composition below. The palette, fonts, native scrolling and article reading contracts remain unchanged.

- Home pairs a three-line headline with the existing original ceramic study. The desktop headline scales from 64 to 100px; the main image uses a 1.15:1 crop. The introduction and writing action stay in the headline column. Mobile starts at 58px and places the action before a 4:3 image.
- Selected writing has one large inverse-color concept panel and two compact companion entries. Diagram chips explicitly use foreground/surface tokens so they stay readable inside either panel treatment.
- A single accent-colored series banner changes the rhythm between selected writing and the project workbench. Its copy and action link to the six-part reading path.
- Interior headers now use the full site grid: a large title, an independently aligned short introduction and one baseline divider. Desktop headings scale to 84px; mobile headings use 46px. Article headings retain 36–48px.
- Project navigation uses muted index panels; evidence remains in numbered sections. About pairs a short working principle with the reading column. Search and Contact use the same muted surface treatment.
- The footer ends each page with a large typographic signature, then compact social and subscription links. No extra image, font or dependency was added.

Implementation replaces the prior spatial/finishing CSS sections with one editorial section rather than adding another competing override layer. See [visual review and measurements](../rebuild/EDITORIAL-REFACTOR.md).

## Tokens

| Role | Light | Dark |
| --- | --- | --- |
| Background | `#f7f6f2` | `#191b19` |
| Foreground | `#232521` | `#eeeee6` |
| Accent | `#a33f2e` | `#ee9b84` |
| Muted text | `#62665e` | See `--muted-foreground` |
| Surface / border | See `--surface`, `--border` | Same semantic tokens |

Use semantic variables for text, surfaces, borders and focus states. Shiki emits GitHub light/dark token colours at build time. Theme selection uses the same `data-theme` attribute as the Tailwind dark variant, avoiding a system-preference/manual-toggle mismatch.

## Type and layout

- Space Grotesk: headings, navigation and identity. JetBrains Mono: code and compact metadata. System sans-serif with Chinese fallbacks: body.
- Site maximum width 1200px; side gutters 48px desktop, 20px mobile.
- Article body maximum 720px, 18px desktop / 17px mobile, line-height 1.8. Desktop contents rail 200px; below 768px use native collapsible contents.
- Home headline 64–100px (art-hero), mobile clamp(58px, 14vw, 88px). Article headline 36–48px. Normal sentence casing.
- Fine dividers, 4px corners, no heavy shadows. Content spacing, alignment and labels define groups.
- Code and tables scroll within their container; they must not widen the page. Heading anchors account for the sticky header.

## Components and interaction

The header, footer, article rows, three featured diagrams, project cards, input fields and buttons share tokens. Home uses author introduction, representative writing, real projects, latest writing and contact. Writing is a compact searchable list; articles remove decorative hero images.

Scrolling is native. No active fullscreen noise, custom cursor, Lenis wrapper or entrance animation hides content. Feedback is limited to hover/focus and short transitions; reduced-motion removes these transitions. Focus rings and the skip link are required. Mobile navigation and article contents use native details/summary so they still open without JavaScript.

The system is the initial theme source; manual light/dark selection persists. Do not add layout differences between themes. Loading, error, not-found and contact status states use the same type and colours.

## CSS regression investigation

The planning baseline observed a 16px headline and an ineffective noise variable in a running development page. Direct compilation of the source through the installed Tailwind/PostCSS chain produced the expected declarations; this did not establish a source syntax defect. A fresh development build with the new explicit component rules rendered the intended sizes. The obsolete noise layer was removed from the active layout.

Later in this implementation the mismatch was reproduced: source heading scroll margin was 10px while `.next/dev/static/chunks` and the browser still reported 110px. This confirms a stale development artifact, but does not establish why the running watcher missed the change or prove the historical baseline had exactly the same trigger. Do not describe it as a confirmed Tailwind syntax bug. The new pipeline test compiles actual CSS and asserts emitted headline and theme rules; browser inspection verifies computed values and appearance independently.

## Accessibility corrections from production review

GitHub Light's orange `#e36209` measured below AA for 13px code. The highlighter replaces it with `#a04408`, retaining the dark-theme palette. The legacy share label now uses the muted text token. Global scroll padding (100px) and heading scroll margin (10px) combine to place anchors below the header; adding two full header offsets would also break the contents rail's active-heading threshold.

## Spatial editorial iteration

See [art direction and asset provenance](../rebuild/ART-DIRECTION.md). The exhibition layer now uses `.art-hero`, a 76–136px fluid desktop headline (56px minimum on small screens), an offset second line and an original ceramic module still life. Global page headers pair large headings with smaller explanatory copy. Featured writing has a larger lead entry; project summaries are numbered editorial rows. These rules supersede the earlier uniform home grid description. Long article body widths, themes, native scroll and code treatment retain their existing contracts.

The finishing pass gives Projects a compact anchor directory and numbered evidence sections; the sculptural image is now exclusive to the homepage. Featured diagrams use thin geometric outlines with decorative captions only on the lead entry. Display headings use balanced wrapping, while article-list titles use pretty wrapping. Project identities may stick on desktop, but must return to normal flow below 768px. See the art-direction record for actual browser coverage and final-build measurements.

### Shared form primitives

Button, Input and Textarea now use locally owned shadcn/ui source with existing design tokens. Primary maps to foreground/background; focus rings map to the accent, and destructive/error colors adapt to both themes. Contact and Writing consume these primitives. `components.json` supports further additions; review generated changes rather than replacing the site's palette with a preset. Contact errors use field-specific text, `aria-invalid` and `aria-describedby`.
