import Link from "next/link";
import { Hero } from "@/components/ui/Hero";
import { FeaturedArticle, ArticleRow } from "@/components/ui/ArticleCard";
import { MonographRoom } from "@/components/home/MonographRoom";
import { projects } from "@/config/data";
import { siteConfig } from "@/config/site";
import { getAllArticles } from "@/lib/markdown";
import { modelSystemsArticles, llmInfraArticles, LLM_INFRA_SERIES } from "@/lib/series";
import { getLabsManifest } from "@/lib/labs";

export default function Home() {
  const articles = getAllArticles();
  const featured = articles.filter((article) => article.featured).slice(0, 3);
  const chapterCount = modelSystemsArticles(articles).length;
  const infraArticlesList = llmInfraArticles(articles);
  const infraChapterCount = infraArticlesList.length;
  const infraPaperCount = infraArticlesList.reduce((sum, a) => sum + (a.papers?.length ?? 0), 0);
  const labsManifest = getLabsManifest();
  const recent = articles.filter((article) => !article.featured).slice(0, 6);

  const flagshipProject = projects.find((p) => p.id === "gemini-research") ?? projects[0];
  const piGoProject = projects.find((p) => p.id === "pi-go") ?? projects[1];
  const labsProject = projects.find((p) => p.id === "engineering-labs") ?? projects[2];

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "en",
    publisher: { "@type": "Person", name: siteConfig.author.name },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/articles?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c") }}
      />

      {/* Room 1: Cotton-Paper Editorial Hero */}
      <Hero
        stats={{
          chapters: infraChapterCount,
          papers: infraPaperCount,
          labs: labsManifest.labs.length,
          articles: articles.length,
        }}
      />

      <div className="site-shell">
        {/* Room 2: Selected Reading (Tactile Oat Islands) */}
        <section className="section" aria-labelledby="selected-writing">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Curated essays</span>
              <h2 id="selected-writing">Selected reading</h2>
            </div>
            <Link className="text-link" href="/articles">
              All {articles.length} articles →
            </Link>
          </div>
          <div className="featured-grid">
            {featured.map((article) => (
              <FeaturedArticle key={article.slug} article={article} />
            ))}
          </div>
        </section>

        {/* Room 3: Warm Carbon Monograph Dark Ink Room */}
        <MonographRoom
          chapters={infraArticlesList.map((ch) => ({
            slug: ch.slug,
            title: ch.title,
            excerpt: ch.excerpt,
            readingTime: ch.readingTime ?? "",
            seriesOrder: ch.seriesOrder ?? 0,
            paperCount: ch.papers?.length ?? 0,
            labPath: ch.labPath,
          }))}
          totalPapers={infraPaperCount}
          companionChapterCount={chapterCount}
        />

        {/* Room 4: Chronological Reading Ledger */}
        <section className="section" aria-labelledby="latest-writing">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Chronological archive</span>
              <h2 id="latest-writing">Recent writing</h2>
            </div>
            <Link className="text-link" href="/articles">
              Full archive →
            </Link>
          </div>
          <div>
            {recent.map((article) => (
              <ArticleRow key={article.slug} article={article} compact />
            ))}
          </div>
        </section>

        {/* Room 5: Companion Labs & Selected Projects Shelf */}
        <section className="section" id="work" aria-labelledby="selected-projects">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Executable companions</span>
              <h2 id="selected-projects">Labs &amp; selected projects</h2>
            </div>
            <Link className="text-link" href="/projects">
              All projects →
            </Link>
          </div>

          <div className="companion-shelf">
            <article className="companion-card">
              <div>
                <p className="eyebrow">{flagshipProject.category}</p>
                <h3>
                  <Link href={LLM_INFRA_SERIES.path}>{flagshipProject.title}</Link>
                </h3>
                <p>{flagshipProject.description}</p>
              </div>
              <Link className="text-link" href={`/projects#${flagshipProject.id}`}>
                Validation dossier →
              </Link>
            </article>

            <article className="companion-card">
              <div>
                <p className="eyebrow">{piGoProject.category}</p>
                <h3>
                  <Link href={`/projects#${piGoProject.id}`}>{piGoProject.title}</Link>
                </h3>
                <p>{piGoProject.description}</p>
              </div>
              <Link className="text-link" href="/labs/go/agent">
                Agent loop study →
              </Link>
            </article>

            <article className="companion-card">
              <div>
                <p className="eyebrow">{labsProject.category}</p>
                <h3>
                  <Link href="/labs">{labsManifest.labs.length} Companion CPU Labs</Link>
                </h3>
                <p>{labsProject.description}</p>
              </div>
              <Link className="text-link" href="/labs">
                Browse all {labsManifest.labs.length} labs →
              </Link>
            </article>
          </div>
        </section>

        {/* Quiet Correspondence Strip */}
        <section className="contact-strip">
          <div>
            <p className="eyebrow" style={{ marginBottom: 10 }}>
              <span className="eyebrow-dot" />
              Correspondence
            </p>
            <h2>Thoughtful questions and careful corrections are always welcome.</h2>
            <p>Working on backend reliability, model inference, or systems research?</p>
          </div>
          <Link className="button primary" href="/contact">
            Write a note →
          </Link>
        </section>
      </div>
    </>
  );
}
