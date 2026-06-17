import { requireTaxYearConfig } from '../config';
import { calculateAnnualFederalLiability } from '../core/annual-federal-liability';
import {
  BASE_CALCULATOR_WARNINGS,
  ENGINE_VERSION,
} from '../core/calculator-shared';
import { calculateApproximateW2FederalLiability } from '../core/payroll-tax';
import { dollarsToCents } from '../core/rounding';
import type {
  CalculatorResult,
  MoneyCents,
  TaxDisclaimer,
  TaxWarning,
  TaxYearConfig,
  W2Vs1099BetterOption,
  W2Vs1099Details,
  W2Vs1099Input,
} from '../types';

const DISCLAIMER: TaxDisclaimer = {
  key: 'w2-vs-1099',
  text: 'Estimate only — not tax advice, employment advice, legal advice, or financial advice. This comparison uses simplified federal tax assumptions. It does not evaluate employee benefits beyond user-entered values, legal worker classification, state taxes, or full employment protections.',
};

const SIMILAR_THRESHOLD_CENTS = dollarsToCents(500);
const BREAK_EVEN_TOLERANCE_CENTS = dollarsToCents(10);
const BREAK_EVEN_MAX_ITERATIONS = 100;

const W2_VS_1099_WARNINGS: TaxWarning[] = [
  ...BASE_CALCULATOR_WARNINGS,
  {
    code: 'BENEFITS_USER_ENTERED',
    message:
      'Annual benefits value is user-entered and may not reflect your full compensation package.',
  },
  {
    code: 'CONTRACTOR_EXPENSES_USER_ENTERED',
    message:
      'Contractor business expenses and extra costs are user-entered and not validated on this site.',
  },
  {
    code: 'EMPLOYMENT_PROTECTIONS_LIMITED',
    message:
      'Health insurance, retirement match, PTO, unemployment insurance, workers compensation, and other employment protections may not be fully captured.',
  },
  {
    code: 'NOT_LEGAL_OR_EMPLOYMENT_ADVICE',
    message:
      'This calculator does not determine whether you are correctly classified as an employee or independent contractor.',
  },
];

interface ContractorPathResult {
  grossIncomeCents: MoneyCents;
  businessExpensesCents: MoneyCents;
  netIncomeCents: MoneyCents;
  selfEmploymentTaxCents: MoneyCents;
  federalIncomeTaxCents: MoneyCents;
  afterTaxIncomeCents: MoneyCents;
  totalEstimatedValueCents: MoneyCents;
  warnings: TaxWarning[];
}

interface W2PathResult {
  afterTaxIncomeCents: MoneyCents;
  totalEstimatedValueCents: MoneyCents;
  employeeFicaCents: MoneyCents;
  employerFicaCents: MoneyCents;
  federalIncomeTaxCents: MoneyCents;
  federalWithholdingCents: MoneyCents;
  warnings: TaxWarning[];
}

