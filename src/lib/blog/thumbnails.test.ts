import { describe, expect, it } from 'vitest';

import type { CmsBlogPost } from '@/lib/admin/content/types';
import { buildBlogArticleJsonLd } from '@/lib/blog/blog-faq-public';
import {
  BLOG_THUMBNAIL_BY_SLUG,
  DEFAULT_BLOG_THUMBNAIL,
  getBlogThumbnail,
  getBlogThumbnailPathForSlug,
  resolveBlogImageAlt,
  resolveBlogImagePath,
} from '@/lib/blog/thumbnails';
import { absoluteUrl } from '@/lib/seo/urls';

const basePost: CmsBlogPost = {
  type: 'blog',
  id: 'blog-thumb',
  slug: 'self-employment-tax-explained',
  title: 'Self Employment Tax Explained',
  excerpt: 'Excerpt',
  content: 'Body',
  status: 'published',
  category: 'Self Employment',
  tags: [],
  authorId: null,
  authorName: 'TaxChecker',
  publishedAt: '2026-06-16',
  updatedAt: '2026-06-16',
  seoTitle: 'Self Employment Tax Explained',
  seoDescription: 'Description',
  canonicalUrl: null,
  ogImage: null,
  taxYear: 2025,
  readingTime: '5 min read',
  featured: false,
  relatedCalculators: [],
  relatedResources: [],
  relatedBlogPosts: [],
  revision: 1,
  faqs: [],
};

describe('blog thumbnails', () => {
  it('maps every launch blog slug to a thumbnail asset', () => {
    const launchSlugs = [
      'self-employment-tax-explained',
      'how-self-employment-tax-is-calculated',
      'self-employment-tax-rate-2025',
      '1099-vs-w2-explained',
      '1099-tax-deductions-explained',
      'quarterly-taxes-explained',
      'estimated-tax-safe-harbor-rules',
      'llc-vs-s-corp-explained',
      'reasonable-salary-explained',
      'federal-tax-brackets-2025-explained',
    ];

    for (const slug of launchSlugs) {
      expect(BLOG_THUMBNAIL_BY_SLUG[slug]?.path).toMatch(/^\/images\/blog\/.+-hero\.jpg$/);
    }
  });

  it('resolves slug thumbnails when CMS ogImage is empty', () => {
    expect(resolveBlogImagePath(basePost)).toBe(
      '/images/blog/self-employment-tax-explained-hero.jpg',
    );
    expect(resolveBlogImageAlt(basePost)).toContain('self-employment tax');
  });

  it('ignores legacy SVG CMS ogImage paths and uses slug hero JPG', () => {
    const post = {
      ...basePost,
      ogImage: '/images/blog/self-employment-tax-explained-thumbnail.svg',
    };

    expect(resolveBlogImagePath(post)).toBe(
      '/images/blog/self-employment-tax-explained-hero.jpg',
    );
  });

  it('normalizes public/ prefixed CMS image paths', () => {
    const post = {
      ...basePost,
      ogImage: 'public/images/blog/custom-hero.jpg',
    };

    expect(resolveBlogImagePath(post)).toBe('/images/blog/custom-hero.jpg');
  });

  it('falls back to the default thumbnail for unknown slugs', () => {
    const post = { ...basePost, slug: 'unknown-post', ogImage: null };

    expect(getBlogThumbnailPathForSlug(post.slug)).toBe(DEFAULT_BLOG_THUMBNAIL.path);
    expect(getBlogThumbnail(post).src).toBe(DEFAULT_BLOG_THUMBNAIL.path);
  });

  it('uses absolute thumbnail URLs in BlogPosting JSON-LD image', () => {
    const schemas = buildBlogArticleJsonLd(basePost, '/blog/self-employment-tax-explained');
    const blogPosting = schemas.find((schema) => schema['@type'] === 'BlogPosting');

    expect(blogPosting?.image).toBe(
      absoluteUrl('/images/blog/self-employment-tax-explained-hero.jpg'),
    );
  });
});
