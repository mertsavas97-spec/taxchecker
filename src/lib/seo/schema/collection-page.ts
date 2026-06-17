import type { CalculatorDefinition } from '@/config/calculators';
import type { ResourceDefinition } from '@/config/resources';
import { site } from '@/config/site';
import { absoluteUrl } from '@/lib/seo/urls';

export function buildCalculatorsCollectionSchema(
  calculators: CalculatorDefinition[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Federal Tax Calculators',
    url: absoluteUrl('/calculators'),
    description:
      'Browse free federal tax calculators for self-employment, quarterly payments, business structures, HSA savings, and employment comparisons.',
    isPartOf: {
      '@type': 'WebSite',
      name: site.siteName,
      url: site.productionUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: site.organization.name,
      url: site.organization.url,
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: calculators.length,
      itemListElement: calculators.map((calculator, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: calculator.shortTitle,
        url: absoluteUrl(calculator.route),
        item: {
          '@type': 'SoftwareApplication',
          name: calculator.shortTitle,
          applicationCategory: 'FinanceApplication',
          url: absoluteUrl(calculator.route),
          description: calculator.description,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        },
      })),
    },
  };
}

export function buildResourcesCollectionSchema(
  resources: ResourceDefinition[],
  publishedResources: ResourceDefinition[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'TaxChecker Resources',
    url: absoluteUrl('/resources'),
    description:
      'Federal tax guides, quarterly deadlines, tax bracket references, and methodology articles maintained and reviewed regularly.',
    isPartOf: {
      '@type': 'WebSite',
      name: site.siteName,
      url: site.productionUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: site.organization.name,
      url: site.organization.url,
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: resources.length,
      itemListElement: publishedResources.map((resource, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: resource.shortTitle,
        url: absoluteUrl(resource.route),
        item: {
          '@type': 'Article',
          name: resource.title,
          headline: resource.title,
          url: absoluteUrl(resource.route),
          description: resource.description,
          dateModified: resource.lastUpdated,
        },
      })),
    },
  };
}

export interface BlogCollectionPost {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string | null;
  updatedAt: string;
}

export function buildBlogCollectionSchema(posts: BlogCollectionPost[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'TaxChecker Blog',
    url: absoluteUrl('/blog'),
    description:
      'Federal tax updates, freelancer planning notes, and IRS-related explainers from TaxChecker.',
    isPartOf: {
      '@type': 'WebSite',
      name: site.siteName,
      url: site.productionUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: site.organization.name,
      url: site.organization.url,
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: posts.length,
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: post.title,
        url: absoluteUrl(`/blog/${post.slug}`),
        item: {
          '@type': 'Article',
          name: post.title,
          headline: post.title,
          url: absoluteUrl(`/blog/${post.slug}`),
          description: post.excerpt,
          datePublished: post.publishedAt ?? post.updatedAt,
          dateModified: post.updatedAt,
        },
      })),
    },
  };
}
