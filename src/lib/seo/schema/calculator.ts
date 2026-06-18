import type { CalculatorDefinition } from '@/config/calculators';
import { site } from '@/config/site';
import { absoluteUrl } from '@/lib/seo/urls';

export function buildCalculatorSchema(calculator: CalculatorDefinition) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: calculator.shortTitle,
    applicationCategory: 'FinanceApplication',
    applicationSubCategory: 'TaxCalculator',
    operatingSystem: 'Web',
    url: absoluteUrl(calculator.route),
    description: calculator.description,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    isAccessibleForFree: true,
    publisher: {
      '@type': 'Organization',
      name: site.organization.name,
      url: site.organization.url,
      logo: {
        '@type': 'ImageObject',
        url: site.organization.logo,
      },
    },
    author: {
      '@type': 'Organization',
      name: site.organization.name,
      url: site.organization.url,
    },
    softwareHelp: absoluteUrl('/methodology'),
    keywords: [calculator.primaryKeyword, ...calculator.secondaryKeywords].join(
      ', ',
    ),
    dateModified: calculator.lastUpdated,
    temporalCoverage: `${calculator.taxYear}`,
    inLanguage: site.defaultLocale.replace('_', '-'),
  };
}
