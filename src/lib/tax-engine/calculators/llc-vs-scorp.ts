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
  LlcVsSCorpDetails,
  LlcVsSCorpInput,
  TaxDisclaimer,
  TaxWarning,
} from '../types';

const DISCLAIMER: TaxDisclaimer = {
  key: 'llc-vs-scorp',
  text: 'Estimate only — not tax advice, legal advice, or entity formation advice. This comparison uses simplified federal tax assumptions for a default LLC pass-through sole proprietor treatment versus an S corporation pass-through model. It does not evaluate state law, operating agreements, liability protection, or whether an LLC or S corporation election is appropriate for you. Consult a CPA and attorney before choosing a business structure.',
};

const LLC_VS_S_CORP_WARNINGS: TaxWarning[] = [
  ...BASE_CALCULATOR_WARNINGS,
  {
    code: 'LLC_DEFAULT_PASS_THROUGH',
    message:
      'LLCs can be taxed in different ways. This estimate assumes default single-member pass-through sole proprietor treatment with self-employment tax on net profit.',
  },
  {
    code: 'REASONABLE_COMPENSATION_USER_ENTERED',
    message:
      'S corporation owner salary is user-entered. This calculator does not evaluate or suggest a salary amount.',
  },
  {
    code: 'NOT_ENTITY_OR_LEGAL_ADVICE',
    message:
      'This calculator does not provide legal, entity formation, or worker classification advice.',
  },
  {
    code: 'STATE_FEES_USER_ENTERED',
    message:
      'State taxes and state fees are excluded unless you entered them as compliance costs.',
  },
  {
    code: 'CONSULT_CPA',
    message: 'Consider consulting a CPA before electing S corporation status or changing entity structure.',
  },
];

