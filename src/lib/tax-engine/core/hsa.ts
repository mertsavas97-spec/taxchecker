import type {
  FilingStatus,
  HsaContributionLimitResult,
  HsaFederalTaxSavingsInput,
  HsaFederalTaxSavingsResult,
  HsaLimitInput,
  HsaPayrollTaxSavingsInput,
  HsaPayrollTaxSavingsResult,
  HsaRemainingRoomResult,
  HsaRoomInput,
  HsaTaxSavingsInput,
  HsaTaxSavingsResult,
  MoneyCents,
  TaxWarning,
  TaxYearConfig,
} from '../types';
import {
  calculateFederalIncomeTaxFromAgi,
  calculateMarginalRate,
} from './federal-income-tax';
import { multiplyCentsByRate, roundCents } from './rounding';

const FULL_YEAR_ELIGIBILITY_MONTHS = 12;

export function getHsaContributionLimit(
  input: HsaLimitInput,
  config: TaxYearConfig,
): HsaContributionLimitResult {
  const warnings: TaxWarning[] = [];
  const baseLimit =
    input.coverageType === 'family'
      ? config.hsa.familyLimit
      : config.hsa.selfOnlyLimit;

  const catchUp =
    input.age >= config.hsa.catchUpAge ? config.hsa.catchUpAmount : 0;

  let prorationFactor = 1;

  if (input.eligibleMonths === undefined) {
    warnings.push({
      code: 'FULL_YEAR_ELIGIBILITY_ASSUMED',
      message:
        'Eligible months were not provided. This estimate assumes full-year HDHP eligibility.',
    });
  } else {
    const months = Math.max(1, Math.min(FULL_YEAR_ELIGIBILITY_MONTHS, input.eligibleMonths));
    if (months !== input.eligibleMonths) {
      warnings.push({
        code: 'ELIGIBLE_MONTHS_CLAMPED',
        message:
          'Eligible months were adjusted to the 1–12 range for proration.',
      });
    }
    prorationFactor = months / FULL_YEAR_ELIGIBILITY_MONTHS;
    if (months < FULL_YEAR_ELIGIBILITY_MONTHS) {
      warnings.push({
        code: 'PARTIAL_YEAR_PRORATION',
        message:
          'Contribution limit is prorated by eligible months. Partial-year HDHP rules may be more complex than this estimate.',
      });
    }
  }

  const contributionLimit = roundCents((baseLimit + catchUp) * prorationFactor);

  return {
    contributionLimitCents: contributionLimit,
    baseLimitCents: roundCents(baseLimit * prorationFactor),
    catchUpContributionCents: roundCents(catchUp * prorationFactor),
    prorationFactor,
    warnings,
  };
}

export function calculateRemainingHsaContributionRoom(
  input: HsaRoomInput,
  config: TaxYearConfig,
): HsaRemainingRoomResult {
  const limitResult = getHsaContributionLimit(input, config);
  const employerContribution = Math.max(0, input.employerContributionCents ?? 0);
  const remainingContributionRoom = Math.max(
    0,
    limitResult.contributionLimitCents - employerContribution,
  );

  const warnings = [...limitResult.warnings];

  if (employerContribution > limitResult.contributionLimitCents) {
    warnings.push({
      code: 'EMPLOYER_EXCEEDS_LIMIT',
      message:
        'Employer contributions exceed the annual HSA limit. Remaining contribution room is zero.',
    });
  }

  return {
    contributionLimitCents: limitResult.contributionLimitCents,
    employerContributionCents: employerContribution,
    remainingContributionRoomCents: remainingContributionRoom,
    warnings,
  };
}

export function calculateHsaFederalTaxSavings(
  input: HsaFederalTaxSavingsInput,
  config: TaxYearConfig,
): HsaFederalTaxSavingsResult {
  const annualIncome = Math.max(0, input.annualIncomeCents);
  const eligibleContribution = Math.max(0, input.eligibleContributionCents);

  const federalResult = calculateFederalIncomeTaxFromAgi(
    {
      adjustedGrossIncomeCents: annualIncome,
      filingStatus: input.filingStatus,
      useStandardDeduction: true,
    },
    config,
  );

  const marginalFederalTaxRate = calculateMarginalRate(
    federalResult.taxableIncome,
    input.filingStatus,
    config,
  );

  const federalIncomeTaxSavings = multiplyCentsByRate(
    eligibleContribution,
    marginalFederalTaxRate,
  );

  return {
    marginalFederalTaxRate,
    federalIncomeTaxSavingsCents: federalIncomeTaxSavings,
    taxableIncomeCents: federalResult.taxableIncome,
  };
}

