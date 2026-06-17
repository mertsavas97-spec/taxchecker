import { authorityRoutes } from '@/config/authority';

export interface AboutAuthoritySection {
  id: string;
  heading: string;
  paragraphs: string[];
  list?: string[];
  href?: string;
  linkLabel?: string;
}

export const aboutAuthoritySections: AboutAuthoritySection[] = [
  {
    id: 'editorial-standards',
    heading: 'Editorial standards',
    paragraphs: [
      'TaxChecker publishes federal tax calculators and educational resources using a documented editorial process. Content is tied to IRS primary sources, labeled with tax year and last reviewed dates, and written for planning—not filing or individualized advice.',
      'Our full editorial standards describe how content is created, reviewed, sourced, and corrected.',
    ],
    href: authorityRoutes.editorialStandards,
    linkLabel: 'Read editorial standards',
  },
  {
    id: 'review-process',
    heading: 'Review process',
    paragraphs: [
      'Each ready calculator is reviewed against IRS publications, forms, notices, and revenue procedures for its labeled tax year. Resource articles and reference pages follow the same source-first approach before publication.',
      'Comparison tools receive additional review so outputs remain neutral scenario estimates rather than employment, legal, or entity recommendations.',
    ],
    list: [
      'Tax-year constants checked against cited IRS sources',
      'Calculator disclaimers and warnings confirmed on-page',
      'Resource FAQs confirm content is educational only',
      'Last reviewed dates updated when constants or copy change',
    ],
  },
  {
    id: 'source-documentation',
    heading: 'Source documentation',
    paragraphs: [
      'TaxChecker documents IRS sources used for brackets, deductions, self-employment tax rules, payroll taxes, HSA limits, quarterly due dates, and related federal constants.',
      'Calculator and resource pages cite primary references inline. A consolidated public Sources appendix lists publications, forms, and revenue procedures used across the site.',
    ],
    href: authorityRoutes.sources,
    linkLabel: 'View sources appendix',
  },
  {
    id: 'update-policy',
    heading: 'Update policy',
    paragraphs: [
      'When IRS guidance changes tax-year constants, TaxChecker updates the shared tax engine configuration, affected calculator pages, and related resources. We then update last reviewed metadata and document the change on Methodology and Sources pages.',
      'Internal review against IRS sources is source traceability—not IRS certification, approval, or endorsement.',
    ],
    list: [
      'Monitor IRS annual inflation adjustments and form instructions',
      'Update tax-year configuration and affected educational copy',
      'Refresh last reviewed dates on impacted pages',
      'Publish corrections when users report substantiated source issues',
    ],
    href: authorityRoutes.methodology,
    linkLabel: 'View methodology',
  },
  {
    id: 'federal-scope',
    heading: 'Federal scope and limitations',
    paragraphs: [
      'TaxChecker models U.S. federal taxes for planning scenarios. State, local, franchise, sales, and many credits are excluded unless a page explicitly includes them.',
      'Calculators may simplify complex return items such as AMT, QBI, underpayment penalties, and multi-state situations. Warnings on each page describe active simplifications.',
    ],
    list: [
      'Federal income and self-employment tax estimates',
      'Quarterly estimated payment planning',
      'Educational entity and employment comparisons only',
      'Not tax preparation, filing, or professional advice',
    ],
  },
];
