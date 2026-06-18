import { beforeEach, describe, expect, it, vi } from 'vitest';

import { seedCmsBlogPosts } from '@/lib/admin/content/seed';

const mockIsSupabaseStoreActive = vi.fn();
const mockCreateClient = vi.fn();
const mockGetBlogPosts = vi.fn();

vi.mock('@/lib/admin/content/storage', () => ({
  isSupabaseStoreActive: () => mockIsSupabaseStoreActive(),
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

describe('getPublishedBlogPostsPublic fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsSupabaseStoreActive.mockReturnValue(true);
    mockGetBlogPosts.mockResolvedValue([]);
  });

  it('falls back to launch seed posts when Supabase returns an empty list', async () => {
    mockCreateClient.mockResolvedValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            order: async () => ({ data: [], error: null }),
          }),
        }),
      }),
    });

    const { getPublishedBlogPostsPublic } = await import('./public-read');
    const posts = await getPublishedBlogPostsPublic();
    const seeded = seedCmsBlogPosts().filter((post) => post.status === 'published');

    expect(posts.length).toBe(seeded.length);
    expect(posts.map((post) => post.slug).sort()).toEqual(
      seeded.map((post) => post.slug).sort(),
    );
  });

  it('prefers non-empty Supabase results over static fallback', async () => {
    mockCreateClient.mockResolvedValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            order: async () => ({
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
                },
              ],
              error: null,
            }),
          }),
        }),
      }),
    });

    const { getPublishedBlogPostsPublic } = await import('./public-read');
    const posts = await getPublishedBlogPostsPublic();

    expect(posts).toHaveLength(1);
    expect(posts[0]?.slug).toBe('remote-only-post');
  });
});
