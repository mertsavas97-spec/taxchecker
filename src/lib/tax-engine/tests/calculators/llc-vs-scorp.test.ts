import { describe, expect, it } from 'vitest';
import { calculateLlcVsSCorp } from '../../calculators/llc-vs-scorp';
import { dollarsToCents } from '../../core/rounding';

describe('calculateLlcVsSCorp', () => {
  const baseInput = {
    taxYear: 2025,
    filingStatus: 'single' as const,
    llcBusinessProfitCents: dollarsToCents(120_000),
    sCorpOwnerSalaryCents: dollarsToCents(60_000),
    annualPayrollAdminCostCents: dollarsToCents(2_000),
  };

  it('uses LLC profit for S Corp when sCorpBusinessProfitCents is omitted', () => {
    const result = calculateLlcVsSCorp(baseInput);

    expect(result.details.sCorpBusinessProfitCents).toBe(
      baseInput.llcBusinessProfitCents,
    );
    expect(result.details.llcBusinessProfitCents).toBe(
      baseInput.llcBusinessProfitCents,
    );
  });

  it('returns both LLC and S Corp values', () => {
    const result = calculateLlcVsSCorp(baseInput);
    const ids = result.summary.map((card) => card.id);

    expect(result.details.llcAfterTaxValueCents).toBeGreaterThan(0);
    expect(result.details.sCorpAfterTaxValueCents).toBeGreaterThan(0);
    expect(ids).toContain('llc-federal-tax-burden');
    expect(ids).toContain('scorp-federal-tax-burden');
    expect(ids).toContain('llc-after-tax-value');
    expect(ids).toContain('scorp-after-tax-value');
  });

  it('includes default LLC pass-through warning', () => {
    const result = calculateLlcVsSCorp(baseInput);

    expect(
      result.warnings.some((warning) => warning.code === 'LLC_DEFAULT_PASS_THROUGH'),
    ).toBe(true);
  });

  it('includes entity and legal advice warning', () => {
    const result = calculateLlcVsSCorp(baseInput);

    expect(
      result.warnings.some((warning) => warning.code === 'NOT_ENTITY_OR_LEGAL_ADVICE'),
    ).toBe(true);
  });

  it('does not recommend S Corp or LLC', () => {
    const result = calculateLlcVsSCorp(baseInput);
    const advisoryText = result.warnings.map((warning) => warning.message).join(' ').toLowerCase();

    expect(advisoryText).not.toMatch(/\brecommend (an )?llc\b/);
    expect(advisoryText).not.toMatch(/\brecommend (an )?s corp\b/);
    expect(advisoryText).not.toMatch(/\badvise (an )?llc\b/);
    expect(advisoryText).not.toMatch(/\badvise (an )?s corp\b/);
    expect(result.summary.some((card) => card.id === 'recommended-structure')).toBe(
      false,
    );
  });

  it('handles compliance costs', () => {
    const compliance = dollarsToCents(5_000);
    const without = calculateLlcVsSCorp(baseInput);
    const withCompliance = calculateLlcVsSCorp({
      ...baseInput,
      annualPayrollAdminCostCents: compliance,
      annualStateComplianceCostCents: dollarsToCents(1_000),
      annualTaxPrepCostCents: dollarsToCents(500),
    });

    expect(withCompliance.details.sCorpComplianceCostsCents).toBe(
      compliance + dollarsToCents(1_000) + dollarsToCents(500),
    );
    expect(withCompliance.details.sCorpAfterTaxValueCents).toBeLessThan(
      without.details.sCorpAfterTaxValueCents,
    );
  });
});
