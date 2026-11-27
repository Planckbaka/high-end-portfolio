import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllLabs, getLabDetail, getLabSummary } from "@/lib/labs";
import { getAllArticles } from "@/lib/markdown";
import { pageMetadata } from "@/lib/page-metadata";
import { CodeCopyEnhancement } from "@/components/ui/ArticleTools";
import { siteConfig } from "@/config/site";
import { breadcrumbJsonLd, personEntity, serializeJsonLd } from "@/lib/seo";
import { LabFileStack } from "./LabFileStack";

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
    return {
      title: "Lab Not Found",
      alternates: {},
      robots: { index: false, follow: false },
    };
  }
  return pageMetadata(
    `${lab.title} — Lab`,
    lab.summary || `Reproducible ${track.toUpperCase()} implementation and verification suite.`,
    `/${lab.labPath}`
  );
}

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
  const labUrl = `${siteConfig.url}/${lab.labPath}`;
  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: lab.title,
    description: lab.summary || `Reproducible ${track.toUpperCase()} implementation and verification suite.`,
    url: labUrl,
    programmingLanguage: track === "go" ? "Go" : "Python",
    codeRepository: siteConfig.author.github,
    author: personEntity(),
    ...(companions.length > 0
      ? {
          isPartOf: companions.map((a) => ({
            "@type": "BlogPosting",
            headline: a.title,
            url: `${siteConfig.url}/articles/${a.slug}`,
          })),
        }
      : {}),
  };
  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", url: siteConfig.url },
    { name: "Engineering Labs", url: `${siteConfig.url}/labs` },
    { name: lab.title, url: labUrl },
  ]);

  return (
    <div className="site-shell paper-shell page-bottom">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(softwareLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbLd) }}
      />
      <nav className="paper-breadcrumb-bar" aria-label="Lab navigation and utilities">
        <div className="paper-breadcrumb-left">
          <Link className="paper-crumb back-link" href="/labs">
            ← All Labs
          </Link>
          {companions[0] && (
            <>
              <span className="paper-crumb-sep" aria-hidden="true">
                /
              </span>
              <Link className="paper-crumb" href={`/articles/${companions[0].slug}`}>
                Companion Article →
              </Link>
            </>
          )}
        </div>
        <div className="paper-breadcrumb-actions">
          {runSnippet && (
            <button
              type="button"
              className="paper-util-btn"
              data-copy-text={runSnippet}
              data-copied-label="Copied command!"
              aria-label="Copy lab run commands"
            >
              Copy Run Command
            </button>
          )}
          <a className="paper-util-link" href="/labs/engineering-labs.zip" download>
            Download All (.zip) ↓
          </a>
        </div>
      </nav>

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
                    {article.title} →
                  </Link>
                  <p>{article.excerpt}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="prose lab-readme-prose" dangerouslySetInnerHTML={{ __html: lab.readmeHtml }} />

        <LabFileStack files={lab.files} />
      </div>

      <CodeCopyEnhancement key={lab.labPath} />
    </div>
  );
}
