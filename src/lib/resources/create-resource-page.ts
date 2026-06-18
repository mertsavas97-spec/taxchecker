import type { Metadata } from 'next';

import type { FaqItem } from '@/components/content/faq-block';
import { ogPaths } from '@/lib/og/paths';
import { getPublishedResourceOrThrow, getResourceOrThrow } from '@/lib/resources/related-links';
import { buildResourceMetadata } from '@/lib/seo/metadata';
import { buildArticleSchema, buildFaqSchema, buildResourceBreadcrumbs } from '@/lib/seo/schema';

export async function createResourcePageMetadata(slug: string): Promise<Metadata> {
  const resource = await getPublishedResourceOrThrow(slug);
  return buildResourceMetadata(resource);
}

export async function buildResourcePageJsonLd(
  slug: string,
  faqs: FaqItem[],
): Promise<Record<string, unknown>[]> {
  const resource = await getPublishedResourceOrThrow(slug);

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

/** Sync metadata for static registry pages without CMS overlay. */
export function createResourcePageMetadataSync(slug: string): Metadata {
  return buildResourceMetadata(getResourceOrThrow(slug));
}
