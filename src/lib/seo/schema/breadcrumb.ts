import { absoluteUrl } from '@/lib/seo/urls';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildHomeBreadcrumbs() {
  return buildBreadcrumbSchema([{ name: 'Home', path: '/' }]);
}

export function buildCalculatorsHubBreadcrumbs() {
  return buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Calculators', path: '/calculators' },
  ]);
}

export function buildResourcesHubBreadcrumbs() {
  return buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Resources', path: '/resources' },
  ]);
}

export function buildResourceBreadcrumbs(
  resourceTitle: string,
  resourcePath: string,
) {
  return buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Resources', path: '/resources' },
    { name: resourceTitle, path: resourcePath },
  ]);
}

export function buildStaticPageBreadcrumbs(
  pageTitle: string,
  pagePath: string,
) {
  return buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: pageTitle, path: pagePath },
  ]);
}

export function buildCalculatorBreadcrumbs(
  calculatorTitle: string,
  calculatorPath: string,
) {
  return buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Calculators', path: '/calculators' },
    { name: calculatorTitle, path: calculatorPath },
  ]);
}

export function buildBlogHubBreadcrumbs() {
  return buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
  ]);
}

export function buildBlogPostBreadcrumbs(postTitle: string, postPath: string) {
  return buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: postTitle, path: postPath },
  ]);
}
