import type { CalculatorConversionJourney, CalculatorJourneyId } from '@/lib/conversion/types';

export const calculatorJourneys: CalculatorConversionJourney[] = [
  {
    id: 'self-employed-tax',
    summary:
      'Plan quarterly payments, compare entity structures, and read the self-employment tax guide.',
    nextSteps: [
      { kind: 'calculator', slug: 'quarterly-tax-calculator' },
      { kind: 'calculator', slug: 'llc-vs-scorp-calculator' },
      { kind: 'resource', slug: 'self-employment-tax-guide' },
    ],
    related: {
      calculators: [
        'quarterly-tax-calculator',
        'estimated-tax-calculator',
        '1099-tax-calculator',
        'llc-vs-scorp-calculator',
        'hsa-tax-savings-calculator',
      ],
      resources: [
        'self-employment-tax-guide',
        'quarterly-tax-guide',
        'quarterly-tax-due-dates-2025',
        'tax-brackets-2025',
      ],
      articles: ['2026-tax-planning-checklist-freelancers'],
    },
  },
  {
    id: '1099-tax',
    summary:
      'Estimate quarterly payments, annual liability, and review quarterly tax planning guides.',
    nextSteps: [
      { kind: 'calculator', slug: 'quarterly-tax-calculator' },
      { kind: 'calculator', slug: 'estimated-tax-calculator' },
      { kind: 'resource', slug: 'quarterly-tax-guide' },
    ],
    related: {
      calculators: [
        'self-employed-tax-calculator',
        'quarterly-tax-calculator',
        'estimated-tax-calculator',
        'w2-vs-1099-calculator',
      ],
      resources: [
        'self-employment-tax-guide',
        'quarterly-tax-guide',
        'quarterly-tax-due-dates-2025',
        'tax-brackets-2025',
      ],
      articles: ['2026-tax-planning-checklist-freelancers'],
    },
  },
  {
    id: 'quarterly-tax',
    summary:
      'Cross-check annual liability, self-employment tax, and 2025 due dates.',
    nextSteps: [
      { kind: 'calculator', slug: 'estimated-tax-calculator' },
      { kind: 'calculator', slug: 'self-employed-tax-calculator' },
      { kind: 'resource', slug: 'quarterly-tax-due-dates-2025' },
    ],
    related: {
      calculators: [
        'estimated-tax-calculator',
        'self-employed-tax-calculator',
        '1099-tax-calculator',
      ],
      resources: [
        'quarterly-tax-guide',
        'quarterly-tax-due-dates-2025',
        'self-employment-tax-guide',
        'tax-brackets-2025',
      ],
      articles: ['2026-tax-planning-checklist-freelancers'],
    },
  },
  {
    id: 'estimated-tax',
    summary:
      'Break payments into quarters, refine self-employment tax, and review bracket tables.',
    nextSteps: [
      { kind: 'calculator', slug: 'quarterly-tax-calculator' },
      { kind: 'calculator', slug: 'self-employed-tax-calculator' },
      { kind: 'resource', slug: 'quarterly-tax-guide' },
    ],
    related: {
      calculators: [
        'quarterly-tax-calculator',
        'self-employed-tax-calculator',
        '1099-tax-calculator',
      ],
      resources: [
        'quarterly-tax-guide',
        'quarterly-tax-due-dates-2025',
        'tax-brackets-2025',
        'self-employment-tax-guide',
      ],
      articles: [
        '2026-tax-planning-checklist-freelancers',
        'what-changes-when-irs-updates-tax-brackets',
      ],
    },
  },
  {
    id: 'w2-vs-1099',
    summary:
      'Model contractor taxes, S Corp salary splits, and read employment tax guides.',
    nextSteps: [
      { kind: 'calculator', slug: '1099-tax-calculator' },
      { kind: 'calculator', slug: 'self-employed-tax-calculator' },
      { kind: 'resource', slug: 'self-employment-tax-guide' },
    ],
    related: {
      calculators: [
        '1099-tax-calculator',
        'self-employed-tax-calculator',
        's-corp-tax-calculator',
        'llc-vs-scorp-calculator',
      ],
      resources: [
        'self-employment-tax-guide',
        'tax-brackets-2025',
        'quarterly-tax-guide',
      ],
      articles: ['2026-tax-planning-checklist-freelancers'],
    },
  },
  {
    id: 's-corp-tax',
    summary:
      'Compare LLC vs S Corp scenarios, sole proprietor taxes, and entity planning resources.',
    nextSteps: [
      { kind: 'calculator', slug: 'llc-vs-scorp-calculator' },
      { kind: 'calculator', slug: 'self-employed-tax-calculator' },
      { kind: 'resource', slug: 'self-employment-tax-guide' },
    ],
    related: {
      calculators: [
        'llc-vs-scorp-calculator',
        'self-employed-tax-calculator',
        'w2-vs-1099-calculator',
        'hsa-tax-savings-calculator',
      ],
      resources: [
        'self-employment-tax-guide',
        'tax-brackets-2025',
        'taxchecker-methodology',
      ],
      articles: ['what-changes-when-irs-updates-tax-brackets'],
    },
  },
  {
    id: 'llc-vs-scorp',
    summary:
      'Model S Corp salary and distributions, then explore entity comparison resources.',
    nextSteps: [
      { kind: 'calculator', slug: 's-corp-tax-calculator' },
      { kind: 'calculator', slug: 'self-employed-tax-calculator' },
      { kind: 'resource', slug: 'self-employment-tax-guide' },
    ],
    related: {
      calculators: [
        's-corp-tax-calculator',
        'self-employed-tax-calculator',
        'w2-vs-1099-calculator',
        '1099-tax-calculator',
      ],
      resources: [
        'self-employment-tax-guide',
        'tax-brackets-2025',
        'taxchecker-methodology',
      ],
      articles: ['what-changes-when-irs-updates-tax-brackets'],
    },
  },
  {
    id: 'hsa-tax',
    summary:
      'See how HSA savings interact with self-employment tax and S Corp payroll scenarios.',
    nextSteps: [
      { kind: 'calculator', slug: 'self-employed-tax-calculator' },
      { kind: 'calculator', slug: 's-corp-tax-calculator' },
      { kind: 'resource', slug: 'tax-brackets-2025' },
    ],
    related: {
      calculators: [
        'self-employed-tax-calculator',
        's-corp-tax-calculator',
        'w2-vs-1099-calculator',
        'estimated-tax-calculator',
      ],
      resources: [
        'tax-brackets-2025',
        'self-employment-tax-guide',
        'taxchecker-methodology',
      ],
      articles: ['2026-tax-planning-checklist-freelancers'],
    },
  },
];

const journeyById = new Map(
  calculatorJourneys.map((journey) => [journey.id, journey]),
);

export function getCalculatorJourney(
  id: CalculatorJourneyId,
): CalculatorConversionJourney {
  const journey = journeyById.get(id);
  if (!journey) {
    throw new Error(`Unknown calculator journey: ${id}`);
  }
  return journey;
}

export function getCalculatorJourneyByEngineId(
  engineId: string,
): CalculatorConversionJourney | undefined {
  return journeyById.get(engineId as CalculatorJourneyId);
}
