import { requireTaxYearConfig } from '../config';
import { calculateAnnualFederalLiability } from '../core/annual-federal-liability';
import {
  BASE_CALCULATOR_WARNINGS,
  ENGINE_VERSION,
  PENALTY_EXCLUDED_WARNING,
} from '../core/calculator-shared';
import {
  calculateMonthlyReserve,
  calculateQuarterlyPayments,
  calculateSafeHarborTargets,
} from '../core/estimated-tax';
import { calculateSelfEmployedTax } from './self-employed-tax';
import type {
  CalculatorResult,
  EstimatedTaxDetails,
  EstimatedTaxInput,
  TaxDisclaimer,
  TaxWarning,
} from '../types';

const DISCLAIMER: TaxDisclaimer = {
  key: 'estimated-tax',
  text: 'Estimate only — not tax advice. This worksheet simplifies IRS estimated tax rules and may not include all factors affecting your required payments. Safe harbor calculations require accurate prior-year tax information. Underpayment penalties are not computed.',
};

export function calculateEstimatedTax(
  input: EstimatedTaxInput,
): CalculatorResult<EstimatedTaxDetails> {
  if (input.incomeType === 'self_employed') {
    return calculateSelfEmployedEstimatedTax(input);
  }

  return calculateMixedEstimatedTax(input);
}

function calculateSelfEmployedEstimatedTax(
  input: EstimatedTaxInput,
): CalculatorResult<EstimatedTaxDetails> {
  const base = calculateSelfEmployedTax({
    taxYear: input.taxYear,
    filingStatus: input.filingStatus,
    netSelfEmploymentIncomeCents: input.netSelfEmploymentIncomeCents ?? 0,
    otherIncomeCents: input.otherIncomeCents,
    estimatedPaymentsMadeCents: input.estimatedPaymentsMadeCents,
  });

  const safeHarbor = calculateSafeHarborTargets({
    currentYearEstimatedTaxCents: base.details.totalEstimatedFederalTaxCents,
    priorYearTaxCents: input.priorYearTaxCents,
    priorYearAdjustedGrossIncomeCents: input.priorYearAdjustedGrossIncomeCents,
    filingStatus: input.filingStatus,
    taxYear: input.taxYear,
  });

  const federalWithholding = Math.max(0, input.federalWithholdingCents ?? 0);
  const estimatedPayments = Math.max(0, input.estimatedPaymentsMadeCents ?? 0);
  const totalOffsets = federalWithholding + estimatedPayments;
  const remainingTax = Math.max(
    0,
    base.details.totalEstimatedFederalTaxCents - totalOffsets,
  );
  const [recommendedRemainingQuarterly] = calculateQuarterlyPayments(
    remainingTax,
    0,
  );

  const details: EstimatedTaxDetails = {
    estimatedAnnualFederalTaxCents: base.details.totalEstimatedFederalTaxCents,
    federalWithholdingCents: federalWithholding,
    estimatedPaymentsMadeCents: estimatedPayments,
    remainingTaxCents: remainingTax,
    recommendedRemainingQuarterlyPaymentCents: recommendedRemainingQuarterly,
    monthlyTaxReserveCents: base.details.monthlyTaxReserveCents,
    safeHarborTargetCents: safeHarbor.recommendedSafeHarborTargetCents,
    safeHarborRuleUsed: safeHarbor.safeHarborRuleUsed,
    quarterlyDueDates: safeHarbor.quarterlyDueDates,
    selfEmploymentTaxCents: base.details.selfEmploymentTaxCents,
    federalIncomeTaxCents: base.details.federalIncomeTaxCents,
    adjustedGrossIncomeCents: base.details.adjustedGrossIncomeCents,
  };

  const warnings: TaxWarning[] = [
    ...BASE_CALCULATOR_WARNINGS,
    PENALTY_EXCLUDED_WARNING,
    ...safeHarbor.warnings,
    ...base.warnings.filter(
      (w) => !BASE_CALCULATOR_WARNINGS.some((b) => b.code === w.code),
    ),
  ];

  return buildEstimatedTaxResult(input, details, warnings);
}

