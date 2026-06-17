import { requireTaxYearConfig } from '../config';
import {
  BASE_CALCULATOR_WARNINGS,
  ENGINE_VERSION,
} from '../core/calculator-shared';
import { calculateHsaTaxSavings } from '../core/hsa';
import { percentFromRatio } from '../core/rounding';
import type {
  CalculatorResult,
  HsaTaxDetails,
  HsaTaxInput,
  TaxDisclaimer,
  TaxWarning,
} from '../types';

const DISCLAIMER: TaxDisclaimer = {
  key: 'hsa-tax',
  text: 'Estimate only — not tax, financial, or benefits advice. You must have a qualifying High Deductible Health Plan to contribute to an HSA. This calculator estimates federal tax savings from your inputs and does not determine HDHP eligibility, investment returns, or Form 8889 filing outcomes. Consult your health plan administrator and tax advisor.',
};

const HSA_WARNINGS: TaxWarning[] = [
  ...BASE_CALCULATOR_WARNINGS,
  {
    code: 'HDHP_ELIGIBILITY_NOT_VERIFIED',
    message:
      'HDHP eligibility is not assessed on this site. You must have qualifying coverage to contribute to an HSA.',
  },
  {
    code: 'PARTIAL_YEAR_SIMPLIFIED',
    message:
      'Partial-year eligibility rules are simplified unless you enter eligible months.',
  },
  {
    code: 'EMPLOYER_REDUCES_ROOM',
    message:
      'Employer HSA contributions reduce your remaining contribution room.',
  },
  {
    code: 'PAYROLL_FICA_ONLY',
    message:
      'Payroll tax savings apply only when contributions are made through payroll deduction.',
  },
  {
    code: 'EXCESS_CONTRIBUTION_PENALTY',
    message:
      'Excess HSA contributions may be subject to additional tax and penalty.',
  },
  {
    code: 'NO_INVESTMENT_GROWTH',
    message:
      'HSA investment growth and earnings are not included in this estimate.',
  },
  {
    code: 'NOT_TAX_OR_BENEFITS_ADVICE',
    message:
      'This calculator does not provide tax, financial, or benefits advice.',
  },
];

export function calculateHsaTax(
  input: HsaTaxInput,
): CalculatorResult<HsaTaxDetails> {
  const config = requireTaxYearConfig(input.taxYear);
  const normalized = normalizeInput(input);

  const savings = calculateHsaTaxSavings(normalized, config);

  const details: HsaTaxDetails = {
    contributionLimitCents: savings.contributionLimitCents,
    employerContributionCents: savings.employerContributionCents,
    userContributionCents: savings.userContributionCents,
    remainingContributionRoomCents: savings.remainingContributionRoomCents,
    excessContributionCents: savings.excessContributionCents,
    marginalFederalTaxRate: savings.marginalFederalTaxRate,
    federalIncomeTaxSavingsCents: savings.federalIncomeTaxSavingsCents,
    payrollTaxSavingsCents: savings.payrollTaxSavingsCents,
    totalTaxSavingsCents: savings.totalTaxSavingsCents,
    netAfterTaxCostCents: savings.netAfterTaxCostCents,
    eligibleContributionCents: savings.eligibleContributionCents,
    catchUpContributionCents: savings.catchUpContributionCents,
    baseLimitCents: savings.baseLimitCents,
  };

  const warnings = dedupeWarnings([...HSA_WARNINGS, ...savings.warnings]);

  return {
    calculatorId: 'hsa-tax',
    taxYear: input.taxYear,
    computedAt: new Date().toISOString(),
    disclaimer: DISCLAIMER,
    summary: buildResultCards(details, normalized.payrollDeductedContribution),
    details,
    breakdown: buildBreakdown(details),
    warnings,
    metadata: {
      engineVersion: ENGINE_VERSION,
      configVerified: config.verifiedAt.length > 0,
    },
  };
}

type NormalizedHsaTaxInput = Required<
  Pick<HsaTaxInput, 'employerContributionCents' | 'payrollDeductedContribution'>
> &
  HsaTaxInput;

