/** Integer cents — avoid floating-point money math */
export type MoneyCents = number;

export type FilingStatus =
  | 'single'
  | 'married_filing_jointly'
  | 'married_filing_separately'
  | 'head_of_household'
  | 'qualifying_surviving_spouse';

export const FILING_STATUSES: readonly FilingStatus[] = [
  'single',
  'married_filing_jointly',
  'married_filing_separately',
  'head_of_household',
  'qualifying_surviving_spouse',
] as const;

export interface TaxBracket {
  /** Inclusive lower bound in cents */
  min: MoneyCents;
  /** Inclusive upper bound in cents; null = no cap (top bracket) */
  max: MoneyCents | null;
  rate: number;
}

export interface SourceReference {
  title: string;
  url: string;
  taxYear: number;
  dateAccessed: string;
}

export interface TaxYearConfig {
  taxYear: number;
  verifiedAt: string;
  sourceNotes: string;
  sources: {
    federalIncomeTax: SourceReference;
    standardDeduction: SourceReference;
    selfEmploymentTax: SourceReference;
    additionalMedicareTax: SourceReference;
    payrollTax: SourceReference;
    estimatedTax: SourceReference;
    hsa: SourceReference;
    sepIra: SourceReference;
    solo401k: SourceReference;
  };

  federalIncomeTax: {
    brackets: Record<FilingStatus, TaxBracket[]>;
  };

  standardDeduction: Record<FilingStatus, MoneyCents>;

  selfEmploymentTax: {
    netEarningsFactor: number;
    socialSecurityRate: number;
    medicareRate: number;
    socialSecurityWageBase: MoneyCents;
    deductiblePortionRate: number;
    minimumNetEarningsThreshold: MoneyCents;
  };

  additionalMedicareTax: {
    rate: number;
    thresholds: Record<FilingStatus, MoneyCents>;
  };

  payrollTax: {
    socialSecurityRateEmployee: number;
    medicareRateEmployee: number;
    socialSecurityRateEmployer: number;
    medicareRateEmployer: number;
    socialSecurityWageBase: MoneyCents;
  };

  estimatedTax: {
    safeHarborCurrentYearRate: number;
    safeHarborPriorYearRate: number;
    safeHarborPriorYearHighAGIRate: number;
    safeHarborHighAGIThreshold: MoneyCents;
    safeHarborHighAGIThresholdMFS: MoneyCents;
    minimumTaxOwedThreshold: MoneyCents;
    quarterlyDueDates: [string, string, string, string];
  };

  hsa: {
    selfOnlyLimit: MoneyCents;
    familyLimit: MoneyCents;
    catchUpAge: number;
    catchUpAmount: MoneyCents;
  };

  sepIra: {
    maxContribution: MoneyCents;
    compensationRate: number;
  };

  solo401k: {
    employeeDeferralLimit: MoneyCents;
    catchUpAge: number;
    catchUpAmount: MoneyCents;
    totalAnnualAdditionLimit: MoneyCents;
    employerCompensationRate: number;
    annualCompensationLimit: MoneyCents;
  };
}

export type ResultCardVariant =
  | 'default'
  | 'highlight'
  | 'savings'
  | 'liability'
  | 'informational';

export interface ResultCard {
  id: string;
  label: string;
  value: MoneyCents | number | string;
  format: 'currency' | 'percent' | 'text';
  variant: ResultCardVariant;
  tooltip?: string;
}

export type BreakdownCategory =
  | 'income'
  | 'deduction'
  | 'tax'
  | 'contribution'
  | 'informational';

export interface BreakdownLine {
  id: string;
  label: string;
  amount: MoneyCents;
  indent?: number;
  category: BreakdownCategory;
}

export interface TaxWarning {
  code: string;
  message: string;
}

export interface TaxDisclaimer {
  key: string;
  text: string;
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
}

export interface CalculatorResult<TDetails> {
  calculatorId: string;
  taxYear: number;
  computedAt: string;
  disclaimer: TaxDisclaimer;
  summary: ResultCard[];
  details: TDetails;
  breakdown: BreakdownLine[];
  warnings: TaxWarning[];
  metadata: {
    engineVersion: string;
    configVerified: boolean;
  };
}

