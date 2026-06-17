import { describe, expect, it } from 'vitest';
import { calculateSelfEmployedTax } from '../../calculators/self-employed-tax';
import { dollarsToCents } from '../../core/rounding';

const REQUIRED_CARD_IDS = [
  'net-self-employment-income',
  'net-earnings-se-tax',
  'self-employment-tax',
  'deductible-se-tax',
  'federal-taxable-income',
  'federal-income-tax',
  'total-federal-tax',
  'effective-rate',
  'marginal-rate',
  'quarterly-payment',
  'monthly-reserve',
  'after-tax-income',
] as const;

describe('calculateSelfEmployedTax', () => {
  it('returns all required result cards', () => {
    const result = calculateSelfEmployedTax({
      taxYear: 2025,
      filingStatus: 'single',
      netSelfEmploymentIncomeCents: dollarsToCents(80_000),
    });

    const cardIds = result.summary.map((card) => card.id);
    for (const id of REQUIRED_CARD_IDS) {
      expect(cardIds).toContain(id);
    }
  });

  it('warns that state taxes are excluded', () => {
    const result = calculateSelfEmployedTax({
      taxYear: 2025,
      filingStatus: 'single',
      netSelfEmploymentIncomeCents: dollarsToCents(50_000),
    });

    expect(
      result.warnings.some((w) => w.code === 'STATE_EXCLUDED'),
    ).toBe(true);
    expect(
      result.warnings.some((w) =>
        w.message.toLowerCase().includes('state'),
      ),
    ).toBe(true);
  });

  it('warns that QBI is excluded', () => {
    const result = calculateSelfEmployedTax({
      taxYear: 2025,
      filingStatus: 'single',
      netSelfEmploymentIncomeCents: dollarsToCents(50_000),
    });

    expect(result.warnings.some((w) => w.code === 'QBI_EXCLUDED')).toBe(true);
    expect(
      result.warnings.some((w) => w.message.includes('199A')),
    ).toBe(true);
  });

  it('computes total federal tax as SE tax plus income tax', () => {
    const result = calculateSelfEmployedTax({
      taxYear: 2025,
      filingStatus: 'single',
      netSelfEmploymentIncomeCents: dollarsToCents(100_000),
    });

    expect(result.details.totalEstimatedFederalTaxCents).toBe(
      result.details.selfEmploymentTaxCents +
        result.details.federalIncomeTaxCents,
    );
    expect(result.metadata.configVerified).toBe(true);
  });

  it('subtracts estimated payments from remaining tax owed', () => {
    const result = calculateSelfEmployedTax({
      taxYear: 2025,
      filingStatus: 'single',
      netSelfEmploymentIncomeCents: dollarsToCents(100_000),
      estimatedPaymentsMadeCents: dollarsToCents(5_000),
    });

    expect(result.details.remainingTaxOwedCents).toBe(
      result.details.totalEstimatedFederalTaxCents - dollarsToCents(5_000),
    );
  });
});
