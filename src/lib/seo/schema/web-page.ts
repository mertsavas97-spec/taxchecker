import type { TrustPageDefinition } from '@/config/trust-pages';
import { site } from '@/config/site';
import { absoluteUrl } from '@/lib/seo/urls';

import { buildStaticPageBreadcrumbs } from './breadcrumb';

export interface WebPageSchemaInput {
  name: string;
  description: string;
  path: string;
  dateModified?: string;
}

export function buildWebPageSchema(input: WebPageSchemaInput) {
  const url = absoluteUrl(input.path);

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: input.name,
    description: input.description,
    url,
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    isPartOf: {
      '@type': 'WebSite',
      name: site.siteName,
      url: site.productionUrl,
    },
    inLanguage: site.defaultLocale.replace('_', '-'),
  };
}

export function buildTrustPageJsonLd(
  page: Pick<TrustPageDefinition, 'shortTitle' | 'route' | 'description' | 'lastUpdated'>,
) {
  return [
    buildStaticPageBreadcrumbs(page.shortTitle, page.route),
    buildWebPageSchema({
      name: page.shortTitle,
      description: page.description,
      path: page.route,
      dateModified: page.lastUpdated,
    }),
  ];
}
