<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# scripts

## Purpose
Build-time scripts for processing content and generating static data required by the application at runtime.

## Key Files
| File | Description |
|------|-------------|
| `generate-articles-data.mjs` | Reads markdown from `content/articles/`, processes frontmatter + body via unified/remark/rehype pipeline, and writes pre-rendered HTML to `src/lib/articles-data.json` |

## For AI Agents

### Working In This Directory
- Run via `npm run generate:articles` or automatically during `npm run build` / `npm run build:cf`
- Uses ESM (`.mjs`) — no TypeScript compilation needed
- The rehype pipeline includes: slug, autolink-headings, pretty-code (Shiki), format, stringify
- If article generation fails, the app will have no articles data at runtime

### Testing Requirements
- No direct tests for scripts — verify by running `npm run generate:articles` and checking `src/lib/articles-data.json`

<!-- MANUAL: Custom project notes can be added below -->
