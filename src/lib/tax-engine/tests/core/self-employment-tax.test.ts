import { describe, expect, it } from 'vitest';
import { taxYear2025 } from '../../config/tax-year-2025';
import {
  calculateDeductibleSETax,
  calculateNetEarningsFromSelfEmployment,
  calculateSelfEmploymentTax,
} from '../../core/self-employment-tax';
import { dollarsToCents } from '../../core/rounding';

describe('self-employment-tax', () => {
  it('applies 92.35% net earnings factor', () => {
    const netProfit = dollarsToCents(100_000);
    const netEarnings = calculateNetEarningsFromSelfEmployment(
      netProfit,
      taxYear2025,
    );
    expect(netEarnings).toBe(Math.round(netProfit * 0.9235));
  });

  it('caps Social Security portion at wage base', () => {
    const netProfit = dollarsToCents(250_000);
    const result = calculateSelfEmploymentTax(
      {
        netProfitCents: netProfit,
        filingStatus: 'single',
      },
      taxYear2025,
    );

    const maxSsTax = Math.round(
      taxYear2025.selfEmploymentTax.socialSecurityWageBase *
        taxYear2025.selfEmploymentTax.socialSecurityRate,
    );
    expect(result.socialSecurityTax).toBe(maxSsTax);
    expect(result.netEarnings).toBeGreaterThan(
      taxYear2025.selfEmploymentTax.socialSecurityWageBase,
    );
  });

  it('returns zero SE tax below minimum net earnings threshold', () => {
    const result = calculateSelfEmploymentTax(
      {
        netProfitCents: dollarsToCents(300),
        filingStatus: 'single',
      },
      taxYear2025,
    );
    expect(result.totalSETax).toBe(0);
  });

  it('deductible SE tax equals 50% of Schedule SE tax (SS + Medicare only)', () => {
    const result = calculateSelfEmploymentTax(
      {
        netProfitCents: dollarsToCents(80_000),
        filingStatus: 'single',
      },
      taxYear2025,
    );

    const expectedDeductible = calculateDeductibleSETax(
      result.socialSecurityTax,
      result.medicareTax,
      taxYear2025,
    );

    expect(result.deductibleSETax).toBe(expectedDeductible);
    expect(result.deductibleSETax).toBe(
      Math.round((result.socialSecurityTax + result.medicareTax) * 0.5),
    );
  });

  it('calculates non-zero SE tax at moderate income', () => {
    const result = calculateSelfEmploymentTax(
      {
        netProfitCents: dollarsToCents(80_000),
        filingStatus: 'single',
      },
      taxYear2025,
    );
    expect(result.totalSETax).toBeGreaterThan(0);
    expect(result.medicareTax).toBeGreaterThan(0);
  });
});
