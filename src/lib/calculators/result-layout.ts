import type {
  EstimatedTaxDetails,
  HsaTaxDetails,
  LlcVsSCorpDetails,
  QuarterlyTaxDetails,
  ResultCard,
} from '@/lib/tax-engine';
import { formatCurrency, percentFromRatio } from '@/lib/tax-engine';
import { cn } from '@/lib/utils';

/** Default primary result card ids for self-employed style calculators */
export const SELF_EMPLOYED_PRIMARY_RESULT_IDS = [
  'total-federal-tax',
  'quarterly-payment',
  'monthly-reserve',
  'after-tax-income',
] as const;

/** Primary result card ids for the quarterly tax calculator */
export const QUARTERLY_PRIMARY_RESULT_IDS = [
  'total-federal-tax',
  'quarterly-payment',
  'monthly-reserve',
  'remaining-tax',
] as const;

/** Primary result card ids for the estimated tax calculator */
export const ESTIMATED_PRIMARY_RESULT_IDS = [
  'annual-federal-tax',
  'remaining-tax',
  'quarterly-payment',
  'monthly-reserve',
] as const;

/** Primary result card ids for the W-2 vs 1099 calculator */
export const W2_VS_1099_PRIMARY_RESULT_IDS = [
  'better-option',
  'w2-total-value',
  'contractor-total-value',
  'difference',
] as const;

const W2_VS_1099_BREAKDOWN_RESULT_IDS = [
  'w2-after-tax',
  'contractor-after-tax',
  'break-even-gross',
  'break-even-hourly',
  'employee-fica',
  'self-employment-tax',
  'annual-benefits',
  'contractor-extra-costs',
] as const;

export const ESTIMATED_PRIMARY_LABEL_OVERRIDES: Record<string, string> = {
  'quarterly-payment': 'Estimated remaining quarterly payment',
};

export const PAYMENT_PLANNING_PRIMARY_LABEL_OVERRIDES: Record<string, string> = {
  'quarterly-payment': 'Estimated quarterly payment',
};

export const W2_VS_1099_PRIMARY_LABEL_OVERRIDES: Record<string, string> = {
  'better-option': 'Higher modeled total value',
  'w2-total-value': 'Estimated W-2 Total Value',
  'contractor-total-value': 'Estimated 1099 Total Value',
  difference: 'Difference',
};

/** Primary result card ids for the S Corp tax calculator */
export const S_CORP_PRIMARY_RESULT_IDS = [
  'scorp-net-value',
  'savings-vs-sole-prop',
  'total-federal-tax-burden',
  'break-even-profit',
] as const;

const S_CORP_BREAKDOWN_RESULT_IDS = [
  'business-profit',
  'owner-salary',
  'distribution',
  'employee-fica',
  'employer-fica',
  'federal-income-tax',
  'sole-prop-tax-burden',
  'compliance-costs',
] as const;

/** Primary result card ids for the LLC vs S Corp calculator */
export const LLC_VS_SCORP_PRIMARY_RESULT_IDS = [
  'llc-after-tax-value',
  'scorp-after-tax-value',
  'after-tax-value-difference',
  'break-even-profit',
] as const;

export const LLC_VS_SCORP_PRIMARY_LABEL_OVERRIDES: Record<string, string> = {
  'llc-after-tax-value': 'LLC Estimated After-Tax Value',
  'scorp-after-tax-value': 'S Corp Estimated After-Tax Value',
  'after-tax-value-difference': 'Estimated Difference',
};

const LLC_VS_SCORP_BREAKDOWN_RESULT_IDS = [
  'llc-federal-tax-burden',
  'scorp-federal-tax-burden',
  'scorp-distribution',
  'user-entered-salary',
  'scorp-compliance-costs',
  'employee-fica',
  'employer-fica',
] as const;

/** Primary result card ids for the HSA tax calculator */
export const HSA_PRIMARY_RESULT_IDS = [
  'total-tax-savings',
  'federal-income-tax-savings',
  'payroll-tax-savings',
  'net-after-tax-cost',
] as const;

const HSA_BREAKDOWN_RESULT_IDS = [
  'contribution-limit',
  'employer-contribution',
  'user-contribution',
  'remaining-room',
  'excess-contribution',
  'marginal-rate',
] as const;

