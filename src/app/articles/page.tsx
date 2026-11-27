import { pageMetadata } from "@/lib/page-metadata";
import ArticlesClient from "./ArticlesClient";
import { getAllArticles } from "@/lib/markdown";
import { getLabsManifest } from "@/lib/labs";
import { siteConfig } from "@/config/site";
import { breadcrumbJsonLd, collectionPageJsonLd, serializeJsonLd } from "@/lib/seo";

// Force this page to be statically generated at build time
// This is required for Cloudflare Workers deployment
export const dynamic = "force-static";
export const revalidate = false;

export const metadata = pageMetadata(
  "Writing",
  "Engineering notes on Go, Python, and model inference, with reproducible experiments.",
  "/articles"
);

export default function ArticlesPage() {
  const articles = getAllArticles({ includeToc: true });
  const labCount = getLabsManifest().labs.length;
  const collectionLd = collectionPageJsonLd({
    name: "Writing",
    description: "Engineering notes on Go, Python, and model inference, with reproducible experiments.",
    path: "/articles",
    items: articles.map((a) => ({
      name: a.title,
      url: `${siteConfig.url}/articles/${a.slug}`,
      description: a.excerpt,
    })),
  });
  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", url: siteConfig.url },
    { name: "Writing", url: `${siteConfig.url}/articles` },
  ]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbLd) }}
      />
      <ArticlesClient articles={articles} labCount={labCount} />
    </>
  );
}
