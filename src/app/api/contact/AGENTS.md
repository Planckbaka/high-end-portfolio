<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# api/contact

## Purpose
API route for the contact form. Receives form submissions via POST and sends emails using the Resend SDK.

## Key Files
| File | Description |
|------|-------------|
| `route.ts` | POST handler — validates input, sends email via Resend, returns JSON response |

## For AI Agents

### Working In This Directory
- Server-only code — runs on Cloudflare Workers edge runtime
- Requires `RESEND_API_KEY` environment variable (set in wrangler.toml or `.dev.vars`)
- Validates required fields: `name`, `email`, `message`
- Returns structured JSON responses: `{ success: boolean, message?: string, error?: string }`

### Testing Requirements
- Test via `npm run dev` and POSTing to `/api/contact`
- Cannot be unit-tested in isolation without mocking the Resend SDK

## Dependencies

### Internal
- `src/config/env.ts` — environment variable access

### External
- `resend` — email delivery SDK

<!-- MANUAL: Custom project notes can be added below -->
