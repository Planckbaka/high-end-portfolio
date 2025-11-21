import { articles } from "@/config/data";
import ArticleClient from "./ArticleClient";
import { notFound } from "next/navigation";

export function generateStaticParams() {
    return articles.map((article) => ({
        slug: article.slug,
    }));
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const article = articles.find((a) => a.slug === slug);

    if (!article) {
        notFound();
    }

    return <ArticleClient article={article} />;
}