export function calculateLlcVsSCorp(
  input: LlcVsSCorpInput,
): CalculatorResult<LlcVsSCorpDetails> {
  const config = requireTaxYearConfig(input.taxYear);
  const normalized = normalizeInput(input);

  const llc = calculateSoleProprietorFederalBurden(
    {
      taxYear: normalized.taxYear,
      filingStatus: normalized.filingStatus,
      businessProfitCents: normalized.llcBusinessProfitCents,
      otherIncomeCents: normalized.otherIncomeCents,
    },
    config,
  );

  const sCorp = calculateSCorpFederalBurden(
    {
      taxYear: normalized.taxYear,
      filingStatus: normalized.filingStatus,
      businessProfitCents: normalized.sCorpBusinessProfitCents,
      ownerSalaryCents: normalized.sCorpOwnerSalaryCents,
      annualPayrollAdminCostCents: normalized.annualPayrollAdminCostCents,
      annualStateComplianceCostCents: normalized.annualStateComplianceCostCents,
      annualTaxPrepCostCents: normalized.annualTaxPrepCostCents,
      otherIncomeCents: normalized.otherIncomeCents,
    },
    config,
  );

  const breakEven = calculateSCorpBreakEvenProfit(
    {
      taxYear: normalized.taxYear,
      filingStatus: normalized.filingStatus,
      ownerSalaryCents: normalized.sCorpOwnerSalaryCents,
      annualPayrollAdminCostCents: normalized.annualPayrollAdminCostCents,
      annualStateComplianceCostCents: normalized.annualStateComplianceCostCents,
      annualTaxPrepCostCents: normalized.annualTaxPrepCostCents,
      otherIncomeCents: normalized.otherIncomeCents,
    },
    config,
  );

  const details: LlcVsSCorpDetails = {
    llcFederalTaxBurdenCents: llc.totalFederalTaxBurdenCents,
    sCorpFederalTaxBurdenCents: sCorp.totalFederalTaxBurdenCents,
    taxBurdenDifferenceCents: roundCents(
      llc.totalFederalTaxBurdenCents - sCorp.totalFederalTaxBurdenCents,
    ),
    llcAfterTaxValueCents: llc.netValueCents,
    sCorpAfterTaxValueCents: sCorp.netValueCents,
    sCorpComplianceCostsCents: sCorp.complianceCostsCents,
    sCorpDistributionCents: sCorp.distributionCents,
    sCorpOwnerSalaryCents: sCorp.ownerSalaryCents,
    breakEvenProfitCents: breakEven.breakEvenProfitCents,
    llcBusinessProfitCents: normalized.llcBusinessProfitCents,
    sCorpBusinessProfitCents: normalized.sCorpBusinessProfitCents,
    llcSelfEmploymentTaxCents: llc.selfEmploymentTaxCents,
    sCorpEmployeeFicaCents: sCorp.employeeFicaCents,
    sCorpEmployerFicaCents: sCorp.employerFicaCents,
  };

  const warnings = dedupeWarnings([
    ...LLC_VS_S_CORP_WARNINGS,
    ...llc.warnings,
    ...sCorp.warnings,
    ...breakEven.warnings,
  ]);

  return {
    calculatorId: 'llc-vs-scorp',
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

type NormalizedLlcVsSCorpInput = Required<
  Pick<
    LlcVsSCorpInput,
    | 'sCorpBusinessProfitCents'
    | 'annualPayrollAdminCostCents'
    | 'annualStateComplianceCostCents'
    | 'annualTaxPrepCostCents'
    | 'otherIncomeCents'
  >
> &
  LlcVsSCorpInput;

function normalizeInput(input: LlcVsSCorpInput): NormalizedLlcVsSCorpInput {
  const llcBusinessProfitCents = Math.max(0, input.llcBusinessProfitCents);
  return {
    ...input,
    llcBusinessProfitCents,
    sCorpBusinessProfitCents: Math.max(
      0,
      input.sCorpBusinessProfitCents ?? llcBusinessProfitCents,
    ),
    sCorpOwnerSalaryCents: Math.max(0, input.sCorpOwnerSalaryCents),
    annualPayrollAdminCostCents: Math.max(0, input.annualPayrollAdminCostCents ?? 0),
    annualStateComplianceCostCents: Math.max(
      0,
      input.annualStateComplianceCostCents ?? 0,
    ),
    annualTaxPrepCostCents: Math.max(0, input.annualTaxPrepCostCents ?? 0),
    otherIncomeCents: Math.max(0, input.otherIncomeCents ?? 0),
  };
}

function buildResultCards(details: LlcVsSCorpDetails) {
  return [
    {
      id: 'llc-federal-tax-burden',
      label: 'LLC Estimated Federal Tax Burden',
      value: details.llcFederalTaxBurdenCents,
      format: 'currency' as const,
      variant: 'liability' as const,
    },
    {
      id: 'scorp-federal-tax-burden',
      label: 'S Corp Estimated Federal Tax Burden',
      value: details.sCorpFederalTaxBurdenCents,
      format: 'currency' as const,
      variant: 'liability' as const,
    },
    {
      id: 'tax-burden-difference',
      label: 'Estimated Difference (LLC minus S Corp burden)',
      value: details.taxBurdenDifferenceCents,
      format: 'currency' as const,
      variant: 'highlight' as const,
    },
    {
      id: 'llc-after-tax-value',
      label: 'LLC After-Tax Value',
      value: details.llcAfterTaxValueCents,
      format: 'currency' as const,
      variant: 'default' as const,
    },
    {
      id: 'scorp-after-tax-value',
      label: 'S Corp After-Tax Value',
      value: details.sCorpAfterTaxValueCents,
      format: 'currency' as const,
      variant: 'default' as const,
    },
    {
      id: 'scorp-compliance-costs',
      label: 'S Corp Compliance Costs',
      value: details.sCorpComplianceCostsCents,
      format: 'currency' as const,
      variant: 'informational' as const,
    },
    {
      id: 'scorp-distribution',
      label: 'S Corp Distribution',
      value: details.sCorpDistributionCents,
      format: 'currency' as const,
      variant: 'default' as const,
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
    {
      id: 'user-entered-salary',
      label: 'User-Entered Salary Assumption',
      value: details.sCorpOwnerSalaryCents,
      format: 'currency' as const,
      variant: 'informational' as const,
    },
  ];
}

function buildBreakdown(details: LlcVsSCorpDetails) {
  return [
    {
      id: 'llc-profit',
      label: 'LLC business profit',
      amount: details.llcBusinessProfitCents,
      category: 'income' as const,
    },
    {
      id: 'llc-se-tax',
      label: 'LLC self-employment tax',
      amount: details.llcSelfEmploymentTaxCents,
      category: 'tax' as const,
      indent: 1,
    },
    {
      id: 'scorp-profit',
      label: 'S Corp business profit',
      amount: details.sCorpBusinessProfitCents,
      category: 'income' as const,
    },
    {
      id: 'scorp-salary',
      label: 'S Corp owner salary',
      amount: details.sCorpOwnerSalaryCents,
      category: 'income' as const,
      indent: 1,
    },
    {
      id: 'scorp-distribution',
      label: 'S Corp distribution',
      amount: details.sCorpDistributionCents,
      category: 'income' as const,
      indent: 1,
    },
    {
      id: 'scorp-employee-fica',
      label: 'S Corp employee FICA',
      amount: details.sCorpEmployeeFicaCents,
      category: 'tax' as const,
      indent: 1,
    },
    {
      id: 'scorp-employer-fica',
      label: 'S Corp employer FICA',
      amount: details.sCorpEmployerFicaCents,
      category: 'tax' as const,
      indent: 1,
    },
    {
      id: 'scorp-compliance',
      label: 'S Corp compliance costs',
      amount: details.sCorpComplianceCostsCents,
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
