import type {
  FilingStatus,
  MoneyCents,
  SelfEmploymentTaxResult,
  TaxWarning,
  TaxYearConfig,
} from '../types';
import { multiplyCentsByRate, roundCents } from './rounding';

export interface SelfEmploymentTaxInput {
  netProfitCents: MoneyCents;
  filingStatus: FilingStatus;
  /** W-2 wages subject to Social Security — default 0 */
  w2WagesSubjectToSocialSecurityCents?: MoneyCents;
  /** Wages/compensation subject to Medicare for Additional Medicare coordination */
  medicareWagesCents?: MoneyCents;
}

export interface AdditionalMedicareResult {
  tax: MoneyCents;
  warnings: TaxWarning[];
}

/** Net earnings from self-employment (Schedule SE line 4 factor) */
export function calculateNetEarningsFromSelfEmployment(
  netProfitCents: MoneyCents,
  config: TaxYearConfig,
): MoneyCents {
  if (netProfitCents <= 0) {
    return 0;
  }
  return multiplyCentsByRate(netProfitCents, config.selfEmploymentTax.netEarningsFactor);
}

/**
 * Additional Medicare on SE income per Form 8959 Steps 2–3 (SE-only path).
 * W-2 wages reduce the threshold before SE excess is computed.
 */
export function calculateAdditionalMedicareTaxForSEIncome(
  netEarningsCents: MoneyCents,
  medicareWagesCents: MoneyCents,
  filingStatus: FilingStatus,
  config: TaxYearConfig,
): AdditionalMedicareResult {
  const warnings: TaxWarning[] = [];
  const threshold = config.additionalMedicareTax.thresholds[filingStatus];
  const reducedThreshold = Math.max(0, threshold - Math.max(0, medicareWagesCents));
  const seExcess = Math.max(0, netEarningsCents - reducedThreshold);

  if (medicareWagesCents > 0) {
    warnings.push({
      code: 'ADDITIONAL_MEDICARE_WAGE_ASSUMPTION',
      message:
        'Additional Medicare uses other income as Medicare wages. Non-wage income may affect accuracy.',
    });
  }

  if (seExcess > 0 && medicareWagesCents === 0 && netEarningsCents > threshold) {
    warnings.push({
      code: 'ADDITIONAL_MEDICARE_SE_ONLY',
      message:
        'Additional Medicare computed on self-employment earnings only. Mixed W-2 and SE income may require Form 8959 review.',
    });
  }

  return {
    tax: multiplyCentsByRate(seExcess, config.additionalMedicareTax.rate),
    warnings,
  };
}

export function calculateDeductibleSETax(
  socialSecurityTaxCents: MoneyCents,
  medicareTaxCents: MoneyCents,
  config: TaxYearConfig,
): MoneyCents {
  const scheduleSeTax = socialSecurityTaxCents + medicareTaxCents;
  return multiplyCentsByRate(scheduleSeTax, config.selfEmploymentTax.deductiblePortionRate);
}

export function calculateSelfEmploymentTax(
  input: SelfEmploymentTaxInput,
  config: TaxYearConfig,
): SelfEmploymentTaxResult & { warnings: TaxWarning[] } {
  const warnings: TaxWarning[] = [];
  const netProfit = Math.max(0, input.netProfitCents);
  const w2Wages = Math.max(0, input.w2WagesSubjectToSocialSecurityCents ?? 0);
  const medicareWages = Math.max(0, input.medicareWagesCents ?? w2Wages);

  const netEarnings = calculateNetEarningsFromSelfEmployment(netProfit, config);

  if (
    netEarnings > 0 &&
    netEarnings < config.selfEmploymentTax.minimumNetEarningsThreshold
  ) {
    return {
      netProfit,
      netEarnings,
      socialSecurityTax: 0,
      medicareTax: 0,
      additionalMedicareTax: 0,
      totalSETax: 0,
      deductibleSETax: 0,
      warnings,
    };
  }

  const remainingWageBase = Math.max(
    0,
    config.selfEmploymentTax.socialSecurityWageBase - w2Wages,
  );
  const socialSecurityTaxable = Math.min(netEarnings, remainingWageBase);
  const socialSecurityTax = multiplyCentsByRate(
    socialSecurityTaxable,
    config.selfEmploymentTax.socialSecurityRate,
  );
  const medicareTax = multiplyCentsByRate(
    netEarnings,
    config.selfEmploymentTax.medicareRate,
  );

  const additionalMedicare = calculateAdditionalMedicareTaxForSEIncome(
    netEarnings,
    medicareWages,
    input.filingStatus,
    config,
  );
  warnings.push(...additionalMedicare.warnings);

  const scheduleSeTotal = socialSecurityTax + medicareTax;
  const totalSETax = scheduleSeTotal + additionalMedicare.tax;
  const deductibleSETax = calculateDeductibleSETax(
    socialSecurityTax,
    medicareTax,
    config,
  );

  return {
    netProfit,
    netEarnings,
    socialSecurityTax,
    medicareTax,
    additionalMedicareTax: additionalMedicare.tax,
    totalSETax,
    deductibleSETax,
    warnings,
  };
}
