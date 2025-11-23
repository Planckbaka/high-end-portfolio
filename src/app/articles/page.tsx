import type { Metadata } from "next";
import ArticlesClient from "./ArticlesClient";

export const metadata: Metadata = {
    title: "Articles",
    description: "Thoughts on Advanced Go development, Kubernetes, Docker, Kafka, Redis, and Linux system programming.",
    openGraph: {
        title: "Articles | Akiwayne's Portfolio",
        description: "Thoughts on Advanced Go development, Kubernetes, Docker, Kafka, Redis, and Linux system programming.",
    },
};

export default function ArticlesPage() {
    return <ArticlesClient />;
}
