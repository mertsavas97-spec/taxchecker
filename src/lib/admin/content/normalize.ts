import type { CmsBlogPost } from '@/lib/admin/content/types';
import { computeReadingTime } from '@/lib/blog/reading-time';

/** Ensure blog posts loaded from disk include Sprint 27 fields. */
export function normalizeBlogPost(
  post: Partial<CmsBlogPost> & Pick<CmsBlogPost, 'id' | 'slug' | 'title' | 'type'>,
): CmsBlogPost {
  const content = post.content ?? '';
  return {
    type: 'blog',
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt ?? '',
    content,
    status: post.status ?? 'draft',
    category: post.category ?? 'Self Employment',
    tags: post.tags ?? [],
    authorId: post.authorId ?? null,
    authorName: post.authorName ?? null,
    publishedAt: post.publishedAt ?? null,
    updatedAt: post.updatedAt ?? new Date().toISOString().slice(0, 10),
    seoTitle: post.seoTitle ?? '',
    seoDescription: post.seoDescription ?? '',
    canonicalUrl: post.canonicalUrl ?? null,
    ogImage: post.ogImage ?? null,
    taxYear: post.taxYear ?? null,
    readingTime: post.readingTime ?? computeReadingTime(content),
    featured: post.featured ?? false,
    relatedCalculators: post.relatedCalculators ?? [],
    relatedResources: post.relatedResources ?? [],
    relatedBlogPosts: post.relatedBlogPosts ?? [],
    revision: post.revision ?? 1,
    faqs: post.faqs ?? [],
  };
}
