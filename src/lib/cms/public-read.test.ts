import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mapDbBlogPostToCms } from '@/lib/admin/content/storage/mappers';
import { seedCmsBlogPosts } from '@/lib/admin/content/seed';

const mockIsSupabaseStoreActive = vi.fn();
const mockIsSupabasePublicReadConfigured = vi.fn();
const mockIsSupabaseAdminConfigured = vi.fn();
const mockCreateClient = vi.fn();
const mockCreateAdminClient = vi.fn();
const mockGetBlogPosts = vi.fn();

vi.mock('next/cache', () => ({
  unstable_noStore: vi.fn(),
}));

vi.mock('@/lib/admin/content/storage', () => ({
  isSupabaseStoreActive: () => mockIsSupabaseStoreActive(),
  getConfiguredStoreDriver: () => 'file',
}));

vi.mock('@/lib/supabase/public-read', () => ({
  isSupabasePublicReadConfigured: () => mockIsSupabasePublicReadConfigured(),
}));

vi.mock('@/lib/supabase/admin', () => ({
  isSupabaseAdminConfigured: () => mockIsSupabaseAdminConfigured(),
  createAdminClient: () => mockCreateAdminClient(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mockCreateClient(),
}));

vi.mock('@/lib/admin/content/registry', () => ({
  contentRegistry: {
    getBlogPosts: () => mockGetBlogPosts(),
    getResources: vi.fn(async () => []),
  },
}));

function createSupabaseBlogClient(result: { data: unknown; error: unknown }) {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: async () =>
              Array.isArray(result.data) ? { data: null, error: null } : result,
          }),
          not: () => ({
            not: () => ({
              order: async () =>
                Array.isArray(result.data) ? result : { data: [], error: null },
            }),
          }),
          order: async () =>
            Array.isArray(result.data) ? result : { data: [], error: null },
        }),
      }),
    }),
  };
}

function createRemoteBlogRows(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `11111111-1111-1111-1111-${String(index + 1).padStart(12, '0')}`,
    slug: `remote-post-${index + 1}`,
    title: `Remote post ${index + 1}`,
    excerpt: 'Excerpt',
    content: 'Body',
    status: 'published',
    category: 'Guides',
    tags: [],
    author_id: null,
    author_name: 'TaxChecker',
    published_at: `2026-01-${String(index + 1).padStart(2, '0')}`,
    updated_at: '2026-01-01T00:00:00.000Z',
    seo_title: `Remote post ${index + 1}`,
    seo_description: `Remote post ${index + 1}`,
    canonical_url: null,
    og_image: null,
    tax_year: 2026,
    reading_time: '5 min read',
    featured: index === 0,
    related_calculators: [],
    related_resources: [],
    related_blog_posts: [],
    revision: 1,
    faqs: [],
  }));
}

