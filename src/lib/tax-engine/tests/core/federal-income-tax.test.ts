import { describe, expect, it } from 'vitest';
import { taxYear2025 } from '../../config/tax-year-2025';
import {
  calculateFederalIncomeTax,
  calculateMarginalRate,
  calculateTaxableIncome,
} from '../../core/federal-income-tax';
import { dollarsToCents } from '../../core/rounding';

describe('federal-income-tax', () => {
  it('standard deduction reduces taxable income', () => {
    const agi = dollarsToCents(50_000);
    const taxable = calculateTaxableIncome(
      {
        adjustedGrossIncomeCents: agi,
        filingStatus: 'single',
        useStandardDeduction: true,
      },
      taxYear2025,
    );
    expect(taxable).toBe(dollarsToCents(35_000));
  });

  it('negative taxable income results in zero federal income tax', () => {
    const agi = dollarsToCents(10_000);
    const taxable = calculateTaxableIncome(
      {
        adjustedGrossIncomeCents: agi,
        filingStatus: 'single',
        useStandardDeduction: true,
      },
      taxYear2025,
    );
    expect(taxable).toBe(0);

    const result = calculateFederalIncomeTax(taxable, 'single', taxYear2025);
    expect(result.tax).toBe(0);
    expect(result.effectiveRate).toBe(0);
  });

  it('single bracket boundary at top of 10% bracket', () => {
    const taxable = dollarsToCents(11_925);
    const result = calculateFederalIncomeTax(taxable, 'single', taxYear2025);
    expect(result.tax).toBe(dollarsToCents(1_192.5));
    expect(result.marginalRate).toBe(0.1);
  });

  it('married filing separately top bracket differs from single', () => {
    const taxable = dollarsToCents(376_000);

    const mfsMarginal = calculateMarginalRate(
      taxable,
      'married_filing_separately',
      taxYear2025,
    );
    const singleMarginal = calculateMarginalRate(
      taxable,
      'single',
      taxYear2025,
    );

    expect(mfsMarginal).toBe(0.37);
    expect(singleMarginal).toBe(0.35);
  });
});
