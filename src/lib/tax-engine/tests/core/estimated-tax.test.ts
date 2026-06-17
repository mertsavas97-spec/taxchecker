import { describe, expect, it } from 'vitest';
import { taxYear2025 } from '../../config/tax-year-2025';
import {
  calculateQuarterlyPayments,
  calculateRemainingEstimatedTax,
  computeSafeHarborTargets,
} from '../../core/estimated-tax';
import { dollarsToCents } from '../../core/rounding';

describe('estimated-tax core', () => {
  it('calculates 90% current-year safe harbor target', () => {
    const currentTax = dollarsToCents(50_000);
    const result = computeSafeHarborTargets(
      {
        currentYearEstimatedTaxCents: currentTax,
        filingStatus: 'single',
        taxYear: 2025,
      },
      taxYear2025,
    );

    expect(result.currentYear90PercentTargetCents).toBe(dollarsToCents(45_000));
    expect(result.recommendedSafeHarborTargetCents).toBe(dollarsToCents(45_000));
    expect(result.safeHarborRuleUsed).toBe('current_year_90');
  });

  it('uses 100% prior-year safe harbor when AGI is below threshold', () => {
    const result = computeSafeHarborTargets(
      {
        currentYearEstimatedTaxCents: dollarsToCents(60_000),
        priorYearTaxCents: dollarsToCents(40_000),
        priorYearAdjustedGrossIncomeCents: dollarsToCents(120_000),
        filingStatus: 'single',
        taxYear: 2025,
      },
      taxYear2025,
    );

    expect(result.priorYear100PercentTargetCents).toBe(dollarsToCents(40_000));
    expect(result.recommendedSafeHarborTargetCents).toBe(dollarsToCents(40_000));
    expect(result.safeHarborRuleUsed).toBe('prior_year_100');
  });

  it('uses 110% prior-year safe harbor when AGI exceeds threshold', () => {
    const result = computeSafeHarborTargets(
      {
        currentYearEstimatedTaxCents: dollarsToCents(60_000),
        priorYearTaxCents: dollarsToCents(40_000),
        priorYearAdjustedGrossIncomeCents: dollarsToCents(180_000),
        filingStatus: 'single',
        taxYear: 2025,
      },
      taxYear2025,
    );

    expect(result.priorYear110PercentTargetCents).toBe(dollarsToCents(44_000));
    expect(result.recommendedSafeHarborTargetCents).toBe(dollarsToCents(44_000));
    expect(result.safeHarborRuleUsed).toBe('prior_year_110');
  });

  it('applies separate MFS AGI threshold for 110% rule', () => {
    const result = computeSafeHarborTargets(
      {
        currentYearEstimatedTaxCents: dollarsToCents(60_000),
        priorYearTaxCents: dollarsToCents(30_000),
        priorYearAdjustedGrossIncomeCents: dollarsToCents(80_000),
        filingStatus: 'married_filing_separately',
        taxYear: 2025,
      },
      taxYear2025,
    );

    expect(result.recommendedSafeHarborTargetCents).toBe(dollarsToCents(33_000));
    expect(result.safeHarborRuleUsed).toBe('prior_year_110');
  });

  it('warns and uses 90% when prior-year inputs are missing', () => {
    const result = computeSafeHarborTargets(
      {
        currentYearEstimatedTaxCents: dollarsToCents(25_000),
        priorYearTaxCents: dollarsToCents(20_000),
        filingStatus: 'single',
        taxYear: 2025,
      },
      taxYear2025,
    );

    expect(result.recommendedSafeHarborTargetCents).toBe(dollarsToCents(22_500));
    expect(result.warnings.some((w) => w.code === 'SAFE_HARBOR_PRIOR_YEAR_INCOMPLETE')).toBe(
      true,
    );
  });

  it('returns quarterly due dates from TaxYearConfig', () => {
    const result = computeSafeHarborTargets(
      {
        currentYearEstimatedTaxCents: dollarsToCents(10_000),
        filingStatus: 'single',
        taxYear: 2025,
      },
      taxYear2025,
    );

    expect(result.quarterlyDueDates).toEqual(
      taxYear2025.estimatedTax.quarterlyDueDates,
    );
  });

  it('reduces remaining tax when estimated payments were made', () => {
    const total = dollarsToCents(20_000);
    const paid = dollarsToCents(5_000);
    expect(calculateRemainingEstimatedTax(total, paid)).toBe(dollarsToCents(15_000));

    const quarters = calculateQuarterlyPayments(total, paid);
    expect(quarters.reduce((a, b) => a + b, 0)).toBe(dollarsToCents(15_000));
  });
});
