/**
 * Trust, legal, and informational page registry.
 */

export type TrustPageSlug =
  | 'about'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'disclaimer'
  | 'methodology'
  | 'sources'
  | 'editorial-standards'
  | 'guides';

export interface TrustPageDefinition {
  slug: TrustPageSlug;
  route: string;
  title: string;
  shortTitle: string;
  description: string;
  lastUpdated: string;
  sitemapPriority: number;
  /** Placeholder pages may use noindex until content is complete */
  placeholder?: boolean;
}

const UPDATED = '2026-06-16';

export const trustPages: TrustPageDefinition[] = [
  {
    slug: 'about',
    route: '/about',
    title: 'About TaxChecker',
    shortTitle: 'About',
    description:
      'Learn how TaxChecker builds free federal tax calculators for freelancers and contractors using documented IRS publications. Independent—not affiliated with the IRS.',
    lastUpdated: UPDATED,
    sitemapPriority: 0.6,
  },
  {
    slug: 'contact',
    route: '/contact',
    title: 'Contact',
    shortTitle: 'Contact',
    description:
      'Contact TaxChecker about federal tax calculators, methodology, or website questions. Estimates only — not tax advice. No public email address is published.',
    lastUpdated: UPDATED,
    sitemapPriority: 0.5,
  },
  {
    slug: 'privacy',
    route: '/privacy',
    title: 'Privacy Policy',
    shortTitle: 'Privacy Policy',
    description:
      'TaxChecker privacy policy: how we handle data when you use our free federal tax calculators. Calculations run locally in your browser.',
    lastUpdated: UPDATED,
    sitemapPriority: 0.4,
  },
  {
    slug: 'terms',
    route: '/terms',
    title: 'Terms of Use',
    shortTitle: 'Terms of Use',
    description:
      'Terms of use for TaxChecker federal tax calculators. Estimates only — not tax, legal, or financial advice.',
    lastUpdated: UPDATED,
    sitemapPriority: 0.4,
  },
  {
    slug: 'disclaimer',
    route: '/disclaimer',
    title: 'Disclaimer',
    shortTitle: 'Disclaimer',
    description:
      'TaxChecker disclaimer: federal tax estimates for planning only. Not tax advice, not affiliated with the IRS.',
    lastUpdated: UPDATED,
    sitemapPriority: 0.5,
  },
  {
    slug: 'methodology',
    route: '/methodology',
    title: 'Methodology',
    shortTitle: 'Methodology',
    description:
      'How TaxChecker models federal estimates: IRS sources, annual reviews, known exclusions, and estimate-only limits. Source traceability—not IRS endorsement.',
    lastUpdated: UPDATED,
    sitemapPriority: 0.7,
  },
  {
    slug: 'sources',
    route: '/sources',
    title: 'Sources',
    shortTitle: 'Sources',
    description:
      'IRS publications, forms, revenue procedures, and notices cited in TaxChecker calculators and guides. Public source appendix for the labeled tax year.',
    lastUpdated: UPDATED,
    sitemapPriority: 0.65,
  },
  {
    slug: 'editorial-standards',
    route: '/editorial-standards',
    title: 'Editorial Standards',
    shortTitle: 'Editorial Standards',
    description:
      'How TaxChecker creates, reviews, and corrects calculators and guides: tax-year checks, source citations, update workflow, and reader corrections.',
    lastUpdated: UPDATED,
    sitemapPriority: 0.6,
  },
  {
    slug: 'guides',
    route: '/guides',
    title: 'Tax Guides',
    shortTitle: 'Guides',
    description:
      'Federal tax guides and reference articles from TaxChecker. Educational content for self-employment, quarterly payments, and more.',
    lastUpdated: UPDATED,
    sitemapPriority: 0.6,
    placeholder: true,
  },
];

export const TRUST_PAGE_SLUGS = trustPages.map((page) => page.slug);

export function getTrustPageBySlug(
  slug: TrustPageSlug,
): TrustPageDefinition | undefined {
  return trustPages.find((page) => page.slug === slug);
}

export function getTrustPageByRoute(
  route: string,
): TrustPageDefinition | undefined {
  return trustPages.find((page) => page.route === route);
}

export function getSitemapTrustPages(): TrustPageDefinition[] {
  return trustPages.filter((page) => !page.placeholder);
}

/** Pages linked in sitemap including placeholder guides hub */
export function getAllPublicTrustPages(): TrustPageDefinition[] {
  return trustPages;
}
