<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# articles

## Purpose
Markdown article files with YAML frontmatter. Each file becomes a blog post accessible at `/articles/<slug>` where the slug is derived from the filename.

## Key Files
| File | Description |
|------|-------------|
| `.README.md` | Article authoring guide |
| `.IMAGE-GUIDE.md` | Guide for adding images to articles |
| `10-design-patterns-in-go.md` | Go design patterns article |
| `art-of-microservices.md` | Microservices architecture article |
| `event-driven-architecture-kafka.md` | Event-driven architecture with Kafka |
| `future-of-digital-interfaces.md` | Digital interfaces trends |
| `go-wire-for-dev.md` | Google Wire dependency injection for Go |
| `kubernetes-for-developers.md` | Kubernetes developer guide |
| `linux-system-programming-go.md` | Linux system programming with Go |
| `mastering-framer-motion.md` | Framer Motion deep dive |
| `redis-beyond-caching.md` | Redis advanced use cases |
| `the-go-webframe-work.md` | Go web frameworks comparison |
| `the-understand-of-kafka.md` | Understanding Kafka internals |
| `transaction-in-DDIA.md` | Transaction concepts from DDIA book |

## For AI Agents

### Working In This Directory
- Required frontmatter: `title` (string), `date` (YYYY-MM-DD), `category` (string)
- Optional frontmatter: `excerpt` (string summary)
- Filename determines the URL slug (e.g., `redis-beyond-caching.md` → `/articles/redis-beyond-caching`)
- Supports GFM: tables, task lists, autolinks, code blocks with syntax highlighting
- After any changes, run `npm run generate:articles` to update `src/lib/articles-data.json`

### Testing Requirements
- Verify articles render by running `npm run dev` and visiting `/articles`
- Check `src/lib/articles-data.json` is generated correctly after adding new articles

## Dependencies

### External
- Unified/remark/rehype pipeline processes these at build time
- Shiki for code syntax highlighting

<!-- MANUAL: Custom project notes can be added below -->
