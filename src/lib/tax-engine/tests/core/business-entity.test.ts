import { describe, expect, it } from 'vitest';
import { taxYear2025 } from '../../config/tax-year-2025';
import {
  calculateSCorpBreakEvenProfit,
  calculateSCorpFederalBurden,
  calculateSoleProprietorFederalBurden,
  compareSoleProprietorVsSCorp,
  LOW_SALARY_TO_PROFIT_RATIO_WARNING,
} from '../../core/business-entity';
import { calculateAnnualFederalLiability } from '../../core/annual-federal-liability';
import { dollarsToCents } from '../../core/rounding';

describe('business-entity', () => {
  it('sole proprietor path reuses SE logic and includes SE tax', () => {
    const profit = dollarsToCents(100_000);
    const liability = calculateAnnualFederalLiability(
      {
        filingStatus: 'single',
        netSelfEmploymentIncomeCents: profit,
      },
      taxYear2025,
    );
    const result = calculateSoleProprietorFederalBurden(
      {
        taxYear: 2025,
        filingStatus: 'single',
        businessProfitCents: profit,
      },
      taxYear2025,
    );

    expect(result.selfEmploymentTaxCents).toBe(liability.selfEmploymentTaxCents);
    expect(result.federalIncomeTaxCents).toBe(liability.federalIncomeTaxCents);
    expect(result.totalFederalTaxBurdenCents).toBe(
      liability.totalEstimatedFederalTaxCents,
    );
    expect(result.selfEmploymentTaxCents).toBeGreaterThan(0);
  });

  it('S Corp salary creates employee and employer FICA', () => {
    const result = calculateSCorpFederalBurden(
      {
        taxYear: 2025,
        filingStatus: 'single',
        businessProfitCents: dollarsToCents(120_000),
        ownerSalaryCents: dollarsToCents(60_000),
      },
      taxYear2025,
    );

    expect(result.employeeFicaCents).toBeGreaterThan(0);
    expect(result.employerFicaCents).toBeGreaterThan(0);
    expect(result.distributionCents).toBe(dollarsToCents(60_000));
  });

  it('distribution is not subject to SE tax', () => {
    const profit = dollarsToCents(150_000);
    const salary = dollarsToCents(70_000);
    const sole = calculateSoleProprietorFederalBurden(
      {
        taxYear: 2025,
        filingStatus: 'single',
        businessProfitCents: profit,
      },
      taxYear2025,
    );
    const scorp = calculateSCorpFederalBurden(
      {
        taxYear: 2025,
        filingStatus: 'single',
        businessProfitCents: profit,
        ownerSalaryCents: salary,
      },
      taxYear2025,
    );

    expect(scorp.distributionCents).toBe(profit - salary);
    expect(sole.selfEmploymentTaxCents).toBeGreaterThan(
      scorp.employeeFicaCents + scorp.employerFicaCents,
    );
  });

  it('compliance costs reduce S Corp net value', () => {
    const withoutCosts = calculateSCorpFederalBurden(
      {
        taxYear: 2025,
        filingStatus: 'single',
        businessProfitCents: dollarsToCents(100_000),
        ownerSalaryCents: dollarsToCents(50_000),
      },
      taxYear2025,
    );
    const compliance = dollarsToCents(4_000);
    const withCosts = calculateSCorpFederalBurden(
      {
        taxYear: 2025,
        filingStatus: 'single',
        businessProfitCents: dollarsToCents(100_000),
        ownerSalaryCents: dollarsToCents(50_000),
        annualPayrollAdminCostCents: compliance,
      },
      taxYear2025,
    );

    expect(withCosts.netValueCents).toBe(
      withoutCosts.netValueCents - compliance,
    );
    expect(withCosts.complianceCostsCents).toBe(compliance);
  });

  it('owner salary above profit returns validation error and warning', () => {
    const result = calculateSCorpFederalBurden(
      {
        taxYear: 2025,
        filingStatus: 'single',
        businessProfitCents: dollarsToCents(50_000),
        ownerSalaryCents: dollarsToCents(80_000),
      },
      taxYear2025,
    );

    expect(result.validationErrors.some((e) => e.code === 'INCONSISTENT')).toBe(
      true,
    );
    expect(result.warnings.some((w) => w.code === 'SALARY_EXCEEDS_PROFIT')).toBe(
      true,
    );
    expect(result.ownerSalaryCents).toBe(dollarsToCents(50_000));
    expect(result.distributionCents).toBe(0);
  });

  it('low salary ratio returns warning without recommending a salary', () => {
    const profit = dollarsToCents(200_000);
    const lowSalary = Math.floor(profit * (LOW_SALARY_TO_PROFIT_RATIO_WARNING - 0.1));
    const result = calculateSCorpFederalBurden(
      {
        taxYear: 2025,
        filingStatus: 'single',
        businessProfitCents: profit,
        ownerSalaryCents: lowSalary,
      },
      taxYear2025,
    );

    const lowSalaryWarning = result.warnings.find((w) => w.code === 'LOW_SALARY_RATIO');
    expect(lowSalaryWarning).toBeDefined();
    expect(lowSalaryWarning?.message.toLowerCase()).toContain('does not evaluate');
    expect(lowSalaryWarning?.message.toLowerCase()).not.toMatch(/\bpay yourself\b/);
  });

  it('returns break-even profit for a typical scenario', () => {
    const result = calculateSCorpBreakEvenProfit(
      {
        taxYear: 2025,
        filingStatus: 'single',
        ownerSalaryCents: dollarsToCents(60_000),
        annualPayrollAdminCostCents: dollarsToCents(2_000),
        annualTaxPrepCostCents: dollarsToCents(1_500),
      },
      taxYear2025,
    );

    expect(result.breakEvenProfitCents).not.toBeNull();
    expect(result.breakEvenProfitCents!).toBeGreaterThan(0);
  });

  it('returns warning when break-even is not found', () => {
    const result = calculateSCorpBreakEvenProfit(
      {
        taxYear: 2025,
        filingStatus: 'single',
        ownerSalaryCents: dollarsToCents(1_000_000),
        annualPayrollAdminCostCents: dollarsToCents(50_000),
        annualStateComplianceCostCents: dollarsToCents(25_000),
        annualTaxPrepCostCents: dollarsToCents(20_000),
      },
      taxYear2025,
    );

    expect(result.breakEvenProfitCents).toBeNull();
    expect(
      result.warnings.some((warning) => warning.code === 'BREAK_EVEN_NOT_FOUND'),
    ).toBe(true);
  });

  it('comparison returns both paths', () => {
    const comparison = compareSoleProprietorVsSCorp(
      {
        taxYear: 2025,
        filingStatus: 'single',
        businessProfitCents: dollarsToCents(100_000),
        ownerSalaryCents: dollarsToCents(50_000),
      },
      taxYear2025,
    );

    expect(comparison.soleProprietor.netValueCents).toBeGreaterThan(0);
    expect(comparison.sCorp.netValueCents).toBeGreaterThan(0);
    expect(comparison.taxBurdenDifferenceCents).toBeDefined();
  });
});
