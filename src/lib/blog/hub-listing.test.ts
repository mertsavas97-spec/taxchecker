import { describe, expect, it } from 'vitest';

import {
  getBlogHubListingView,
  shouldShowFeaturedBlogCard,
} from '@/lib/blog/hub-listing';
import { BLOG_HUB_PAGE_SIZE, shouldShowBlogHubPagination } from '@/lib/blog/pagination';
import type { CmsBlogPost } from '@/lib/admin/content/types';

function makePost(index: number, featured = false): CmsBlogPost {
  return {
    type: 'blog',
    id: `post-${index}`,
    slug: `post-${index}`,
    title: `Post ${index}`,
    excerpt: 'Excerpt',
    content: 'Body',
    status: 'published',
    category: 'Guides',
    tags: [],
    authorId: null,
    authorName: 'TaxChecker',
    publishedAt: '2026-06-16',
    updatedAt: '2026-06-16',
    seoTitle: `Post ${index}`,
    seoDescription: 'Description',
    canonicalUrl: null,
    ogImage: null,
    taxYear: 2025,
    readingTime: '5 min read',
    featured,
    relatedCalculators: [],
    relatedResources: [],
    relatedBlogPosts: [],
    revision: 1,
    faqs: [],
  };
}

describe('blog hub listing view', () => {
  it('paginates 12 published posts with 1 featured into 2 grid pages', () => {
    const allPosts = Array.from({ length: 12 }, (_, index) =>
      makePost(index + 1, index === 0),
    );
    const featuredPost = allPosts.find((post) => post.featured);
    const gridPosts = allPosts.filter((post) => post.id !== featuredPost?.id);

    expect(gridPosts).toHaveLength(11);
    expect(shouldShowBlogHubPagination(gridPosts.length, BLOG_HUB_PAGE_SIZE)).toBe(true);

    const pageOne = getBlogHubListingView({
      gridPosts,
      featuredPost,
      currentPage: 1,
    });
    const pageTwo = getBlogHubListingView({
      gridPosts,
      featuredPost,
      currentPage: 2,
    });

    expect(pageOne.totalPages).toBe(2);
    expect(pageOne.visibleGridPosts).toHaveLength(9);
    expect(pageOne.showFeaturedCard).toBe(true);
    expect(pageTwo.visibleGridPosts).toHaveLength(2);
    expect(pageTwo.showFeaturedCard).toBe(false);
  });

  it('keeps a single page for 10 published posts with 1 featured', () => {
    const allPosts = Array.from({ length: 10 }, (_, index) =>
      makePost(index + 1, index === 0),
    );
    const featuredPost = allPosts.find((post) => post.featured);
    const gridPosts = allPosts.filter((post) => post.id !== featuredPost?.id);

    expect(gridPosts).toHaveLength(9);
    expect(shouldShowBlogHubPagination(gridPosts.length, BLOG_HUB_PAGE_SIZE)).toBe(false);

    const pageOne = getBlogHubListingView({
      gridPosts,
      featuredPost,
      currentPage: 1,
    });

    expect(pageOne.totalPages).toBe(1);
    expect(pageOne.visibleGridPosts).toHaveLength(9);
  });

  it('bases pagination on unsliced filtered posts, not visible posts', () => {
    const gridPosts = Array.from({ length: 11 }, (_, index) => makePost(index + 1));
    const pageOne = getBlogHubListingView({
      gridPosts,
      currentPage: 1,
    });

    expect(pageOne.visibleGridPosts).toHaveLength(9);
    expect(shouldShowBlogHubPagination(gridPosts.length, BLOG_HUB_PAGE_SIZE)).toBe(true);
    expect(pageOne.totalPages).toBe(2);
  });

  it('hides featured card on page 2 and when filters are active', () => {
    expect(
      shouldShowFeaturedBlogCard({
        hasFeaturedPost: true,
        currentPage: 2,
        hasActiveFilters: false,
      }),
    ).toBe(false);

    expect(
      shouldShowFeaturedBlogCard({
        hasFeaturedPost: true,
        currentPage: 1,
        hasActiveFilters: true,
      }),
    ).toBe(false);
  });
});
