# Cloudflare deployment readiness — 2026-09-09

## Result

The existing OpenNext / Workers application builds and passes a Wrangler deployment dry-run. Local workerd smoke checks pass after correcting the contact route from Next.js Edge Runtime to Node.js Runtime. No deployment or real email was sent.

## Verified

- `npm run build:cf`: completed after the runtime fix.
- `wrangler deploy --dry-run --env ''`: completed; 115 static assets, Worker gzip 1273.46 KiB.
- `wrangler dev --local --env '' --port 8788`: actual Workers runtime, not `next start`.
- HTTP 200: `/`, `/articles`, `/articles/kv-cache-tiny-decoder`, `/projects`, `/contact`, `/sitemap.xml`, `/images/identity/bounded-modules.webp`.
- POST `/api/contact` with `{}`: 400 JSON; the same invalid body with an untrusted Origin: 403 JSON. Neither request can reach email sending.
- Before the runtime fix, POST returned 500 (`Cannot read properties of undefined (reading 'default')` in the generated component loader).
- 97 Jest tests pass; ESLint and TypeScript checks pass.
- Built canonical URL: `https://high-end-portfolio.1229773363.workers.dev`.

## Remaining publication conditions

1. `wrangler whoami` failed to refresh the auth token (400 Bad Request, Not logged in). Reauthenticate using `npx wrangler login` before attempting publication.
2. The default Worker is `high-end-portfolio` with `workers_dev = true`. The separate `production` environment names `high-end-portfolio-prod`, sets `workers_dev = false`, and declares no routes. Do not assume `npm run deploy:prod` will create a public entry point; explicitly configure its intended domain or enable workers.dev first. No deployment configuration was changed during this audit.
3. Local `RESEND_API_KEY` exists, but remote secret presence could not be checked while authentication failed. Local `.env.local` is not evidence that a Worker secret is configured. Once authenticated, inspect secret names with `npx wrangler secret list --env ''`; set the key securely if absent.
4. The contact sender remains `onboarding@resend.dev`; confirm Resend authorizes the configured recipient/sender before claiming successful production delivery. Actual delivery was deliberately not tested.
5. If selecting another hostname, set `NEXT_PUBLIC_SITE_URL` at build time and rebuild. Canonical metadata and contact Origin validation must match the published hostname. Confirm any dashboard-only variables before deployment: plain Wrangler deployment does not preserve unspecified vars by default.

For the existing default target, after these conditions are met, the explicit build/deployment sequence is `npm run build:cf` followed by `npx wrangler deploy --env ''`. These are instructions, not actions performed in this audit.

## References

- [Cloudflare OpenNext guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/)
- [OpenNext runtime requirements](https://opennext.js.org/cloudflare/get-started)
- [Wrangler environments](https://developers.cloudflare.com/workers/wrangler/environments/)

Cloudflare now recommends vinext for new projects; this audit retains the existing OpenNext architecture and does not introduce an unrelated framework migration. Local checks establish compatibility, not successful remote deployment or email delivery.
