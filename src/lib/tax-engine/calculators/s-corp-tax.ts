import { requireTaxYearConfig } from '../config';
import {
  calculateSCorpBreakEvenProfit,
  calculateSCorpFederalBurden,
  calculateSoleProprietorFederalBurden,
} from '../core/business-entity';
import {
  BASE_CALCULATOR_WARNINGS,
  ENGINE_VERSION,
} from '../core/calculator-shared';
import { roundCents } from '../core/rounding';
import type {
  CalculatorResult,
  SCorpTaxDetails,
  SCorpTaxInput,
  TaxDisclaimer,
  TaxWarning,
} from '../types';

const DISCLAIMER: TaxDisclaimer = {
  key: 's-corp-tax',
  text: 'Estimate only — not tax advice. S Corporation taxation involves complex rules including reasonable salary requirements, basis limitations, and entity formalities. This calculator models federal payroll and income taxes on your inputs and does not determine whether your salary is reasonable under IRS standards or whether S corporation election is appropriate for you. Consult a CPA or tax attorney before electing or operating as an S corporation.',
};

const S_CORP_WARNINGS: TaxWarning[] = [
  ...BASE_CALCULATOR_WARNINGS,
  {
    code: 'REASONABLE_COMPENSATION_USER_ENTERED',
    message:
      'Reasonable owner compensation is user-entered. This calculator does not evaluate or suggest a salary amount.',
  },
  {
    code: 'NO_S_CORP_ELECTION_ADVICE',
    message:
      'This calculator does not recommend or advise whether to elect S corporation status.',
  },
  {
    code: 'STATE_FEES_USER_ENTERED',
    message:
      'State taxes and state fees are excluded unless you entered them as compliance costs.',
  },
  {
    code: 'COMPLIANCE_COSTS_VARIABLE',
    message:
      'Payroll, accounting, bookkeeping, and legal costs may vary widely by business.',
  },
  {
    code: 'CONSULT_CPA',
    message: 'Consider consulting a CPA or tax professional before making entity or compensation decisions.',
  },
];

export function calculateSCorpTax(
  input: SCorpTaxInput,
): CalculatorResult<SCorpTaxDetails> {
  const config = requireTaxYearConfig(input.taxYear);
  const normalized = normalizeInput(input);

  const sCorp = calculateSCorpFederalBurden(normalized, config);
  const soleProprietor = calculateSoleProprietorFederalBurden(
    {
      taxYear: normalized.taxYear,
      filingStatus: normalized.filingStatus,
      businessProfitCents: normalized.businessProfitCents,
      otherIncomeCents: normalized.otherIncomeCents,
    },
    config,
  );

  const breakEven = calculateSCorpBreakEvenProfit(
    {
      taxYear: normalized.taxYear,
      filingStatus: normalized.filingStatus,
      ownerSalaryCents: normalized.ownerSalaryCents,
      annualPayrollAdminCostCents: normalized.annualPayrollAdminCostCents,
      annualStateComplianceCostCents: normalized.annualStateComplianceCostCents,
      annualTaxPrepCostCents: normalized.annualTaxPrepCostCents,
      otherIncomeCents: normalized.otherIncomeCents,
    },
    config,
  );

  const estimatedSavings = roundCents(
    soleProprietor.netValueCents - sCorp.netValueCents,
  );

  const details: SCorpTaxDetails = {
    businessProfitCents: sCorp.businessProfitCents,
    ownerSalaryCents: sCorp.ownerSalaryCents,
    distributionCents: sCorp.distributionCents,
    employeeFicaCents: sCorp.employeeFicaCents,
    employerFicaCents: sCorp.employerFicaCents,
    federalIncomeTaxCents: sCorp.federalIncomeTaxCents,
    totalFederalTaxBurdenCents: sCorp.totalFederalTaxBurdenCents,
    sCorpNetValueCents: sCorp.netValueCents,
    soleProprietorTaxBurdenCents: soleProprietor.totalFederalTaxBurdenCents,
    estimatedSavingsVsSoleProprietorCents: estimatedSavings,
    complianceCostsCents: sCorp.complianceCostsCents,
    breakEvenProfitCents: breakEven.breakEvenProfitCents,
    otherIncomeCents: sCorp.otherIncomeCents,
    soleProprietorNetValueCents: soleProprietor.netValueCents,
  };

  const warnings = dedupeWarnings([
    ...S_CORP_WARNINGS,
    ...sCorp.warnings,
    ...soleProprietor.warnings,
    ...breakEven.warnings,
  ]);

  return {
    calculatorId: 's-corp-tax',
    taxYear: input.taxYear,
    computedAt: new Date().toISOString(),
    disclaimer: DISCLAIMER,
    summary: buildResultCards(details),
    details,
    breakdown: buildBreakdown(details),
    warnings,
    metadata: {
      engineVersion: ENGINE_VERSION,
      configVerified: config.verifiedAt.length > 0,
    },
  };
}