export function calculateW2Vs1099(
  input: W2Vs1099Input,
): CalculatorResult<W2Vs1099Details> {
  const config = requireTaxYearConfig(input.taxYear);
  const normalized = normalizeInput(input);

  const w2Path = computeW2Path(normalized, config);
  const contractorPath = computeContractorPath(
    normalized.contractorGrossIncomeCents,
    normalized,
    config,
  );

  const difference = roundCents(
    w2Path.totalEstimatedValueCents - contractorPath.totalEstimatedValueCents,
  );
  const betterOption = determineBetterOption(difference);

  const breakEven = findBreakEvenContractorGrossIncome(
    w2Path.totalEstimatedValueCents,
    normalized,
    config,
  );

  const warnings: TaxWarning[] = [
    ...W2_VS_1099_WARNINGS,
    ...w2Path.warnings,
    ...contractorPath.warnings,
    ...breakEven.warnings,
  ];

  const details: W2Vs1099Details = {
    betterEstimatedOption: betterOption,
    w2AfterTaxIncomeCents: w2Path.afterTaxIncomeCents,
    contractorAfterTaxIncomeCents: contractorPath.afterTaxIncomeCents,
    differenceCents: difference,
    breakEvenContractorGrossIncomeCents: breakEven.grossIncomeCents,
    breakEvenContractorHourlyRateCents:
      breakEven.grossIncomeCents !== null &&
      normalized.hoursPerYear !== undefined &&
      normalized.hoursPerYear > 0
        ? Math.round(breakEven.grossIncomeCents / normalized.hoursPerYear)
        : null,
    w2TotalEstimatedValueCents: w2Path.totalEstimatedValueCents,
    contractorTotalEstimatedValueCents: contractorPath.totalEstimatedValueCents,
    employeeFicaCents: w2Path.employeeFicaCents,
    selfEmploymentTaxCents: contractorPath.selfEmploymentTaxCents,
    annualBenefitsValueCents: normalized.annualBenefitsValueCents,
    contractorExtraCostsCents: normalized.contractorExtraCostsCents,
    w2FederalIncomeTaxCents: w2Path.federalIncomeTaxCents,
    contractorFederalIncomeTaxCents: contractorPath.federalIncomeTaxCents,
    w2FederalWithholdingCents: w2Path.federalWithholdingCents,
    contractorEstimatedPaymentsCents: normalized.estimatedPaymentsMadeCents,
    w2GrossSalaryCents: normalized.w2SalaryCents,
    contractorGrossIncomeCents: normalized.contractorGrossIncomeCents,
    contractorBusinessExpensesCents: contractorPath.businessExpensesCents,
    contractorNetIncomeCents: contractorPath.netIncomeCents,
    employerFicaCents: w2Path.employerFicaCents,
  };

  return {
    calculatorId: 'w2-vs-1099',
    taxYear: input.taxYear,
    computedAt: new Date().toISOString(),
    disclaimer: DISCLAIMER,
    summary: buildResultCards(details, betterOption),
    details,
    breakdown: buildBreakdown(details),
    warnings: dedupeWarnings(warnings),
    metadata: {
      engineVersion: ENGINE_VERSION,
      configVerified: config.verifiedAt.length > 0,
    },
  };
}

function normalizeInput(input: W2Vs1099Input): Required<
  Pick<
    W2Vs1099Input,
    | 'contractorBusinessExpensesCents'
    | 'w2FederalWithholdingCents'
    | 'estimatedPaymentsMadeCents'
    | 'annualBenefitsValueCents'
    | 'contractorExtraCostsCents'
  >
> &
  W2Vs1099Input {
  return {
    ...input,
    w2SalaryCents: Math.max(0, input.w2SalaryCents),
    contractorGrossIncomeCents: Math.max(0, input.contractorGrossIncomeCents),
    contractorBusinessExpensesCents: Math.max(
      0,
      input.contractorBusinessExpensesCents ?? 0,
    ),
    w2FederalWithholdingCents: Math.max(0, input.w2FederalWithholdingCents ?? 0),
    estimatedPaymentsMadeCents: Math.max(0, input.estimatedPaymentsMadeCents ?? 0),
    annualBenefitsValueCents: Math.max(0, input.annualBenefitsValueCents ?? 0),
    contractorExtraCostsCents: Math.max(0, input.contractorExtraCostsCents ?? 0),
  };
}

function computeW2Path(
  input: ReturnType<typeof normalizeInput>,
  config: TaxYearConfig,
): W2PathResult {
  const liability = calculateApproximateW2FederalLiability(
    {
      taxYear: input.taxYear,
      filingStatus: input.filingStatus,
      w2WagesCents: input.w2SalaryCents,
      federalWithholdingCents: input.w2FederalWithholdingCents,
    },
    config,
  );

  const totalEstimatedValue = roundCents(
    liability.estimatedAfterTaxIncomeCents + input.annualBenefitsValueCents,
  );

  return {
    afterTaxIncomeCents: liability.estimatedAfterTaxIncomeCents,
    totalEstimatedValueCents: totalEstimatedValue,
    employeeFicaCents: liability.employeeFicaTaxCents,
    employerFicaCents: liability.employerFicaTaxCents,
    federalIncomeTaxCents: liability.federalIncomeTaxCents,
    federalWithholdingCents: liability.federalWithholdingCents,
    warnings: liability.warnings,
  };
}

