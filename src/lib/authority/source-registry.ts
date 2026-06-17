import { taxYear2025 } from '@/lib/tax-engine';
import type { SourceReference } from '@/lib/tax-engine/types';

export type SourceCategory =
  | 'publication'
  | 'form'
  | 'revenue-procedure'
  | 'notice'
  | 'topic'
  | 'guide';

export interface PublicSourceEntry {
  id: string;
  category: SourceCategory;
  title: string;
  url: string;
  taxYear: number;
  dateAccessed: string;
  usedFor: string;
}

function categorizeSource(title: string, url: string): SourceCategory {
  const lower = `${title} ${url}`.toLowerCase();
  if (lower.includes('revenue procedure') || url.includes('/rp-')) {
    return 'revenue-procedure';
  }
  if (lower.includes('notice ') || url.includes('/n-')) {
    return 'notice';
  }
  if (lower.includes('form ') || url.includes('f1040') || url.includes('/forms-pubs/')) {
    return 'form';
  }
  if (lower.includes('topic no')) {
    return 'topic';
  }
  if (lower.includes('publication')) {
    return 'publication';
  }
  return 'guide';
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function entryFromReference(
  source: SourceReference,
  usedFor: string,
): PublicSourceEntry {
  return {
    id: slugify(source.title),
    category: categorizeSource(source.title, source.url),
    title: source.title,
    url: source.url,
    taxYear: source.taxYear,
    dateAccessed: source.dateAccessed,
    usedFor,
  };
}

const supplementalSources: Array<{ source: SourceReference; usedFor: string }> = [
  {
    source: {
      title: 'Publication 334 — Tax Guide for Small Business',
      url: 'https://www.irs.gov/publications/p334',
      taxYear: 2025,
      dateAccessed: '2026-06-16',
    },
    usedFor: 'Self-employment tax guides and educational resources',
  },
  {
    source: {
      title: 'Limited Liability Company (LLC) — IRS',
      url: 'https://www.irs.gov/businesses/small-businesses-self-employed/limited-liability-company-llc',
      taxYear: 2025,
      dateAccessed: '2026-06-16',
    },
    usedFor: 'LLC vs S Corp comparison calculator and entity education',
  },
  {
    source: {
      title: 'S Corporations — IRS Small Business Guide',
      url: 'https://www.irs.gov/businesses/small-businesses-self-employed/s-corporations',
      taxYear: 2025,
      dateAccessed: '2026-06-16',
    },
    usedFor: 'S Corp tax calculator and entity comparison content',
  },
  {
    source: {
      title: 'About Schedule SE (Form 1040)',
      url: 'https://www.irs.gov/forms-pubs/about-schedule-se-form-1040',
      taxYear: 2025,
      dateAccessed: '2026-06-16',
    },
    usedFor: 'Self-employed and 1099 tax calculators',
  },
];

const engineSourceUses: Array<{ key: keyof typeof taxYear2025.sources; usedFor: string }> =
  [
    { key: 'federalIncomeTax', usedFor: 'Federal income tax brackets and rates' },
    { key: 'standardDeduction', usedFor: 'Standard deduction amounts' },
    { key: 'selfEmploymentTax', usedFor: 'Self-employment tax rates and rules' },
    { key: 'additionalMedicareTax', usedFor: 'Additional Medicare tax thresholds' },
    { key: 'payrollTax', usedFor: 'Payroll and FICA calculations' },
    { key: 'estimatedTax', usedFor: 'Quarterly estimated tax due dates' },
    { key: 'hsa', usedFor: 'HSA contribution limits' },
    { key: 'sepIra', usedFor: 'SEP IRA limits (planned calculators)' },
    { key: 'solo401k', usedFor: 'Solo 401(k) limits (planned calculators)' },
  ];

/** Public IRS source registry for /sources and trust pages. */
export function getPublicSourceRegistry(): PublicSourceEntry[] {
  const byUrl = new Map<string, PublicSourceEntry>();

  for (const { key, usedFor } of engineSourceUses) {
    const source = taxYear2025.sources[key];
    const entry = entryFromReference(source, usedFor);
    const existing = byUrl.get(entry.url);
    if (existing) {
      existing.usedFor = `${existing.usedFor}; ${usedFor}`;
    } else {
      byUrl.set(entry.url, entry);
    }
  }

  for (const { source, usedFor } of supplementalSources) {
    const entry = entryFromReference(source, usedFor);
    const existing = byUrl.get(entry.url);
    if (existing) {
      existing.usedFor = `${existing.usedFor}; ${usedFor}`;
    } else {
      byUrl.set(entry.url, entry);
    }
  }

  return [...byUrl.values()].sort((a, b) => a.title.localeCompare(b.title));
}

export function getSourcesByCategory(
  category: SourceCategory,
): PublicSourceEntry[] {
  return getPublicSourceRegistry().filter((entry) => entry.category === category);
}

export const sourceUpdatePolicy = {
  lastReviewed: taxYear2025.verifiedAt,
  taxYear: taxYear2025.taxYear,
  summary:
    'TaxChecker reviews IRS primary sources when tax-year constants change, when calculators are added or updated, and when educational resources reference new federal rules. Internal review against IRS publications is not IRS certification or endorsement.',
  steps: [
    'Identify the IRS publication, form, notice, or revenue procedure that governs the constant or rule.',
    'Update the shared tax-year configuration used by the tax engine.',
    'Re-run calculator and resource content review for affected pages.',
    'Update last reviewed dates on affected calculator and resource registry entries.',
    'Document the change on the Methodology and Sources pages.',
  ],
} as const;
