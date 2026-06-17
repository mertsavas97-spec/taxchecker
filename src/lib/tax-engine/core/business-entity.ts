import type {
  FilingStatus,
  MoneyCents,
  SCorpBreakEvenProfitInput,
  SCorpBreakEvenProfitResult,
  SCorpFederalBurdenInput,
  SCorpFederalBurdenResult,
  SoleProprietorFederalBurdenInput,
  SoleProprietorFederalBurdenResult,
  SoleProprietorVsSCorpComparisonInput,
  SoleProprietorVsSCorpComparisonResult,
  TaxWarning,
  TaxYearConfig,
  ValidationError,
} from '../types';
import { calculateAnnualFederalLiability } from './annual-federal-liability';
import { calculateFederalIncomeTaxFromAgi } from './federal-income-tax';
import {
  calculateEmployeeFicaTax,
  calculateEmployerFicaTax,
} from './payroll-tax';
import { dollarsToCents, roundCents } from './rounding';

/** Informational warning threshold only — not IRS guidance on reasonable compensation */
export const LOW_SALARY_TO_PROFIT_RATIO_WARNING = 0.4;

const BREAK_EVEN_TOLERANCE_CENTS = dollarsToCents(10);
const BREAK_EVEN_MAX_ITERATIONS = 100;

export function calculateSoleProprietorFederalBurden(
  input: SoleProprietorFederalBurdenInput,
  config: TaxYearConfig,
): SoleProprietorFederalBurdenResult {
  const businessProfit = Math.max(0, input.businessProfitCents);
  const otherIncome = Math.max(0, input.otherIncomeCents ?? 0);

  const liability = calculateAnnualFederalLiability(
    {
      filingStatus: input.filingStatus,
      netSelfEmploymentIncomeCents: businessProfit,
      otherIncomeCents: otherIncome,
    },
    config,
  );

  const netValue = roundCents(
    businessProfit + otherIncome - liability.totalEstimatedFederalTaxCents,
  );

  return {
    businessProfitCents: businessProfit,
    otherIncomeCents: otherIncome,
    selfEmploymentTaxCents: liability.selfEmploymentTaxCents,
    federalIncomeTaxCents: liability.federalIncomeTaxCents,
    totalFederalTaxBurdenCents: liability.totalEstimatedFederalTaxCents,
    netValueCents: netValue,
    adjustedGrossIncomeCents: liability.adjustedGrossIncomeCents,
    federalTaxableIncomeCents: liability.federalTaxableIncomeCents,
    warnings: liability.warnings,
    validationErrors: [],
  };
}

