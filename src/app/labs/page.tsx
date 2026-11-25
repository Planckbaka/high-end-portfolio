import Link from "next/link";
import { getLabsManifest } from "@/lib/labs";
import { getAllArticles } from "@/lib/markdown";
import { pageMetadata } from "@/lib/page-metadata";
import { CodeCopyEnhancement } from "@/components/ui/ArticleTools";

export const dynamic = "force-static";
export const revalidate = false;

const LAB_COUNT = getLabsManifest().labs.length;

export const metadata = pageMetadata(
  "Engineering Labs",
  `${LAB_COUNT} reproducible CPU experiments in Go, Python, and PyTorch accompanying the systems and LLM infrastructure monographs.`,
  "/labs"
);

const TRACK_LABELS: Record<"llm" | "go" | "python", { title: string; subtitle: string }> = {
  llm: {
    title: "LLM & Tensor Verification Labs",
    subtitle: "Deterministic CPU PyTorch proofs: RoPE, Online Softmax tiling, KV cache, MLA absorption & GRPO",
  },
  go: {
    title: "Go Runtime & Lifecycle Labs",
    subtitle: "Bounded admission control, graceful draining, and deterministic agent loops tested under -race",
  },
  python: {
    title: "Python Orchestration & Telemetry Labs",
    subtitle: "Structured TaskGroup cancellation and streaming TTFT/ITL latency measurement",
  },
};

export default function LabsIndexPage() {
  const manifest = getLabsManifest();
  const articlesBySlug = new Map(getAllArticles().map((a) => [a.slug, a]));
  const tracks: Array<"llm" | "go" | "python"> = ["llm", "go", "python"];

  return (
    <div className="site-shell page-bottom">
      <nav className="paper-breadcrumb-bar" aria-label="Lab archive utilities">
        <div className="paper-breadcrumb-left">
          <Link className="paper-crumb back-link" href="/articles">
            ← All Writing
          </Link>
        </div>
        <div className="paper-breadcrumb-actions">
          <a className="paper-util-link" href="/labs/engineering-labs.zip" download>
            Download All Labs (.zip) ↓
          </a>
        </div>
      </nav>

      <header className="page-heading">
        <p className="eyebrow">
          <span className="eyebrow-dot" />
          Companion implementations · {manifest.labs.length} reproducible CPU labs
        </p>
        <h1>
          Engineering
          <br />
          labs.
        </h1>
        <p>
          {manifest.labs.length} self-contained CPU implementations and test suites paired with the
          writing. Every mechanism—from bounded Go admission gates to DeepSeek MLA matrix
          absorption—runs locally without GPUs or external API keys.
        </p>
      </header>

      {tracks.map((track) => {
        const items = manifest.labs.filter((lab) => lab.track === track);
        const info = TRACK_LABELS[track];
        return (
          <section key={track} className="section lab-track-section" aria-labelledby={`track-${track}`}>
            <div className="section-heading">
              <div>
                <h2 id={`track-${track}`}>{info.title}</h2>
                <p className="lab-track-subtitle">{info.subtitle}</p>
              </div>
              <span className="eyebrow">{items.length} labs</span>
            </div>
            <div className="lab-grid">
              {items.map((lab) => (
                <article key={lab.labPath} className="lab-card">
                  <div className="lab-card-meta">
                    <span className="eyebrow">/{lab.labPath}</span>
                    <span className="eyebrow">{lab.fileCount} files</span>
                  </div>
                  <h3>
                    <Link href={`/${lab.labPath}`}>{lab.title}</Link>
                  </h3>
                  {lab.summary && <p className="lab-card-summary">{lab.summary}</p>}
                  {lab.companionSlugs.length > 0 && (
                    <div className="lab-companion-links">
                      <span className="eyebrow">Companion writing:</span>
                      {lab.companionSlugs.map((slug) => {
                        const companion = articlesBySlug.get(slug);
                        return companion ? (
                          <Link key={slug} className="text-link" href={`/articles/${slug}`}>
                            {companion.title} ↗
                          </Link>
                        ) : null;
                      })}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <section className="section lab-guide-section" aria-labelledby="reproduction-guide">
        <div className="section-heading">
          <h2 id="reproduction-guide">Environment &amp; reproduction guide</h2>
          <a className="text-link" href="/labs/engineering-labs.zip" download>
            engineering-labs.zip ↓
          </a>
        </div>
        <div className="prose lab-overview-prose" dangerouslySetInnerHTML={{ __html: manifest.overviewHtml }} />
      </section>

      <CodeCopyEnhancement key="labs-index" />
    </div>
  );
}
