import { getAllArticleSlugs, getArticleBySlug } from "@/lib/markdown";
import ArticleClient from "./ArticleClient";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";

// Force static generation for Cloudflare Workers compatibility
export const dynamic = 'force-static';
export const revalidate = false;

export async function generateStaticParams() {
    const slugs = getAllArticleSlugs();
    return slugs.map((slug) => ({
        slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);

    if (!article) {
        return {
            title: "Article Not Found",
        };
    }

    // Per-article share card, pre-rendered at build time by
    // scripts/generate-og-image.mjs into public/og/articles/<slug>.png.
    const ogImage = `/og/articles/${slug}.png`;

    return {
        /*
         * Bare title only. The root layout defines
         * `title.template = "%s | Akiwayne's Portfolio"`, so appending the site
         * name here produced "… | Akiwayne's Portfolio | Akiwayne's Portfolio".
         */
        title: article.title,
        description: article.excerpt,
        alternates: {
            canonical: `${siteConfig.url}/articles/${slug}`,
        },
        openGraph: {
            // openGraph titles are not run through the template, so the site
            // name is spelled out once here on purpose.
            title: `${article.title} | ${siteConfig.name}`,
            description: article.excerpt,
            type: "article",
            publishedTime: article.date,
            authors: [siteConfig.author.name],
            url: `${siteConfig.url}/articles/${slug}`,
            images: [{ url: ogImage, width: 1200, height: 630, alt: article.title }],
        },
        twitter: {
            card: "summary_large_image",
            title: `${article.title} | ${siteConfig.name}`,
            description: article.excerpt,
            images: [ogImage],
        },
    };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);

    if (!article) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: article.title,
        description: article.excerpt,
        datePublished: article.date,
        author: {
            "@type": "Person",
            name: siteConfig.author.name,
            url: siteConfig.url,
        },
        url: `${siteConfig.url}/articles/${slug}`,
        publisher: {
            "@type": "Person",
            name: siteConfig.author.name,
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ArticleClient article={article} />
        </>
    );
}
