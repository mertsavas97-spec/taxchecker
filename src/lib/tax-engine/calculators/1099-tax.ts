import { calculateSelfEmployedTax } from './self-employed-tax';
import { ENGINE_VERSION } from '../core/calculator-shared';
import type {
  CalculatorResult,
  ResultCard,
  SelfEmployedTaxDetails,
  Tax1099TaxDetails,
  Tax1099TaxInput,
  TaxDisclaimer,
  TaxWarning,
} from '../types';

const DISCLAIMER: TaxDisclaimer = {
  key: 'tax-1099',
  text: 'Estimate only — not tax advice. This calculator estimates federal taxes on independent contractor income using IRS self-employment tax rules. Receiving a 1099-NEC generally means income is reported to the IRS; your actual tax depends on your full return, deductions, and credits. TaxChecker does not determine whether you are correctly classified as a contractor or employee.',
};

export function calculate1099Tax(
  input: Tax1099TaxInput,
): CalculatorResult<Tax1099TaxDetails> {
  const gross1099Income = Math.max(0, input.gross1099IncomeCents);
  const businessExpenses = Math.max(0, input.businessExpensesCents ?? 0);
  const net1099Income = Math.max(0, gross1099Income - businessExpenses);

  const warnings: TaxWarning[] = [];

  if (businessExpenses > gross1099Income) {
    warnings.push({
      code: 'EXPENSES_EXCEED_GROSS',
      message:
        'Business expenses exceed gross 1099 income. Net income is treated as zero.',
    });
  }

  warnings.push({
    code: 'EXPENSES_USER_ENTERED',
    message:
      'Deductible business expenses are user-entered and not validated for deductibility on this site.',
  });

  const baseResult = calculateSelfEmployedTax({
    taxYear: input.taxYear,
    filingStatus: input.filingStatus,
    netSelfEmploymentIncomeCents: net1099Income,
    otherIncomeCents: input.otherIncomeCents,
    estimatedPaymentsMadeCents: input.estimatedPaymentsMadeCents,
  });

  const details: Tax1099TaxDetails = {
    ...baseResult.details,
    gross1099IncomeCents: gross1099Income,
    businessExpensesCents: businessExpenses,
    net1099IncomeCents: net1099Income,
  };

  const summary1099Cards: ResultCard[] = [
    {
      id: 'gross-1099-income',
      label: 'Gross 1099 Income',
      value: gross1099Income,
      format: 'currency',
      variant: 'default',
    },
    {
      id: 'business-expenses',
      label: 'Business Expenses',
      value: businessExpenses,
      format: 'currency',
      variant: 'default',
    },
    {
      id: 'net-1099-income',
      label: 'Net 1099 Income',
      value: net1099Income,
      format: 'currency',
      variant: 'highlight',
    },
  ];

  return {
    calculatorId: 'tax-1099',
    taxYear: input.taxYear,
    computedAt: new Date().toISOString(),
    disclaimer: DISCLAIMER,
    summary: [...summary1099Cards, ...baseResult.summary],
    details,
    breakdown: [
      {
        id: 'gross-1099',
        label: 'Gross 1099 income',
        amount: gross1099Income,
        category: 'income',
      },
      {
        id: 'business-expenses',
        label: 'Business expenses',
        amount: businessExpenses,
        category: 'deduction',
        indent: 1,
      },
      ...baseResult.breakdown,
    ],
    warnings: [...warnings, ...baseResult.warnings],
    metadata: {
      engineVersion: ENGINE_VERSION,
      configVerified: baseResult.metadata.configVerified,
    },
  };
}
