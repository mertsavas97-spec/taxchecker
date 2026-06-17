import { describe, expect, it } from 'vitest';
import { calculateEstimatedTax } from '../../calculators/estimated-tax';
import { calculateSelfEmployedTax } from '../../calculators/self-employed-tax';
import { dollarsToCents } from '../../core/rounding';

describe('calculateEstimatedTax', () => {
  it('self-employed path matches base self-employed annual tax', () => {
    const input = {
      taxYear: 2025,
      filingStatus: 'single' as const,
      incomeType: 'self_employed' as const,
      netSelfEmploymentIncomeCents: dollarsToCents(90_000),
      otherIncomeCents: dollarsToCents(5_000),
    };

    const base = calculateSelfEmployedTax({
      taxYear: input.taxYear,
      filingStatus: input.filingStatus,
      netSelfEmploymentIncomeCents: input.netSelfEmploymentIncomeCents,
      otherIncomeCents: input.otherIncomeCents,
    });

    const result = calculateEstimatedTax(input);

    expect(result.details.estimatedAnnualFederalTaxCents).toBe(
      base.details.totalEstimatedFederalTaxCents,
    );
  });

  it('mixed income subtracts federal withholding from remaining tax', () => {
    const withoutWithholding = calculateEstimatedTax({
      taxYear: 2025,
      filingStatus: 'single',
      incomeType: 'mixed',
      netSelfEmploymentIncomeCents: dollarsToCents(40_000),
      w2WagesCents: dollarsToCents(60_000),
      otherIncomeCents: dollarsToCents(2_000),
    });

    const withWithholding = calculateEstimatedTax({
      taxYear: 2025,
      filingStatus: 'single',
      incomeType: 'mixed',
      netSelfEmploymentIncomeCents: dollarsToCents(40_000),
      w2WagesCents: dollarsToCents(60_000),
      otherIncomeCents: dollarsToCents(2_000),
      federalWithholdingCents: dollarsToCents(8_000),
    });

    expect(withWithholding.details.remainingTaxCents).toBe(
      withoutWithholding.details.remainingTaxCents - dollarsToCents(8_000),
    );
  });

  it('warns that withholding treatment is simplified for mixed income', () => {
    const result = calculateEstimatedTax({
      taxYear: 2025,
      filingStatus: 'single',
      incomeType: 'mixed',
      w2WagesCents: dollarsToCents(50_000),
      federalWithholdingCents: dollarsToCents(3_000),
    });

    expect(result.warnings.some((w) => w.code === 'WITHHOLDING_SIMPLIFIED')).toBe(true);
  });

  it('warns that state taxes are excluded', () => {
    const result = calculateEstimatedTax({
      taxYear: 2025,
      filingStatus: 'single',
      incomeType: 'self_employed',
      netSelfEmploymentIncomeCents: dollarsToCents(50_000),
    });

    expect(result.warnings.some((w) => w.code === 'STATE_EXCLUDED')).toBe(true);
  });
});
