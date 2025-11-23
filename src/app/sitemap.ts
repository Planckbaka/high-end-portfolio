import { MetadataRoute } from 'next';
import { articles } from '@/config/data';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://yourportfolio.com'; // Update with your actual domain

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

    // Dynamic article pages
    const articlePages = articles.map((article) => ({
        url: `${baseUrl}/articles/${article.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }));

    return [...staticPages, ...articlePages];
}