export interface FederalIncomeTaxResult {
  adjustedGrossIncome: MoneyCents;
  taxableIncome: MoneyCents;
  tax: MoneyCents;
  marginalRate: number;
  effectiveRate: number;
  bracketBreakdown: Array<{
    rate: number;
    taxableInBracket: MoneyCents;
    taxInBracket: MoneyCents;
  }>;
}

export interface SelfEmploymentTaxResult {
  netProfit: MoneyCents;
  netEarnings: MoneyCents;
  socialSecurityTax: MoneyCents;
  medicareTax: MoneyCents;
  additionalMedicareTax: MoneyCents;
  totalSETax: MoneyCents;
  deductibleSETax: MoneyCents;
}

export interface SelfEmployedTaxInput {
  taxYear: number;
  filingStatus: FilingStatus;
  netSelfEmploymentIncomeCents: MoneyCents;
  otherIncomeCents?: MoneyCents;
  estimatedPaymentsMadeCents?: MoneyCents;
}

export interface SelfEmployedTaxDetails {
  netSelfEmploymentIncomeCents: MoneyCents;
  netEarningsSubjectToSeTaxCents: MoneyCents;
  selfEmploymentTaxCents: MoneyCents;
  deductibleSeTaxCents: MoneyCents;
  adjustedGrossIncomeCents: MoneyCents;
  federalTaxableIncomeCents: MoneyCents;
  federalIncomeTaxCents: MoneyCents;
  totalEstimatedFederalTaxCents: MoneyCents;
  effectiveTaxRate: number;
  marginalTaxRate: number;
  quarterlyEstimatedPaymentCents: MoneyCents;
  monthlyTaxReserveCents: MoneyCents;
  estimatedAfterTaxIncomeCents: MoneyCents;
  estimatedPaymentsMadeCents: MoneyCents;
  remainingTaxOwedCents: MoneyCents;
}

export interface Tax1099TaxInput {
  taxYear: number;
  filingStatus: FilingStatus;
  gross1099IncomeCents: MoneyCents;
  businessExpensesCents?: MoneyCents;
  otherIncomeCents?: MoneyCents;
  estimatedPaymentsMadeCents?: MoneyCents;
}

export type Tax1099TaxDetails = SelfEmployedTaxDetails & {
  gross1099IncomeCents: MoneyCents;
  businessExpensesCents: MoneyCents;
  net1099IncomeCents: MoneyCents;
};

export interface QuarterlyTaxInput {
  taxYear: number;
  filingStatus: FilingStatus;
  netSelfEmploymentIncomeCents: MoneyCents;
  otherIncomeCents?: MoneyCents;
  estimatedPaymentsMadeCents?: MoneyCents;
  priorYearTaxCents?: MoneyCents;
  priorYearAdjustedGrossIncomeCents?: MoneyCents;
}

export interface QuarterlyTaxDetails {
  totalEstimatedFederalTaxCents: MoneyCents;
  estimatedPaymentsMadeCents: MoneyCents;
  remainingEstimatedTaxCents: MoneyCents;
  recommendedQuarterlyPaymentCents: MoneyCents;
  monthlyTaxReserveCents: MoneyCents;
  safeHarborTargetCents: MoneyCents;
  safeHarborRuleUsed: string;
  quarterlyDueDates: [string, string, string, string];
  selfEmployedDetails: {
    netSelfEmploymentIncomeCents: MoneyCents;
    selfEmploymentTaxCents: MoneyCents;
    federalIncomeTaxCents: MoneyCents;
    adjustedGrossIncomeCents: MoneyCents;
  };
}

export type EstimatedTaxIncomeType = 'self_employed' | 'mixed';

export interface EstimatedTaxInput {
  taxYear: number;
  filingStatus: FilingStatus;
  incomeType: EstimatedTaxIncomeType;
  netSelfEmploymentIncomeCents?: MoneyCents;
  w2WagesCents?: MoneyCents;
  federalWithholdingCents?: MoneyCents;
  otherIncomeCents?: MoneyCents;
  estimatedPaymentsMadeCents?: MoneyCents;
  priorYearTaxCents?: MoneyCents;
  priorYearAdjustedGrossIncomeCents?: MoneyCents;
}

