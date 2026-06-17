/**
 * TaxChecker global site configuration.
 * Used by SEO, metadata, JSON-LD, sitemap, and robots.
 */

export const site = {
  siteName: 'TaxChecker',
  domain: 'taxchecker.app',
  productionUrl: 'https://taxchecker.app',
  defaultTitle: 'Federal Tax Estimates You Can Verify — Free 2025 Calculators',
  defaultDescription:
    'Free self-employment, 1099, quarterly & LLC vs S Corp calculators built from IRS publications. Run instant federal estimates—not tax advice.',
  defaultOgImage: '/og/home',
  defaultLocale: 'en_US',
  twitterHandle: '@taxchecker',
  titleTemplate: '%s | TaxChecker',
  organization: {
    name: 'TaxChecker',
    legalName: 'TaxChecker',
    url: 'https://taxchecker.app',
    logo: 'https://taxchecker.app/brand/taxchecker-logo.png',
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
