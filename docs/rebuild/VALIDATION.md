# Local delivery validation — 2026-09-09

The implementation is available as a local production preview. No deployment, real contact message, GPU run or cluster operation was performed.

## Delivery

- One English editorial design across home, writing, articles, projects, about, contact and auxiliary states; light/dark palettes, native scrolling and responsive navigation.
- 18 published English articles: six new lab-based articles and twelve rewritten articles. Original slugs and original publication dates are preserved. All old articles carry an update date.
- Six runnable lab units; downloadable sources and README files exclude the isolated Python environment.
- Server-rendered article body and metadata; generated TOC, static Shiki highlighting, copy controls, series navigation, metadata-only local search and URL filters/pagination.
- Draft and non-article exclusions, fail-fast metadata validation, source-region inclusion and generated benchmark tables.

## Engineering checks

| Check | Result |
| --- | --- |
| Jest | 9 suites, 97 tests passed |
| Content pipeline | 7 tests passed, including actual PostCSS compilation |
| Content graph | 18 English articles, 6 valid lab entries, unique anchors, generated data current |
| Static publication | All 18 bodies and TOCs present outside scripts; all page canonicals correct; no-JS listing exposes all articles; 12 original dates verified against HEAD |
| ESLint | Passed, no warnings |
| TypeScript | Passed with `--noEmit --incremental false` |
| Cloudflare build | `npm run build:cf` passed; `.open-next/worker.js` generated |
| Formatting / patch whitespace | Prettier check and `git diff --check` passed |
| Go labs | Both packages passed `go test -race ./...` (7 top-level tests with subcases) |
| Python queue / stream labs | 4 + 7 tests passed |
| CPU attention / cache labs | 4 + 4 tests passed |
| Download archive | 25 files, ZIP integrity verified, no virtual environment |

Runtime used: Node 26.8.1, Go 1.27.1 darwin/arm64, Python 3.14.7, PyTorch 2.14.0. Go module declares Go 1.24; Python queue/stream APIs require 3.11+. These minimum versions were not independently matrix-tested. PyTorch emits a NumPy-not-installed warning; the labs use no NumPy conversions and their numerical checks pass.

The Cloudflare build retains existing middleware and deployment configuration. Next reports a middleware-convention deprecation; the migration is not bundled into this UI/content delivery. The successful local OpenNext build is not evidence of a deployed Worker receiving traffic.

## Browser review

The in-app browser was used for visual inspection of both themes, with the following primary page matrix. This includes screenshots during implementation and the final review; archived Lighthouse screenshots are linked below.

| Width | Home | Writing | Long article | Contact |
| --- | --- | --- | --- | --- |
| 375 | Light / dark | Light / dark | Light / dark | Light / dark |
| 768 | Light / dark | Light / dark | Light / dark | Light / dark |
| 1280 | Light / dark | Light / dark | Light / dark | Light / dark |
| 1440 | Light / dark | Light / dark | Light / dark | Light / dark |

Projects, About and 404 were also visually inspected. Browser interactions checked topic filtering, empty search results, history back, theme changes, mobile menu opening/Escape, article heading links and code copying. The clipboard contained the source code after copying. At 375px the inspected long article's document width matched the viewport. Long code and result tables have their own scroll containers. Contact success, failure, preserved input and duplicate submission are covered with mocked fetch responses in Jest; no live email was sent.

The final directory anchor check measured a heading at 110.2px with `scroll-margin-top: 10px`; its contents link had `aria-current="location"`. Keyboard focus styling and reduced-motion rules are present. Automated accessibility checks complement, but do not constitute a comprehensive assistive-technology certification.

## Performance and accessibility

Lighthouse 12.8.2, local Next production server, Chrome headless, default simulated mobile throttling. Reports preserve the browser version, run time, settings and raw audits. These are laboratory measurements, not real-user field data.

| Home mobile run | Performance | Accessibility | CLS | LCP |
| --- | ---: | ---: | ---: | ---: |
| 1 | 97 | 100 | 0 | 2.615 s |
| 2 | 97 | 100 | 0 | 2.610 s |
| 3 | 97 | 100 | 0 | 2.609 s |
| Median | **97** | **100** | **0** | **2.610 s** |

All requested score/CLS targets pass. Supplementary final runs: KV-cache long article 96 performance / 100 accessibility / CLS 0; desktop home with the desktop preset 100 / 100 / CLS 0. Contact measured 98 / 100 before the final nonvisual logo accessible-name cleanup. The final home/article audits report no failing accessibility checks, including the previously flagged logo label and code contrast.

Raw reports: [home 1](evidence/lighthouse-home-1.json), [home 2](evidence/lighthouse-home-2.json), [home 3](evidence/lighthouse-home-3.json), [article](evidence/lighthouse-article.json), [contact](evidence/lighthouse-contact.json), [desktop](evidence/lighthouse-desktop.json).

Retained screenshots: [desktop home](evidence/desktop-full.webp), [mobile home](evidence/home-1-full.webp), [long article](evidence/article-full.webp), [contact](evidence/contact-full.webp). Viewport screenshots from the responsive review also appear in the task conversation.

Example reproduction with an existing Lighthouse installation:

```sh
npm run build:cf
node scripts/check-publication.mjs
npm run start -- --hostname 127.0.0.1 --port 3001
# In another terminal; repeat three times and keep distinct output names:
lighthouse http://127.0.0.1:3001 --chrome-flags='--headless --no-sandbox' \
  --only-categories=performance,accessibility --output=json --output-path=home-1.json
```

Lighthouse was already available on this machine; it was not added as a project dependency.

## CSS investigation and remaining boundaries

A running development instance served old CSS after source edits. The mismatch was verified in `.next/dev/static/chunks` and browser computed values. After a fresh production build and preview restart, the expected values rendered. The source compiler test also passes. The stale development instance was shut down; this establishes the observed failure layer but not the underlying file-watcher cause. See the [design system](../architecture/DESIGN_SYSTEM.md).

The cache timing table is generated from [raw CPU measurements](../../labs/results/cache-results.json). Attention output/gradient comparisons and cache-logit comparisons validate numerical behavior at the tested sizes. No results are extrapolated to GPU capacity, trained-model quality, Kubernetes behavior or production reliability. External-service examples in the older articles remain explicitly explanatory; follow their linked first-party documentation and validate in a target environment before operational use.
