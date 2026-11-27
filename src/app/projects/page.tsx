import { pageMetadata } from "@/lib/page-metadata";
import Link from "next/link";
import { projects } from "@/config/data";
import { getAllArticles } from "@/lib/markdown";
import { siteConfig } from "@/config/site";
import { breadcrumbJsonLd, collectionPageJsonLd, serializeJsonLd } from "@/lib/seo";
export const metadata = pageMetadata(
  "Projects",
  "Agent engineering and reproducible Go, Python, and CPU model-inference experiments.",
  "/projects"
);
interface EvidenceLink {
  href: string;
  label: string;
  isRaw?: boolean;
}

const PROJECT_EVIDENCE_LINKS: Record<string, EvidenceLink[]> = {
  "pi-go": [
    { href: "/labs/go/agent", label: "Teaching implementation →" },
    { href: "/labs/go/gateway", label: "Gateway admission lab →" },
  ],
  "gemini-research": [
    { href: "/labs/llm/flagship-2026", label: "2026 Flagship & Muon lab →" },
    { href: "/labs/llm/roofline-flash", label: "Roofline & Online Softmax lab →" },
    { href: "/series/llm-ai-infra", label: "Nine-part research monograph →" },
  ],
};

const DEFAULT_EVIDENCE_LINKS: EvidenceLink[] = [
  { href: "/labs", label: "Reproduction guide →" },
  { href: "/labs/llm/kv-cache", label: "Decoder & KV cache lab →" },
  { href: "/labs/results/cache-results.json", label: "Raw CPU measurements →", isRaw: true },
];

export default function Projects() {
  const articles = getAllArticles();
  const collectionLd = collectionPageJsonLd({
    name: "Projects",
    description:
      "Agent engineering and reproducible Go, Python, and CPU model-inference experiments.",
    path: "/projects",
    items: projects.map((p) => ({
      name: p.title,
      url: `${siteConfig.url}/projects#${p.id}`,
      description: p.description,
    })),
  });
  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", url: siteConfig.url },
    { name: "Projects", url: `${siteConfig.url}/projects` },
  ]);
  return (
    <div className="site-shell page-bottom">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbLd) }}
      />
      <header className="page-heading">
        <p className="eyebrow">
          <span className="eyebrow-dot" />
          Selected systems &amp; validation
        </p>
        <h1>
          Built to be
          {" "}
          <br />
          understood.
        </h1>
        <p>
          Projects and experiments, with their design decisions, evidence, and limits kept close to
          the code.
        </p>
      </header>
      <nav className="project-directory" aria-label="Project index">
        {projects.map((project, index) => (
          <a href={`#${project.id}`} key={project.id}>
            <span className="eyebrow">
              {String(index + 1).padStart(2, "0")} · {project.category}
            </span>
            <span>
              {project.title}
              <span aria-hidden="true">↓</span>
            </span>
          </a>
        ))}
      </nav>
      {projects.map((project, index) => (
        <article className="project-detail" id={project.id} key={project.id}>
          <div className="project-identity">
            <span className="project-folio" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <p className="eyebrow">{project.category}</p>
            <h2>{project.title}</h2>
            <div className="tags">
              {project.tags.map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            {project.url && (
              <div className="inline-links">
                <a
                  className="text-link"
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Upstream reference ↗ <span className="sr-only">(opens in a new tab)</span>
                </a>
              </div>
            )}
          </div>
          <div>
            {[
              ["The problem", project.problem],
              ["The work", project.contribution],
              ["Design tradeoff", project.tradeoff],
              ["Validation", project.validation],
              ["Limits", project.limitations],
            ].map(([heading, body]) => (
              <section key={heading}>
                <h3>{heading}</h3>
                <p>{body}</p>
              </section>
            ))}
            <section aria-label={`${project.title} evidence`}>
              <h3>Inspect the evidence</h3>
              <div className="inline-links">
                {(PROJECT_EVIDENCE_LINKS[project.id] ?? DEFAULT_EVIDENCE_LINKS).map((item) =>
                  item.isRaw ? (
                    <a key={item.href} className="text-link" href={item.href}>
                      {item.label}
                    </a>
                  ) : (
                    <Link key={item.href} className="text-link" href={item.href}>
                      {item.label}
                    </Link>
                  )
                )}
                <a className="text-link" href="/labs/engineering-labs.zip" download>
                  Download labs ↓
                </a>
              </div>
              <p>
                Small teaching implementations; these files do not establish production or GPU
                performance.
              </p>
            </section>
            <h3>Read the accompanying work</h3>
            <ul>
              {project.articles.map((slug) => {
                const article = articles.find((a) => a.slug === slug);
                return article ? (
                  <li key={slug}>
                    <Link className="text-link" href={`/articles/${slug}`}>
                      {article.title}
                    </Link>
                  </li>
                ) : null;
              })}
            </ul>
          </div>
        </article>
      ))}
    </div>
  );
}
