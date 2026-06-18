import { getCalculatorFeatureBadge } from '@/config/calculator-badges';
import { getResourceCategoryLabel } from '@/config/resource-hub';
import { calculators, getReadyCalculators } from '@/config/calculators';
import { resources } from '@/config/resources';
import { getLaunchBlogPosts } from '@/lib/blog/launch-articles';

import type {
  CmsBlogPost,
  CmsCalculatorRecord,
  CmsContentStatus,
  CmsResource,
} from '@/lib/admin/content/types';

function mapPublicResourceStatus(
  status: 'published' | 'coming_soon',
): CmsContentStatus {
  return status === 'published' ? 'published' : 'draft';
}

export function seedCmsResources(): CmsResource[] {
  return resources.map((resource) => ({
    type: 'resource' as const,
    id: resource.slug,
    slug: resource.slug,
    title: resource.title,
    shortTitle: resource.shortTitle,
    status: mapPublicResourceStatus(resource.status),
    publishedAt:
      resource.status === 'published' ? resource.lastReviewed : null,
    updatedAt: resource.lastUpdated,
    seoTitle: resource.title,
    seoDescription: resource.description,
    taxYear: resource.taxYear ?? null,
    category: getResourceCategoryLabel(resource.category),
    route: resource.route,
    featured: resource.featured,
    relatedCalculatorSlugs: [...resource.relatedCalculatorSlugs],
    relatedResourceSlugs: [...resource.relatedResourceSlugs],
    relatedBlogSlugs: [...resource.relatedBlogSlugs],
    sourceIds: resource.sourceIds ?? [],
    lastReviewed: resource.lastReviewed ?? resource.lastUpdated,
    readingTime: resource.readingTime,
    description: resource.description,
    canonicalUrl: null,
    ogImage: null,
    faqs: [],
  }));
}

export function seedCmsBlogPosts(): CmsBlogPost[] {
  return getLaunchBlogPosts();
}

export function seedCmsCalculators(): CmsCalculatorRecord[] {
  return calculators.map((calculator) => {
    const badge = getCalculatorFeatureBadge(calculator.slug);
    return {
      id: calculator.slug,
      slug: calculator.slug,
      name: calculator.shortTitle,
      route: calculator.route,
      taxYear: calculator.taxYear,
      lastReviewed: calculator.lastReviewed,
      lastUpdated: calculator.lastUpdated,
      featuredBadge: badge ?? null,
      published: calculator.status === 'ready',
      category: calculator.category,
      seoTitle: calculator.title,
      seoDescription: calculator.description,
    };
  });
}

export function getPublishedCalculatorCount(): number {
  return getReadyCalculators().length;
}
