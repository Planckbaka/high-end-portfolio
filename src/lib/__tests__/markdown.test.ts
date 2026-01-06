// Define mock data as a plain object that Jest can hoist
jest.mock('../articles-data.json', () => [
  {
    slug: 'test-article-1',
    title: 'Test Article 1',
    date: '2024-01-01',
    category: 'Test',
    excerpt: 'Test excerpt 1',
    content: '<p>Full content 1</p>',
    readingTime: '5 min',
  },
  {
    slug: 'test-article-2',
    title: 'Test Article 2',
    date: '2024-01-02',
    category: 'Test',
    excerpt: 'Test excerpt 2',
    content: '<p>Full content 2</p>',
    readingTime: '3 min',
  },
])

import { getAllArticles, getArticleBySlug, getAllArticleSlugs } from '../markdown'

describe('Markdown Utilities', () => {
  describe('getAllArticles', () => {
    it('should return all articles without content', async () => {
      const articles = await getAllArticles()
      expect(articles).toHaveLength(2)
      expect(articles[0].slug).toBe('test-article-1')
      expect(articles[0].content).toBe('')
      expect(articles[1].content).toBe('')
    })

    it('should preserve article metadata', async () => {
      const articles = await getAllArticles()
      expect(articles[0].title).toBe('Test Article 1')
      expect(articles[0].category).toBe('Test')
      expect(articles[0].excerpt).toBe('Test excerpt 1')
    })
  })

  describe('getArticleBySlug', () => {
    it('should return article by slug', async () => {
      const article = await getArticleBySlug('test-article-1')
      expect(article).not.toBeNull()
      expect(article?.slug).toBe('test-article-1')
      expect(article?.title).toBe('Test Article 1')
    })

    it('should return null for non-existent slug', async () => {
      const article = await getArticleBySlug('non-existent')
      expect(article).toBeNull()
    })

    it('should include full content for single article', async () => {
      const article = await getArticleBySlug('test-article-1')
      expect(article?.content).toBe('<p>Full content 1</p>')
    })
  })

  describe('getAllArticleSlugs', () => {
    it('should return all article slugs', () => {
      const slugs = getAllArticleSlugs()
      expect(slugs).toHaveLength(2)
      expect(slugs).toContain('test-article-1')
      expect(slugs).toContain('test-article-2')
    })

    it('should return slugs in order', () => {
      const slugs = getAllArticleSlugs()
      expect(slugs[0]).toBe('test-article-1')
      expect(slugs[1]).toBe('test-article-2')
    })
  })
})
