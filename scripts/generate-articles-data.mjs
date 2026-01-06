import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeStringify from 'rehype-stringify';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const articlesDirectory = path.join(__dirname, '../content/articles');
const outputFile = path.join(__dirname, '../src/lib/articles-data.json');

/**
 * Calculate reading time
 */
function getReadingTime(content) {
    const wordsPerMinute = 100;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
}

/**
 * Helper: Validate article data
 */
function validateArticleData(data, slug) {
    if (!data.title || !data.date || !data.category) {
        console.warn(`Missing required fields in ${slug}.md`);
        return false;
    }
    return true;
}

/**
 * Helper: Generate excerpt from content
 */
function generateExcerpt(content, dataExcerpt) {
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
 * Process markdown content to HTML
 */
async function processMarkdown(content) {
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
        .use(rehypeStringify)
        .process(content);

    return file.toString();
}

/**
 * Generate articles data
 */
async function generateArticlesData() {
    console.log('Generating articles data...');
    console.log('Articles directory:', articlesDirectory);

    if (!fs.existsSync(articlesDirectory)) {
        console.error(`Articles directory not found: ${articlesDirectory}`);
        process.exit(1);
    }

    const fileNames = fs.readdirSync(articlesDirectory);
    const mdFiles = fileNames.filter(file => file.endsWith('.md') && !file.startsWith('.'));

    console.log(`Found ${mdFiles.length} markdown files`);

    const articles = [];

    for (const fileName of mdFiles) {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(articlesDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        if (!validateArticleData(data, slug)) {
            continue;
        }

        console.log(`Processing: ${slug}`);

        // Process markdown to HTML
        const contentHtml = await processMarkdown(content);

        articles.push({
            id: data.id || slug,
            title: data.title,
            date: data.date,
            category: data.category,
            excerpt: generateExcerpt(content, data.excerpt),
            slug,
            content: contentHtml,
            readingTime: getReadingTime(content),
        });
    }

    // Sort by date (newest first)
    articles.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
    });

    // Write to JSON file
    fs.writeFileSync(outputFile, JSON.stringify(articles, null, 2));
    console.log(`✓ Generated articles data: ${outputFile}`);
    console.log(`✓ Total articles: ${articles.length}`);
}

generateArticlesData().catch(error => {
    console.error('Error generating articles data:', error);
    process.exit(1);
});