export function calculateSCorpFederalBurden(
  input: SCorpFederalBurdenInput,
  config: TaxYearConfig,
): SCorpFederalBurdenResult {
  const warnings: TaxWarning[] = [];
  const validationErrors: ValidationError[] = [];

  const businessProfit = Math.max(0, input.businessProfitCents);
  const otherIncome = Math.max(0, input.otherIncomeCents ?? 0);
  const complianceCosts = sumComplianceCosts(input);
  let ownerSalary = Math.max(0, input.ownerSalaryCents);

  if (ownerSalary > businessProfit) {
    validationErrors.push({
      field: 'ownerSalaryCents',
      code: 'INCONSISTENT',
      message:
        'Owner salary exceeds business profit. Salary was capped to business profit for this estimate.',
    });
    warnings.push({
      code: 'SALARY_EXCEEDS_PROFIT',
      message:
        'Owner salary exceeds business profit. Salary was capped to business profit for this estimate.',
    });
    ownerSalary = businessProfit;
  }

  if (
    businessProfit > 0 &&
    ownerSalary > 0 &&
    ownerSalary / businessProfit < LOW_SALARY_TO_PROFIT_RATIO_WARNING
  ) {
    warnings.push({
      code: 'LOW_SALARY_RATIO',
      message:
        'Owner salary is low relative to business profit. IRS requires reasonable compensation for services performed. This calculator does not evaluate or suggest a salary amount.',
    });
  }

  if (ownerSalary === 0 && businessProfit > 0) {
    warnings.push({
      code: 'ZERO_SALARY',
      message:
        'Owner salary is zero while business profit is positive. S corporation owners who perform services generally must receive W-2 wages. This calculator does not evaluate or recommend a salary amount.',
    });
  }

  const distribution = roundCents(businessProfit - ownerSalary);

  const employeeFica = calculateEmployeeFicaTax(
    ownerSalary,
    input.filingStatus,
    config,
  );
  const employerFica = calculateEmployerFicaTax(ownerSalary, config);

  const adjustedGrossIncome = roundCents(
    ownerSalary + distribution + otherIncome,
  );

  const federalResult = calculateFederalIncomeTaxFromAgi(
    {
      adjustedGrossIncomeCents: adjustedGrossIncome,
      filingStatus: input.filingStatus,
      useStandardDeduction: true,
    },
    config,
  );

  const totalFederalTaxBurden = roundCents(
    employeeFica + employerFica + federalResult.tax,
  );

  const netValue = roundCents(
    businessProfit +
      otherIncome -
      employeeFica -
      federalResult.tax -
      employerFica -
      complianceCosts,
  );

  return {
    businessProfitCents: businessProfit,
    ownerSalaryCents: ownerSalary,
    distributionCents: distribution,
    otherIncomeCents: otherIncome,
    employeeFicaCents: employeeFica,
    employerFicaCents: employerFica,
    federalIncomeTaxCents: federalResult.tax,
    totalFederalTaxBurdenCents: totalFederalTaxBurden,
    complianceCostsCents: complianceCosts,
    netValueCents: netValue,
    adjustedGrossIncomeCents: adjustedGrossIncome,
    federalTaxableIncomeCents: federalResult.taxableIncome,
    warnings,
    validationErrors,
  };
}

export function compareSoleProprietorVsSCorp(
  input: SoleProprietorVsSCorpComparisonInput,
  config: TaxYearConfig,
): SoleProprietorVsSCorpComparisonResult {
  const soleProprietor = calculateSoleProprietorFederalBurden(
    {
      taxYear: input.taxYear,
      filingStatus: input.filingStatus,
      businessProfitCents: input.businessProfitCents,
      otherIncomeCents: input.otherIncomeCents,
    },
    config,
  );

  const sCorp = calculateSCorpFederalBurden(
    {
      taxYear: input.taxYear,
      filingStatus: input.filingStatus,
      businessProfitCents: input.businessProfitCents,
      ownerSalaryCents: input.ownerSalaryCents,
      annualPayrollAdminCostCents: input.annualPayrollAdminCostCents,
      annualStateComplianceCostCents: input.annualStateComplianceCostCents,
      annualTaxPrepCostCents: input.annualTaxPrepCostCents,
      otherIncomeCents: input.otherIncomeCents,
    },
    config,
  );

  return {
    soleProprietor,
    sCorp,
    netValueDifferenceCents: roundCents(
      soleProprietor.netValueCents - sCorp.netValueCents,
    ),
    taxBurdenDifferenceCents: roundCents(
      soleProprietor.totalFederalTaxBurdenCents - sCorp.totalFederalTaxBurdenCents,
    ),
    warnings: dedupeWarnings([
      ...soleProprietor.warnings,
      ...sCorp.warnings,
    ]),
  };
}

