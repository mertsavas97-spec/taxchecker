import { describe, expect, it } from 'vitest';
import { calculateHsaTax } from '../../calculators/hsa-tax';
import { taxYear2025 } from '../../config/tax-year-2025';
import { dollarsToCents } from '../../core/rounding';

describe('calculateHsaTax', () => {
  const baseInput = {
    taxYear: 2025,
    filingStatus: 'single' as const,
    coverageType: 'self_only' as const,
    age: 40,
    annualIncomeCents: dollarsToCents(90_000),
    hsaContributionCents: dollarsToCents(3_000),
    employerContributionCents: dollarsToCents(500),
    payrollDeductedContribution: true,
    eligibleMonths: 12,
  };

  it('returns required result cards', () => {
    const result = calculateHsaTax(baseInput);
    const ids = result.summary.map((card) => card.id);

    expect(ids).toContain('contribution-limit');
    expect(ids).toContain('employer-contribution');
    expect(ids).toContain('user-contribution');
    expect(ids).toContain('remaining-room');
    expect(ids).toContain('excess-contribution');
    expect(ids).toContain('marginal-rate');
    expect(ids).toContain('federal-income-tax-savings');
    expect(ids).toContain('total-tax-savings');
    expect(ids).toContain('net-after-tax-cost');
  });

  it('includes state exclusion warning', () => {
    const result = calculateHsaTax(baseInput);

    expect(result.warnings.some((warning) => warning.code === 'STATE_EXCLUDED')).toBe(
      true,
    );
  });

  it('includes HDHP eligibility warning', () => {
    const result = calculateHsaTax(baseInput);

    expect(
      result.warnings.some((warning) => warning.code === 'HDHP_ELIGIBILITY_NOT_VERIFIED'),
    ).toBe(true);
  });

  it('includes excess contribution warning when applicable', () => {
    const result = calculateHsaTax({
      ...baseInput,
      hsaContributionCents: dollarsToCents(5_000),
      employerContributionCents: 0,
    });

    expect(result.details.excessContributionCents).toBeGreaterThan(0);
    expect(result.warnings.some((warning) => warning.code === 'EXCESS_CONTRIBUTION')).toBe(
      true,
    );
  });

  it('includes employer contribution card', () => {
    const result = calculateHsaTax(baseInput);

    expect(result.summary.find((card) => card.id === 'employer-contribution')?.value).toBe(
      baseInput.employerContributionCents,
    );
    expect(result.details.remainingContributionRoomCents).toBe(
      taxYear2025.hsa.selfOnlyLimit - baseInput.employerContributionCents,
    );
  });

  it('includes payroll savings card when payrollDeductedContribution is true', () => {
    const result = calculateHsaTax({
      ...baseInput,
      payrollDeductedContribution: true,
    });

    expect(result.summary.some((card) => card.id === 'payroll-tax-savings')).toBe(true);
    expect(result.details.payrollTaxSavingsCents).toBeGreaterThan(0);
  });

  it('does not include payroll savings card when payroll deduction is false', () => {
    const result = calculateHsaTax({
      ...baseInput,
      payrollDeductedContribution: false,
    });

    expect(result.summary.some((card) => card.id === 'payroll-tax-savings')).toBe(false);
    expect(result.details.payrollTaxSavingsCents).toBe(0);
  });

  it('does not include investment growth', () => {
    const result = calculateHsaTax(baseInput);
    const text = [
      ...result.warnings.map((warning) => warning.message),
      ...result.summary.map((card) => card.label),
    ]
      .join(' ')
      .toLowerCase();

    expect(result.warnings.some((warning) => warning.code === 'NO_INVESTMENT_GROWTH')).toBe(
      true,
    );
    expect(text).not.toContain('investment return');
    expect(text).not.toContain('account growth');
    expect(result.summary.some((card) => card.id.includes('growth'))).toBe(false);
  });

  it('does not include eligibility recommendation language', () => {
    const result = calculateHsaTax(baseInput);
    const advisoryText = result.warnings.map((warning) => warning.message).join(' ').toLowerCase();

    expect(advisoryText).not.toMatch(/\byou (are|should be) eligible\b/);
    expect(advisoryText).not.toMatch(/\bqualifies for an hsa\b/);
    expect(result.summary.some((card) => card.id === 'recommended-contribution')).toBe(
      false,
    );
  });
});
