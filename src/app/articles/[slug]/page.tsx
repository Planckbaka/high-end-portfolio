import "katex/dist/katex.min.css";
import {
  getAllArticleSlugs,
  getArticleBySlug,
  getArticleSummaryBySlug,
  getAllArticles,
} from "@/lib/markdown";
import { getRelatedArticles } from "@/lib/related-articles";
import ArticleClient from "./ArticleClient";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { seriesPathForTitle } from "@/lib/series";
import { breadcrumbJsonLd, personEntity, serializeJsonLd, WEBSITE_ID } from "@/lib/seo";

// Force static generation for Cloudflare Workers compatibility
export const dynamic = "force-static";
export const revalidate = false;

export async function generateStaticParams() {
  const slugs = getAllArticleSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleSummaryBySlug(slug);

  if (!article) {
    return {
      title: "Article Not Found",
      alternates: {},
      robots: { index: false, follow: false },
    };
  }

  // Per-article share card, pre-rendered at build time by
  // scripts/generate-og-image.mjs into public/og/articles/<slug>.png.
  const ogImage = `/og/articles/${slug}.png`;
  const canonicalUrl = `${siteConfig.url}/articles/${slug}`;
  const citationDate = article.date.replaceAll("-", "/");

  const otherMeta: Record<string, string> = {
    citation_title: article.title,
    citation_author: siteConfig.author.name,
    citation_publication_date: citationDate,
    citation_online_date: (article.updatedAt || article.date).replaceAll("-", "/"),
    citation_journal_title: article.series || siteConfig.name,
    citation_language: "en",
    citation_public_url: canonicalUrl,
  };
  if (article.tags && article.tags.length > 0) {
    otherMeta.citation_keywords = article.tags.join("; ");
  }

  return {
    /*
     * Bare title only. The root layout defines
     * `title.template = "%s | ${siteConfig.name}"`, so appending the site
     * name here would duplicate it.
     */
    title: article.title,
    description: article.excerpt,
    keywords: article.tags,
    alternates: {
      canonical: canonicalUrl,
      types: { "application/rss+xml": "/feed.xml" },
    },
    openGraph: {
      // openGraph titles are not run through the template, so the site
      // name is spelled out once here on purpose.
      title: `${article.title} | ${siteConfig.name}`,
      description: article.excerpt,
      type: "article",
      siteName: siteConfig.name,
      locale: "en_US",
      publishedTime: article.date,
      modifiedTime: article.updatedAt || article.date,
      authors: [siteConfig.author.name],
      section: article.category,
      tags: article.tags,
      url: canonicalUrl,
      images: [{ url: ogImage, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${article.title} | ${siteConfig.name}`,
      description: article.excerpt,
      images: [ogImage],
      // Not inherited: Next shallow-merges page metadata over the layout's.
      creator: siteConfig.author.twitter,
    },
    other: otherMeta,
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const allArticles = getAllArticles();
  const series = article.series
    ? allArticles
        .filter((a) => a.series === article.series)
        .sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0))
    : [];
  const position = series.findIndex((a) => a.slug === slug);
  const previous = position > 0 ? series[position - 1] : undefined;
  const next = position >= 0 ? series[position + 1] : undefined;

  // Layered reading flow: intermediate series chapters stay strictly linear,
  // while standalone articles and series finales surface 3 related pieces.
  const related = !next
    ? getRelatedArticles(article, allArticles, {
        excludeSlugs: previous ? [previous.slug] : [],
        limit: 3,
      })
    : [];

  const canonicalUrl = `${siteConfig.url}/articles/${slug}`;
  const wordCount = article.content
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const breadcrumbItems: Array<{ name: string; url?: string }> = [
    { name: "Home", url: siteConfig.url },
    { name: "Writing", url: `${siteConfig.url}/articles` },
  ];
  if (article.series) {
    breadcrumbItems.push({
      name: article.series,
      url: `${siteConfig.url}${seriesPathForTitle(article.series)}`,
    });
  }
  breadcrumbItems.push({ name: article.title, url: canonicalUrl });
  const breadcrumbLd = breadcrumbJsonLd(breadcrumbItems);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    articleSection: article.category,
    wordCount,
    datePublished: article.date,
    dateModified: article.updatedAt || article.date,
    inLanguage: "en",
    image: {
      "@type": "ImageObject",
      url: `${siteConfig.url}/og/articles/${slug}.png`,
      width: 1200,
      height: 630,
    },
    keywords: article.tags?.join(", "),
    mainEntityOfPage: canonicalUrl,
    isPartOf: article.series
      ? {
          "@type": "CreativeWorkSeries",
          name: article.series,
          url: `${siteConfig.url}${seriesPathForTitle(article.series)}`,
        }
      : { "@id": WEBSITE_ID },
    ...(article.papers && article.papers.length > 0
      ? {
          citation: article.papers.map((p) => ({
            "@type": "ScholarlyArticle",
            name: p.title,
            url: `https://arxiv.org/abs/${p.arxiv}`,
            datePublished: String(p.year),
          })),
        }
      : {}),
    author: personEntity(),
    url: canonicalUrl,
    publisher: personEntity(),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbLd) }}
      />
      <ArticleClient
        article={article}
        previous={previous}
        next={next}
        related={related}
      />
    </>
  );
}
