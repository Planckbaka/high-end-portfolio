# Editorial style refactor — 2026-09-09

## Scope and rationale

The shared visual system now uses stronger differences in scale and surface: a title/image pair on Home, one inverse selected-writing panel, an accent series invitation, and a large typographic footer. Interior pages share a full-width header grid, while long-form reading preserves its narrower measure. The approach follows the blog design skill's Noomo translation: compositional tension, original material identity and readable engineering content.

The original ceramic asset is reused with responsive crops. No new image generation, dependencies, article rewrites, deployment changes or real email deliveries were needed. Article URLs and dates are unchanged.

## Verification

- 122 Jest tests pass. ESLint, TypeScript, Cloudflare production build, static publication checks and whitespace checks pass.
- Local workerd integration checks pass for pages, RSS, the lab archive and invalid contact payloads.
- Browser review included Home in desktop dark and mobile light; selected writing in desktop dark; Projects at 1440px light; About at 1440px dark; Writing at 768px dark and the desktop empty-result state; Contact at desktop light and 375px dark; series chapters at 375px light; and long article headings, mobile directory navigation and horizontally contained code.
- Layout-width checks used 375, 768, 1280 and 1440px across the seven page types. These checks complement the selected screenshots, not a claim that every page/theme/width combination received full manual visual inspection.
- Computed styles confirm a 89.6px Home headline at 1280px and a 17px article body at 375px. The article document remains 375px wide while long code scrolls within its own box.
- An initial screenshot revealed an overly tall Home image; its crop was reduced to bring the writing action into the desktop first screen. Lighthouse then identified a contrast error in diagram chips; explicit token colors fixed it before final measurement.

## Final mobile Lighthouse measurements

URL: `http://127.0.0.1:8793/`, final Cloudflare production build served through local workerd. Raw reports: `evidence/editorial/final-home-{1,2,3}.json`. Earlier `home-*` reports capture the pre-correction contrast issue and are not acceptance results.

| Metric | Run 1 | Run 2 | Run 3 | Median |
| --- | ---: | ---: | ---: | ---: |
| Performance | 100 | 97 | 97 | 97 |
| Accessibility | 100 | 100 | 100 | 100 |
| CLS | 0 | 0 | 0 | 0 |
| LCP, seconds | 1.832 | 2.619 | 2.624 | 2.619 |

Scores describe local simulated mobile loads, not field performance or a complete accessibility certification. Production deployment, real email delivery and a new exhaustive screenshot matrix remain outside this iteration. Existing dependency audit findings are unchanged; see `STACK-UPDATE.md`.
