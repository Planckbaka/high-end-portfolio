# Maintenance

## Publish an article

Use a stable filename as the URL slug. Preserve original `date` when rewriting and set `updatedAt` to the review date. Current categories are Go, Python, LLM, Systems and Interface.

```yaml
---
title: "A specific engineering question"
date: "2026-09-09"
updatedAt: "2026-09-09"
category: "Go"
excerpt: "The problem, method, and boundary of the result."
tags: [concurrency, cancellation]
lang: "en"
draft: true
series: "Engineering Reliable Model Systems"
seriesOrder: 7
featured: false
labPath: "labs/go/gateway"
---
```

Remove optional series/lab fields when they do not apply. Drafts are excluded from the generated article registry, and therefore from public listings, search, static routes, sitemap and share-card generation. AGENTS.md, CLAUDE.md, README.md and hidden files are not articles. Invalid metadata fails generation. Do not use future promises as published evidence.

Heading anchors and reading time are generated. Use unique descriptive headings. Code fences are highlighted at build time by Shiki using the explicit language allowlist in `scripts/article-pipeline.mjs`; extend that list intentionally when adding a language. Sanitization runs before the trusted highlighter creates static HTML.

## Link prose to evidence

Use `<!-- lab: labs/go/gateway/gateway.go#admission -->` to include a named source region. Region markers are language comments (`region:admission` / `endregion:admission`). Generation fails for a missing path or region. Whole-file inclusion is also supported. `<!-- result: cache -->` renders the measured decoder table from its raw JSON record. Regenerate after changing lab source or results.

```sh
npm run prebuild
npm run test:content
npm run check:content
```

The lab packager includes only source, README and result formats; hidden directories and the virtual environment are excluded. It generates both public source links and a dependency-free ZIP. Downloaded code is an independent learning artifact, not a production service. Run tests before publishing a new result and preserve environment, seed, inputs, repeats and raw samples.

## Pages and theme

`src/config/site.ts` owns identity and canonical URLs; `src/config/data.ts` owns navigation and verified project descriptions. Change these rather than scattering identity claims through components. No unverified employment history or metrics should be added.

`src/app/globals.css` is the design source of truth. Theme follows the system initially; light/dark controls persist a manual choice through next-themes. To restore the system default, remove the site's stored theme preference. Both themes use the same layout. Native scrolling and visible keyboard focus are intentional.

Review home, writing, a long article, projects, about, contact and 404 at 375, 768, 1280 and 1440 pixels in both themes. Include long code and tables, empty search results, browser back and direct URL refresh. Verify article HTML without running JavaScript. Mock contact success/error responses; do not send real messages during checks.

## Build and performance

Use `npm run build:cf`, then `node scripts/check-publication.mjs` to verify static article bodies, page canonical URLs, the no-JS index and preserved dates. Keep Cloudflare configuration and secrets separate from content changes. Use `npm run start -- --port 3001` to review the resulting Next production build locally. This checks production HTML and browser performance, but is not an edge-runtime deployment test.

Record three mobile Lighthouse runs from a production preview, retaining raw reports and medians. Distinguish laboratory results from real-user Core Web Vitals. After a functional or CSS change, rerun the affected checks; avoid treating tests as a substitute for visual review.

## Future series

GPU capacity curves, vLLM scheduling, quantization/quality evaluation and RAG evaluation remain proposed topics. Publish only after their target-environment experiments exist. There are no promised release dates.

## Contact reliability and CI follow-up

Contact requests now reject malformed JSON, non-string fields and whitespace-only input before sending. Provider calls have a 10-second timeout. The browser retains a submission ID for retries of unchanged content and rotates it when content changes or delivery succeeds; Resend receives it as `Idempotency-Key`. This protection lasts for the provider's idempotency window, not indefinitely. `CONTACT_FROM` may configure a verified sender; its fallback remains the existing Resend test sender. Do not claim live delivery without a separately authorized test.

The isolate-local rate limiter expires old entries, caps its size and uses Cloudflare's client-IP header instead of trusting `X-Forwarded-For`. It is still not a distributed quota. A Cloudflare binding or WAF rule remains a deployment follow-up.

CI now includes type checks, content pipeline/publication checks, a Worker dry-run and Go/Python/CPU tensor tests. The Linux CI targets Go 1.24 and Python 3.11; local verification used the already installed newer runtimes. Remote workflow execution and that minimum-version matrix remain unverified until GitHub runs them. The existing separate push-to-main deployment workflow is unchanged and does not automatically depend on the new CI jobs. Proposed next step: require CI success and a protected production approval before deployment; review that workflow change before adopting it.

Project pages link to the packaged teaching source, correctness tests and raw measurements, with explicit scope labels. Keep these URLs synchronized with `scripts/package-labs.mjs`.

The installed Wrangler declares Node >=22, so the expanded CI uses Node 22. The separate deployment workflow still pins Node 20 and must be updated as part of the reviewed release-workflow change. Local verification: 107 Jest tests, 7 pipeline tests, 18-article publication checks, both Go packages with race detection and all 19 Python/tensor tests passed. Workerd returned 200 for the new evidence assets and 400 for malformed JSON, null bodies and non-string fields. All provider interactions in tests were mocked; no real message was sent.

### Superseding release update

The follow-up stack update now replaces the old deployment workflow with a manual release that depends on the reusable CI, and uses Node 22 throughout. The earlier note that deployment still uses Node 20 and skips new checks is historical. Required reviewers must still be configured in GitHub's production environment. See `STACK-UPDATE.md` for exact versions, shadcn/Zod adoption and remaining dependency audit findings.

### Series, subscriptions and local runtime checks

Published articles also appear in `/feed.xml`; drafts remain excluded. The current guided series is `/series/reliable-model-systems`. Keep its six-chapter introduction and the expected article count in `scripts/check-worker.mjs` synchronized when adding content. Run `node scripts/check-worker.mjs` after `npm run build:cf` to verify the actual local Workers runtime without sending email. See `READING-UPGRADE.md` for the latest targeted visual review, 122-test result and three-run performance evidence.