export interface EstimatedTaxDetails {
  estimatedAnnualFederalTaxCents: MoneyCents;
  federalWithholdingCents: MoneyCents;
  estimatedPaymentsMadeCents: MoneyCents;
  remainingTaxCents: MoneyCents;
  recommendedRemainingQuarterlyPaymentCents: MoneyCents;
  monthlyTaxReserveCents: MoneyCents;
  safeHarborTargetCents: MoneyCents;
  safeHarborRuleUsed: string;
  quarterlyDueDates: [string, string, string, string];
  selfEmploymentTaxCents: MoneyCents;
  federalIncomeTaxCents: MoneyCents;
  adjustedGrossIncomeCents: MoneyCents;
}

export type W2Vs1099BetterOption = 'w2' | 'contractor_1099' | 'similar';

export interface W2Vs1099Input {
  taxYear: number;
  filingStatus: FilingStatus;
  w2SalaryCents: MoneyCents;
  contractorGrossIncomeCents: MoneyCents;
  contractorBusinessExpensesCents?: MoneyCents;
  w2FederalWithholdingCents?: MoneyCents;
  estimatedPaymentsMadeCents?: MoneyCents;
  annualBenefitsValueCents?: MoneyCents;
  contractorExtraCostsCents?: MoneyCents;
  hoursPerYear?: number;
}

export interface W2Vs1099Details {
  betterEstimatedOption: W2Vs1099BetterOption;
  w2AfterTaxIncomeCents: MoneyCents;
  contractorAfterTaxIncomeCents: MoneyCents;
  differenceCents: MoneyCents;
  breakEvenContractorGrossIncomeCents: MoneyCents | null;
  breakEvenContractorHourlyRateCents: MoneyCents | null;
  w2TotalEstimatedValueCents: MoneyCents;
  contractorTotalEstimatedValueCents: MoneyCents;
  employeeFicaCents: MoneyCents;
  selfEmploymentTaxCents: MoneyCents;
  annualBenefitsValueCents: MoneyCents;
  contractorExtraCostsCents: MoneyCents;
  w2FederalIncomeTaxCents: MoneyCents;
  contractorFederalIncomeTaxCents: MoneyCents;
  w2FederalWithholdingCents: MoneyCents;
  contractorEstimatedPaymentsCents: MoneyCents;
  w2GrossSalaryCents: MoneyCents;
  contractorGrossIncomeCents: MoneyCents;
  contractorBusinessExpensesCents: MoneyCents;
  contractorNetIncomeCents: MoneyCents;
  employerFicaCents: MoneyCents;
}

export interface SoleProprietorFederalBurdenInput {
  taxYear: number;
  filingStatus: FilingStatus;
  businessProfitCents: MoneyCents;
  otherIncomeCents?: MoneyCents;
}

export interface SoleProprietorFederalBurdenResult {
  businessProfitCents: MoneyCents;
  otherIncomeCents: MoneyCents;
  selfEmploymentTaxCents: MoneyCents;
  federalIncomeTaxCents: MoneyCents;
  totalFederalTaxBurdenCents: MoneyCents;
  netValueCents: MoneyCents;
  adjustedGrossIncomeCents: MoneyCents;
  federalTaxableIncomeCents: MoneyCents;
  warnings: TaxWarning[];
  validationErrors: ValidationError[];
}

export interface SCorpFederalBurdenInput {
  taxYear: number;
  filingStatus: FilingStatus;
  businessProfitCents: MoneyCents;
  ownerSalaryCents: MoneyCents;
  annualPayrollAdminCostCents?: MoneyCents;
  annualStateComplianceCostCents?: MoneyCents;
  annualTaxPrepCostCents?: MoneyCents;
  otherIncomeCents?: MoneyCents;
}

