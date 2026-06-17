import type {
  FilingStatus,
  FederalIncomeTaxResult,
  MoneyCents,
  TaxYearConfig,
} from '../types';
import { multiplyCentsByRate, roundCents } from './rounding';

export interface TaxableIncomeInput {
  adjustedGrossIncomeCents: MoneyCents;
  filingStatus: FilingStatus;
  useStandardDeduction?: boolean;
  itemizedDeductionCents?: MoneyCents;
}

/** AGI minus standard or itemized deduction, floored at zero */
export function calculateTaxableIncome(
  input: TaxableIncomeInput,
  config: TaxYearConfig,
): MoneyCents {
  const useStandard = input.useStandardDeduction !== false;
  const deduction = useStandard
    ? config.standardDeduction[input.filingStatus]
    : Math.max(0, input.itemizedDeductionCents ?? 0);

  return Math.max(0, input.adjustedGrossIncomeCents - deduction);
}

export function calculateFederalIncomeTax(
  taxableIncomeCents: MoneyCents,
  filingStatus: FilingStatus,
  config: TaxYearConfig,
): FederalIncomeTaxResult {
  const brackets = config.federalIncomeTax.brackets[filingStatus];
  const bracketBreakdown: FederalIncomeTaxResult['bracketBreakdown'] = [];
  let tax = 0;
  let previousCapCents = 0;

  for (const bracket of brackets) {
    if (taxableIncomeCents <= previousCapCents) {
      break;
    }

    const upperBoundCents = bracket.max ?? taxableIncomeCents;
    const taxableInBracket = Math.min(taxableIncomeCents, upperBoundCents) - previousCapCents;

    if (taxableInBracket > 0) {
      const taxInBracket = multiplyCentsByRate(taxableInBracket, bracket.rate);
      tax += taxInBracket;
      bracketBreakdown.push({
        rate: bracket.rate,
        taxableInBracket,
        taxInBracket,
      });
    }

    if (bracket.max === null) {
      break;
    }

    previousCapCents = bracket.max;
  }

  const effectiveRate =
    taxableIncomeCents > 0 ? tax / taxableIncomeCents : 0;

  return {
    adjustedGrossIncome: 0,
    taxableIncome: taxableIncomeCents,
    tax,
    marginalRate: calculateMarginalRate(taxableIncomeCents, filingStatus, config),
    effectiveRate,
    bracketBreakdown,
  };
}

/** Marginal ordinary rate on the next dollar of taxable income */
export function calculateMarginalRate(
  taxableIncomeCents: MoneyCents,
  filingStatus: FilingStatus,
  config: TaxYearConfig,
): number {
  if (taxableIncomeCents <= 0) {
    return config.federalIncomeTax.brackets[filingStatus][0]?.rate ?? 0;
  }

  const brackets = config.federalIncomeTax.brackets[filingStatus];

  for (const bracket of brackets) {
    if (bracket.max === null || taxableIncomeCents <= bracket.max) {
      return bracket.rate;
    }
  }

  return brackets[brackets.length - 1]?.rate ?? 0;
}

export function calculateEffectiveRate(
  taxCents: MoneyCents,
  taxableIncomeCents: MoneyCents,
): number {
  if (taxableIncomeCents <= 0) {
    return 0;
  }
  return roundCents(taxCents) / taxableIncomeCents;
}

/** Full federal income tax from AGI through brackets */
export function calculateFederalIncomeTaxFromAgi(
  input: TaxableIncomeInput,
  config: TaxYearConfig,
): FederalIncomeTaxResult {
  const taxableIncome = calculateTaxableIncome(input, config);
  const result = calculateFederalIncomeTax(
    taxableIncome,
    input.filingStatus,
    config,
  );

  return {
    ...result,
    adjustedGrossIncome: input.adjustedGrossIncomeCents,
    taxableIncome,
  };
}
