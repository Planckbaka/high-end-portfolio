import { getAllArticleSlugs, getArticleBySlug } from "@/lib/markdown";
import ArticleClient from "./ArticleClient";
import { notFound } from "next/navigation";

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

    return {
        title: `${article.title} | Akiwayne's Portfolio`,
        description: article.excerpt,
        openGraph: {
            title: article.title,
            description: article.excerpt,
            type: "article",
            publishedTime: article.date,
            authors: ["Akiwayne"],
        },
    };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);

    if (!article) {
        notFound();
    }

    return <ArticleClient article={article} />;
}
