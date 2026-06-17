import { describe, expect, it } from 'vitest';
import { calculateQuarterlyTax } from '../../calculators/quarterly-tax';
import { taxYear2025 } from '../../config/tax-year-2025';
import { dollarsToCents } from '../../core/rounding';

describe('calculateQuarterlyTax', () => {
  it('returns four quarterly due dates', () => {
    const result = calculateQuarterlyTax({
      taxYear: 2025,
      filingStatus: 'single',
      netSelfEmploymentIncomeCents: dollarsToCents(80_000),
    });

    expect(result.details.quarterlyDueDates).toHaveLength(4);
    expect(result.details.quarterlyDueDates).toEqual(
      taxYear2025.estimatedTax.quarterlyDueDates,
    );

    const dueDateCards = result.summary.filter((c) => c.id.endsWith('-due-date'));
    expect(dueDateCards).toHaveLength(4);
  });

  it('returns a safe harbor target', () => {
    const result = calculateQuarterlyTax({
      taxYear: 2025,
      filingStatus: 'single',
      netSelfEmploymentIncomeCents: dollarsToCents(80_000),
      priorYearTaxCents: dollarsToCents(15_000),
      priorYearAdjustedGrossIncomeCents: dollarsToCents(90_000),
    });

    expect(result.details.safeHarborTargetCents).toBeGreaterThan(0);
    expect(result.summary.some((c) => c.id === 'safe-harbor-target')).toBe(true);
    expect(result.details.safeHarborRuleUsed).toBeTruthy();
  });

  it('accounts for estimated payments already made in remaining tax', () => {
    const withoutPayments = calculateQuarterlyTax({
      taxYear: 2025,
      filingStatus: 'single',
      netSelfEmploymentIncomeCents: dollarsToCents(80_000),
    });

    const withPayments = calculateQuarterlyTax({
      taxYear: 2025,
      filingStatus: 'single',
      netSelfEmploymentIncomeCents: dollarsToCents(80_000),
      estimatedPaymentsMadeCents: dollarsToCents(2_000),
    });

    expect(withPayments.details.remainingEstimatedTaxCents).toBe(
      withoutPayments.details.remainingEstimatedTaxCents - dollarsToCents(2_000),
    );
  });

  it('does not include penalty calculation', () => {
    const result = calculateQuarterlyTax({
      taxYear: 2025,
      filingStatus: 'single',
      netSelfEmploymentIncomeCents: dollarsToCents(80_000),
    });

    expect(result.warnings.some((w) => w.code === 'PENALTY_EXCLUDED')).toBe(true);
    expect(result.breakdown.some((b) => b.label.toLowerCase().includes('penalty'))).toBe(
      false,
    );
  });
});