const QUARTERLY_BREAKDOWN_RESULT_IDS = [
  'q1-due-date',
  'q2-due-date',
  'q3-due-date',
  'q4-due-date',
  'safe-harbor-target',
  'safe-harbor-rule',
  'payments-made',
  'federal-income-tax',
  'self-employment-tax',
] as const;

const ESTIMATED_BREAKDOWN_RESULT_IDS = [
  'federal-withholding',
  'payments-made',
  'safe-harbor-target',
  'safe-harbor-rule',
  'q1-due-date',
  'q2-due-date',
  'q3-due-date',
  'q4-due-date',
  'federal-income-tax',
  'self-employment-tax',
] as const;

const SAFE_HARBOR_RULE_LABELS: Record<string, string> = {
  current_year_90: '90% of current-year estimated tax',
  prior_year_100: '100% of prior-year tax',
  prior_year_110: '110% of prior-year tax (high AGI)',
  none: 'None',
};

const QUARTERLY_DUE_DATE_IDS = new Set([
  'q1-due-date',
  'q2-due-date',
  'q3-due-date',
  'q4-due-date',
]);

function formatIsoDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function partitionResultCards(
  cards: ResultCard[],
  primaryIds: readonly string[],
): { primary: ResultCard[]; breakdown: ResultCard[] } {
  const primarySet = new Set<string>(primaryIds);
  const primary = primaryIds
    .map((id) => cards.find((card) => card.id === id))
    .filter((card): card is ResultCard => card !== undefined);
  const breakdown = cards.filter((card) => !primarySet.has(card.id));

  return { primary, breakdown };
}

export function buildQuarterlyBreakdownCards(
  summary: ResultCard[],
  details: QuarterlyTaxDetails,
): ResultCard[] {
  const supplemental: ResultCard[] = [
    {
      id: 'federal-income-tax',
      label: 'Federal Income Tax',
      value: details.selfEmployedDetails.federalIncomeTaxCents,
      format: 'currency',
      variant: 'default',
    },
    {
      id: 'self-employment-tax',
      label: 'Self-Employment Tax',
      value: details.selfEmployedDetails.selfEmploymentTaxCents,
      format: 'currency',
      variant: 'default',
    },
  ];

  const byId = new Map(
    [...summary, ...supplemental].map((card) => [card.id, card]),
  );

  return QUARTERLY_BREAKDOWN_RESULT_IDS.map((id) => byId.get(id)).filter(
    (card): card is ResultCard => card !== undefined,
  );
}

export function buildEstimatedBreakdownCards(
  summary: ResultCard[],
  details: EstimatedTaxDetails,
): ResultCard[] {
  const supplemental: ResultCard[] = [
    {
      id: 'federal-income-tax',
      label: 'Federal Income Tax',
      value: details.federalIncomeTaxCents,
      format: 'currency',
      variant: 'default',
    },
    {
      id: 'self-employment-tax',
      label: 'Self-Employment Tax',
      value: details.selfEmploymentTaxCents,
      format: 'currency',
      variant: 'default',
    },
  ];

  const byId = new Map(
    [...summary, ...supplemental].map((card) => [card.id, card]),
  );

  return ESTIMATED_BREAKDOWN_RESULT_IDS.filter(
    (id) => id !== 'self-employment-tax' || details.selfEmploymentTaxCents > 0,
  )
    .map((id) => byId.get(id))
    .filter((card): card is ResultCard => card !== undefined);
}

export function buildW2Vs1099BreakdownCards(summary: ResultCard[]): ResultCard[] {
  const byId = new Map(summary.map((card) => [card.id, card]));

  return W2_VS_1099_BREAKDOWN_RESULT_IDS.map((id) => byId.get(id)).filter(
    (card): card is ResultCard => card !== undefined,
  );
}

export function buildSCorpBreakdownCards(summary: ResultCard[]): ResultCard[] {
  const byId = new Map(summary.map((card) => [card.id, card]));

  return S_CORP_BREAKDOWN_RESULT_IDS.map((id) => byId.get(id)).filter(
    (card): card is ResultCard => card !== undefined,
  );
}

