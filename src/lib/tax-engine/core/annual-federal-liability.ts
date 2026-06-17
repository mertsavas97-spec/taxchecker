import type { FilingStatus, MoneyCents, TaxYearConfig } from '../types';
import { calculateFederalIncomeTaxFromAgi } from './federal-income-tax';
import { roundCents } from './rounding';
import { calculateSelfEmploymentTax } from './self-employment-tax';

export interface AnnualFederalLiabilityInput {
  filingStatus: FilingStatus;
  netSelfEmploymentIncomeCents: MoneyCents;
  otherIncomeCents?: MoneyCents;
  w2WagesSubjectToSocialSecurityCents?: MoneyCents;
}

export interface AnnualFederalLiabilityResult {
  netSelfEmploymentIncomeCents: MoneyCents;
  otherIncomeCents: MoneyCents;
  seResult: ReturnType<typeof calculateSelfEmploymentTax>;
  adjustedGrossIncomeCents: MoneyCents;
  federalTaxableIncomeCents: MoneyCents;
  federalIncomeTaxCents: MoneyCents;
  selfEmploymentTaxCents: MoneyCents;
  deductibleSeTaxCents: MoneyCents;
  totalEstimatedFederalTaxCents: MoneyCents;
  marginalTaxRate: number;
  effectiveTaxRate: number;
  warnings: ReturnType<typeof calculateSelfEmploymentTax>['warnings'];
}

/** SE tax + federal income tax on net self-employment and other ordinary income */
export function calculateAnnualFederalLiability(
  input: AnnualFederalLiabilityInput,
  config: TaxYearConfig,
): AnnualFederalLiabilityResult {
  const netSelfEmploymentIncome = Math.max(0, input.netSelfEmploymentIncomeCents);
  const otherIncome = Math.max(0, input.otherIncomeCents ?? 0);
  const w2Wages = Math.max(0, input.w2WagesSubjectToSocialSecurityCents ?? 0);

  const medicareWages = w2Wages + otherIncome;

  const seResult = calculateSelfEmploymentTax(
    {
      netProfitCents: netSelfEmploymentIncome,
      filingStatus: input.filingStatus,
      w2WagesSubjectToSocialSecurityCents: w2Wages,
      medicareWagesCents: medicareWages,
    },
    config,
  );

  const adjustedGrossIncome = roundCents(
    netSelfEmploymentIncome + otherIncome + w2Wages - seResult.deductibleSETax,
  );

  const federalResult = calculateFederalIncomeTaxFromAgi(
    {
      adjustedGrossIncomeCents: adjustedGrossIncome,
      filingStatus: input.filingStatus,
      useStandardDeduction: true,
    },
    config,
  );

  const totalEstimatedFederalTax = roundCents(
    seResult.totalSETax + federalResult.tax,
  );

  const grossIncome = netSelfEmploymentIncome + otherIncome + w2Wages;
  const effectiveTaxRate =
    grossIncome > 0 ? totalEstimatedFederalTax / grossIncome : 0;

  return {
    netSelfEmploymentIncomeCents: netSelfEmploymentIncome,
    otherIncomeCents: otherIncome,
    seResult,
    adjustedGrossIncomeCents: adjustedGrossIncome,
    federalTaxableIncomeCents: federalResult.taxableIncome,
    federalIncomeTaxCents: federalResult.tax,
    selfEmploymentTaxCents: seResult.totalSETax,
    deductibleSeTaxCents: seResult.deductibleSETax,
    totalEstimatedFederalTaxCents: totalEstimatedFederalTax,
    marginalTaxRate: federalResult.marginalRate,
    effectiveTaxRate,
    warnings: seResult.warnings,
  };
}
