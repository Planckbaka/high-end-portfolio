# UI and release tooling update

## Decisions

- Add shadcn/ui Button, Input and Textarea as owned source files, adapted from the official `new-york-v4` registry. This project previously had no shadcn configuration. `components.json` enables future additions; do not run preset replacement over the custom design system.
- Use `class-variance-authority` for button variants and `@radix-ui/react-slot` for composition. The single Slot package replaces the registry's umbrella Radix import. Preserve HTML labels, native form semantics and native category/series selects.
- Map shadcn primary, secondary, input, ring and destructive tokens onto the warm editorial palette. Keep existing article typography and the `data-theme` dark-mode selector.
- Share a Zod contact schema between browser and server. Trim fields, enforce limits, reject incorrect types, and associate client validation errors with their inputs. Provider timeout/idempotency and server tests remain in place.
- Refresh compatible dependency ranges; preserve TypeScript 5 and existing animation APIs rather than mixing unrelated major migrations into the delivery.
- Standardize Node 22 through `.nvmrc`, package engines and GitHub workflows.

## Release boundary

Deployment is now manual (`workflow_dispatch`) and runs the reusable CI workflow before deploying. Both frontend/content/Worker checks and CPU labs must succeed. The production job references the GitHub `production` environment; maintainers must configure required reviewers in GitHub to enable human approval. Merely naming an environment does not enable protection.

The deploy target remains the default `high-end-portfolio` Worker (`--env ''`), not the unconfigured Wrangler `production` environment. Set `NEXT_PUBLIC_SITE_URL` as a GitHub environment/repository variable when changing the hostname; configure Cloudflare credentials as secrets. No workflow was dispatched and no deployment occurred during this update.

## Sources

- https://ui.shadcn.com/docs/installation/next
- https://ui.shadcn.com/docs/tailwind-v4
- https://ui.shadcn.com/r/styles/new-york-v4/button.json
- https://ui.shadcn.com/r/styles/new-york-v4/input.json
- https://ui.shadcn.com/r/styles/new-york-v4/textarea.json
- https://zod.dev/basics

The shadcn component source is MIT licensed. Local changes include import aliases, semantic token integration, small corner radii and a 44px default button target. Existing high-level UI components retain their names; the new primitives use shadcn's lowercase filenames.

ESLint 10 was tested because `eslint-config-next@16.3.4` declares ESLint >=9, but its bundled React plugin crashed on a removed `context.getFilename` API. ESLint is retained at 9.39.5 until that upstream incompatibility is resolved; its maintenance status remains a limitation. The initial full `npm update` encountered a registry idle timeout; core versions were then installed explicitly. Do not infer success from the attempted update: the final installed-version table and verification below are authoritative.

## Installed versions

| Package | Version |
| --- | --- |
| next | 16.3.4 |
| react | 19.2.8 |
| tailwindcss | 4.3.3 |
| @opennextjs/cloudflare | 1.20.6 |
| wrangler | 4.130.0 |
| eslint | 9.39.5 |
| sharp | 0.35.4 |
| zod | 4.5.4 |
| @radix-ui/react-slot | 1.3.3 |
| class-variance-authority | 0.7.1 |

## Compatibility and audit boundaries

After compatible audit fixes, npm reports four high-severity entries in the Miniflare → nested Sharp → Wrangler/OpenNext dependency chain. The application's direct Sharp is updated to 0.35.4, but this does not replace Miniflare's nested version. npm proposes a substantial Wrangler downgrade; it was not applied. Do not describe this stack as vulnerability-free. Reassess the upstream dependency before using image-processing features in that runtime.

ESLint 9.39.5 remains necessary for the bundled React plugin; ESLint 10's failure was reproduced during lint, not merely inferred from version metadata. No package-manager force flag or peer-check bypass was used.

## Verification

113 Jest tests, seven content-pipeline tests, TypeScript, ESLint 9 and 18-article publication checks pass. Cloudflare build and deployment dry-run pass (gzip Worker 1491.05 KiB). Actual workerd serves Home, Writing, Contact and the KV Cache article with HTTP 200; invalid JSON, null and incorrectly typed contact bodies return 400. Browser review checked desktop light Contact, mobile dark Contact/Writing, client-only field errors and a successful cache search. No message was sent.

Contact mobile Lighthouse on local workerd: 90 Performance / 100 Accessibility / 0 CLS; 98 Performance / 100 Accessibility / 0 CLS; 94 Performance / 100 Accessibility / 0 CLS. These are local measurements; GitHub Actions and real deployment remain untested. Raw reports are under `evidence/stack/`.
