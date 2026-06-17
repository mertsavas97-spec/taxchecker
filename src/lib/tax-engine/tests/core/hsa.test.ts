import { describe, expect, it } from 'vitest';
import { taxYear2025 } from '../../config/tax-year-2025';
import {
  calculateHsaFederalTaxSavings,
  calculateHsaPayrollTaxSavings,
  calculateHsaTaxSavings,
  calculateRemainingHsaContributionRoom,
  getHsaContributionLimit,
} from '../../core/hsa';
import {
  calculateFederalIncomeTaxFromAgi,
  calculateMarginalRate,
} from '../../core/federal-income-tax';
import { dollarsToCents, multiplyCentsByRate } from '../../core/rounding';

describe('hsa core', () => {
  it('uses self-only limit from config', () => {
    const result = getHsaContributionLimit(
      { coverageType: 'self_only', age: 40 },
      taxYear2025,
    );

    expect(result.contributionLimitCents).toBe(taxYear2025.hsa.selfOnlyLimit);
    expect(result.baseLimitCents).toBe(taxYear2025.hsa.selfOnlyLimit);
    expect(result.catchUpContributionCents).toBe(0);
  });

  it('uses family limit from config', () => {
    const result = getHsaContributionLimit(
      { coverageType: 'family', age: 40 },
      taxYear2025,
    );

    expect(result.contributionLimitCents).toBe(taxYear2025.hsa.familyLimit);
    expect(result.baseLimitCents).toBe(taxYear2025.hsa.familyLimit);
  });

  it('applies catch-up contribution when age is 55 or older', () => {
    const result = getHsaContributionLimit(
      { coverageType: 'self_only', age: 55 },
      taxYear2025,
    );

    expect(result.catchUpContributionCents).toBe(taxYear2025.hsa.catchUpAmount);
    expect(result.contributionLimitCents).toBe(
      taxYear2025.hsa.selfOnlyLimit + taxYear2025.hsa.catchUpAmount,
    );
  });

  it('does not apply catch-up contribution when age is under 55', () => {
    const result = getHsaContributionLimit(
      { coverageType: 'self_only', age: 54 },
      taxYear2025,
    );

    expect(result.catchUpContributionCents).toBe(0);
    expect(result.contributionLimitCents).toBe(taxYear2025.hsa.selfOnlyLimit);
  });

  it('prorates the limit by eligible months', () => {
    const result = getHsaContributionLimit(
      { coverageType: 'self_only', age: 40, eligibleMonths: 6 },
      taxYear2025,
    );

    expect(result.contributionLimitCents).toBe(
      Math.round(taxYear2025.hsa.selfOnlyLimit / 2),
    );
    expect(result.prorationFactor).toBe(0.5);
  });

  it('reduces remaining room when employer contributions are present', () => {
    const employer = dollarsToCents(1_000);
    const result = calculateRemainingHsaContributionRoom(
      {
        coverageType: 'self_only',
        age: 40,
        employerContributionCents: employer,
      },
      taxYear2025,
    );

    expect(result.remainingContributionRoomCents).toBe(
      taxYear2025.hsa.selfOnlyLimit - employer,
    );
  });

  it('detects excess user contributions', () => {
    const result = calculateHsaTaxSavings(
      {
        taxYear: 2025,
        filingStatus: 'single',
        coverageType: 'self_only',
        age: 40,
        annualIncomeCents: dollarsToCents(80_000),
        hsaContributionCents: dollarsToCents(5_000),
      },
      taxYear2025,
    );

    expect(result.excessContributionCents).toBe(
      dollarsToCents(5_000) - taxYear2025.hsa.selfOnlyLimit,
    );
    expect(result.warnings.some((w) => w.code === 'EXCESS_CONTRIBUTION')).toBe(true);
  });

  it('calculates federal tax savings using marginal rate', () => {
    const income = dollarsToCents(100_000);
    const contribution = dollarsToCents(3_000);
    const federal = calculateFederalIncomeTaxFromAgi(
      {
        adjustedGrossIncomeCents: income,
        filingStatus: 'single',
        useStandardDeduction: true,
      },
      taxYear2025,
    );
    const marginalRate = calculateMarginalRate(
      federal.taxableIncome,
      'single',
      taxYear2025,
    );
    const result = calculateHsaFederalTaxSavings(
      {
        filingStatus: 'single',
        annualIncomeCents: income,
        eligibleContributionCents: contribution,
      },
      taxYear2025,
    );

    expect(result.marginalFederalTaxRate).toBe(marginalRate);
    expect(result.federalIncomeTaxSavingsCents).toBe(
      multiplyCentsByRate(contribution, marginalRate),
    );
  });

  it('calculates payroll tax savings only when payrollDeductedContribution is true', () => {
    const income = dollarsToCents(80_000);
    const contribution = dollarsToCents(3_000);

    const withoutPayroll = calculateHsaPayrollTaxSavings(
      {
        annualIncomeCents: income,
        eligibleContributionCents: contribution,
        payrollDeductedContribution: false,
      },
      taxYear2025,
    );
    const withPayroll = calculateHsaPayrollTaxSavings(
      {
        annualIncomeCents: income,
        eligibleContributionCents: contribution,
        payrollDeductedContribution: true,
      },
      taxYear2025,
    );

    expect(withoutPayroll.payrollTaxSavingsCents).toBe(0);
    expect(withPayroll.payrollTaxSavingsCents).toBeGreaterThan(0);
    expect(withPayroll.warnings.some((w) => w.code === 'FICA_SIMPLIFIED')).toBe(
      true,
    );
  });

  it('returns full-year eligibility assumption warning when eligibleMonths is missing', () => {
    const result = getHsaContributionLimit(
      { coverageType: 'self_only', age: 40 },
      taxYear2025,
    );

    expect(
      result.warnings.some((w) => w.code === 'FULL_YEAR_ELIGIBILITY_ASSUMED'),
    ).toBe(true);
  });
});
