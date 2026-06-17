import type { Metadata } from 'next';

import { getResourceOrThrow } from '@/lib/resources/related-links';
import { ogPaths } from '@/lib/og/paths';
import { buildResourceMetadata } from '@/lib/seo/metadata';
import { buildArticleSchema, buildFaqSchema, buildResourceBreadcrumbs } from '@/lib/seo/schema';
import type { FaqItem } from '@/components/content/faq-block';

export function createResourcePageMetadata(slug: string): Metadata {
  const resource = getResourceOrThrow(slug);
  return buildResourceMetadata(resource);
}

export function buildResourcePageJsonLd(
  slug: string,
  faqs: FaqItem[],
): Record<string, unknown>[] {
  const resource = getResourceOrThrow(slug);

  const schemas: Record<string, unknown>[] = [
    buildResourceBreadcrumbs(resource.shortTitle, resource.route),
    buildArticleSchema({
      title: resource.title,
      description: resource.description,
      path: resource.route,
      publishedAt: resource.lastReviewed,
      modifiedAt: resource.lastUpdated,
      imagePath: ogPaths.resource(resource.slug),
    }),
  ];

  const faqSchema = buildFaqSchema(faqs);
  if (faqSchema) {
    schemas.push(faqSchema);
  }

  return schemas;
}
