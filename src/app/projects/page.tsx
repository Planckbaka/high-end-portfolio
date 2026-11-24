import { pageMetadata } from "@/lib/page-metadata";
import Link from "next/link";
import { projects } from "@/config/data";
import { getAllArticles } from "@/lib/markdown";
export const metadata = pageMetadata(
  "Projects",
  "Agent engineering and reproducible Go, Python, and CPU model-inference experiments.",
  "/projects"
);
export default function Projects() {
  const articles = getAllArticles();
  return (
    <div className="site-shell page-bottom">
      <header className="page-heading">
        <h1>
          Built to be
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
              {String(index + 1).padStart(2, "0")} / {project.category}
            </span>
            <span>
              {project.title}
              <span aria-hidden="true">↘</span>
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
                  Upstream reference ↗<span className="sr-only">(opens in a new tab)</span>
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
                <Link
                  className="text-link"
                  href={
                    project.id === "pi-go"
                      ? "/labs/go/agent"
                      : project.id === "gemini-research"
                        ? "/labs/llm/flagship-2026"
                        : "/labs"
                  }
                >
                  {project.id === "pi-go"
                    ? "Teaching implementation ↗"
                    : project.id === "gemini-research"
                      ? "2026 Flagship & Muon lab ↗"
                      : "Reproduction guide ↗"}
                </Link>
                <Link
                  className="text-link"
                  href={
                    project.id === "pi-go"
                      ? "/labs/go/gateway"
                      : project.id === "gemini-research"
                        ? "/labs/llm/roofline-flash"
                        : "/labs/llm/kv-cache"
                  }
                >
                  {project.id === "pi-go"
                    ? "Gateway admission lab ↗"
                    : project.id === "gemini-research"
                      ? "Roofline & Online Softmax lab ↗"
                      : "Decoder & KV cache lab ↗"}
                </Link>
                {project.id !== "pi-go" && (
                  <a
                    className="text-link"
                    href={
                      project.id === "gemini-research"
                        ? "/series/llm-ai-infra"
                        : "/labs/results/cache-results.json"
                    }
                  >
                    {project.id === "gemini-research"
                      ? "Nine-part research monograph ↗"
                      : "Raw CPU measurements ↗"}
                  </a>
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
