import type { CmsBlogPost } from '@/lib/admin/content/types';
import { normalizePublishedFaqs } from '@/lib/cms/faq-utils';
import { site } from '@/config/site';
import { buildBlogPostingSchema, buildBlogPostBreadcrumbs, buildFaqSchema } from '@/lib/seo/schema';

export function getPublishedBlogFaqs(post: Pick<CmsBlogPost, 'faqs'>) {
  return normalizePublishedFaqs(post.faqs);
}

export function buildBlogArticleJsonLd(post: CmsBlogPost, path: string) {
  const schemas: Record<string, unknown>[] = [
    buildBlogPostBreadcrumbs(post.title, path),
    buildBlogPostingSchema({
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      path,
      publishedAt: post.publishedAt ?? post.updatedAt,
      modifiedAt: post.updatedAt,
      authorName: post.authorName ?? site.organization.name,
      imagePath: post.ogImage ?? undefined,
    }),
  ];

  const faqSchema = buildFaqSchema(getPublishedBlogFaqs(post));
  if (faqSchema) {
    schemas.push(faqSchema);
  }

  return schemas;
}
