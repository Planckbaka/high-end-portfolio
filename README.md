# Akiwayne — Engineering Notes

An English personal engineering blog about Go backends, Python workloads, and the mechanics of model inference. Built with Next.js 16, React 19, Tailwind CSS 4, and the OpenNext Cloudflare adapter.

The site includes 18 articles and six runnable [Engineering Labs](labs/README.md). Experiments use synthetic inputs and CPU execution; they do not claim production or GPU performance.

## Run locally

```sh
npm ci
npm run prebuild
npm run dev
```

Open http://localhost:3000. Content is generated before development; after editing Markdown, run `npm run generate:articles` again. Python and PyTorch are isolated from the web application's dependencies.

## Verify

```sh
npm test -- --runInBand
npm run test:content
npm run check:content
npm run lint
npx tsc --noEmit --incremental false
npm run build:cf
node scripts/check-publication.mjs
```

See the [lab README](labs/README.md) for Go race tests, Python tests, CPU tensor checks, and benchmark reproduction. `build:cf` generates local Cloudflare artifacts; it does not deploy. Deployment remains a separate explicit operation.

## Maintain the site

- [Content and maintenance guide](docs/rebuild/MAINTENANCE.md)
- [Design system](docs/architecture/DESIGN_SYSTEM.md)
- [Implementation and validation record](docs/rebuild/VALIDATION.md)
- [Sources and scope](docs/rebuild/PROVENANCE.md)

Article Markdown lives in `content/articles`. The validated, sanitized and syntax-highlighted output is generated into `src/lib/articles-data.json` because the Worker cannot read local Markdown at runtime. Page bodies render on the server; search, theme choice, table-of-contents tracking and copying are small client interactions. Public listings receive metadata only.

Contact delivery keeps the existing Resend integration. Configure secrets only through the existing environment/deployment setup; never place credentials in article content or lab downloads. Contact verification uses mocked responses and sends no email.
