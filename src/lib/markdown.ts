import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeStringify from 'rehype-stringify';
import type { Article } from '@/types';

const articlesDirectory = path.join(process.cwd(), 'content/articles');

/**
 * Calculate reading time
 */
function getReadingTime(content: string): string {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
}

/**
 * Helper: Validate article data
 */
function validateArticleData(data: any, slug: string): boolean {
    if (!data.title || !data.date || !data.category) {
        console.warn(`Missing required fields in ${slug}.md`);
        return false;
    }
    return true;
}

/**
 * Helper: Generate excerpt from content
 */
function generateExcerpt(content: string, dataExcerpt?: string): string {
    if (dataExcerpt) return dataExcerpt;

    // Remove markdown syntax more aggressively
    const plainText = content
        .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links but keep text
        .replace(/#{1,6}\s+/g, '') // Remove headings
        .replace(/`{3}[\s\S]*?`{3}/g, '') // Remove code blocks
        .replace(/`([^`]+)`/g, '$1') // Remove inline code
        .replace(/[*_~]/g, '') // Remove emphasis
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .trim();

    return plainText.substring(0, 150) + '...';
}

/**
 * Get all articles from markdown files (metadata only)
 */
export async function getAllArticles(): Promise<Article[]> {
    // Ensure directory exists
    if (!fs.existsSync(articlesDirectory)) {
        await fs.promises.mkdir(articlesDirectory, { recursive: true });
        return [];
    }

    const fileNames = await fs.promises.readdir(articlesDirectory);
    const mdFiles = fileNames.filter(file => file.endsWith('.md'));

    const articlesPromise = mdFiles.map(async (fileName): Promise<Article | null> => {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(articlesDirectory, fileName);
        const fileContents = await fs.promises.readFile(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        if (!validateArticleData(data, slug)) {
            return null;
        }

        return {
            id: data.id || slug,
            title: data.title,
            date: data.date,
            category: data.category,
            excerpt: generateExcerpt(content, data.excerpt),
            slug,
            content: '', // Content is not needed for the list view
            readingTime: getReadingTime(content),
        };
    });

    const allArticles = await Promise.all(articlesPromise);

    // Filter out null values and sort by date (newest first)
    return allArticles
        .filter((article): article is Article => article !== null)
        .sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB.getTime() - dateA.getTime();
        });
}

/**
 * Get a single article by slug
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
    try {
        const fullPath = path.join(articlesDirectory, `${slug}.md`);

        if (!fs.existsSync(fullPath)) {
            return null;
        }

        const fileContents = await fs.promises.readFile(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        // Process markdown with unified pipeline
        const file = await unified()
            .use(remarkParse)
            .use(remarkGfm)
            .use(remarkRehype)
            .use(rehypeSlug)
            .use(rehypeAutolinkHeadings, {
                behavior: 'wrap',
                properties: {
                    className: ['anchor'],
                },
            })
            .use(rehypePrettyCode, {
                theme: 'github-dark',
                keepBackground: true,
                onVisitLine(node: any) {
                    // Prevent lines from collapsing in `display: grid` mode, and
                    // allow empty lines to be copy/pasted
                    if (node.children.length === 0) {
                        node.children = [{ type: 'text', value: ' ' }];
                    }
                },
                onVisitHighlightedLine(node: any) {
                    if (node.properties?.className) {
                        node.properties.className.push('highlighted');
                    }
                },
                onVisitHighlightedWord(node: any) {
                    if (node.properties) {
                        node.properties.className = ['word'];
                    }
                },
            } as any)
            .use(rehypeStringify)
            .process(content);

        const contentHtml = file.toString();
        const readingTime = getReadingTime(content);

        if (!validateArticleData(data, slug)) {
            return null;
        }

        return {
            id: data.id || slug,
            title: data.title,
            date: data.date,
            category: data.category,
            excerpt: generateExcerpt(content, data.excerpt),
            slug,
            content: contentHtml,
            readingTime, // Add reading time to the returned object
        };
    } catch (error) {
        console.error(`Error reading article ${slug}:`, error);
        return null;
    }
}

/**
 * Get all article slugs for static generation
 */
export function getAllArticleSlugs(): string[] {
    if (!fs.existsSync(articlesDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(articlesDirectory);
    return fileNames
        .filter(file => file.endsWith('.md'))
        .map(fileName => fileName.replace(/\.md$/, ''));
}
