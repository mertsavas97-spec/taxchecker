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
  calculateRemainingEstimatedTax,
  calculateSafeHarborTargets,
} from '../core/estimated-tax';
import type {
  CalculatorResult,
  QuarterlyTaxDetails,
  QuarterlyTaxInput,
  TaxDisclaimer,
  TaxWarning,
} from '../types';

const DISCLAIMER: TaxDisclaimer = {
  key: 'quarterly-tax',
  text: 'Estimate only — not tax advice. Quarterly payment amounts are estimates based on annualized income you provide. Actual required payments may differ if your income varies or you qualify for different safe harbor rules. Missing estimated tax payments may result in IRS penalties.',
};

export function calculateQuarterlyTax(
  input: QuarterlyTaxInput,
): CalculatorResult<QuarterlyTaxDetails> {
  const config = requireTaxYearConfig(input.taxYear);
  const estimatedPayments = Math.max(0, input.estimatedPaymentsMadeCents ?? 0);

  const liability = calculateAnnualFederalLiability(
    {
      filingStatus: input.filingStatus,
      netSelfEmploymentIncomeCents: input.netSelfEmploymentIncomeCents,
      otherIncomeCents: input.otherIncomeCents,
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

  const remainingEstimatedTax = calculateRemainingEstimatedTax(
    liability.totalEstimatedFederalTaxCents,
    estimatedPayments,
  );
  const [recommendedQuarterlyPayment] = calculateQuarterlyPayments(
    liability.totalEstimatedFederalTaxCents,
    estimatedPayments,
  );
  const monthlyReserve = calculateMonthlyReserve(
    liability.totalEstimatedFederalTaxCents,
  );

  const [q1, q2, q3, q4] = safeHarbor.quarterlyDueDates;

  const warnings: TaxWarning[] = [
    ...BASE_CALCULATOR_WARNINGS,
    PENALTY_EXCLUDED_WARNING,
    ...liability.warnings,
    ...safeHarbor.warnings,
  ];

  const details: QuarterlyTaxDetails = {
    totalEstimatedFederalTaxCents: liability.totalEstimatedFederalTaxCents,
    estimatedPaymentsMadeCents: estimatedPayments,
    remainingEstimatedTaxCents: remainingEstimatedTax,
    recommendedQuarterlyPaymentCents: recommendedQuarterlyPayment,
    monthlyTaxReserveCents: monthlyReserve,
    safeHarborTargetCents: safeHarbor.recommendedSafeHarborTargetCents,
    safeHarborRuleUsed: safeHarbor.safeHarborRuleUsed,
    quarterlyDueDates: safeHarbor.quarterlyDueDates,
    selfEmployedDetails: {
      netSelfEmploymentIncomeCents: liability.netSelfEmploymentIncomeCents,
      selfEmploymentTaxCents: liability.selfEmploymentTaxCents,
      federalIncomeTaxCents: liability.federalIncomeTaxCents,
      adjustedGrossIncomeCents: liability.adjustedGrossIncomeCents,
    },
  };

  return {
    calculatorId: 'quarterly-tax',
    taxYear: input.taxYear,
    computedAt: new Date().toISOString(),
    disclaimer: DISCLAIMER,
    summary: [
      {
        id: 'total-federal-tax',
        label: 'Total Estimated Federal Tax',
        value: details.totalEstimatedFederalTaxCents,
        format: 'currency',
        variant: 'liability',
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
        label: 'Remaining Estimated Tax',
        value: details.remainingEstimatedTaxCents,
        format: 'currency',
        variant: 'liability',
      },
      {
        id: 'quarterly-payment',
        label: 'Recommended Quarterly Payment',
        value: details.recommendedQuarterlyPaymentCents,
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
        id: 'annual-tax',
        label: 'Estimated annual federal tax',
        amount: details.totalEstimatedFederalTaxCents,
        category: 'tax',
      },
      {
        id: 'se-tax',
        label: 'Self-employment tax',
        amount: liability.selfEmploymentTaxCents,
        category: 'tax',
        indent: 1,
      },
      {
        id: 'income-tax',
        label: 'Federal income tax',
        amount: liability.federalIncomeTaxCents,
        category: 'tax',
        indent: 1,
      },
      {
        id: 'safe-harbor',
        label: 'Safe harbor target',
        amount: details.safeHarborTargetCents,
        category: 'informational',
      },
    ],
    warnings,
    metadata: {
      engineVersion: ENGINE_VERSION,
      configVerified: config.verifiedAt.length > 0,
    },
  };
}
