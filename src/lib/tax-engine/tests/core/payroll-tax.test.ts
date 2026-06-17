import { describe, expect, it } from 'vitest';
import { taxYear2025 } from '../../config/tax-year-2025';
import {
  calculateApproximateW2FederalLiability,
  calculateEmployeeAdditionalMedicareTax,
  calculateEmployeeFicaTax,
  calculateEmployeeMedicareTax,
  calculateEmployeeSocialSecurityTax,
  calculateEmployerFicaTax,
} from '../../core/payroll-tax';
import { dollarsToCents } from '../../core/rounding';

describe('payroll-tax', () => {
  it('caps Social Security tax at the wage base', () => {
    const wages = dollarsToCents(250_000);
    const ssTax = calculateEmployeeSocialSecurityTax(wages, taxYear2025);
    const expected = Math.round(
      taxYear2025.payrollTax.socialSecurityWageBase *
        taxYear2025.payrollTax.socialSecurityRateEmployee,
    );

    expect(ssTax).toBe(expected);
    expect(ssTax).toBeLessThan(
      Math.round(wages * taxYear2025.payrollTax.socialSecurityRateEmployee),
    );
  });

  it('applies Medicare tax to all W-2 wages', () => {
    const wages = dollarsToCents(80_000);
    const medicareTax = calculateEmployeeMedicareTax(
      wages,
      'single',
      taxYear2025,
    );

    expect(medicareTax).toBe(
      Math.round(wages * taxYear2025.payrollTax.medicareRateEmployee),
    );
  });

  it('applies Additional Medicare tax above the filing-status threshold', () => {
    const wages = dollarsToCents(250_000);
    const threshold = taxYear2025.additionalMedicareTax.thresholds.single;
    const additionalMedicare = calculateEmployeeAdditionalMedicareTax(
      wages,
      'single',
      taxYear2025,
    );

    expect(additionalMedicare).toBe(
      Math.round((wages - threshold) * taxYear2025.additionalMedicareTax.rate),
    );
    expect(
      calculateEmployeeFicaTax(wages, 'single', taxYear2025),
    ).toBeGreaterThan(
      calculateEmployeeSocialSecurityTax(wages, taxYear2025) +
        calculateEmployeeMedicareTax(wages, 'single', taxYear2025),
    );
  });

  it('treats employer FICA as informational and excludes it from employee after-tax income', () => {
    const wages = dollarsToCents(100_000);
    const employerFica = calculateEmployerFicaTax(wages, taxYear2025);
    const liability = calculateApproximateW2FederalLiability(
      {
        taxYear: 2025,
        filingStatus: 'single',
        w2WagesCents: wages,
      },
      taxYear2025,
    );

    expect(employerFica).toBeGreaterThan(0);
    expect(liability.employerFicaTaxCents).toBe(employerFica);
    expect(liability.estimatedAfterTaxIncomeCents).toBe(
      wages - liability.employeeFicaTaxCents - liability.federalIncomeTaxCents,
    );
  });

  it('reduces remaining federal liability when withholding is provided', () => {
    const wages = dollarsToCents(100_000);
    const withoutWithholding = calculateApproximateW2FederalLiability(
      {
        taxYear: 2025,
        filingStatus: 'single',
        w2WagesCents: wages,
      },
      taxYear2025,
    );
    const withholding = dollarsToCents(10_000);
    const withWithholding = calculateApproximateW2FederalLiability(
      {
        taxYear: 2025,
        filingStatus: 'single',
        w2WagesCents: wages,
        federalWithholdingCents: withholding,
      },
      taxYear2025,
    );

    expect(withWithholding.remainingFederalLiabilityCents).toBe(
      Math.max(
        0,
        withoutWithholding.totalEmployeeFederalTaxCents - withholding,
      ),
    );
    expect(withWithholding.remainingFederalLiabilityCents).toBeLessThan(
      withoutWithholding.remainingFederalLiabilityCents,
    );
    expect(withWithholding.estimatedAfterTaxIncomeCents).toBe(
      withoutWithholding.estimatedAfterTaxIncomeCents,
    );
  });
});
