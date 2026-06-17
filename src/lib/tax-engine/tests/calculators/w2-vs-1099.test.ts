import { describe, expect, it } from 'vitest';
import { calculateW2Vs1099 } from '../../calculators/w2-vs-1099';
import { dollarsToCents } from '../../core/rounding';
import type { W2Vs1099Input } from '../../types';

function baseInput(overrides: Partial<W2Vs1099Input> = {}): W2Vs1099Input {
  return {
    taxYear: 2025,
    filingStatus: 'single',
    w2SalaryCents: dollarsToCents(100_000),
    contractorGrossIncomeCents: dollarsToCents(100_000),
    contractorBusinessExpensesCents: dollarsToCents(10_000),
    ...overrides,
  };
}

describe('calculateW2Vs1099', () => {
  it('returns result cards for both W-2 and 1099 paths', () => {
    const result = calculateW2Vs1099(baseInput());
    const ids = result.summary.map((card) => card.id);

    expect(ids).toContain('w2-after-tax');
    expect(ids).toContain('contractor-after-tax');
    expect(ids).toContain('employee-fica');
    expect(ids).toContain('self-employment-tax');
    expect(ids).toContain('w2-total-value');
    expect(ids).toContain('contractor-total-value');
    expect(result.details.w2AfterTaxIncomeCents).toBeGreaterThan(0);
    expect(result.details.contractorAfterTaxIncomeCents).toBeGreaterThan(0);
  });

  it('increases total W-2 value when benefits are provided', () => {
    const withoutBenefits = calculateW2Vs1099(baseInput());
    const benefits = dollarsToCents(12_000);
    const withBenefits = calculateW2Vs1099(
      baseInput({ annualBenefitsValueCents: benefits }),
    );

    expect(withBenefits.details.w2TotalEstimatedValueCents).toBe(
      withoutBenefits.details.w2TotalEstimatedValueCents + benefits,
    );
    expect(withBenefits.details.annualBenefitsValueCents).toBe(benefits);
  });

  it('reduces 1099 value when contractor extra costs are provided', () => {
    const withoutExtra = calculateW2Vs1099(baseInput());
    const extraCosts = dollarsToCents(5_000);
    const withExtra = calculateW2Vs1099(
      baseInput({ contractorExtraCostsCents: extraCosts }),
    );

    expect(withExtra.details.contractorTotalEstimatedValueCents).toBe(
      withoutExtra.details.contractorTotalEstimatedValueCents - extraCosts,
    );
    expect(withExtra.details.contractorExtraCostsCents).toBe(extraCosts);
  });

  it('returns break-even contractor gross income', () => {
    const result = calculateW2Vs1099(
      baseInput({
        annualBenefitsValueCents: dollarsToCents(8_000),
        contractorExtraCostsCents: dollarsToCents(2_000),
      }),
    );

    expect(result.details.breakEvenContractorGrossIncomeCents).not.toBeNull();
    expect(result.summary.some((card) => card.id === 'break-even-gross')).toBe(
      true,
    );
  });

  it('returns hourly break-even when hoursPerYear is provided', () => {
    const hoursPerYear = 2_000;
    const result = calculateW2Vs1099(
      baseInput({
        hoursPerYear,
      }),
    );

    expect(result.details.breakEvenContractorGrossIncomeCents).not.toBeNull();
    expect(result.details.breakEvenContractorHourlyRateCents).toBe(
      Math.round(result.details.breakEvenContractorGrossIncomeCents! / hoursPerYear),
    );
    expect(result.summary.some((card) => card.id === 'break-even-hourly')).toBe(
      true,
    );
  });

  it('includes benefits and expense limitation warnings', () => {
    const result = calculateW2Vs1099(baseInput());
    const codes = result.warnings.map((warning) => warning.code);

    expect(codes).toContain('BENEFITS_USER_ENTERED');
    expect(codes).toContain('CONTRACTOR_EXPENSES_USER_ENTERED');
    expect(codes).toContain('EMPLOYMENT_PROTECTIONS_LIMITED');
    expect(codes).toContain('NOT_LEGAL_OR_EMPLOYMENT_ADVICE');
  });

  it('includes state tax excluded warning', () => {
    const result = calculateW2Vs1099(baseInput());

    expect(result.warnings.some((warning) => warning.code === 'STATE_EXCLUDED')).toBe(
      true,
    );
  });

  it('does not mutate the input object', () => {
    const input = baseInput({
      w2SalaryCents: dollarsToCents(90_000),
      contractorGrossIncomeCents: dollarsToCents(110_000),
      contractorBusinessExpensesCents: dollarsToCents(5_000),
      annualBenefitsValueCents: dollarsToCents(3_000),
      contractorExtraCostsCents: dollarsToCents(1_000),
    });
    const snapshot = JSON.parse(JSON.stringify(input));

    calculateW2Vs1099(input);

    expect(input).toEqual(snapshot);
  });
});
