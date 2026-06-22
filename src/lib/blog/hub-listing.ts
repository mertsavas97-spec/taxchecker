import type { CmsBlogPost } from '@/lib/admin/content/types';
import {
  BLOG_HUB_PAGE_SIZE,
  getBlogHubPaginationMeta,
  paginateBlogHubPosts,
} from '@/lib/blog/pagination';

export function shouldShowFeaturedBlogCard(options: {
  hasFeaturedPost: boolean;
  currentPage: number;
  hasActiveFilters: boolean;
}): boolean {
  return (
    options.hasFeaturedPost &&
    options.currentPage === 1 &&
    !options.hasActiveFilters
  );
}

export function getBlogHubListingView(options: {
  gridPosts: CmsBlogPost[];
  featuredPost?: CmsBlogPost;
  currentPage: number;
  hasActiveFilters?: boolean;
  pageSize?: number;
}) {
  const pageSize = options.pageSize ?? BLOG_HUB_PAGE_SIZE;
  const hasActiveFilters = options.hasActiveFilters ?? false;
  const pagination = getBlogHubPaginationMeta(options.gridPosts.length, pageSize);
  const safePage = Math.min(
    Math.max(options.currentPage, 1),
    pagination.totalPages,
  );
  const visibleGridPosts = paginateBlogHubPosts(
    options.gridPosts,
    safePage,
    pageSize,
  );

  return {
    ...pagination,
    safePage,
    visibleGridPosts,
    showFeaturedCard: shouldShowFeaturedBlogCard({
      hasFeaturedPost: Boolean(options.featuredPost),
      currentPage: safePage,
      hasActiveFilters,
    }),
  };
}

export type BlogPostsPublicSource = 'supabase' | 'registry' | 'seed';

export interface BlogHubDevDebugMeta {
  source: BlogPostsPublicSource;
  totalReturned: number;
  publishedCount: number;
  featuredSlug: string | null;
  gridPostCount: number;
  pageSize: number;
  totalPages: number;
  slugs: string[];
  supabaseConfigured: boolean;
  adminContentStore: string;
}

export function logBlogHubDebugInDevelopment(meta: BlogHubDevDebugMeta): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  console.log('[blog-hub]', {
    source: meta.source,
    totalReturned: meta.totalReturned,
    publishedCount: meta.publishedCount,
    featuredSlug: meta.featuredSlug,
    gridPostCount: meta.gridPostCount,
    pageSize: meta.pageSize,
    totalPages: meta.totalPages,
    slugs: meta.slugs,
    supabaseConfigured: meta.supabaseConfigured,
    adminContentStore: meta.adminContentStore,
  });
}
