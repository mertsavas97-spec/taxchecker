/**
 * TaxChecker global site configuration.
 * Used by SEO, metadata, JSON-LD, sitemap, and robots.
 */

export const site = {
  siteName: 'TaxChecker',
  domain: 'taxchecker.app',
  productionUrl: 'https://www.taxchecker.app',
  defaultTitle: 'TaxChecker — Free Federal Tax Calculators',
  defaultDescription:
    'Free federal tax calculators for self-employment, 1099 income, quarterly estimated taxes, LLC vs S Corp comparisons and HSA savings. Estimates only — not tax advice.',
  defaultOgImage: '/og/home',
  defaultLocale: 'en_US',
  titleTemplate: '%s | TaxChecker',
  organization: {
    name: 'TaxChecker',
    legalName: 'TaxChecker',
    url: 'https://www.taxchecker.app',
    logo: 'https://www.taxchecker.app/brand/taxchecker-logo.png',
    contactPath: '/contact',
    foundingDate: '2026',
    description:
      'Independent federal tax estimation tools for self-employed workers, contractors, and small business owners.',
    sameAs: [] as string[],
  },
  disclaimer:
    'Estimates only — not tax advice, legal advice, or financial advice. TaxChecker is not affiliated with the IRS. Consult a qualified tax professional for your situation.',
} as const;

export type SiteConfig = typeof site;
