import { requireTaxYearConfig } from '../config';
import type { FilingStatus, MoneyCents, TaxWarning, TaxYearConfig } from '../types';

export type SafeHarborRule =
  | 'current_year_90'
  | 'prior_year_100'
  | 'prior_year_110'
  | 'none';

export interface SafeHarborInput {
  currentYearEstimatedTaxCents: MoneyCents;
  priorYearTaxCents?: MoneyCents;
  priorYearAdjustedGrossIncomeCents?: MoneyCents;
  filingStatus: FilingStatus;
  taxYear: number;
}

export interface SafeHarborResult {
  currentYear90PercentTargetCents: MoneyCents;
  priorYear100PercentTargetCents?: MoneyCents;
  priorYear110PercentTargetCents?: MoneyCents;
  recommendedSafeHarborTargetCents: MoneyCents;
  safeHarborRuleUsed: SafeHarborRule;
  quarterlyDueDates: [string, string, string, string];
  warnings: TaxWarning[];
}

export function calculateSafeHarborTargets(
  input: SafeHarborInput,
): SafeHarborResult {
  const config = requireTaxYearConfig(input.taxYear);
  return computeSafeHarborTargets(input, config);
}

export function computeSafeHarborTargets(
  input: SafeHarborInput,
  config: TaxYearConfig,
): SafeHarborResult {
  const warnings: TaxWarning[] = [];
  const currentYear90 = multiplyRate(
    input.currentYearEstimatedTaxCents,
    config.estimatedTax.safeHarborCurrentYearRate,
  );

  const priorYearTax = input.priorYearTaxCents;
  const priorYearAgi = input.priorYearAdjustedGrossIncomeCents;

  if (priorYearTax === undefined || priorYearAgi === undefined) {
    warnings.push({
      code: 'SAFE_HARBOR_PRIOR_YEAR_INCOMPLETE',
      message:
        'Prior-year tax or AGI not provided. Safe harbor uses 90% of current-year estimated tax only.',
    });

    return {
      currentYear90PercentTargetCents: currentYear90,
      recommendedSafeHarborTargetCents: currentYear90,
      safeHarborRuleUsed: 'current_year_90',
      quarterlyDueDates: config.estimatedTax.quarterlyDueDates,
      warnings,
    };
  }

  const agiThreshold =
    input.filingStatus === 'married_filing_separately'
      ? config.estimatedTax.safeHarborHighAGIThresholdMFS
      : config.estimatedTax.safeHarborHighAGIThreshold;

  const use110 = priorYearAgi > agiThreshold;
  const priorRate = use110
    ? config.estimatedTax.safeHarborPriorYearHighAGIRate
    : config.estimatedTax.safeHarborPriorYearRate;

  const priorYear100 = multiplyRate(
    priorYearTax,
    config.estimatedTax.safeHarborPriorYearRate,
  );
  const priorYear110 = multiplyRate(
    priorYearTax,
    config.estimatedTax.safeHarborPriorYearHighAGIRate,
  );
  const priorHarbor = multiplyRate(priorYearTax, priorRate);

  let recommended = currentYear90;
  let rule: SafeHarborRule = 'current_year_90';

  if (priorHarbor <= currentYear90) {
    recommended = priorHarbor;
    rule = use110 ? 'prior_year_110' : 'prior_year_100';
  }

  return {
    currentYear90PercentTargetCents: currentYear90,
    priorYear100PercentTargetCents: priorYear100,
    priorYear110PercentTargetCents: priorYear110,
    recommendedSafeHarborTargetCents: recommended,
    safeHarborRuleUsed: rule,
    quarterlyDueDates: config.estimatedTax.quarterlyDueDates,
    warnings,
  };
}

export function calculateRemainingEstimatedTax(
  totalEstimatedTaxCents: MoneyCents,
  estimatedPaymentsMadeCents = 0,
): MoneyCents {
  return Math.max(0, totalEstimatedTaxCents - Math.max(0, estimatedPaymentsMadeCents));
}

export function calculateQuarterlyPayments(
  totalEstimatedTaxCents: MoneyCents,
  estimatedPaymentsMadeCents = 0,
): [MoneyCents, MoneyCents, MoneyCents, MoneyCents] {
  const remaining = calculateRemainingEstimatedTax(
    totalEstimatedTaxCents,
    estimatedPaymentsMadeCents,
  );

  const base = Math.floor(remaining / 4);
  const remainder = remaining - base * 4;
  return [base + remainder, base, base, base];
}

export function calculateMonthlyReserve(
  totalEstimatedTaxCents: MoneyCents,
): MoneyCents {
  return Math.floor(totalEstimatedTaxCents / 12);
}

function multiplyRate(cents: MoneyCents, rate: number): MoneyCents {
  return Math.round(cents * rate);
}