function normalizeInput(input: HsaTaxInput): NormalizedHsaTaxInput {
  return {
    ...input,
    annualIncomeCents: Math.max(0, input.annualIncomeCents),
    hsaContributionCents: Math.max(0, input.hsaContributionCents),
    employerContributionCents: Math.max(0, input.employerContributionCents ?? 0),
    payrollDeductedContribution: input.payrollDeductedContribution === true,
    age: Math.max(0, input.age),
  };
}

function buildResultCards(
  details: HsaTaxDetails,
  payrollDeductedContribution: boolean,
) {
  return [
    {
      id: 'contribution-limit',
      label: 'HSA Contribution Limit',
      value: details.contributionLimitCents,
      format: 'currency' as const,
      variant: 'highlight' as const,
    },
    {
      id: 'employer-contribution',
      label: 'Employer Contribution',
      value: details.employerContributionCents,
      format: 'currency' as const,
      variant: 'informational' as const,
    },
    {
      id: 'user-contribution',
      label: 'User Contribution',
      value: details.userContributionCents,
      format: 'currency' as const,
      variant: 'default' as const,
    },
    {
      id: 'remaining-room',
      label: 'Remaining Contribution Room',
      value: details.remainingContributionRoomCents,
      format: 'currency' as const,
      variant: 'default' as const,
    },
    {
      id: 'excess-contribution',
      label: 'Excess Contribution',
      value: details.excessContributionCents,
      format: 'currency' as const,
      variant: details.excessContributionCents > 0 ? ('liability' as const) : ('default' as const),
    },
    {
      id: 'marginal-rate',
      label: 'Marginal Federal Tax Rate Used',
      value: details.marginalFederalTaxRate,
      format: 'percent' as const,
      variant: 'informational' as const,
      tooltip: percentFromRatio(details.marginalFederalTaxRate),
    },
    {
      id: 'federal-income-tax-savings',
      label: 'Estimated Federal Income Tax Savings',
      value: details.federalIncomeTaxSavingsCents,
      format: 'currency' as const,
      variant: 'savings' as const,
    },
    ...(payrollDeductedContribution
      ? [
          {
            id: 'payroll-tax-savings',
            label: 'Estimated Payroll Tax Savings',
            value: details.payrollTaxSavingsCents,
            format: 'currency' as const,
            variant: 'savings' as const,
          },
        ]
      : []),
    {
      id: 'total-tax-savings',
      label: 'Total Estimated Tax Savings',
      value: details.totalTaxSavingsCents,
      format: 'currency' as const,
      variant: 'highlight' as const,
    },
    {
      id: 'net-after-tax-cost',
      label: 'Net After-Tax Cost of Contribution',
      value: details.netAfterTaxCostCents,
      format: 'currency' as const,
      variant: 'default' as const,
    },
  ];
}

function buildBreakdown(details: HsaTaxDetails) {
  return [
    {
      id: 'contribution-limit',
      label: 'Annual HSA contribution limit',
      amount: details.contributionLimitCents,
      category: 'informational' as const,
    },
    {
      id: 'employer-contribution',
      label: 'Employer contribution',
      amount: details.employerContributionCents,
      category: 'informational' as const,
      indent: 1,
    },
    {
      id: 'remaining-room',
      label: 'Remaining contribution room',
      amount: details.remainingContributionRoomCents,
      category: 'informational' as const,
      indent: 1,
    },
    {
      id: 'user-contribution',
      label: 'User contribution',
      amount: details.userContributionCents,
      category: 'contribution' as const,
    },
    {
      id: 'eligible-contribution',
      label: 'Eligible contribution for savings',
      amount: details.eligibleContributionCents,
      category: 'contribution' as const,
      indent: 1,
    },
    {
      id: 'federal-savings',
      label: 'Federal income tax savings',
      amount: details.federalIncomeTaxSavingsCents,
      category: 'deduction' as const,
    },
    {
      id: 'payroll-savings',
      label: 'Payroll tax savings',
      amount: details.payrollTaxSavingsCents,
      category: 'deduction' as const,
    },
    {
      id: 'excess-contribution',
      label: 'Excess contribution',
      amount: details.excessContributionCents,
      category: 'informational' as const,
    },
  ];
}

function dedupeWarnings(warnings: TaxWarning[]): TaxWarning[] {
  const seen = new Set<string>();
  return warnings.filter((warning) => {
    if (seen.has(warning.code)) return false;
    seen.add(warning.code);
    return true;
  });
}