export function calculateHsaPayrollTaxSavings(
  input: HsaPayrollTaxSavingsInput,
  config: TaxYearConfig,
): HsaPayrollTaxSavingsResult {
  const warnings: TaxWarning[] = [];
  const eligibleContribution = Math.max(0, input.eligibleContributionCents);

  if (!input.payrollDeductedContribution || eligibleContribution === 0) {
    return {
      payrollTaxSavingsCents: 0,
      socialSecurityTaxSavingsCents: 0,
      medicareTaxSavingsCents: 0,
      warnings,
    };
  }

  warnings.push({
    code: 'FICA_SIMPLIFIED',
    message:
      'Payroll tax savings use a simplified employee FICA model. Social Security wage base limits and Additional Medicare Tax are not fully modeled.',
  });

  const annualIncome = Math.max(0, input.annualIncomeCents);
  const remainingSocialSecurityRoom = Math.max(
    0,
    config.payrollTax.socialSecurityWageBase - annualIncome,
  );
  const socialSecurityTaxable = Math.min(
    eligibleContribution,
    remainingSocialSecurityRoom,
  );

  const socialSecurityTaxSavings = multiplyCentsByRate(
    socialSecurityTaxable,
    config.payrollTax.socialSecurityRateEmployee,
  );
  const medicareTaxSavings = multiplyCentsByRate(
    eligibleContribution,
    config.payrollTax.medicareRateEmployee,
  );

  return {
    payrollTaxSavingsCents: roundCents(
      socialSecurityTaxSavings + medicareTaxSavings,
    ),
    socialSecurityTaxSavingsCents: socialSecurityTaxSavings,
    medicareTaxSavingsCents: medicareTaxSavings,
    warnings,
  };
}

export function calculateHsaTaxSavings(
  input: HsaTaxSavingsInput,
  config: TaxYearConfig,
): HsaTaxSavingsResult {
  const warnings: TaxWarning[] = [];

  const userContribution = Math.max(0, input.hsaContributionCents);
  const employerContribution = Math.max(0, input.employerContributionCents ?? 0);
  const payrollDeductedContribution = input.payrollDeductedContribution === true;

  const limitResult = getHsaContributionLimit(
    {
      coverageType: input.coverageType,
      age: input.age,
      eligibleMonths: input.eligibleMonths,
    },
    config,
  );

  const roomResult = calculateRemainingHsaContributionRoom(
    {
      coverageType: input.coverageType,
      age: input.age,
      eligibleMonths: input.eligibleMonths,
      employerContributionCents: employerContribution,
    },
    config,
  );

  warnings.push(...roomResult.warnings);

  if (employerContribution > 0) {
    warnings.push({
      code: 'EMPLOYER_REDUCES_ROOM',
      message:
        'Employer HSA contributions reduce your remaining contribution room.',
    });
  }

  const eligibleContribution = Math.min(
    userContribution,
    roomResult.remainingContributionRoomCents,
  );
  const excessContribution = Math.max(
    0,
    userContribution - roomResult.remainingContributionRoomCents,
  );

  if (excessContribution > 0) {
    warnings.push({
      code: 'EXCESS_CONTRIBUTION',
      message:
        'Your contribution exceeds remaining HSA room. Excess contributions may be subject to tax and penalty.',
    });
  }

  const federalSavings = calculateHsaFederalTaxSavings(
    {
      filingStatus: input.filingStatus,
      annualIncomeCents: input.annualIncomeCents,
      eligibleContributionCents: eligibleContribution,
    },
    config,
  );

  const payrollSavings = calculateHsaPayrollTaxSavings(
    {
      annualIncomeCents: input.annualIncomeCents,
      eligibleContributionCents: eligibleContribution,
      payrollDeductedContribution,
    },
    config,
  );

  warnings.push(...payrollSavings.warnings);

  if (!payrollDeductedContribution) {
    warnings.push({
      code: 'PAYROLL_FICA_SAVINGS_EXCLUDED',
      message:
        'Payroll tax savings apply only when HSA contributions are made through payroll deduction.',
    });
  }

  const totalTaxSavings = roundCents(
    federalSavings.federalIncomeTaxSavingsCents +
      payrollSavings.payrollTaxSavingsCents,
  );

  const netAfterTaxCost = roundCents(userContribution - totalTaxSavings);

  return {
    contributionLimitCents: roomResult.contributionLimitCents,
    employerContributionCents: employerContribution,
    userContributionCents: userContribution,
    eligibleContributionCents: eligibleContribution,
    remainingContributionRoomCents: roomResult.remainingContributionRoomCents,
    excessContributionCents: excessContribution,
    marginalFederalTaxRate: federalSavings.marginalFederalTaxRate,
    federalIncomeTaxSavingsCents: federalSavings.federalIncomeTaxSavingsCents,
    payrollTaxSavingsCents: payrollSavings.payrollTaxSavingsCents,
    totalTaxSavingsCents: totalTaxSavings,
    netAfterTaxCostCents: netAfterTaxCost,
    catchUpContributionCents: limitResult.catchUpContributionCents,
    baseLimitCents: limitResult.baseLimitCents,
    warnings: dedupeWarnings(warnings),
  };
}

function dedupeWarnings(warnings: TaxWarning[]): TaxWarning[] {
  const seen = new Set<string>();
  return warnings.filter((warning) => {
    if (seen.has(warning.code)) return false;
    seen.add(warning.code);
    return true;
  });
}
