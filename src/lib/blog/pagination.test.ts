import { describe, expect, it } from 'vitest';

import {
  BLOG_HUB_PAGE_SIZE,
  blogHubPageHref,
  clampBlogHubPage,
  getBlogHubPageCount,
  getBlogHubPaginationMeta,
  paginateBlogHubPosts,
  parseBlogHubPageParam,
  shouldShowBlogHubPagination,
} from '@/lib/blog/pagination';

describe('blog hub pagination', () => {
  it('uses 9 posts per page', () => {
    expect(BLOG_HUB_PAGE_SIZE).toBe(9);
  });

  it('shows pagination only when filtered posts exceed page size', () => {
    expect(shouldShowBlogHubPagination(9)).toBe(false);
    expect(shouldShowBlogHubPagination(10)).toBe(true);
    expect(shouldShowBlogHubPagination(11)).toBe(true);
  });

  it('calculates page counts for 11 hub posts', () => {
    expect(getBlogHubPageCount(11)).toBe(2);
    expect(paginateBlogHubPosts(Array.from({ length: 11 }, (_, i) => i), 1)).toHaveLength(9);
    expect(paginateBlogHubPosts(Array.from({ length: 11 }, (_, i) => i), 2)).toHaveLength(2);
  });

  it('returns pagination metadata for blog hub listing', () => {
    const meta = getBlogHubPaginationMeta(11);
    expect(meta.totalGridPosts).toBe(11);
    expect(meta.totalPages).toBe(2);
    expect(meta.shouldPaginate).toBe(true);
  });

  it('parses and clamps page params', () => {
    expect(parseBlogHubPageParam(undefined)).toBe(1);
    expect(parseBlogHubPageParam('2')).toBe(2);
    expect(parseBlogHubPageParam('0')).toBe(1);
    expect(clampBlogHubPage(99, 2)).toBe(2);
  });

  it('builds SEO-friendly blog hub links', () => {
    expect(blogHubPageHref(1)).toBe('/blog');
    expect(blogHubPageHref(2)).toBe('/blog?page=2');
  });
});
