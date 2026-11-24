import Link from "next/link";
import { Hero } from "@/components/ui/Hero";
import { ProjectList } from "@/components/ui/ProjectList";
import { FeaturedArticle, ArticleRow } from "@/components/ui/ArticleCard";
import { projects } from "@/config/data";
import { siteConfig } from "@/config/site";
import { getAllArticles } from "@/lib/markdown";
import { modelSystemsArticles, llmInfraArticles, LLM_INFRA_SERIES } from "@/lib/series";
export default function Home() {
  const articles = getAllArticles();
  const featured = articles.filter((article) => article.featured).slice(0, 3);
  const chapterCount = modelSystemsArticles(articles).length;
  const infraArticlesList = llmInfraArticles(articles);
  const infraChapterCount = infraArticlesList.length;
  const infraPaperCount = infraArticlesList.reduce((sum, a) => sum + (a.papers?.length ?? 0), 0);
  /*
   * Recent notes skips the featured trio above it: the homepage otherwise
   * repeated the same titles and excerpts verbatim in two sections.
   */
  const recent = articles.filter((article) => !article.featured).slice(0, 5);
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
    <div className="site-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c") }}
      />
      <Hero />
      <section className="section" aria-labelledby="selected-writing">
        <div className="section-heading">
          <h2 id="selected-writing">
            <span className="section-number" aria-hidden="true">01</span>Selected writing
          </h2>
          <Link className="text-link" href="/articles">
            All articles ↗
          </Link>
        </div>
        <div className="featured-grid">
          {featured.map((article) => (
            <FeaturedArticle key={article.slug} article={article} />
          ))}
        </div>
      </section>
      <div className="dual-series-banners">
        <Link className="series-banner" href={LLM_INFRA_SERIES.path}>
          <span className="series-banner-kind">
            Research monograph, {String(infraChapterCount).padStart(2, "0")} chapters,{" "}
            {infraPaperCount} arXiv papers
          </span>
          <span className="series-banner-title">
            LLM &amp; AI Infra.
            <br />
            First principles.
          </span>
          <span className="series-banner-copy">
            From RoPE, FlashAttention-2, and DeepSeek MLA to V4.1 CED, AttnRes, Muon, Looped
            Transformers, and Block Diffusion LLMs. Derive the math, audit the Roofline ledger, and
            run the PyTorch tests.
            <span className="series-banner-action">Read the monograph ↗</span>
          </span>
        </Link>
        <Link className="series-banner series-banner-secondary" href="/series/reliable-model-systems">
          <span className="series-banner-kind">
            The guided series, {String(chapterCount).padStart(2, "0")} chapters, runnable CPU labs
          </span>
          <span className="series-banner-title">
            Reliable models.
            <br />
            Deliberate systems.
          </span>
          <span className="series-banner-copy">
            From bounded Go workers to a tiny cached decoder. Read the explanations, then test the
            mechanisms.<span className="series-banner-action">Begin the series ↗</span>
          </span>
        </Link>
      </div>
      <section className="section" id="work" aria-labelledby="selected-projects">
        <div className="section-heading">
          <h2 id="selected-projects">
            <span className="section-number" aria-hidden="true">02</span>From the workbench
          </h2>
          <Link className="text-link" href="/projects">
            Projects ↗
          </Link>
        </div>
        <ProjectList projects={projects} />
      </section>
      <section className="section" aria-labelledby="latest-writing">
        <div className="section-heading">
          <h2 id="latest-writing">
            <span className="section-number" aria-hidden="true">03</span>Recent notes
          </h2>
          <span className="eyebrow">Always a work in progress</span>
        </div>
        {recent.map((article) => (
          <ArticleRow key={article.slug} article={article} compact />
        ))}
      </section>
      <section className="contact-strip">
        <div>
          <h2>Good systems start with a conversation.</h2>
          <p>Working on backend reliability or model-serving infrastructure?</p>
        </div>
        <Link className="button" href="/contact">
          Get in touch ↗
        </Link>
      </section>
    </div>
  );
}
