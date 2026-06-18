import { site } from '@/config/site';

export function buildWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.siteName,
    url: site.productionUrl,
    description: site.defaultDescription,
    publisher: {
      '@type': 'Organization',
      name: site.organization.name,
      url: site.organization.url,
      logo: site.organization.logo,
    },
    about: {
      '@type': 'Organization',
      name: site.organization.name,
      url: site.organization.url,
    },
    audience: {
      '@type': 'Audience',
      audienceType: 'Self-employed taxpayers and small business owners',
    },
    inLanguage: site.defaultLocale.replace('_', '-'),
  };
}
