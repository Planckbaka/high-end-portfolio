import Link from "next/link";
import { Hero } from "@/components/ui/Hero";
import { ProjectList } from "@/components/ui/ProjectList";
import { FeaturedArticle, ArticleRow } from "@/components/ui/ArticleCard";
import { projects } from "@/config/data";
import { getAllArticles } from "@/lib/markdown";
export default async function Home() {
  const articles = await getAllArticles();
  const featured = articles.filter((article) => article.featured).slice(0, 3);
  return (
    <div className="site-shell">
      <Hero />
      <section className="section" aria-labelledby="selected-writing">
        <div className="section-heading">
          <h2 id="selected-writing">
            <span className="section-number">01</span>Selected writing
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
      <Link className="series-banner" href="/series/reliable-model-systems">
        <span className="eyebrow">The guided series / 06 chapters</span>
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
      <section className="section" id="work" aria-labelledby="selected-projects">
        <div className="section-heading">
          <h2 id="selected-projects">
            <span className="section-number">02</span>From the workbench
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
            <span className="section-number">03</span>Recent notes
          </h2>
          <span className="eyebrow">Always a work in progress</span>
        </div>
        {articles.slice(0, 4).map((article) => (
          <ArticleRow key={article.slug} article={article} />
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
