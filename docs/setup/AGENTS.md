<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# setup

## Purpose
Setup guides for external service integrations, primarily the Resend email service used by the contact form.

## Key Files
| File | Description |
|------|-------------|
| `EMAIL_SETUP.md` | Full Resend email service setup guide |
| `EMAIL_QUICKSTART.md` | Quick-start guide for email integration |
| `RESEND_LIMITATIONS.md` | Known limitations of the Resend integration |

## For AI Agents

### Working In This Directory
- The contact form API route (`src/app/api/contact/route.ts`) uses the Resend SDK
- `RESEND_API_KEY` env var is required for the contact form to work

<!-- MANUAL: Custom project notes can be added below -->
