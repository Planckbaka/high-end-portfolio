import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllLabs, getLabDetail, getLabSummary } from "@/lib/labs";
import { getAllArticles } from "@/lib/markdown";
import { pageMetadata } from "@/lib/page-metadata";
import { CodeCopyEnhancement } from "@/components/ui/ArticleTools";
import type { LabFile } from "@/types";

export const dynamic = "force-static";
export const revalidate = false;

export async function generateStaticParams() {
  return getAllLabs().map((lab) => ({
    track: lab.track,
    name: lab.name,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ track: string; name: string }>;
}) {
  const { track, name } = await params;
  const lab = getLabSummary(track, name);
  if (!lab) {
    return { title: "Lab Not Found" };
  }
  return pageMetadata(
    `${lab.title} — Lab`,
    lab.summary || `Reproducible ${track.toUpperCase()} implementation and verification suite.`,
    `/${lab.labPath}`
  );
}

const KIND_BADGE: Record<LabFile["kind"], string> = {
  impl: "Implementation",
  test: "Verification Suite",
  result: "Recorded Output",
};

export default async function LabDetailPage({
  params,
}: {
  params: Promise<{ track: string; name: string }>;
}) {
  const { track, name } = await params;
  const lab = await getLabDetail(track, name);
  if (!lab) {
    notFound();
  }

  const articlesBySlug = new Map(getAllArticles().map((a) => [a.slug, a]));
  const companions = lab.companionSlugs
    .map((slug) => articlesBySlug.get(slug))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));
  const runSnippet = lab.runCommands.join("\n");

  return (
    <div className="site-shell paper-shell page-bottom">
      <div className="paper-topbar" role="region" aria-label="Lab utilities">
        <div className="paper-topbar-left">
          <Link className="btn-pill back-link" href="/labs">
            ← All Labs
          </Link>
          {companions[0] && (
            <Link className="btn-pill" href={`/articles/${companions[0].slug}`}>
              Companion Article ↗
            </Link>
          )}
        </div>
        <div className="paper-topbar-actions">
          {runSnippet && (
            <button
              type="button"
              className="btn-pill"
              data-copy-text={runSnippet}
              data-copied-label="Copied command!"
              aria-label="Copy lab run commands"
            >
              Copy Run Command
            </button>
          )}
          <a className="btn-pill" href="/labs/engineering-labs.zip" download>
            Download All (.zip) ↓
          </a>
        </div>
      </div>

      <header className="article-heading paper-header">
        <p className="paper-category">
          Reproducible CPU Lab · {track.toUpperCase()}
        </p>
        <h1 className="paper-title">{lab.title}</h1>
        <div className="article-meta paper-meta-row">
          <span className="paper-meta-item">/{lab.labPath}</span>
          <span className="paper-meta-item">{lab.files.length} source &amp; verification files</span>
          <a className="text-link paper-meta-item" href={`/${lab.labPath}/README.md`}>
            Raw README.md
          </a>
        </div>
      </header>

      <div className="lab-detail-body">
        {companions.length > 0 && (
          <section className="abstract-box" aria-label="Companion articles">
            <div className="abstract-title">Companion Writing</div>
            <div className="lab-companion-list">
              {companions.map((article) => (
                <div key={article.slug} className="lab-companion-item">
                  <Link className="text-link" href={`/articles/${article.slug}`}>
                    {article.title} ↗
                  </Link>
                  <p>{article.excerpt}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="prose lab-readme-prose" dangerouslySetInnerHTML={{ __html: lab.readmeHtml }} />

        <section className="lab-files-section" aria-labelledby="lab-source-files">
          <div className="lab-files-header">
            <h2 id="lab-source-files" className="paper-sec-heading">
              Source &amp; Verification Files
            </h2>
            <span className="eyebrow">
              Primary implementation expanded · Click any file header to toggle
            </span>
          </div>

          <div className="lab-file-stack">
            {lab.files.map((file) => (
              <details
                key={file.relativePath}
                className="lab-file-panel"
                open={file.defaultOpen ? true : undefined}
              >
                <summary className="lab-file-summary">
                  <div className="lab-file-summary-left">
                    <span className="lab-file-kind" data-kind={file.kind}>
                      {KIND_BADGE[file.kind]}
                    </span>
                    <code className="lab-file-name">{file.name}</code>
                  </div>
                  <div className="lab-file-summary-right">
                    <span className="lab-file-lines">{file.lineCount} lines</span>
                    <span className="lab-file-toggle-hint" aria-hidden="true" />
                  </div>
                </summary>
                <div className="lab-file-content">
                  <div className="lab-file-subbar">
                    <span>/{file.relativePath}</span>
                    <a className="text-link" href={`/${file.relativePath}`} download={file.name}>
                      Raw file ↓
                    </a>
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: file.html }} />
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>

      <CodeCopyEnhancement key={lab.labPath} />
    </div>
  );
}
