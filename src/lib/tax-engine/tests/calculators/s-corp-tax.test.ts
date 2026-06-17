import { describe, expect, it } from 'vitest';
import { calculateSCorpTax } from '../../calculators/s-corp-tax';
import { dollarsToCents } from '../../core/rounding';

describe('calculateSCorpTax', () => {
  const baseInput = {
    taxYear: 2025,
    filingStatus: 'single' as const,
    businessProfitCents: dollarsToCents(120_000),
    ownerSalaryCents: dollarsToCents(60_000),
    annualPayrollAdminCostCents: dollarsToCents(1_500),
  };

  it('returns required result cards', () => {
    const result = calculateSCorpTax(baseInput);
    const ids = result.summary.map((card) => card.id);

    expect(ids).toContain('business-profit');
    expect(ids).toContain('owner-salary');
    expect(ids).toContain('distribution');
    expect(ids).toContain('employee-fica');
    expect(ids).toContain('employer-fica');
    expect(ids).toContain('federal-income-tax');
    expect(ids).toContain('total-federal-tax-burden');
    expect(ids).toContain('scorp-net-value');
    expect(ids).toContain('sole-prop-tax-burden');
    expect(ids).toContain('savings-vs-sole-prop');
    expect(ids).toContain('compliance-costs');
    expect(ids).toContain('break-even-profit');
  });

  it('shows estimated distribution', () => {
    const result = calculateSCorpTax(baseInput);

    expect(result.details.distributionCents).toBe(
      baseInput.businessProfitCents - baseInput.ownerSalaryCents,
    );
    expect(result.summary.find((card) => card.id === 'distribution')?.value).toBe(
      result.details.distributionCents,
    );
  });

  it('includes reasonable compensation warning', () => {
    const result = calculateSCorpTax(baseInput);

    expect(
      result.warnings.some(
        (warning) => warning.code === 'REASONABLE_COMPENSATION_USER_ENTERED',
      ),
    ).toBe(true);
  });

  it('includes QBI exclusion warning', () => {
    const result = calculateSCorpTax(baseInput);

    expect(result.warnings.some((warning) => warning.code === 'QBI_EXCLUDED')).toBe(
      true,
    );
  });

  it('includes state exclusion warning', () => {
    const result = calculateSCorpTax(baseInput);

    expect(result.warnings.some((warning) => warning.code === 'STATE_EXCLUDED')).toBe(
      true,
    );
  });

  it('does not produce recommendation language', () => {
    const result = calculateSCorpTax(baseInput);
    const advisoryText = result.warnings.map((warning) => warning.message).join(' ').toLowerCase();

    expect(advisoryText).not.toMatch(/\brecommend electing\b/);
    expect(advisoryText).not.toMatch(/\badvise electing\b/);
    expect(result.warnings.some((w) => w.code === 'NO_S_CORP_ELECTION_ADVICE')).toBe(
      true,
    );
  });
});
