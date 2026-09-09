# Spatial editorial update — 2026-09-09

This iteration uses `akiwayne-blog-design`: a larger, lighter headline, deliberate off-axis alignment, one original sculptural image, and varied density between featured writing and project entries. The warm white / charcoal / vermilion identity remains the shared palette. It takes compositional inspiration from [Noomo](https://noomoagency.com/) without reusing its branding or assets.

The homepage pairs the title “Systems, from the inside out.” with a ceramic gateway illustration. This is a conceptual image about boundaries, not a photograph of a project or a technical diagram. Mobile layout stacks and reflows the composition; headings and actions remain HTML. Selected writing uses one lead entry and two supporting entries. Project rows use a shared numbering system instead of another equal-weight card grid. Listing, About and Contact headers share an asymmetric text grid; article body widths and content behavior are preserved.

## Asset provenance

- Original: `public/images/identity/bounded-modules-original.png`, generated with the built-in GPT Image tool on 2026-09-09. No external reference image was supplied.
- Delivery: `public/images/identity/bounded-modules.webp`, resized to 1200 × 800 using Sharp, WebP quality 82; 22,498 bytes. Original image retained.
- Use: homepage visual and Projects concept illustration; empty alt because nearby HTML provides context. Fixed aspect ratio prevents layout movement. The light illustration deliberately retains its paper-like surround in the dark theme.
- No logo regeneration or icon-library replacement was needed for this iteration.

Generation prompt:

> Create a refined editorial 3D still life for Akiwayne's personal engineering blog. Landscape 3:2 composition. One sculptural assembly of precise rectangular matte warm ivory ceramic modules, forming an open square gateway, with a single small muted vermilion red cube passing through its deliberate gap, and two charcoal blocks grounding it. Three-quarter isometric camera, soft upper-left studio light, tactile ceramic material, subtle shadows on a continuous warm off-white background (#eeede7 approximation). Main sculpture centered, fills 70 percent of image with generous breathing room. Sophisticated architectural object photography, very clean geometry, restrained, quiet, visually striking. No letters, no text, no labels, no watermark, no logos, no diagrams or data. No shiny chrome, no neon, no glass, no circuitry. Original conceptual artwork about bounded computation, not an actual technical diagram. Deliver one finished image.

The delivered image was visually inspected for malformed geometry, stray labels and coherence with the site palette. The red module is a metaphor; its arrangement makes no assertion about the exact admission-control algorithm.

## Finishing pass

The Projects page now opens with “Built to be understood.” and a two-entry anchor directory. The repeated homepage illustration has been removed from this page so real work appears earlier. Numbered project identities stay alongside the evidence on desktop and flow normally on mobile. Fine section rules distinguish problem, contribution, tradeoff, validation and limits.

Featured writing now uses restrained geometric outlines derived from the gateway motif, created in CSS. Supporting covers omit their secondary decorative captions to prevent crowding. Long display titles use balanced wrapping; reading-list titles use pretty wrapping. Link underlines, project borders and directional arrows provide short hover feedback, with reduced-motion support. No dependencies were added.

Validation: 97 Jest tests pass; ESLint and TypeScript pass; `npm run build:cf` succeeds; publication checks verify 18 server-rendered articles and the original 12 publication dates. Visual review covered Projects at 1440px light, 768px dark and 375px dark; featured writing at desktop light and phone dark; Writing and Contact at 768px dark; About at 1280px dark; and the KV Cache article at desktop light. Final compact-cover correction was checked in the final production preview. This is representative visual coverage, not a complete all-page/all-theme Cartesian matrix. Contact submission and labs were not rerun for this visual-only pass.

Final local preview: `http://127.0.0.1:3007`. Earlier ports are intermediate versions. Lighthouse reports for the final build are stored under `evidence/polish/final-*.json`; intermediate measurements use `home-*.json`.

Final Lighthouse mobile runs: 96 Performance / 100 Accessibility / 0 CLS; 97 Performance / 100 Accessibility / 0 CLS; 97 Performance / 100 Accessibility / 0 CLS. Median Performance: 97. These are local lab measurements, not field data.
