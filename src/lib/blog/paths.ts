import type { CmsBlogPost } from '@/lib/admin/content/types';
import { blogCategories } from '@/config/blog-categories';

export function getBlogPostPath(slug: string): string {
  return `/blog/${slug}`;
}

export function isTaxRelatedBlogPost(post: CmsBlogPost): boolean {
  const taxCategories = new Set<string>([...blogCategories]);
  return taxCategories.has(post.category) || (post.taxYear ?? 0) > 0;
}
