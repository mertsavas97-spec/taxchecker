import { requireTaxYearConfig } from '../config';
import { calculateAnnualFederalLiability } from '../core/annual-federal-liability';
import {
  BASE_CALCULATOR_WARNINGS,
  ENGINE_VERSION,
} from '../core/calculator-shared';
import {
  calculateMonthlyReserve,
  calculateQuarterlyPayments,
  calculateRemainingEstimatedTax,
} from '../core/estimated-tax';
import { roundCents } from '../core/rounding';
import type {
  CalculatorResult,
  SelfEmployedTaxDetails,
  SelfEmployedTaxInput,
  TaxDisclaimer,
  TaxWarning,
} from '../types';

export { ENGINE_VERSION };

const DISCLAIMER: TaxDisclaimer = {
  key: 'self-employed-tax',
  text: 'Estimate only — not tax advice. This calculator provides a simplified federal tax estimate based on the inputs you supply and IRS-published rules for the selected tax year. It is not a substitute for professional tax advice, does not prepare or file tax returns, and may not reflect your actual tax liability.',
};

export function calculateSelfEmployedTax(
  input: SelfEmployedTaxInput,
): CalculatorResult<SelfEmployedTaxDetails> {
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

  const grossIncome =
    liability.netSelfEmploymentIncomeCents + liability.otherIncomeCents;
  const [quarterlyPayment] = calculateQuarterlyPayments(
    liability.totalEstimatedFederalTaxCents,
    estimatedPayments,
  );
  const monthlyTaxReserve = calculateMonthlyReserve(
    liability.totalEstimatedFederalTaxCents,
  );
  const remainingTaxOwed = calculateRemainingEstimatedTax(
    liability.totalEstimatedFederalTaxCents,
    estimatedPayments,
  );

  const warnings: TaxWarning[] = [
    ...BASE_CALCULATOR_WARNINGS,
    ...liability.warnings,
  ];

  if (liability.seResult.additionalMedicareTax > 0) {
    warnings.push({
      code: 'ADDITIONAL_MEDICARE_REVIEW',
      message:
        'Additional Medicare Tax applied. High-income W-2 and SE combinations may require Form 8959 review.',
    });
  }

  const details: SelfEmployedTaxDetails = {
    netSelfEmploymentIncomeCents: liability.netSelfEmploymentIncomeCents,
    netEarningsSubjectToSeTaxCents: liability.seResult.netEarnings,
    selfEmploymentTaxCents: liability.selfEmploymentTaxCents,
    deductibleSeTaxCents: liability.deductibleSeTaxCents,
    adjustedGrossIncomeCents: liability.adjustedGrossIncomeCents,
    federalTaxableIncomeCents: liability.federalTaxableIncomeCents,
    federalIncomeTaxCents: liability.federalIncomeTaxCents,
    totalEstimatedFederalTaxCents: liability.totalEstimatedFederalTaxCents,
    effectiveTaxRate: liability.effectiveTaxRate,
    marginalTaxRate: liability.marginalTaxRate,
    quarterlyEstimatedPaymentCents: quarterlyPayment,
    monthlyTaxReserveCents: monthlyTaxReserve,
    estimatedAfterTaxIncomeCents: roundCents(
      grossIncome - liability.totalEstimatedFederalTaxCents,
    ),
    estimatedPaymentsMadeCents: estimatedPayments,
    remainingTaxOwedCents: remainingTaxOwed,
  };

  return {
    calculatorId: 'self-employed-tax',
    taxYear: input.taxYear,
    computedAt: new Date().toISOString(),
    disclaimer: DISCLAIMER,
    summary: buildResultCards(details),
    details,
    breakdown: buildBreakdown(details, liability.seResult),
    warnings,
    metadata: {
      engineVersion: ENGINE_VERSION,
      configVerified: config.verifiedAt.length > 0,
    },
  };
}