function calculateMixedEstimatedTax(
  input: EstimatedTaxInput,
): CalculatorResult<EstimatedTaxDetails> {
  const config = requireTaxYearConfig(input.taxYear);
  const w2Wages = Math.max(0, input.w2WagesCents ?? 0);
  const otherIncome = Math.max(0, input.otherIncomeCents ?? 0);
  const netSe = Math.max(0, input.netSelfEmploymentIncomeCents ?? 0);
  const federalWithholding = Math.max(0, input.federalWithholdingCents ?? 0);
  const estimatedPayments = Math.max(0, input.estimatedPaymentsMadeCents ?? 0);

  const liability = calculateAnnualFederalLiability(
    {
      filingStatus: input.filingStatus,
      netSelfEmploymentIncomeCents: netSe,
      otherIncomeCents: otherIncome,
      w2WagesSubjectToSocialSecurityCents: w2Wages,
    },
    config,
  );

  const safeHarbor = calculateSafeHarborTargets({
    currentYearEstimatedTaxCents: liability.totalEstimatedFederalTaxCents,
    priorYearTaxCents: input.priorYearTaxCents,
    priorYearAdjustedGrossIncomeCents: input.priorYearAdjustedGrossIncomeCents,
    filingStatus: input.filingStatus,
    taxYear: input.taxYear,
  });

  const totalOffsets = federalWithholding + estimatedPayments;
  const remainingTax = Math.max(
    0,
    liability.totalEstimatedFederalTaxCents - totalOffsets,
  );
  const [recommendedRemainingQuarterly] = calculateQuarterlyPayments(
    remainingTax,
    0,
  );
  const monthlyReserve = calculateMonthlyReserve(
    liability.totalEstimatedFederalTaxCents,
  );

  const warnings: TaxWarning[] = [
    ...BASE_CALCULATOR_WARNINGS,
    PENALTY_EXCLUDED_WARNING,
    {
      code: 'WITHHOLDING_SIMPLIFIED',
      message:
        'Federal withholding is subtracted as a flat annual estimate. Actual paycheck withholding may differ.',
    },
    ...liability.warnings,
    ...safeHarbor.warnings,
  ];

  const details: EstimatedTaxDetails = {
    estimatedAnnualFederalTaxCents: liability.totalEstimatedFederalTaxCents,
    federalWithholdingCents: federalWithholding,
    estimatedPaymentsMadeCents: estimatedPayments,
    remainingTaxCents: remainingTax,
    recommendedRemainingQuarterlyPaymentCents: recommendedRemainingQuarterly,
    monthlyTaxReserveCents: monthlyReserve,
    safeHarborTargetCents: safeHarbor.recommendedSafeHarborTargetCents,
    safeHarborRuleUsed: safeHarbor.safeHarborRuleUsed,
    quarterlyDueDates: safeHarbor.quarterlyDueDates,
    selfEmploymentTaxCents: liability.selfEmploymentTaxCents,
    federalIncomeTaxCents: liability.federalIncomeTaxCents,
    adjustedGrossIncomeCents: liability.adjustedGrossIncomeCents,
  };

  return buildEstimatedTaxResult(input, details, warnings);
}

function buildEstimatedTaxResult(
  input: EstimatedTaxInput,
  details: EstimatedTaxDetails,
  warnings: TaxWarning[],
): CalculatorResult<EstimatedTaxDetails> {
  const config = requireTaxYearConfig(input.taxYear);
  const [q1, q2, q3, q4] = details.quarterlyDueDates;

  return {
    calculatorId: 'estimated-tax',
    taxYear: input.taxYear,
    computedAt: new Date().toISOString(),
    disclaimer: DISCLAIMER,
    summary: [
      {
        id: 'annual-federal-tax',
        label: 'Estimated Annual Federal Tax',
        value: details.estimatedAnnualFederalTaxCents,
        format: 'currency',
        variant: 'liability',
      },
      {
        id: 'federal-withholding',
        label: 'Federal Withholding',
        value: details.federalWithholdingCents,
        format: 'currency',
        variant: 'default',
      },
      {
        id: 'payments-made',
        label: 'Estimated Payments Already Made',
        value: details.estimatedPaymentsMadeCents,
        format: 'currency',
        variant: 'default',
      },
      {
        id: 'remaining-tax',
        label: 'Remaining Tax',
        value: details.remainingTaxCents,
        format: 'currency',
        variant: 'liability',
      },
      {
        id: 'quarterly-payment',
        label: 'Recommended Remaining Quarterly Payment',
        value: details.recommendedRemainingQuarterlyPaymentCents,
        format: 'currency',
        variant: 'highlight',
      },
      {
        id: 'monthly-reserve',
        label: 'Monthly Tax Reserve',
        value: details.monthlyTaxReserveCents,
        format: 'currency',
        variant: 'default',
      },
      {
        id: 'safe-harbor-target',
        label: 'Safe Harbor Target',
        value: details.safeHarborTargetCents,
        format: 'currency',
        variant: 'informational',
      },
      {
        id: 'safe-harbor-rule',
        label: 'Safe Harbor Rule Used',
        value: details.safeHarborRuleUsed,
        format: 'text',
        variant: 'informational',
      },
      {
        id: 'q1-due-date',
        label: 'Q1 Due Date',
        value: q1,
        format: 'text',
        variant: 'informational',
      },
      {
        id: 'q2-due-date',
        label: 'Q2 Due Date',
        value: q2,
        format: 'text',
        variant: 'informational',
      },
      {
        id: 'q3-due-date',
        label: 'Q3 Due Date',
        value: q3,
        format: 'text',
        variant: 'informational',
      },
      {
        id: 'q4-due-date',
        label: 'Q4 Due Date',
        value: q4,
        format: 'text',
        variant: 'informational',
      },
    ],
    details,
    breakdown: [
      {
        id: 'agi',
        label: 'Adjusted gross income',
        amount: details.adjustedGrossIncomeCents,
        category: 'income',
      },
      {
        id: 'se-tax',
        label: 'Self-employment tax',
        amount: details.selfEmploymentTaxCents,
        category: 'tax',
      },
      {
        id: 'income-tax',
        label: 'Federal income tax',
        amount: details.federalIncomeTaxCents,
        category: 'tax',
      },
      {
        id: 'withholding',
        label: 'Federal withholding applied',
        amount: details.federalWithholdingCents,
        category: 'informational',
      },
    ],
    warnings: dedupeWarnings(warnings),
    metadata: {
      engineVersion: ENGINE_VERSION,
      configVerified: config.verifiedAt.length > 0,
    },
  };
}

function dedupeWarnings(warnings: TaxWarning[]): TaxWarning[] {
  const seen = new Set<string>();
  return warnings.filter((w) => {
    if (seen.has(w.code)) return false;
    seen.add(w.code);
    return true;
  });
}
