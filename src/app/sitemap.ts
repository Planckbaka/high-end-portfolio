import { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/markdown";
import { getAllLabs } from "@/lib/labs";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;

  /*
   * Fully static output: pages can only change when a new build deploys, so
   * lastModified is the build time. Article dates are more precise and come
   * from their own frontmatter below.
   */
  const builtAt = new Date();
  const staticPages = [
    ...["projects", "about", "labs", "series/reliable-model-systems", "series/llm-ai-infra"].map(
      (path) => ({
        url: `${baseUrl}/${path}`,
        lastModified: builtAt,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })
    ),
    {
      url: baseUrl,
      lastModified: builtAt,
      changeFrequency: "monthly" as const,
      priority: 1,
      images: [`${baseUrl}/og-image.png`],
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: builtAt,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: builtAt,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    },
  ];

  // Dynamic article pages from Markdown files
  const articles = getAllArticles();
  const articlePages = articles.map((article) => ({
    url: `${baseUrl}/articles/${article.slug}`,
    lastModified: new Date(article.updatedAt || article.date),
    changeFrequency: "weekly" as const,
    priority: 0.8,
    images: [`${baseUrl}/og/articles/${article.slug}.png`],
  }));

  const labPages = getAllLabs().map((lab) => ({
    url: `${baseUrl}/${lab.labPath}`,
    lastModified: builtAt,
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  return [...staticPages, ...articlePages, ...labPages];
}
