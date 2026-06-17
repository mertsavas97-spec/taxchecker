import { describe, expect, it } from 'vitest';
import { calculate1099Tax } from '../../calculators/1099-tax';
import { calculateSelfEmployedTax } from '../../calculators/self-employed-tax';
import { dollarsToCents } from '../../core/rounding';

describe('calculate1099Tax', () => {
  it('computes net income as gross minus expenses', () => {
    const result = calculate1099Tax({
      taxYear: 2025,
      filingStatus: 'single',
      gross1099IncomeCents: dollarsToCents(100_000),
      businessExpensesCents: dollarsToCents(20_000),
    });

    expect(result.details.net1099IncomeCents).toBe(dollarsToCents(80_000));
    expect(result.details.netSelfEmploymentIncomeCents).toBe(dollarsToCents(80_000));
  });

  it('delegates to self-employed tax outputs', () => {
    const net = dollarsToCents(80_000);
    const delegated = calculateSelfEmployedTax({
      taxYear: 2025,
      filingStatus: 'single',
      netSelfEmploymentIncomeCents: net,
    });
    const result = calculate1099Tax({
      taxYear: 2025,
      filingStatus: 'single',
      gross1099IncomeCents: dollarsToCents(100_000),
      businessExpensesCents: dollarsToCents(20_000),
    });

    expect(result.details.totalEstimatedFederalTaxCents).toBe(
      delegated.details.totalEstimatedFederalTaxCents,
    );
    expect(result.details.selfEmploymentTaxCents).toBe(
      delegated.details.selfEmploymentTaxCents,
    );
  });

  it('warns when expenses exceed gross income', () => {
    const result = calculate1099Tax({
      taxYear: 2025,
      filingStatus: 'single',
      gross1099IncomeCents: dollarsToCents(10_000),
      businessExpensesCents: dollarsToCents(15_000),
    });

    expect(result.details.net1099IncomeCents).toBe(0);
    expect(result.warnings.some((w) => w.code === 'EXPENSES_EXCEED_GROSS')).toBe(true);
  });

  it('includes gross, expense, and net result cards', () => {
    const result = calculate1099Tax({
      taxYear: 2025,
      filingStatus: 'single',
      gross1099IncomeCents: dollarsToCents(50_000),
      businessExpensesCents: dollarsToCents(5_000),
    });

    const ids = result.summary.map((c) => c.id);
    expect(ids).toContain('gross-1099-income');
    expect(ids).toContain('business-expenses');
    expect(ids).toContain('net-1099-income');
  });
});
