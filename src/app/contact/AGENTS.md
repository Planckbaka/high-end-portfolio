<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# contact

## Purpose
Contact page with an interactive form. Submits data to the `/api/contact` API route which sends emails via Resend.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Server Component — contact page wrapper, imports ContactClient |
| `ContactClient.tsx` | Client Component — contact form with validation and submission |

## For AI Agents

### Working In This Directory
- `ContactClient.tsx` handles form state, validation, and POST to `/api/contact`
- Form fields: `name`, `email`, `message`
- Shows success/error feedback after submission

### Testing Requirements
- Test form submission by running `npm run dev` and using the contact page
- Requires `RESEND_API_KEY` for email delivery to work

## Dependencies

### Internal
- `src/config/data.ts` — `contactDetails` for displaying contact info
- `src/app/api/contact/` — form submission endpoint
- `src/lib/contact-schema.ts` — shared zod schema

### External
- `lucide-react` — form icons

<!-- MANUAL: Custom project notes can be added below -->