export interface SCorpFederalBurdenResult {
  businessProfitCents: MoneyCents;
  ownerSalaryCents: MoneyCents;
  distributionCents: MoneyCents;
  otherIncomeCents: MoneyCents;
  employeeFicaCents: MoneyCents;
  employerFicaCents: MoneyCents;
  federalIncomeTaxCents: MoneyCents;
  totalFederalTaxBurdenCents: MoneyCents;
  complianceCostsCents: MoneyCents;
  netValueCents: MoneyCents;
  adjustedGrossIncomeCents: MoneyCents;
  federalTaxableIncomeCents: MoneyCents;
  warnings: TaxWarning[];
  validationErrors: ValidationError[];
}

export interface SoleProprietorVsSCorpComparisonInput {
  taxYear: number;
  filingStatus: FilingStatus;
  businessProfitCents: MoneyCents;
  ownerSalaryCents: MoneyCents;
  annualPayrollAdminCostCents?: MoneyCents;
  annualStateComplianceCostCents?: MoneyCents;
  annualTaxPrepCostCents?: MoneyCents;
  otherIncomeCents?: MoneyCents;
}

export interface SoleProprietorVsSCorpComparisonResult {
  soleProprietor: SoleProprietorFederalBurdenResult;
  sCorp: SCorpFederalBurdenResult;
  netValueDifferenceCents: MoneyCents;
  taxBurdenDifferenceCents: MoneyCents;
  warnings: TaxWarning[];
}

export interface SCorpBreakEvenProfitInput {
  taxYear: number;
  filingStatus: FilingStatus;
  ownerSalaryCents: MoneyCents;
  annualPayrollAdminCostCents?: MoneyCents;
  annualStateComplianceCostCents?: MoneyCents;
  annualTaxPrepCostCents?: MoneyCents;
  otherIncomeCents?: MoneyCents;
}

export interface SCorpBreakEvenProfitResult {
  breakEvenProfitCents: MoneyCents | null;
  warnings: TaxWarning[];
}

export interface SCorpTaxInput {
  taxYear: number;
  filingStatus: FilingStatus;
  businessProfitCents: MoneyCents;
  ownerSalaryCents: MoneyCents;
  annualPayrollAdminCostCents?: MoneyCents;
  annualStateComplianceCostCents?: MoneyCents;
  annualTaxPrepCostCents?: MoneyCents;
  otherIncomeCents?: MoneyCents;
}

export interface SCorpTaxDetails {
  businessProfitCents: MoneyCents;
  ownerSalaryCents: MoneyCents;
  distributionCents: MoneyCents;
  employeeFicaCents: MoneyCents;
  employerFicaCents: MoneyCents;
  federalIncomeTaxCents: MoneyCents;
  totalFederalTaxBurdenCents: MoneyCents;
  sCorpNetValueCents: MoneyCents;
  soleProprietorTaxBurdenCents: MoneyCents;
  estimatedSavingsVsSoleProprietorCents: MoneyCents;
  complianceCostsCents: MoneyCents;
  breakEvenProfitCents: MoneyCents | null;
  otherIncomeCents: MoneyCents;
  soleProprietorNetValueCents: MoneyCents;
}

export interface LlcVsSCorpInput {
  taxYear: number;
  filingStatus: FilingStatus;
  llcBusinessProfitCents: MoneyCents;
  sCorpBusinessProfitCents?: MoneyCents;
  sCorpOwnerSalaryCents: MoneyCents;
  annualPayrollAdminCostCents?: MoneyCents;
  annualStateComplianceCostCents?: MoneyCents;
  annualTaxPrepCostCents?: MoneyCents;
  otherIncomeCents?: MoneyCents;
}

export interface LlcVsSCorpDetails {
  llcFederalTaxBurdenCents: MoneyCents;
  sCorpFederalTaxBurdenCents: MoneyCents;
  taxBurdenDifferenceCents: MoneyCents;
  llcAfterTaxValueCents: MoneyCents;
  sCorpAfterTaxValueCents: MoneyCents;
  sCorpComplianceCostsCents: MoneyCents;
  sCorpDistributionCents: MoneyCents;
  sCorpOwnerSalaryCents: MoneyCents;
  breakEvenProfitCents: MoneyCents | null;
  llcBusinessProfitCents: MoneyCents;
  sCorpBusinessProfitCents: MoneyCents;
  llcSelfEmploymentTaxCents: MoneyCents;
  sCorpEmployeeFicaCents: MoneyCents;
  sCorpEmployerFicaCents: MoneyCents;
}

