import type { Article } from '@/types';

// Import pre-generated articles data  
// This file is generated at build time by scripts/generate-articles-data.mjs
let articlesData: Article[] = [];

try {
    // In Cloudflare Workers environment, we use the pre-generated JSON
    articlesData = require('./articles-data.json');
} catch (error) {
    console.warn('Failed to load articles data:', error);
    articlesData = [];
}

/**
 * Get all articles from pre-generated data
 */
export async function getAllArticles(): Promise<Article[]> {
    return articlesData.map(article => ({
        ...article,
        content: '', // Don't include content for list view
    }));
}

/**
 * Get a single article by slug from pre-generated data
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
    const article = articlesData.find(a => a.slug === slug);
    return article || null;
}

/**
 * Get all article slugs for static generation
 */
export function getAllArticleSlugs(): string[] {
    return articlesData.map(a => a.slug);
}
