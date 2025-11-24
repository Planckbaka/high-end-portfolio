import { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/markdown';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://high-end-portfolio.1229773363.workers.dev';

    // Static pages
    const staticPages = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/articles`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        },
    ];

    // Dynamic article pages from Markdown files
    const articles = await getAllArticles();
    const articlePages = articles.map((article) => ({
        url: `${baseUrl}/articles/${article.slug}`,
        lastModified: new Date(article.date),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }));

    return [...staticPages, ...articlePages];
}
