import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CmsBlogPost, CmsResource } from '@/lib/admin/content/types';
import { buildBlogArticleJsonLd, getPublishedBlogFaqs } from '@/lib/blog/blog-faq-public';
import {
  buildResourcePageJsonLd,
  resolvePublishedResourceFaqs,
} from '@/lib/resources/create-resource-page';
import { getSelfEmploymentTaxGuideFaqs } from '@/lib/resources/content/self-employment-tax-guide';

const mockGetPublishedResourceBySlugPublic = vi.fn();

vi.mock('@/lib/cms/public-read', () => ({
  getPublishedResourceBySlugPublic: (...args: unknown[]) =>
    mockGetPublishedResourceBySlugPublic(...args),
  getPublishedResourceDefinitionBySlugPublic: vi.fn(async () => undefined),
}));

vi.mock('@/lib/resources/related-links', () => ({
  getPublishedResourceOrThrow: vi.fn(async (slug: string) => ({
    slug,
    title: 'Example Resource',
    shortTitle: 'Example',
    description: 'Example description',
    route: `/resources/${slug}`,
    lastReviewed: '2026-06-16',
    lastUpdated: '2026-06-16',
  })),
  getResourceOrThrow: vi.fn(),
}));

describe('blog public FAQ rendering helpers', () => {
  const basePost: CmsBlogPost = {
    type: 'blog',
    id: 'blog-example',
    slug: 'example-post',
    title: 'Example post',
    excerpt: 'Excerpt',
    content: 'Body',
    status: 'published',
    category: 'Guides',
    tags: [],
    authorId: null,
    authorName: 'TaxChecker',
    publishedAt: '2026-06-16',
    updatedAt: '2026-06-16',
    seoTitle: 'Example post',
    seoDescription: 'Example description',
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

  it('returns no FAQs or FAQPage schema when blog FAQs are empty', () => {
    expect(getPublishedBlogFaqs(basePost)).toEqual([]);

    const schemas = buildBlogArticleJsonLd(basePost, '/blog/example-post');
    expect(schemas.some((schema) => schema['@type'] === 'FAQPage')).toBe(false);
  });

  it('returns FAQ UI data and FAQPage schema when blog FAQs are valid', () => {
    const post: CmsBlogPost = {
      ...basePost,
      faqs: [{ question: 'What is SE tax?', answer: 'A federal self-employment tax.' }],
    };

    expect(getPublishedBlogFaqs(post)).toHaveLength(1);

    const schemas = buildBlogArticleJsonLd(post, '/blog/example-post');
    expect(schemas.some((schema) => schema['@type'] === 'FAQPage')).toBe(true);
  });
});

describe('resource public FAQ resolution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPublishedResourceBySlugPublic.mockResolvedValue(undefined);
  });

  it('keeps static resource FAQs when CMS FAQs are empty', async () => {
    const staticFaqs = getSelfEmploymentTaxGuideFaqs().slice(0, 2);
    const resolved = await resolvePublishedResourceFaqs(
      'self-employment-tax-guide',
      staticFaqs,
    );

    expect(resolved).toEqual(staticFaqs);
  });

  it('uses CMS FAQs instead of static fallback when CMS FAQs are non-empty', async () => {
    const cmsFaqs = [{ question: 'CMS question?', answer: 'CMS answer.' }];
    mockGetPublishedResourceBySlugPublic.mockResolvedValue({
      slug: 'self-employment-tax-guide',
      status: 'published',
      faqs: cmsFaqs,
    } as CmsResource);

    const resolved = await resolvePublishedResourceFaqs(
      'self-employment-tax-guide',
      getSelfEmploymentTaxGuideFaqs(),
    );

    expect(resolved).toEqual(cmsFaqs);
  });

  it('does not expose draft CMS FAQs through published resolver', async () => {
    mockGetPublishedResourceBySlugPublic.mockResolvedValue(undefined);
    const staticFaqs = getSelfEmploymentTaxGuideFaqs().slice(0, 1);

    const resolved = await resolvePublishedResourceFaqs('draft-only-resource', staticFaqs);
    expect(resolved).toEqual(staticFaqs);
  });

  it('adds FAQPage schema only when resolved resource FAQs are valid', async () => {
    mockGetPublishedResourceBySlugPublic.mockResolvedValue({
      slug: 'cms-only-resource',
      status: 'published',
      faqs: [{ question: 'CMS question?', answer: 'CMS answer.' }],
    } as CmsResource);

    const schemas = await buildResourcePageJsonLd('cms-only-resource', []);
    expect(schemas.some((schema) => schema['@type'] === 'FAQPage')).toBe(true);
  });

  it('keeps static resource FAQ schema when CMS override is empty', async () => {
    const staticFaqs = getSelfEmploymentTaxGuideFaqs().slice(0, 1);
    const schemas = await buildResourcePageJsonLd(
      'self-employment-tax-guide',
      staticFaqs,
    );

    expect(schemas.some((schema) => schema['@type'] === 'FAQPage')).toBe(true);
  });
});
