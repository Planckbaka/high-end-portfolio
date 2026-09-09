# Reading and runtime upgrade — 2026-09-09

This iteration connects the existing engineering articles into a guided reading path, adds subscriptions, and verifies the built application inside the local Workers runtime. It adds no dependencies and does not deploy the site or send email.

## Reader-facing changes

- `/series/reliable-model-systems` introduces the six experiments, prerequisites and alternative reading routes. Chapters link to their articles and packaged lab instructions. Writing and article series labels link back to this page.
- `/feed.xml` publishes an RSS summary feed with 18 articles. Drafts are excluded, XML text is escaped, original publication dates remain stable, and feed modification time comes from content dates. The layout advertises the feed to readers; the footer provides a visible subscription link.
- The article directory measures heading positions on layout changes and font readiness. Scroll events schedule one animation-frame update using a binary search over cached positions. It no longer reads every heading's geometry on every scroll event. This is a mechanism improvement, not a quantified speedup claim.
- The sitemap includes the series. Static pages no longer receive misleading modification dates on every build.

## Verification

- 122 Jest tests across 13 suites and 7 content-pipeline tests pass.
- ESLint, TypeScript, `npm run build:cf`, publication checks and `git diff --check` pass.
- Publication checks verify 18 server-rendered articles, canonical metadata, the no-JavaScript listing and 12 preserved original dates.
- `node scripts/check-worker.mjs` starts an isolated local Wrangler process, checks pages, the six-part series, the 18-item RSS response and lab archive, then checks malformed contact payloads return 400. It removes its temporary state on exit. No valid contact message is submitted.
- CI runs the same Workers integration check after the build and dry-run. Remote GitHub execution has not been verified in this local session.
- Browser review covered the final series at 1280px light and 375px dark, desktop directory navigation in both directions, and the mobile collapsible directory and long-code layout. This is targeted review, not a fresh full-site screenshot matrix.

Three mobile Lighthouse runs against `http://127.0.0.1:8791/series/reliable-model-systems` used the final Cloudflare build in local workerd. Raw JSON reports are in `evidence/reading/`.

| Metric | Run 1 | Run 2 | Run 3 | Median |
| --- | ---: | ---: | ---: | ---: |
| Performance | 100 | 98 | 98 | 98 |
| Accessibility | 100 | 100 | 100 | 100 |
| CLS | 0 | 0 | 0 | 0 |
| LCP, seconds | 1.378 | 2.317 | 2.331 | 2.317 |

These are local laboratory measurements, not production traffic or a manual accessibility certification. The six labs were unchanged and were not rerun in this iteration.

## Maintenance and remaining boundaries

Run `npm run build:cf` before `node scripts/check-worker.mjs`. The check chooses an available loopback port; `WORKER_CHECK_PORT` may select one explicitly. Update its expected article count when publishing additional articles. The series identity and order live in `src/lib/series.ts`; update the introduction when extending the current six-chapter sequence.

The dependency audit still reports four high entries through the nested Sharp/Miniflare dependency chain. A narrow Sharp override was tested but did not replace the nested installed version; the ineffective override was removed. Do not report this issue as fixed. ESLint remains on the existing compatible version 9. See `STACK-UPDATE.md` for the preceding stack changes and release boundaries.