type NormalizedSCorpTaxInput = Required<
  Pick<
    SCorpTaxInput,
    | 'annualPayrollAdminCostCents'
    | 'annualStateComplianceCostCents'
    | 'annualTaxPrepCostCents'
    | 'otherIncomeCents'
  >
> &
  SCorpTaxInput;

function normalizeInput(input: SCorpTaxInput): NormalizedSCorpTaxInput {
  return {
    ...input,
    businessProfitCents: Math.max(0, input.businessProfitCents),
    ownerSalaryCents: Math.max(0, input.ownerSalaryCents),
    annualPayrollAdminCostCents: Math.max(0, input.annualPayrollAdminCostCents ?? 0),
    annualStateComplianceCostCents: Math.max(
      0,
      input.annualStateComplianceCostCents ?? 0,
    ),
    annualTaxPrepCostCents: Math.max(0, input.annualTaxPrepCostCents ?? 0),
    otherIncomeCents: Math.max(0, input.otherIncomeCents ?? 0),
  };
}

function buildResultCards(details: SCorpTaxDetails) {
  return [
    {
      id: 'business-profit',
      label: 'Business Profit',
      value: details.businessProfitCents,
      format: 'currency' as const,
      variant: 'default' as const,
    },
    {
      id: 'owner-salary',
      label: 'Owner Salary',
      value: details.ownerSalaryCents,
      format: 'currency' as const,
      variant: 'default' as const,
    },
    {
      id: 'distribution',
      label: 'Estimated S Corp Distribution',
      value: details.distributionCents,
      format: 'currency' as const,
      variant: 'default' as const,
    },
    {
      id: 'employee-fica',
      label: 'Employee FICA',
      value: details.employeeFicaCents,
      format: 'currency' as const,
      variant: 'default' as const,
    },
    {
      id: 'employer-fica',
      label: 'Employer FICA',
      value: details.employerFicaCents,
      format: 'currency' as const,
      variant: 'informational' as const,
    },
    {
      id: 'federal-income-tax',
      label: 'Federal Income Tax',
      value: details.federalIncomeTaxCents,
      format: 'currency' as const,
      variant: 'default' as const,
    },
    {
      id: 'total-federal-tax-burden',
      label: 'Estimated Federal Tax Burden',
      value: details.totalFederalTaxBurdenCents,
      format: 'currency' as const,
      variant: 'liability' as const,
    },
    {
      id: 'scorp-net-value',
      label: 'Estimated S Corp Net Value',
      value: details.sCorpNetValueCents,
      format: 'currency' as const,
      variant: 'savings' as const,
    },
    {
      id: 'sole-prop-tax-burden',
      label: 'Estimated Sole Proprietor Tax Burden',
      value: details.soleProprietorTaxBurdenCents,
      format: 'currency' as const,
      variant: 'liability' as const,
    },
    {
      id: 'savings-vs-sole-prop',
      label: 'Estimated Savings vs Sole Proprietor',
      value: details.estimatedSavingsVsSoleProprietorCents,
      format: 'currency' as const,
      variant: 'highlight' as const,
    },
    {
      id: 'compliance-costs',
      label: 'Compliance Costs',
      value: details.complianceCostsCents,
      format: 'currency' as const,
      variant: 'informational' as const,
    },
    {
      id: 'break-even-profit',
      label: 'Break-Even Profit Estimate',
      value:
        details.breakEvenProfitCents !== null
          ? details.breakEvenProfitCents
          : 'Not found',
      format:
        details.breakEvenProfitCents !== null ? ('currency' as const) : ('text' as const),
      variant: 'informational' as const,
    },
  ];
}

function buildBreakdown(details: SCorpTaxDetails) {
  return [
    {
      id: 'business-profit',
      label: 'Business profit',
      amount: details.businessProfitCents,
      category: 'income' as const,
    },
    {
      id: 'owner-salary',
      label: 'Owner W-2 salary',
      amount: details.ownerSalaryCents,
      category: 'income' as const,
      indent: 1,
    },
    {
      id: 'distribution',
      label: 'S corporation distribution',
      amount: details.distributionCents,
      category: 'income' as const,
      indent: 1,
    },
    {
      id: 'employee-fica',
      label: 'Employee FICA',
      amount: details.employeeFicaCents,
      category: 'tax' as const,
    },
    {
      id: 'employer-fica',
      label: 'Employer FICA (business cost)',
      amount: details.employerFicaCents,
      category: 'tax' as const,
    },
    {
      id: 'federal-income-tax',
      label: 'Federal income tax',
      amount: details.federalIncomeTaxCents,
      category: 'tax' as const,
    },
    {
      id: 'compliance-costs',
      label: 'Compliance costs',
      amount: details.complianceCostsCents,
      category: 'informational' as const,
    },
  ];
}

function dedupeWarnings(warnings: TaxWarning[]): TaxWarning[] {
  const seen = new Set<string>();
  return warnings.filter((warning) => {
    if (seen.has(warning.code)) return false;
    seen.add(warning.code);
    return true;
  });
}
