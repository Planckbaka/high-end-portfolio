import { pageMetadata } from "@/lib/page-metadata";
import Link from "next/link";
import { projects } from "@/config/data";
import { getAllArticles } from "@/lib/markdown";
export const metadata = pageMetadata(
  "Projects",
  "Agent engineering and reproducible Go, Python, and CPU model-inference experiments.",
  "/projects"
);
export default async function Projects() {
  const articles = await getAllArticles();
  return (
    <div className="site-shell page-bottom">
      <header className="page-heading">
        <p className="eyebrow">Selected work</p>
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
              0{index + 1} / {project.category}
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
              0{index + 1}
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
                  Upstream reference ↗
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
                <a
                  className="text-link"
                  href={project.id === "pi-go" ? "/labs/go/agent/agent.go" : "/labs/README.md"}
                >
                  {project.id === "pi-go" ? "Teaching implementation ↗" : "Reproduction guide ↗"}
                </a>
                <a
                  className="text-link"
                  href={
                    project.id === "pi-go"
                      ? "/labs/go/agent/agent_test.go"
                      : "/labs/llm/kv-cache/test_decoder.py"
                  }
                >
                  {project.id === "pi-go" ? "Lifecycle tests ↗" : "Decoder correctness tests ↗"}
                </a>
                {project.id !== "pi-go" && (
                  <a className="text-link" href="/labs/results/cache-results.json">
                    Raw CPU measurements ↗
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
