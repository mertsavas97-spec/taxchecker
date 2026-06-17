import 'server-only';

import type { CmsBlogPost } from '@/lib/admin/content/types';
import {
  getFeaturedPublishedBlogPostPublic,
  getPublishedBlogPostBySlugPublic,
  getPublishedBlogPostsPublic,
} from '@/lib/cms/public-read';

export { getBlogPostPath } from '@/lib/blog/paths';

export async function getAllBlogPosts(): Promise<CmsBlogPost[]> {
  const { contentRegistry } = await import('@/lib/admin/content/registry');
  return contentRegistry.getBlogPosts();
}

export async function getPublishedBlogPosts(): Promise<CmsBlogPost[]> {
  return getPublishedBlogPostsPublic();
}

export async function getPublishedBlogPostBySlug(
  slug: string,
): Promise<CmsBlogPost | undefined> {
  return getPublishedBlogPostBySlugPublic(slug);
}

export async function getFeaturedPublishedBlogPost(): Promise<CmsBlogPost | undefined> {
  return getFeaturedPublishedBlogPostPublic();
}

export async function getBlogPostsByCategory(category: string): Promise<CmsBlogPost[]> {
  const posts = await getPublishedBlogPosts();
  return posts.filter((post) => post.category === category);
}
