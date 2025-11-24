import type { Metadata } from "next";
import ArticlesClient from "./ArticlesClient";
import { getAllArticles } from "@/lib/markdown";

// Force this page to be statically generated at build time
// This is required for Cloudflare Workers deployment
export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
    title: "Articles",
    description: "Thoughts on Advanced Go development, Kubernetes, Docker, Kafka, Redis, and Linux system programming.",
    openGraph: {
        title: "Articles | Akiwayne's Portfolio",
        description: "Thoughts on Advanced Go development, Kubernetes, Docker, Kafka, Redis, and Linux system programming.",
    },
};

export default async function ArticlesPage() {
    const articles = await getAllArticles();
    return <ArticlesClient articles={articles} />;
}
