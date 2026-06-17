/**
 * Calculator registry for SEO, sitemap, internal linking, and future page generation.
 */

export type CalculatorCategory =
  | 'self-employed'
  | 'employment'
  | 'business-entity'
  | 'benefits';

export type CalculatorStatus = 'ready' | 'planned';
export type EngineStatus = 'implemented' | 'pending';

export interface CalculatorDefinition {
  slug: string;
  /** Engine module id (may differ from slug) */
  engineId: string;
  title: string;
  shortTitle: string;
  description: string;
  category: CalculatorCategory;
  primaryKeyword: string;
  secondaryKeywords: string[];
  route: string;
  relatedCalculatorSlugs: string[];
  sourceIds: string[];
  status: CalculatorStatus;
  engineStatus: EngineStatus;
  taxYear: number;
  lastReviewed: string;
  lastUpdated: string;
}

const REVIEWED = '2026-06-16';
const UPDATED = '2026-06-16';
const TAX_YEAR = 2025;

export const calculators: CalculatorDefinition[] = [
  {
    slug: 'self-employed-tax-calculator',
    engineId: 'self-employed-tax',
    title: 'Self Employed Tax Calculator (2025) — Free SE & Income Tax Estimate',
    shortTitle: 'Self-Employed Tax',
    description:
      'Estimate 2025 self-employment tax & federal income tax on net profit using Schedule SE rules & IRS brackets. Free instant calculator—not tax advice.',
    category: 'self-employed',
    primaryKeyword: 'self employed tax calculator',
    secondaryKeywords: [
      'self employment tax calculator',
      'freelance tax calculator',
      'Schedule C tax estimate',
      'how much tax on 1099 income',
    ],
    route: '/calculators/self-employed-tax',
    relatedCalculatorSlugs: [
      '1099-tax-calculator',
      'quarterly-tax-calculator',
      'estimated-tax-calculator',
    ],
    sourceIds: ['rev-proc-2024-40', 'schedule-se', 'pub-505'],
    status: 'ready',
    engineStatus: 'implemented',
    taxYear: TAX_YEAR,
    lastReviewed: REVIEWED,
    lastUpdated: UPDATED,
  },
  {
    slug: '1099-tax-calculator',
    engineId: '1099-tax',
    title: '1099 Tax Calculator (2025) — Free Contractor Income Tax Estimate',
    shortTitle: '1099 Tax',
    description:
      'Estimate federal tax on 1099-NEC income after business expenses—incl. self-employment & income tax. Free calculator for contractors—not tax advice.',
    category: 'self-employed',
    primaryKeyword: '1099 tax calculator',
    secondaryKeywords: [
      '1099 NEC tax calculator',
      'how much tax on 1099 income',
      'independent contractor tax calculator',
      '1099 self employment tax',
    ],
    route: '/calculators/1099-tax',
    relatedCalculatorSlugs: [
      'self-employed-tax-calculator',
      'quarterly-tax-calculator',
      'w2-vs-1099-calculator',
    ],
    sourceIds: ['rev-proc-2024-40', 'schedule-se'],
    status: 'ready',
    engineStatus: 'implemented',
    taxYear: TAX_YEAR,
    lastReviewed: REVIEWED,
    lastUpdated: UPDATED,
  },
  {
    slug: 'quarterly-tax-calculator',
    engineId: 'quarterly-tax',
    title: 'Quarterly Tax Calculator (2025) — Free 1040-ES Payment Estimate',
    shortTitle: 'Quarterly Tax',
    description:
      'Estimate 2025 quarterly federal tax payments using IRS safe harbor rules & Form 1040-ES due dates. Free self-employed planner—not tax advice.',
    category: 'self-employed',
    primaryKeyword: 'quarterly tax calculator',
    secondaryKeywords: [
      'estimated tax payment calculator',
      '1040-ES calculator',
      'self employed quarterly taxes',
      'when are quarterly taxes due',
    ],
    route: '/calculators/quarterly-tax',
    relatedCalculatorSlugs: [
      'estimated-tax-calculator',
      'self-employed-tax-calculator',
      '1099-tax-calculator',
    ],
    sourceIds: ['form-1040-es', 'pub-505', 'schedule-se'],
    status: 'ready',
    engineStatus: 'implemented',
    taxYear: TAX_YEAR,
    lastReviewed: REVIEWED,
    lastUpdated: UPDATED,
  },
  {
    slug: 'estimated-tax-calculator',
    engineId: 'estimated-tax',
    title: 'Estimated Tax Calculator (2025) — Annual Federal Liability Worksheet',
    shortTitle: 'Estimated Tax',
    description:
      'Estimate annual federal tax, remaining liability & safe harbor targets for self-employed income. Free 2025 worksheet from IRS publications—not tax advice.',
    category: 'self-employed',
    primaryKeyword: 'estimated tax calculator',
    secondaryKeywords: [
      'federal estimated tax calculator',
      '1040-ES estimated tax',
      'how much estimated tax to pay',
      'self employed estimated taxes',
    ],
    route: '/calculators/estimated-tax',
    relatedCalculatorSlugs: [
      'quarterly-tax-calculator',
      'self-employed-tax-calculator',
      '1099-tax-calculator',
    ],
    sourceIds: ['form-1040-es', 'pub-505', 'rev-proc-2024-40'],
    status: 'ready',
    engineStatus: 'implemented',
    taxYear: TAX_YEAR,
    lastReviewed: REVIEWED,
    lastUpdated: UPDATED,
  },
  {
    slug: 'w2-vs-1099-calculator',
    engineId: 'w2-vs-1099',
    title: 'W2 vs 1099 Calculator (2025) — Compare Take-Home Pay & Taxes',
    shortTitle: 'W-2 vs 1099',
    description:
      'Compare estimated federal taxes & take-home pay: W-2 employee vs 1099 contractor side by side. Free 2025 comparison—not employment or legal advice.',
    category: 'employment',
    primaryKeyword: 'W2 vs 1099 calculator',
    secondaryKeywords: [
      '1099 vs W2 tax calculator',
      'employee vs contractor tax',
      'W2 or 1099 which is better',
      'independent contractor vs employee taxes',
    ],
    route: '/calculators/w2-vs-1099',
    relatedCalculatorSlugs: [
      '1099-tax-calculator',
      'self-employed-tax-calculator',
      's-corp-tax-calculator',
    ],
    sourceIds: ['pub-15', 'schedule-se', 'rev-proc-2024-40'],
    status: 'ready',
    engineStatus: 'implemented',
    taxYear: TAX_YEAR,
    lastReviewed: REVIEWED,
    lastUpdated: UPDATED,
  },
  {
    slug: 's-corp-tax-calculator',
    engineId: 's-corp-tax',
    title: 'S Corp Tax Calculator (2025) — Salary, Payroll & Distribution Estimate',
    shortTitle: 'S Corp Tax',
    description:
      'Estimate federal taxes on S corp owner salary, employer FICA & pass-through distributions. User-entered salary—free 2025 planner, not compensation advice.',
    category: 'business-entity',
    primaryKeyword: 'S corp tax calculator',
    secondaryKeywords: [
      'S corporation tax calculator',
      'S corp salary vs distribution',
      'reasonable salary S corp calculator',
      'S corp self employment tax savings',
    ],
    route: '/calculators/s-corp-tax',
    relatedCalculatorSlugs: [
      'llc-vs-scorp-calculator',
      'self-employed-tax-calculator',
      'w2-vs-1099-calculator',
    ],
    sourceIds: ['s-corporations', 'pub-15', 'rev-proc-2024-40'],
    status: 'ready',
    engineStatus: 'implemented',
    taxYear: TAX_YEAR,
    lastReviewed: REVIEWED,
    lastUpdated: UPDATED,
  },
  {
    slug: 'llc-vs-scorp-calculator',
    engineId: 'llc-vs-scorp',
    title: 'LLC vs S Corp Calculator (2025) — Free Federal Tax Comparison',
    shortTitle: 'LLC vs S Corp',
    description:
      'Compare estimated federal taxes: LLC sole proprietor vs S corporation with owner salary. Free 2025 side-by-side model—not entity or legal advice.',
    category: 'business-entity',
    primaryKeyword: 'LLC vs S corp calculator',
    secondaryKeywords: [
      'LLC or S corp tax calculator',
      'S corp vs LLC tax savings',
      'should I elect S corp',
      'single member LLC S corp comparison',
    ],
    route: '/calculators/llc-vs-scorp',
    relatedCalculatorSlugs: [
      's-corp-tax-calculator',
      'self-employed-tax-calculator',
      'w2-vs-1099-calculator',
    ],
    sourceIds: ['s-corporations', 'schedule-se', 'pub-15'],
    status: 'ready',
    engineStatus: 'implemented',
    taxYear: TAX_YEAR,
    lastReviewed: REVIEWED,
    lastUpdated: UPDATED,
  },
  {
    slug: 'hsa-tax-savings-calculator',
    engineId: 'hsa-tax',
    title: 'HSA Tax Savings Calculator (2025) — Free HSA Deduction Estimate',
    shortTitle: 'HSA Tax Savings',
    description:
      'Estimate 2025 federal income & payroll tax savings from HSA contributions using IRS-published limits. Free calculator—HDHP eligibility not assessed here.',
    category: 'benefits',
    primaryKeyword: 'HSA tax savings calculator',
    secondaryKeywords: [
      'HSA contribution calculator',
      'HSA tax deduction calculator',
      'health savings account tax benefit',
      'HSA limits 2025',
    ],
    route: '/calculators/hsa-tax',
    relatedCalculatorSlugs: [
      'self-employed-tax-calculator',
      's-corp-tax-calculator',
      'w2-vs-1099-calculator',
    ],
    sourceIds: ['pub-969', 'rev-proc-2024-25', 'rev-proc-2024-40'],
    status: 'ready',
    engineStatus: 'implemented',
    taxYear: TAX_YEAR,
    lastReviewed: REVIEWED,
    lastUpdated: UPDATED,
  },
  {
    slug: 'sep-ira-calculator',
    engineId: 'sep-ira',
    title: 'SEP IRA Calculator — Contribution Limits & Tax Savings',
    shortTitle: 'SEP IRA',
    description:
      'Estimate SEP IRA contribution limits and federal tax savings for self-employed individuals. Planned calculator — not yet available.',
    category: 'benefits',
    primaryKeyword: 'SEP IRA calculator',
    secondaryKeywords: [
      'SEP IRA contribution calculator',
      'self employed SEP IRA limit',
      'SEP IRA tax savings',
    ],
    route: '/calculators/sep-ira',
    relatedCalculatorSlugs: [
      'solo-401k-calculator',
      'self-employed-tax-calculator',
      'hsa-tax-savings-calculator',
    ],
    sourceIds: ['pub-560', 'notice-2024-80'],
    status: 'planned',
    engineStatus: 'pending',
    taxYear: TAX_YEAR,
    lastReviewed: REVIEWED,
    lastUpdated: UPDATED,
  },
  {
    slug: 'solo-401k-calculator',
    engineId: 'solo-401k',
    title: 'Solo 401(k) Calculator — Contribution Limits & Tax Savings',
    shortTitle: 'Solo 401(k)',
    description:
      'Estimate solo 401(k) employee deferral and employer contribution limits for owner-only businesses. Planned calculator — not yet available.',
    category: 'benefits',
    primaryKeyword: 'solo 401k calculator',
    secondaryKeywords: [
      'solo 401k contribution calculator',
      'individual 401k calculator',
      'self employed 401k limit',
    ],
    route: '/calculators/solo-401k',
    relatedCalculatorSlugs: [
      'sep-ira-calculator',
      'self-employed-tax-calculator',
      's-corp-tax-calculator',
    ],
    sourceIds: ['pub-560', 'notice-2024-80'],
    status: 'planned',
    engineStatus: 'pending',
    taxYear: TAX_YEAR,
    lastReviewed: REVIEWED,
    lastUpdated: UPDATED,
  },
];

export function getCalculatorBySlug(slug: string): CalculatorDefinition | undefined {
  return calculators.find((calculator) => calculator.slug === slug);
}

export function getCalculatorByEngineId(
  engineId: string,
): CalculatorDefinition | undefined {
  return calculators.find((calculator) => calculator.engineId === engineId);
}

export function getCalculatorByRoute(route: string): CalculatorDefinition | undefined {
  return calculators.find((calculator) => calculator.route === route);
}

export function getReadyCalculators(): CalculatorDefinition[] {
  return calculators.filter((calculator) => calculator.status === 'ready');
}

export function getPlannedCalculators(): CalculatorDefinition[] {
  return calculators.filter((calculator) => calculator.status === 'planned');
}

export function getRelatedCalculators(slug: string): CalculatorDefinition[] {
  const calculator = getCalculatorBySlug(slug);
  if (!calculator) return [];
  return calculator.relatedCalculatorSlugs
    .map((relatedSlug) => getCalculatorBySlug(relatedSlug))
    .filter((item): item is CalculatorDefinition => item !== undefined);
}