function computeContractorPath(
  grossIncomeCents: MoneyCents,
  input: ReturnType<typeof normalizeInput>,
  config: TaxYearConfig,
): ContractorPathResult {
  const warnings: TaxWarning[] = [];
  const expenseRatio = getExpenseRatio(input);
  const businessExpenses = roundCents(grossIncomeCents * expenseRatio);
  const netIncome = Math.max(0, grossIncomeCents - businessExpenses);

  if (businessExpenses > grossIncomeCents) {
    warnings.push({
      code: 'EXPENSES_EXCEED_GROSS',
      message: 'Business expenses exceed gross contractor income for this scenario.',
    });
  }

  const liability = calculateAnnualFederalLiability(
    {
      filingStatus: input.filingStatus,
      netSelfEmploymentIncomeCents: netIncome,
    },
    config,
  );

  const afterTaxIncome = roundCents(
    netIncome -
      liability.totalEstimatedFederalTaxCents -
      input.contractorExtraCostsCents,
  );

  return {
    grossIncomeCents,
    businessExpensesCents: businessExpenses,
    netIncomeCents: netIncome,
    selfEmploymentTaxCents: liability.selfEmploymentTaxCents,
    federalIncomeTaxCents: liability.federalIncomeTaxCents,
    afterTaxIncomeCents: afterTaxIncome,
    totalEstimatedValueCents: afterTaxIncome,
    warnings: [...warnings, ...liability.warnings],
  };
}

function getExpenseRatio(input: ReturnType<typeof normalizeInput>): number {
  if (input.contractorGrossIncomeCents <= 0) {
    return 0;
  }
  const expenses = input.contractorBusinessExpensesCents ?? 0;
  return Math.min(1, expenses / input.contractorGrossIncomeCents);
}

