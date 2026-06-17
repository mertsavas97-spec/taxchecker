/**
 * Centralized resource registry for guides, deadlines, tax bracket references,
 * and methodology articles surfaced on /resources and future article routes.
 */

export type ResourceCategoryId =
  | 'guides'
  | 'deadlines'
  | 'tax-brackets'
  | 'methodology';

export type ResourceStatus = 'published' | 'coming_soon';

export interface ResourceDefinition {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  category: ResourceCategoryId;
  status: ResourceStatus;
  readingTime: string;
  lastReviewed: string;
  lastUpdated: string;
  taxYear?: number;
  featured: boolean;
  relatedCalculatorSlugs: string[];
  relatedResourceSlugs: string[];
  relatedBlogSlugs: string[];
  primaryKeyword: string;
  secondaryKeywords: string[];
  route: string;
  sourceIds: string[];
}

const REVIEWED = '2026-06-16';
const UPDATED = '2026-06-16';
const TAX_YEAR = 2025;

export const resources: ResourceDefinition[] = [
  {
    slug: 'taxchecker-methodology',
    title: 'TaxChecker Methodology — How Federal Estimates Are Built',
    shortTitle: 'Methodology',
    description:
      'Internal methodology reference: IRS sources, formulas, exclusions & review dates behind TaxChecker federal estimates. Companion to the public methodology page.',
    category: 'methodology',
    status: 'published',
    readingTime: '6 min read',
    lastReviewed: REVIEWED,
    lastUpdated: UPDATED,
    taxYear: TAX_YEAR,
    featured: true,
    relatedCalculatorSlugs: ['self-employed-tax-calculator'],
    relatedResourceSlugs: [
      'self-employment-tax-guide',
      'tax-brackets-2025',
    ],
    relatedBlogSlugs: [
      'federal-tax-brackets-2025-explained',
      'estimated-tax-safe-harbor-rules',
    ],
    primaryKeyword: 'tax calculator methodology',
    secondaryKeywords: [
      'how tax calculators work',
      'Federal tax constants from IRS publications',
      'federal tax estimate assumptions',
    ],
    route: '/methodology',
    sourceIds: [],
  },
  {
    slug: 'self-employment-tax-guide',
    title: 'Self Employment Tax Guide (2025) — Schedule SE Explained',
    shortTitle: 'Self Employment Tax Guide',
    description:
      'How 2025 self-employment tax works: Schedule SE net earnings, Social Security wage base & Medicare rates for freelancers. Planning guide—not tax advice.',
    category: 'guides',
    status: 'published',
    readingTime: '10 min read',
    lastReviewed: REVIEWED,
    lastUpdated: UPDATED,
    taxYear: TAX_YEAR,
    featured: true,
    relatedCalculatorSlugs: [
      'self-employed-tax-calculator',
      '1099-tax-calculator',
      'quarterly-tax-calculator',
    ],
    relatedResourceSlugs: [
      'quarterly-tax-guide',
      'quarterly-tax-due-dates-2025',
      'tax-brackets-2025',
    ],
    relatedBlogSlugs: [
      'self-employment-tax-explained',
      'quarterly-taxes-explained',
    ],
    primaryKeyword: 'self employment tax guide',
    secondaryKeywords: [
      'how does self employment tax work',
      'Schedule SE explained',
      'freelancer tax guide',
    ],
    route: '/resources/self-employment-tax-guide',
    sourceIds: ['schedule-se', 'pub-334'],
  },
  {
    slug: 'quarterly-tax-guide',
    title: 'Quarterly Estimated Tax Guide (2025) — 1040-ES Basics',
    shortTitle: 'Quarterly Tax Guide',
    description:
      'Who pays quarterly federal estimated tax, safe harbor rules & how 1040-ES payments fit annual filing. 2025 planning guide from IRS publications—not tax advice.',
    category: 'guides',
    status: 'published',
    readingTime: '9 min read',
    lastReviewed: REVIEWED,
    lastUpdated: UPDATED,
    taxYear: TAX_YEAR,
    featured: true,
    relatedCalculatorSlugs: [
      'quarterly-tax-calculator',
      'estimated-tax-calculator',
      'self-employed-tax-calculator',
    ],
    relatedResourceSlugs: [
      'self-employment-tax-guide',
      'quarterly-tax-due-dates-2025',
      'tax-brackets-2025',
    ],
    relatedBlogSlugs: [
      'self-employment-tax-explained',
      'quarterly-taxes-explained',
    ],
    primaryKeyword: 'quarterly tax guide',
    secondaryKeywords: [
      'estimated tax guide',
      '1040-ES explained',
      'self employed quarterly taxes',
    ],
    route: '/resources/quarterly-tax-guide',
    sourceIds: ['form-1040-es', 'pub-505'],
  },
  {
    slug: 'tax-brackets-2025',
    title: '2025 Federal Tax Brackets — Rates by Filing Status',
    shortTitle: 'Tax Brackets 2025',
    description:
      '2025 federal income tax bracket table by filing status from IRS Revenue Procedure 2024-40. Reference rates used in TaxChecker calculators—not tax advice.',
    category: 'tax-brackets',
    status: 'published',
    readingTime: '5 min read',
    lastReviewed: REVIEWED,
    lastUpdated: UPDATED,
    taxYear: TAX_YEAR,
    featured: true,
    relatedCalculatorSlugs: [
      'self-employed-tax-calculator',
      'estimated-tax-calculator',
    ],
    relatedResourceSlugs: [
      'self-employment-tax-guide',
      'quarterly-tax-due-dates-2025',
    ],
    relatedBlogSlugs: [
      'federal-tax-brackets-2025-explained',
      'estimated-tax-safe-harbor-rules',
    ],
    primaryKeyword: '2025 federal tax brackets',
    secondaryKeywords: [
      'federal income tax rates 2025',
      'tax bracket calculator',
      'IRS tax brackets',
    ],
    route: '/resources/tax-brackets-2025',
    sourceIds: ['rev-proc-2024-40'],
  },
  {
    slug: 'quarterly-tax-due-dates-2025',
    title: 'Quarterly Tax Due Dates 2025 — Form 1040-ES Payment Calendar',
    shortTitle: 'Quarterly Due Dates 2025',
    description:
      '2025 Form 1040-ES estimated tax due dates with weekend & holiday adjustments plus safe harbor overview. Federal deadline reference—not tax advice.',
    category: 'deadlines',
    status: 'published',
    readingTime: '4 min read',
    lastReviewed: REVIEWED,
    lastUpdated: UPDATED,
    taxYear: TAX_YEAR,
    featured: true,
    relatedCalculatorSlugs: [
      'quarterly-tax-calculator',
      'estimated-tax-calculator',
    ],
    relatedResourceSlugs: [
      'quarterly-tax-guide',
      'tax-brackets-2025',
    ],
    relatedBlogSlugs: [
      'self-employment-tax-explained',
      'quarterly-taxes-explained',
    ],
    primaryKeyword: 'quarterly tax due dates 2025',
    secondaryKeywords: [
      'estimated tax due dates',
      '1040-ES due dates',
      'when are quarterly taxes due',
    ],
    route: '/resources/quarterly-tax-due-dates-2025',
    sourceIds: ['form-1040-es', 'pub-505'],
  },
];

export function getResourceBySlug(slug: string): ResourceDefinition | undefined {
  return resources.find((resource) => resource.slug === slug);
}

export function isResourcePublished(resource: ResourceDefinition): boolean {
  return resource.status === 'published';
}

export function getPublishedResources(): ResourceDefinition[] {
  return resources.filter((resource) => resource.status === 'published');
}

/** Alias used by sitemap and metadata for indexable resource routes */
export function getPublishableResources(): ResourceDefinition[] {
  return getPublishedResources();
}

export function getComingSoonResources(): ResourceDefinition[] {
  return resources.filter((resource) => resource.status === 'coming_soon');
}