describe('resolvePublishedBlogPosts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsSupabaseStoreActive.mockReturnValue(false);
    mockIsSupabasePublicReadConfigured.mockReturnValue(true);
    mockIsSupabaseAdminConfigured.mockReturnValue(true);
    mockGetBlogPosts.mockResolvedValue([]);
  });

  it('uses Supabase when public read is configured even if admin store driver is file', async () => {
    mockCreateAdminClient.mockReturnValue(
      createSupabaseBlogClient({
        data: createRemoteBlogRows(12),
        error: null,
      }),
    );

    const { resolvePublishedBlogPosts } = await import('./public-read');
    const resolved = await resolvePublishedBlogPosts();

    expect(resolved.source).toBe('supabase');
    expect(resolved.posts).toHaveLength(12);
    expect(mockGetBlogPosts).not.toHaveBeenCalled();
  });

  it('falls back to launch seed posts when Supabase is not configured', async () => {
    mockIsSupabasePublicReadConfigured.mockReturnValue(false);

    const { resolvePublishedBlogPosts } = await import('./public-read');
    const resolved = await resolvePublishedBlogPosts();
    const seeded = seedCmsBlogPosts().filter((post) => post.status === 'published');

    expect(resolved.source).toBe('seed');
    expect(resolved.posts.length).toBe(seeded.length);
    expect(resolved.posts.map((post) => post.slug).sort()).toEqual(
      seeded.map((post) => post.slug).sort(),
    );
  });

  it('does not fall back to launch seed posts when Supabase is configured but empty', async () => {
    mockCreateAdminClient.mockReturnValue(
      createSupabaseBlogClient({ data: [], error: null }),
    );

    const { resolvePublishedBlogPosts } = await import('./public-read');
    const resolved = await resolvePublishedBlogPosts();

    expect(resolved.source).toBe('supabase');
    expect(resolved.posts).toEqual([]);
  });

  it('prefers non-empty Supabase results over static fallback', async () => {
    mockCreateAdminClient.mockReturnValue(
      createSupabaseBlogClient({
        data: [
          {
            id: '11111111-1111-1111-1111-111111111111',
            slug: 'remote-only-post',
            title: 'Remote only',
            excerpt: 'Excerpt',
            content: 'Body',
            status: 'published',
            category: 'Guides',
            tags: [],
            author_id: null,
            author_name: 'TaxChecker',
            published_at: '2026-01-01',
            updated_at: '2026-01-01T00:00:00.000Z',
            seo_title: 'Remote only',
            seo_description: 'Remote only',
            canonical_url: null,
            og_image: null,
            tax_year: 2026,
            reading_time: '5 min read',
            featured: false,
            related_calculators: [],
            related_resources: [],
            related_blog_posts: [],
            revision: 1,
            faqs: [],
          },
        ],
        error: null,
      }),
    );

    const { resolvePublishedBlogPosts } = await import('./public-read');
    const resolved = await resolvePublishedBlogPosts();

    expect(resolved.posts).toHaveLength(1);
    expect(resolved.posts[0]?.slug).toBe('remote-only-post');
  });

  it('preserves published FAQs from Supabase rows in public blog reads', async () => {
    const faqs = [{ question: 'What is SE tax?', answer: 'A federal self-employment tax.' }];

    mockCreateAdminClient.mockReturnValue(
      createSupabaseBlogClient({
        data: [
          {
            id: '11111111-1111-1111-1111-111111111111',
            slug: 'remote-only-post',
            title: 'Remote only',
            excerpt: 'Excerpt',
            content: 'Body',
            status: 'published',
            category: 'Guides',
            tags: [],
            author_id: null,
            author_name: 'TaxChecker',
            published_at: '2026-01-01',
            updated_at: '2026-01-01T00:00:00.000Z',
            seo_title: 'Remote only',
            seo_description: 'Remote only',
            canonical_url: null,
            og_image: null,
            tax_year: 2026,
            reading_time: '5 min read',
            featured: false,
            related_calculators: [],
            related_resources: [],
            revision: 1,
            faqs,
          },
        ],
        error: null,
      }),
    );

    const { getPublishedBlogPostsPublic, getPublishedBlogPostBySlugPublic } =
      await import('./public-read');
    const posts = await getPublishedBlogPostsPublic();
    const post = await getPublishedBlogPostBySlugPublic('remote-only-post');

    expect(posts[0]?.faqs).toEqual(faqs);
    expect(post?.faqs).toEqual(faqs);
  });

  it('does not return draft blog posts from slug lookup', async () => {
    mockCreateAdminClient.mockReturnValue(
      createSupabaseBlogClient({ data: null, error: null }),
    );

    const { getPublishedBlogPostBySlugPublic } = await import('./public-read');
    const post = await getPublishedBlogPostBySlugPublic('draft-only-post');

    expect(post).toBeUndefined();
  });
});

describe('mapDbBlogPostToCms FAQ mapping', () => {
  it('parses JSON string FAQ payloads from Supabase', () => {
    const mapped = mapDbBlogPostToCms({
      id: '11111111-1111-1111-1111-111111111111',
      slug: 'faq-post',
      title: 'FAQ post',
      excerpt: 'Excerpt',
      content: 'Body',
      status: 'published',
      category: 'Guides',
      tags: [],
      author_id: null,
      author_name: 'TaxChecker',
      published_at: '2026-01-01',
      updated_at: '2026-01-01T00:00:00.000Z',
      seo_title: 'FAQ post',
      seo_description: 'FAQ post',
      canonical_url: null,
      og_image: null,
      tax_year: 2026,
      reading_time: '5 min read',
      featured: false,
      related_calculators: [],
      related_resources: [],
      revision: 1,
      faqs: JSON.stringify([
        { question: 'Question?', answer: 'Answer.' },
      ]),
    });

    expect(mapped.faqs).toEqual([{ question: 'Question?', answer: 'Answer.' }]);
  });
});