export function calculateSCorpBreakEvenProfit(
  input: SCorpBreakEvenProfitInput,
  config: TaxYearConfig,
): SCorpBreakEvenProfitResult {
  const warnings: TaxWarning[] = [];
  const maxBound = Math.max(
    dollarsToCents(1_000_000),
    input.ownerSalaryCents,
    sumComplianceCosts(input) * 20,
  );

  const soleAtZero = calculateSoleProprietorFederalBurden(
    {
      taxYear: input.taxYear,
      filingStatus: input.filingStatus,
      businessProfitCents: 0,
      otherIncomeCents: input.otherIncomeCents,
    },
    config,
  );

  const scorpAtZero = calculateSCorpFederalBurden(
    {
      taxYear: input.taxYear,
      filingStatus: input.filingStatus,
      businessProfitCents: 0,
      ownerSalaryCents: input.ownerSalaryCents,
      annualPayrollAdminCostCents: input.annualPayrollAdminCostCents,
      annualStateComplianceCostCents: input.annualStateComplianceCostCents,
      annualTaxPrepCostCents: input.annualTaxPrepCostCents,
      otherIncomeCents: input.otherIncomeCents,
    },
    config,
  );

  if (scorpAtZero.netValueCents > soleAtZero.netValueCents) {
    return { breakEvenProfitCents: 0, warnings };
  }

  const soleAtMax = calculateSoleProprietorFederalBurden(
    {
      taxYear: input.taxYear,
      filingStatus: input.filingStatus,
      businessProfitCents: maxBound,
      otherIncomeCents: input.otherIncomeCents,
    },
    config,
  );

  const scorpAtMax = calculateSCorpFederalBurden(
    {
      taxYear: input.taxYear,
      filingStatus: input.filingStatus,
      businessProfitCents: maxBound,
      ownerSalaryCents: input.ownerSalaryCents,
      annualPayrollAdminCostCents: input.annualPayrollAdminCostCents,
      annualStateComplianceCostCents: input.annualStateComplianceCostCents,
      annualTaxPrepCostCents: input.annualTaxPrepCostCents,
      otherIncomeCents: input.otherIncomeCents,
    },
    config,
  );

  if (scorpAtMax.netValueCents <= soleAtMax.netValueCents) {
    warnings.push({
      code: 'BREAK_EVEN_NOT_FOUND',
      message:
        'S Corp net value does not exceed sole proprietor net value within the search range. No break-even profit found.',
    });
    return { breakEvenProfitCents: null, warnings };
  }

  let low = 0;
  let high = maxBound;
  let bestProfit: MoneyCents | null = null;

  for (let i = 0; i < BREAK_EVEN_MAX_ITERATIONS; i++) {
    const mid = Math.floor((low + high) / 2);
    const comparison = compareSoleProprietorVsSCorp(
      {
        taxYear: input.taxYear,
        filingStatus: input.filingStatus,
        businessProfitCents: mid,
        ownerSalaryCents: input.ownerSalaryCents,
        annualPayrollAdminCostCents: input.annualPayrollAdminCostCents,
        annualStateComplianceCostCents: input.annualStateComplianceCostCents,
        annualTaxPrepCostCents: input.annualTaxPrepCostCents,
        otherIncomeCents: input.otherIncomeCents,
      },
      config,
    );

    const scorpAdvantage = roundCents(
      comparison.sCorp.netValueCents - comparison.soleProprietor.netValueCents,
    );

    if (Math.abs(scorpAdvantage) <= BREAK_EVEN_TOLERANCE_CENTS) {
      bestProfit = mid;
      break;
    }

    if (scorpAdvantage < 0) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  if (bestProfit === null) {
    warnings.push({
      code: 'BREAK_EVEN_NOT_CONVERGED',
      message:
        'Break-even business profit did not converge within iteration limits.',
    });
  }

  return { breakEvenProfitCents: bestProfit, warnings };
}

function sumComplianceCosts(
  input: Pick<
    SCorpFederalBurdenInput,
    | 'annualPayrollAdminCostCents'
    | 'annualStateComplianceCostCents'
    | 'annualTaxPrepCostCents'
  >,
): MoneyCents {
  return roundCents(
    Math.max(0, input.annualPayrollAdminCostCents ?? 0) +
      Math.max(0, input.annualStateComplianceCostCents ?? 0) +
      Math.max(0, input.annualTaxPrepCostCents ?? 0),
  );
}

function dedupeWarnings(warnings: TaxWarning[]): TaxWarning[] {
  const seen = new Set<string>();
  return warnings.filter((warning) => {
    if (seen.has(warning.code)) return false;
    seen.add(warning.code);
    return true;
  });
}
