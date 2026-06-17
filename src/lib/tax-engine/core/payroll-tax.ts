import type { FilingStatus, MoneyCents, TaxWarning, TaxYearConfig } from '../types';
import { calculateFederalIncomeTaxFromAgi } from './federal-income-tax';
import { multiplyCentsByRate, roundCents } from './rounding';

export interface W2FederalLiabilityInput {
  taxYear: number;
  filingStatus: FilingStatus;
  w2WagesCents: MoneyCents;
  federalWithholdingCents?: MoneyCents;
  preTaxBenefitsCents?: MoneyCents;
}

export interface W2FederalLiabilityResult {
  grossW2WagesCents: MoneyCents;
  taxableWagesForIncomeTaxCents: MoneyCents;
  socialSecurityTaxCents: MoneyCents;
  medicareTaxCents: MoneyCents;
  additionalMedicareTaxCents: MoneyCents;
  employeeFicaTaxCents: MoneyCents;
  employerSocialSecurityTaxCents: MoneyCents;
  employerMedicareTaxCents: MoneyCents;
  employerFicaTaxCents: MoneyCents;
  federalIncomeTaxCents: MoneyCents;
  totalEmployeeFederalTaxCents: MoneyCents;
  federalWithholdingCents: MoneyCents;
  remainingFederalLiabilityCents: MoneyCents;
  estimatedAfterTaxIncomeCents: MoneyCents;
  warnings: TaxWarning[];
}

/** Employee Social Security: 6.2% up to wage base */
export function calculateEmployeeSocialSecurityTax(
  w2WagesCents: MoneyCents,
  config: TaxYearConfig,
): MoneyCents {
  const wages = Math.max(0, w2WagesCents);
  const taxable = Math.min(wages, config.payrollTax.socialSecurityWageBase);
  return multiplyCentsByRate(taxable, config.payrollTax.socialSecurityRateEmployee);
}

/** Employee Medicare: 1.45% on all wages */
export function calculateEmployeeMedicareTax(
  w2WagesCents: MoneyCents,
  _filingStatus: FilingStatus,
  config: TaxYearConfig,
): MoneyCents {
  const wages = Math.max(0, w2WagesCents);
  return multiplyCentsByRate(wages, config.payrollTax.medicareRateEmployee);
}

/** Additional Medicare: 0.9% on wages above filing-status threshold */
export function calculateEmployeeAdditionalMedicareTax(
  w2WagesCents: MoneyCents,
  filingStatus: FilingStatus,
  config: TaxYearConfig,
): MoneyCents {
  const wages = Math.max(0, w2WagesCents);
  const threshold = config.additionalMedicareTax.thresholds[filingStatus];
  const excess = Math.max(0, wages - threshold);
  return multiplyCentsByRate(excess, config.additionalMedicareTax.rate);
}

/** Employee FICA = SS + Medicare + Additional Medicare */
export function calculateEmployeeFicaTax(
  w2WagesCents: MoneyCents,
  filingStatus: FilingStatus,
  config: TaxYearConfig,
): MoneyCents {
  const socialSecurity = calculateEmployeeSocialSecurityTax(w2WagesCents, config);
  const medicare = calculateEmployeeMedicareTax(w2WagesCents, filingStatus, config);
  const additionalMedicare = calculateEmployeeAdditionalMedicareTax(
    w2WagesCents,
    filingStatus,
    config,
  );
  return roundCents(socialSecurity + medicare + additionalMedicare);
}

/** Employer FICA (informational): 6.2% capped + 1.45% uncapped — no Additional Medicare */
export function calculateEmployerFicaTax(
  w2WagesCents: MoneyCents,
  config: TaxYearConfig,
): MoneyCents {
  const wages = Math.max(0, w2WagesCents);
  const ssTaxable = Math.min(wages, config.payrollTax.socialSecurityWageBase);
  const employerSs = multiplyCentsByRate(
    ssTaxable,
    config.payrollTax.socialSecurityRateEmployer,
  );
  const employerMedicare = multiplyCentsByRate(
    wages,
    config.payrollTax.medicareRateEmployer,
  );
  return roundCents(employerSs + employerMedicare);
}

/** W-2 federal income tax + employee FICA with withholding offset */
export function calculateApproximateW2FederalLiability(
  input: W2FederalLiabilityInput,
  config: TaxYearConfig,
): W2FederalLiabilityResult {
  const warnings: TaxWarning[] = [];
  const grossWages = Math.max(0, input.w2WagesCents);
  const preTaxBenefits = Math.max(0, input.preTaxBenefitsCents ?? 0);
  const federalWithholding = Math.max(0, input.federalWithholdingCents ?? 0);

  const taxableWagesForIncomeTax = Math.max(0, grossWages - preTaxBenefits);

  if (preTaxBenefits > 0) {
    warnings.push({
      code: 'FICA_PRETAX_SIMPLIFIED',
      message:
        'Pre-tax benefits reduce federal income tax wages only. FICA is computed on gross W-2 wages in this estimate.',
    });
  }

  const socialSecurityTax = calculateEmployeeSocialSecurityTax(grossWages, config);
  const medicareTax = calculateEmployeeMedicareTax(
    grossWages,
    input.filingStatus,
    config,
  );
  const additionalMedicareTax = calculateEmployeeAdditionalMedicareTax(
    grossWages,
    input.filingStatus,
    config,
  );
  const employeeFicaTax = roundCents(
    socialSecurityTax + medicareTax + additionalMedicareTax,
  );

  const federalIncomeResult = calculateFederalIncomeTaxFromAgi(
    {
      adjustedGrossIncomeCents: taxableWagesForIncomeTax,
      filingStatus: input.filingStatus,
      useStandardDeduction: true,
    },
    config,
  );

  const federalIncomeTax = federalIncomeResult.tax;
  const totalEmployeeFederalTax = roundCents(employeeFicaTax + federalIncomeTax);
  const remainingFederalLiability = Math.max(
    0,
    totalEmployeeFederalTax - federalWithholding,
  );
  const estimatedAfterTaxIncome = roundCents(
    grossWages - employeeFicaTax - federalIncomeTax,
  );

  const employerSocialSecurityTax = multiplyCentsByRate(
    Math.min(grossWages, config.payrollTax.socialSecurityWageBase),
    config.payrollTax.socialSecurityRateEmployer,
  );
  const employerMedicareTax = multiplyCentsByRate(
    grossWages,
    config.payrollTax.medicareRateEmployer,
  );

  return {
    grossW2WagesCents: grossWages,
    taxableWagesForIncomeTaxCents: taxableWagesForIncomeTax,
    socialSecurityTaxCents: socialSecurityTax,
    medicareTaxCents: medicareTax,
    additionalMedicareTaxCents: additionalMedicareTax,
    employeeFicaTaxCents: employeeFicaTax,
    employerSocialSecurityTaxCents: employerSocialSecurityTax,
    employerMedicareTaxCents: employerMedicareTax,
    employerFicaTaxCents: roundCents(employerSocialSecurityTax + employerMedicareTax),
    federalIncomeTaxCents: federalIncomeTax,
    totalEmployeeFederalTaxCents: totalEmployeeFederalTax,
    federalWithholdingCents: federalWithholding,
    remainingFederalLiabilityCents: remainingFederalLiability,
    estimatedAfterTaxIncomeCents: estimatedAfterTaxIncome,
    warnings,
  };
}