function findBreakEvenContractorGrossIncome(
  w2TotalValueCents: MoneyCents,
  input: ReturnType<typeof normalizeInput>,
  config: TaxYearConfig,
): { grossIncomeCents: MoneyCents | null; warnings: TaxWarning[] } {
  const warnings: TaxWarning[] = [];
  const maxBound = Math.max(
    input.w2SalaryCents * 5,
    input.contractorGrossIncomeCents * 5,
    dollarsToCents(1_000_000),
  );

  const valueAtZero = computeContractorPath(0, input, config).totalEstimatedValueCents;
  const valueAtMax = computeContractorPath(maxBound, input, config).totalEstimatedValueCents;

  if (Math.abs(valueAtZero - w2TotalValueCents) <= BREAK_EVEN_TOLERANCE_CENTS) {
    return { grossIncomeCents: 0, warnings };
  }

  if (valueAtZero > w2TotalValueCents && valueAtMax > w2TotalValueCents) {
    warnings.push({
      code: 'BREAK_EVEN_NOT_FOUND',
      message:
        'Contractor total value exceeds W-2 total value across the search range. No break-even gross income found.',
    });
    return { grossIncomeCents: null, warnings };
  }

  if (valueAtMax < w2TotalValueCents) {
    warnings.push({
      code: 'BREAK_EVEN_NOT_FOUND',
      message:
        'Contractor total value remains below W-2 total value across the search range. No break-even gross income found within reasonable bounds.',
    });
    return { grossIncomeCents: null, warnings };
  }

  let low = 0;
  let high = maxBound;
  let bestGross: MoneyCents | null = null;

  for (let i = 0; i < BREAK_EVEN_MAX_ITERATIONS; i++) {
    const mid = Math.floor((low + high) / 2);
    const contractorValue = computeContractorPath(mid, input, config).totalEstimatedValueCents;
    const diff = contractorValue - w2TotalValueCents;

    if (Math.abs(diff) <= BREAK_EVEN_TOLERANCE_CENTS) {
      bestGross = mid;
      break;
    }

    if (contractorValue < w2TotalValueCents) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  if (bestGross === null) {
    warnings.push({
      code: 'BREAK_EVEN_NOT_CONVERGED',
      message:
        'Break-even contractor gross income did not converge within iteration limits.',
    });
  }

  return { grossIncomeCents: bestGross, warnings };
}

function determineBetterOption(differenceCents: MoneyCents): W2Vs1099BetterOption {
  if (Math.abs(differenceCents) <= SIMILAR_THRESHOLD_CENTS) {
    return 'similar';
  }
  return differenceCents > 0 ? 'w2' : 'contractor_1099';
}

function buildResultCards(
  details: W2Vs1099Details,
  betterOption: W2Vs1099BetterOption,
): CalculatorResult<W2Vs1099Details>['summary'] {
  const betterLabel =
    betterOption === 'w2'
      ? 'W-2'
      : betterOption === 'contractor_1099'
        ? '1099 Contractor'
        : 'Similar';

  return [
    {
      id: 'better-option',
      label: 'Higher modeled total value',
      value: betterLabel,
      format: 'text',
      variant: 'highlight',
    },
    {
      id: 'w2-after-tax',
      label: 'Estimated W-2 After-Tax Income',
      value: details.w2AfterTaxIncomeCents,
      format: 'currency',
      variant: 'default',
    },
    {
      id: 'contractor-after-tax',
      label: 'Estimated 1099 After-Tax Income',
      value: details.contractorAfterTaxIncomeCents,
      format: 'currency',
      variant: 'default',
    },
    {
      id: 'difference',
      label: 'Difference (W-2 minus 1099 value)',
      value: details.differenceCents,
      format: 'currency',
      variant: 'highlight',
    },
    {
      id: 'break-even-gross',
      label: 'Break-Even Contractor Gross Income',
      value:
        details.breakEvenContractorGrossIncomeCents !== null
          ? details.breakEvenContractorGrossIncomeCents
          : 'Not found',
      format:
        details.breakEvenContractorGrossIncomeCents !== null ? 'currency' : 'text',
      variant: 'informational',
    },
    ...(details.breakEvenContractorHourlyRateCents !== null
      ? [
          {
            id: 'break-even-hourly',
            label: 'Break-Even Contractor Hourly Rate',
            value: details.breakEvenContractorHourlyRateCents,
            format: 'currency' as const,
            variant: 'informational' as const,
          },
        ]
      : []),
    {
      id: 'employee-fica',
      label: 'Employee FICA',
      value: details.employeeFicaCents,
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
    {
      id: 'annual-benefits',
      label: 'Annual Benefits Value',
      value: details.annualBenefitsValueCents,
      format: 'currency',
      variant: 'informational',
    },
    {
      id: 'contractor-extra-costs',
      label: 'Contractor Extra Costs',
      value: details.contractorExtraCostsCents,
      format: 'currency',
      variant: 'informational',
    },
    {
      id: 'w2-total-value',
      label: 'Total Estimated W-2 Value',
      value: details.w2TotalEstimatedValueCents,
      format: 'currency',
      variant: 'savings',
    },
    {
      id: 'contractor-total-value',
      label: 'Total Estimated 1099 Value',
      value: details.contractorTotalEstimatedValueCents,
      format: 'currency',
      variant: 'savings',
    },
  ];
}

function buildBreakdown(details: W2Vs1099Details) {
  return [
    {
      id: 'w2-salary',
      label: 'W-2 gross salary',
      amount: details.w2GrossSalaryCents,
      category: 'income' as const,
    },
    {
      id: 'w2-fica',
      label: 'Employee FICA',
      amount: details.employeeFicaCents,
      category: 'tax' as const,
      indent: 1,
    },
    {
      id: 'w2-income-tax',
      label: 'W-2 federal income tax',
      amount: details.w2FederalIncomeTaxCents,
      category: 'tax' as const,
      indent: 1,
    },
    {
      id: 'w2-benefits',
      label: 'Annual benefits value',
      amount: details.annualBenefitsValueCents,
      category: 'informational' as const,
    },
    {
      id: 'employer-fica',
      label: 'Employer FICA (informational)',
      amount: details.employerFicaCents,
      category: 'informational' as const,
    },
    {
      id: 'contractor-gross',
      label: 'Contractor gross income',
      amount: details.contractorGrossIncomeCents,
      category: 'income' as const,
    },
    {
      id: 'contractor-expenses',
      label: 'Contractor business expenses',
      amount: details.contractorBusinessExpensesCents,
      category: 'deduction' as const,
      indent: 1,
    },
    {
      id: 'contractor-se-tax',
      label: 'Self-employment tax',
      amount: details.selfEmploymentTaxCents,
      category: 'tax' as const,
      indent: 1,
    },
    {
      id: 'contractor-income-tax',
      label: 'Contractor federal income tax',
      amount: details.contractorFederalIncomeTaxCents,
      category: 'tax' as const,
      indent: 1,
    },
    {
      id: 'contractor-extra',
      label: 'Contractor extra costs',
      amount: details.contractorExtraCostsCents,
      category: 'informational' as const,
      indent: 1,
    },
  ];
}

function roundCents(value: number): MoneyCents {
  return Math.round(value);
}

function dedupeWarnings(warnings: TaxWarning[]): TaxWarning[] {
  const seen = new Set<string>();
  return warnings.filter((w) => {
    if (seen.has(w.code)) return false;
    seen.add(w.code);
    return true;
  });
}
