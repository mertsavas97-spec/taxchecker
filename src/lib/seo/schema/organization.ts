import { legalEntity } from '@/config/legal-entity';
import { site } from '@/config/site';
import { absoluteUrl } from '@/lib/seo/urls';

export function buildOrganizationSchema() {
  const legalName =
    legalEntity.legalName.startsWith('[')
      ? site.organization.legalName
      : legalEntity.legalName;

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.organization.name,
    legalName,
    url: site.organization.url,
    logo: site.organization.logo,
    foundingDate: site.organization.foundingDate,
    description: site.organization.description,
    sameAs: site.organization.sameAs,
    areaServed: {
      '@type': 'Country',
      name: 'United States',
    },
    knowsAbout: [
      'Federal income tax',
      'Self-employment tax',
      'Quarterly estimated tax',
      'IRS publications',
      'Tax planning',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: absoluteUrl(site.organization.contactPath),
    },
  };
}