export type HsaCoverageType = 'self_only' | 'family';

export interface HsaLimitInput {
  coverageType: HsaCoverageType;
  age: number;
  eligibleMonths?: number;
}

export interface HsaContributionLimitResult {
  contributionLimitCents: MoneyCents;
  baseLimitCents: MoneyCents;
  catchUpContributionCents: MoneyCents;
  prorationFactor: number;
  warnings: TaxWarning[];
}

export interface HsaRoomInput extends HsaLimitInput {
  employerContributionCents?: MoneyCents;
}

export interface HsaRemainingRoomResult {
  contributionLimitCents: MoneyCents;
  employerContributionCents: MoneyCents;
  remainingContributionRoomCents: MoneyCents;
  warnings: TaxWarning[];
}

export interface HsaFederalTaxSavingsInput {
  filingStatus: FilingStatus;
  annualIncomeCents: MoneyCents;
  eligibleContributionCents: MoneyCents;
}

export interface HsaFederalTaxSavingsResult {
  marginalFederalTaxRate: number;
  federalIncomeTaxSavingsCents: MoneyCents;
  taxableIncomeCents: MoneyCents;
}

export interface HsaPayrollTaxSavingsInput {
  annualIncomeCents: MoneyCents;
  eligibleContributionCents: MoneyCents;
  payrollDeductedContribution: boolean;
}

export interface HsaPayrollTaxSavingsResult {
  payrollTaxSavingsCents: MoneyCents;
  socialSecurityTaxSavingsCents: MoneyCents;
  medicareTaxSavingsCents: MoneyCents;
  warnings: TaxWarning[];
}

export interface HsaTaxSavingsInput {
  taxYear: number;
  filingStatus: FilingStatus;
  coverageType: HsaCoverageType;
  age: number;
  annualIncomeCents: MoneyCents;
  hsaContributionCents: MoneyCents;
  employerContributionCents?: MoneyCents;
  payrollDeductedContribution?: boolean;
  eligibleMonths?: number;
}

export interface HsaTaxSavingsResult {
  contributionLimitCents: MoneyCents;
  employerContributionCents: MoneyCents;
  userContributionCents: MoneyCents;
  eligibleContributionCents: MoneyCents;
  remainingContributionRoomCents: MoneyCents;
  excessContributionCents: MoneyCents;
  marginalFederalTaxRate: number;
  federalIncomeTaxSavingsCents: MoneyCents;
  payrollTaxSavingsCents: MoneyCents;
  totalTaxSavingsCents: MoneyCents;
  netAfterTaxCostCents: MoneyCents;
  catchUpContributionCents: MoneyCents;
  baseLimitCents: MoneyCents;
  warnings: TaxWarning[];
}

export interface HsaTaxInput {
  taxYear: number;
  filingStatus: FilingStatus;
  coverageType: HsaCoverageType;
  age: number;
  annualIncomeCents: MoneyCents;
  hsaContributionCents: MoneyCents;
  employerContributionCents?: MoneyCents;
  payrollDeductedContribution?: boolean;
  eligibleMonths?: number;
}

export interface HsaTaxDetails {
  contributionLimitCents: MoneyCents;
  employerContributionCents: MoneyCents;
  userContributionCents: MoneyCents;
  remainingContributionRoomCents: MoneyCents;
  excessContributionCents: MoneyCents;
  marginalFederalTaxRate: number;
  federalIncomeTaxSavingsCents: MoneyCents;
  payrollTaxSavingsCents: MoneyCents;
  totalTaxSavingsCents: MoneyCents;
  netAfterTaxCostCents: MoneyCents;
  eligibleContributionCents: MoneyCents;
  catchUpContributionCents: MoneyCents;
  baseLimitCents: MoneyCents;
}
