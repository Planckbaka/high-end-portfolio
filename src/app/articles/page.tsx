import { pageMetadata } from "@/lib/page-metadata";
import ArticlesClient from "./ArticlesClient";
import { getAllArticles } from "@/lib/markdown";

// Force this page to be statically generated at build time
// This is required for Cloudflare Workers deployment
export const dynamic = "force-static";
export const revalidate = false;

export const metadata = pageMetadata(
  "Writing",
  "Engineering notes on Go, Python, and model inference, with reproducible experiments.",
  "/articles"
);

export default async function ArticlesPage() {
  const articles = await getAllArticles();
  return <ArticlesClient articles={articles} />;
}