function buildResultCards(details: SelfEmployedTaxDetails) {
  return [
    {
      id: 'net-self-employment-income',
      label: 'Net Self-Employment Income',
      value: details.netSelfEmploymentIncomeCents,
      format: 'currency' as const,
      variant: 'default' as const,
    },
    {
      id: 'net-earnings-se-tax',
      label: 'Net Earnings Subject to SE Tax',
      value: details.netEarningsSubjectToSeTaxCents,
      format: 'currency' as const,
      variant: 'informational' as const,
    },
    {
      id: 'self-employment-tax',
      label: 'Self-Employment Tax',
      value: details.selfEmploymentTaxCents,
      format: 'currency' as const,
      variant: 'default' as const,
    },
    {
      id: 'deductible-se-tax',
      label: 'Deductible Portion of SE Tax',
      value: details.deductibleSeTaxCents,
      format: 'currency' as const,
      variant: 'informational' as const,
    },
    {
      id: 'federal-taxable-income',
      label: 'Federal Taxable Income',
      value: details.federalTaxableIncomeCents,
      format: 'currency' as const,
      variant: 'default' as const,
    },
    {
      id: 'federal-income-tax',
      label: 'Federal Income Tax',
      value: details.federalIncomeTaxCents,
      format: 'currency' as const,
      variant: 'default' as const,
    },
    {
      id: 'total-federal-tax',
      label: 'Total Estimated Federal Tax',
      value: details.totalEstimatedFederalTaxCents,
      format: 'currency' as const,
      variant: 'liability' as const,
    },
    {
      id: 'effective-rate',
      label: 'Effective Tax Rate',
      value: details.effectiveTaxRate,
      format: 'percent' as const,
      variant: 'default' as const,
    },
    {
      id: 'marginal-rate',
      label: 'Marginal Tax Rate',
      value: details.marginalTaxRate,
      format: 'percent' as const,
      variant: 'default' as const,
    },
    {
      id: 'quarterly-payment',
      label: 'Quarterly Estimated Payment',
      value: details.quarterlyEstimatedPaymentCents,
      format: 'currency' as const,
      variant: 'highlight' as const,
    },
    {
      id: 'monthly-reserve',
      label: 'Monthly Tax Reserve',
      value: details.monthlyTaxReserveCents,
      format: 'currency' as const,
      variant: 'default' as const,
    },
    {
      id: 'after-tax-income',
      label: 'Estimated After-Tax Income',
      value: details.estimatedAfterTaxIncomeCents,
      format: 'currency' as const,
      variant: 'savings' as const,
    },
  ];
}

function buildBreakdown(
  details: SelfEmployedTaxDetails,
  seResult: ReturnType<typeof calculateAnnualFederalLiability>['seResult'],
) {
  return [
    {
      id: 'net-se-income',
      label: 'Net self-employment income',
      amount: details.netSelfEmploymentIncomeCents,
      category: 'income' as const,
    },
    {
      id: 'deductible-se',
      label: 'Deductible SE tax (50%)',
      amount: details.deductibleSeTaxCents,
      category: 'deduction' as const,
      indent: 1,
    },
    {
      id: 'se-tax',
      label: 'Self-employment tax',
      amount: details.selfEmploymentTaxCents,
      category: 'tax' as const,
    },
    {
      id: 'se-ss',
      label: 'Social Security portion',
      amount: seResult.socialSecurityTax,
      category: 'tax' as const,
      indent: 1,
    },
    {
      id: 'se-medicare',
      label: 'Medicare portion',
      amount: seResult.medicareTax,
      category: 'tax' as const,
      indent: 1,
    },
    ...(seResult.additionalMedicareTax > 0
      ? [
          {
            id: 'se-additional-medicare',
            label: 'Additional Medicare Tax',
            amount: seResult.additionalMedicareTax,
            category: 'tax' as const,
            indent: 1,
          },
        ]
      : []),
    {
      id: 'federal-income-tax',
      label: 'Federal income tax',
      amount: details.federalIncomeTaxCents,
      category: 'tax' as const,
    },
  ];
}
