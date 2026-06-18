import type { ResourceDefinition } from '@/config/resources';
import { getResourceBySlug } from '@/config/resources';
import type { CmsResource } from '@/lib/admin/content/types';

export const STATIC_RESOURCE_ARTICLE_SLUGS = [
  'self-employment-tax-guide',
  'quarterly-tax-guide',
  'tax-brackets-2025',
  'quarterly-tax-due-dates-2025',
] as const;

export type StaticResourceArticleSlug = (typeof STATIC_RESOURCE_ARTICLE_SLUGS)[number];

export function isStaticResourceArticleSlug(
  slug: string,
): slug is StaticResourceArticleSlug {
  return (STATIC_RESOURCE_ARTICLE_SLUGS as readonly string[]).includes(slug);
}

export function cmsResourceToPublicDefinition(resource: CmsResource): ResourceDefinition {
  const staticResource = getResourceBySlug(resource.slug);

  if (staticResource) {
    return {
      ...staticResource,
      title: resource.title,
      shortTitle: resource.shortTitle,
      description: resource.description || resource.seoDescription || staticResource.description,
      status: resource.status === 'published' ? 'published' : 'coming_soon',
      lastUpdated: resource.updatedAt,
      lastReviewed: resource.lastReviewed ?? staticResource.lastReviewed,
      featured: resource.featured,
      relatedCalculatorSlugs: resource.relatedCalculatorSlugs,
      relatedResourceSlugs: resource.relatedResourceSlugs,
      relatedBlogSlugs: resource.relatedBlogSlugs,
      route: resource.route,
      taxYear: resource.taxYear ?? staticResource.taxYear,
      readingTime: resource.readingTime ?? staticResource.readingTime,
      primaryKeyword: resource.seoTitle || resource.title,
      secondaryKeywords: staticResource.secondaryKeywords,
      sourceIds: resource.sourceIds ?? staticResource.sourceIds,
    };
  }

  return {
    slug: resource.slug,
    title: resource.title,
    shortTitle: resource.shortTitle,
    description: resource.description || resource.seoDescription || '',
    category: 'guides',
    status: 'published',
    readingTime: resource.readingTime ?? '5 min read',
    lastReviewed: resource.lastReviewed ?? resource.updatedAt,
    lastUpdated: resource.updatedAt,
    taxYear: resource.taxYear ?? undefined,
    featured: resource.featured,
    relatedCalculatorSlugs: resource.relatedCalculatorSlugs,
    relatedResourceSlugs: resource.relatedResourceSlugs,
    relatedBlogSlugs: resource.relatedBlogSlugs,
    primaryKeyword: resource.seoTitle || resource.title,
    secondaryKeywords: [],
    route: resource.route,
    sourceIds: resource.sourceIds ?? [],
  };
}

export function hasCmsResourceBody(resource: CmsResource | undefined): boolean {
  return Boolean(resource?.content?.trim());
}
