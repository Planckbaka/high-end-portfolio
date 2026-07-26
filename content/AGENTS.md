<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# content

## Purpose
Content directory holding markdown articles with YAML frontmatter. Articles are processed at build time by `scripts/generate-articles-data.mjs` into `src/lib/articles-data.json` because Cloudflare Workers cannot read the filesystem at runtime.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `articles/` | Markdown article files (see `articles/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Every article must have frontmatter: `title`, `date`, `category` (required), `excerpt` (optional)
- After adding or modifying articles, run `npm run generate:articles` to rebuild the JSON
- Article slugs are derived from filenames (e.g., `my-article.md` → `/articles/my-article`)
- Article images go in `public/images/articles/<slug>/`

### Common Patterns
- Standard markdown with GFM support (tables, task lists, autolinks)
- Code blocks are syntax-highlighted via Shiki at build time
- Articles support rehype plugins: slug, autolink headings, pretty-code

<!-- MANUAL: Custom project notes can be added below -->