export function buildLlcVsScorpPrimaryCards(
  summary: ResultCard[],
  details: LlcVsSCorpDetails,
): ResultCard[] {
  const supplemental: ResultCard = {
    id: 'after-tax-value-difference',
    label: 'Estimated Difference',
    value: details.llcAfterTaxValueCents - details.sCorpAfterTaxValueCents,
    format: 'currency',
    variant: 'highlight',
  };

  const byId = new Map(
    [...summary, supplemental].map((card) => [card.id, card]),
  );

  return LLC_VS_SCORP_PRIMARY_RESULT_IDS.map((id) => byId.get(id)).filter(
    (card): card is ResultCard => card !== undefined,
  );
}

export function buildLlcVsScorpBreakdownCards(
  summary: ResultCard[],
  details: LlcVsSCorpDetails,
): ResultCard[] {
  const supplemental: ResultCard[] = [
    {
      id: 'employee-fica',
      label: 'Employee FICA',
      value: details.sCorpEmployeeFicaCents,
      format: 'currency',
      variant: 'default',
    },
    {
      id: 'employer-fica',
      label: 'Employer FICA',
      value: details.sCorpEmployerFicaCents,
      format: 'currency',
      variant: 'informational',
    },
  ];

  const byId = new Map(
    [...summary, ...supplemental].map((card) => [card.id, card]),
  );

  return LLC_VS_SCORP_BREAKDOWN_RESULT_IDS.map((id) => byId.get(id)).filter(
    (card): card is ResultCard => card !== undefined,
  );
}

export function buildHsaPrimaryCards(
  summary: ResultCard[],
  details: HsaTaxDetails,
): ResultCard[] {
  const supplemental: ResultCard[] = [];

  if (!summary.some((card) => card.id === 'payroll-tax-savings')) {
    supplemental.push({
      id: 'payroll-tax-savings',
      label: 'Estimated Payroll Tax Savings',
      value: details.payrollTaxSavingsCents,
      format: 'currency',
      variant: 'savings',
    });
  }

  const byId = new Map(
    [...summary, ...supplemental].map((card) => [card.id, card]),
  );

  return HSA_PRIMARY_RESULT_IDS.map((id) => byId.get(id)).filter(
    (card): card is ResultCard => card !== undefined,
  );
}

export function buildHsaBreakdownCards(summary: ResultCard[]): ResultCard[] {
  const byId = new Map(summary.map((card) => [card.id, card]));

  return HSA_BREAKDOWN_RESULT_IDS.map((id) => byId.get(id)).filter(
    (card): card is ResultCard => card !== undefined,
  );
}

export function applyPrimaryLabelOverrides(
  cards: ResultCard[],
  overrides: Record<string, string>,
): ResultCard[] {
  return cards.map((card) =>
    overrides[card.id] ? { ...card, label: overrides[card.id]! } : card,
  );
}

export function formatResultCardValue(card: ResultCard): string {
  if (card.id === 'safe-harbor-rule' && card.format === 'text') {
    const key = String(card.value);
    return SAFE_HARBOR_RULE_LABELS[key] ?? key;
  }
  if (QUARTERLY_DUE_DATE_IDS.has(card.id) && card.format === 'text') {
    return formatIsoDate(String(card.value));
  }
  if (card.format === 'text') {
    return String(card.value);
  }
  if (card.format === 'percent') {
    return percentFromRatio(Number(card.value));
  }
  return formatCurrency(Number(card.value));
}

export function isHeroPrimaryCard(cardId: string): boolean {
  return (
    cardId === 'total-federal-tax' ||
    cardId === 'annual-federal-tax' ||
    cardId === 'total-federal-tax-burden' ||
    cardId === 'total-tax-savings'
  );
}

export function isComparisonHighlightCard(cardId: string): boolean {
  return cardId === 'better-option';
}

export function isSavingsPrimaryCard(cardId: string): boolean {
  return (
    cardId === 'after-tax-income' ||
    cardId === 'w2-total-value' ||
    cardId === 'contractor-total-value' ||
    cardId === 'scorp-net-value' ||
    cardId === 'federal-income-tax-savings' ||
    cardId === 'payroll-tax-savings'
  );
}
