export const BLOG_HUB_PAGE_SIZE = 9;

export function shouldShowBlogHubPagination(
  totalPosts: number,
  pageSize = BLOG_HUB_PAGE_SIZE,
): boolean {
  return totalPosts > pageSize;
}

export function getBlogHubPageCount(totalPosts: number, pageSize = BLOG_HUB_PAGE_SIZE): number {
  if (totalPosts <= 0) return 1;
  return Math.ceil(totalPosts / pageSize);
}

export function getBlogHubPaginationMeta(totalGridPosts: number, pageSize = BLOG_HUB_PAGE_SIZE) {
  const totalPages = getBlogHubPageCount(totalGridPosts, pageSize);
  return {
    pageSize,
    totalGridPosts,
    totalPages,
    shouldPaginate: shouldShowBlogHubPagination(totalGridPosts, pageSize),
  };
}

export function parseBlogHubPageParam(pageParam: string | undefined): number {
  const parsed = Number.parseInt(pageParam ?? '1', 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

export function clampBlogHubPage(page: number, totalPages: number): number {
  if (totalPages < 1) return 1;
  return Math.min(Math.max(page, 1), totalPages);
}

export function paginateBlogHubPosts<T>(
  posts: T[],
  page: number,
  pageSize = BLOG_HUB_PAGE_SIZE,
): T[] {
  const start = (page - 1) * pageSize;
  return posts.slice(start, start + pageSize);
}

export function blogHubPageHref(page: number): string {
  if (page <= 1) return '/blog';
  return `/blog?page=${page}`;
}
