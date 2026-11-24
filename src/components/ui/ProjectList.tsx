import Link from "next/link";
import type { Project } from "@/types";
export function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div className="project-grid">
      {projects.map((project, index) => (
        <article className="project-card" key={project.id}>
          <div className="project-index" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
            <span> /</span>
          </div>
          <p className="eyebrow">{project.category}</p>
          <h3>
            <Link href={`/projects#${project.id}`}>
              {project.title} <span aria-hidden="true">↗</span>
            </Link>
          </h3>
          <p>{project.description}</p>
          <div className="tags">
            {project.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
