/**
 * Stage 2 real-world validation scenarios (tax year 2025).
 * Expected values derived from IRS worksheets: Schedule SE, Rev. Proc. 2024-40,
 * Form 1040-ES, Pub. 15, Rev. Proc. 2024-25.
 */
import { dollarsToCents } from '../../core/rounding';
import type { FilingStatus } from '../../types';

export const STAGE2_TAX_YEAR = 2025;

const d = dollarsToCents;

export const STAGE2_SELF_EMPLOYED = [
  {
    id: 'SE-1',
    label: 'Single $80k net SE — Schedule SE anchor',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      netSelfEmploymentIncomeCents: d(80_000),
    },
    expected: {
      selfEmploymentTaxCents: d(11_303.64),
      federalIncomeTaxCents: d(7_970.6),
      totalEstimatedFederalTaxCents: d(19_274.24),
    },
  },
  {
    id: 'SE-2',
    label: 'Below Schedule SE $400 net earnings threshold',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      netSelfEmploymentIncomeCents: d(300),
    },
    expected: {
      selfEmploymentTaxCents: 0,
      totalEstimatedFederalTaxCents: 0,
    },
  },
  {
    id: 'SE-3',
    label: 'MFJ $100k SE + $25k other income',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'married_filing_jointly' as FilingStatus,
      netSelfEmploymentIncomeCents: d(100_000),
      otherIncomeCents: d(25_000),
    },
    expected: {
      totalEstimatedFederalTaxCents: d(24_204.78),
    },
  },
  {
    id: 'SE-4',
    label: 'Single $250k — SS wage base cap',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      netSelfEmploymentIncomeCents: d(250_000),
    },
    expected: {
      selfEmploymentTaxCents: d(28_809.65),
    },
  },
  {
    id: 'SE-5',
    label: 'HOH $60k net SE',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'head_of_household' as FilingStatus,
      netSelfEmploymentIncomeCents: d(60_000),
    },
    expected: {
      federalIncomeTaxCents: d(3_651.34),
      totalEstimatedFederalTaxCents: d(12_129.07),
    },
  },
] as const;

export const STAGE2_1099 = [
  {
    id: '1099-1',
    label: 'Gross $100k, expenses $15k',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      gross1099IncomeCents: d(100_000),
      businessExpensesCents: d(15_000),
    },
    expected: {
      net1099IncomeCents: d(85_000),
      totalEstimatedFederalTaxCents: d(21_003.01),
    },
  },
  {
    id: '1099-2',
    label: 'Gross $50k, no expenses',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      gross1099IncomeCents: d(50_000),
    },
    expected: {
      totalEstimatedFederalTaxCents: d(10_602.39),
    },
  },
  {
    id: '1099-3',
    label: 'Expenses exceed gross',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      gross1099IncomeCents: d(20_000),
      businessExpensesCents: d(25_000),
    },
    expected: {
      net1099IncomeCents: 0,
      totalEstimatedFederalTaxCents: 0,
    },
  },
  {
    id: '1099-4',
    label: 'MFJ gross $120k, expenses $20k, other $10k',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'married_filing_jointly' as FilingStatus,
      gross1099IncomeCents: d(120_000),
      businessExpensesCents: d(20_000),
      otherIncomeCents: d(10_000),
    },
    expected: {
      totalEstimatedFederalTaxCents: d(22_404.78),
    },
  },
  {
    id: '1099-5',
    label: 'Gross $75k, expenses $5k',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      gross1099IncomeCents: d(75_000),
      businessExpensesCents: d(5_000),
    },
    expected: {
      selfEmploymentTaxCents: d(9_890.69),
    },
  },
] as const;

export const STAGE2_ESTIMATED = [
  {
    id: 'EST-1',
    label: '90% current-year safe harbor',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      incomeType: 'self_employed' as const,
      netSelfEmploymentIncomeCents: d(80_000),
    },
    expected: {
      estimatedAnnualFederalTaxCents: d(19_274.24),
      safeHarborTargetCents: d(17_346.82),
    },
  },
  {
    id: 'EST-2',
    label: '100% prior-year safe harbor',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      incomeType: 'self_employed' as const,
      netSelfEmploymentIncomeCents: d(60_000),
      priorYearTaxCents: d(18_000),
      priorYearAdjustedGrossIncomeCents: d(120_000),
    },
    expected: {
      safeHarborTargetCents: d(11_817.51),
    },
  },
  {
    id: 'EST-3',
    label: '110% prior-year safe harbor (high AGI)',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      incomeType: 'self_employed' as const,
      netSelfEmploymentIncomeCents: d(100_000),
      priorYearTaxCents: d(30_000),
      priorYearAdjustedGrossIncomeCents: d(180_000),
    },
    expected: {
      safeHarborTargetCents: d(23_570.37),
    },
  },
  {
    id: 'EST-4',
    label: 'Remaining tax after withholding and payments',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      incomeType: 'self_employed' as const,
      netSelfEmploymentIncomeCents: d(80_000),
      federalWithholdingCents: d(5_000),
      estimatedPaymentsMadeCents: d(3_000),
    },
    expected: {
      remainingTaxCents: d(11_274.24),
    },
  },
  {
    id: 'EST-5',
    label: 'Mixed W-2 $50k + SE $30k (engine scope excludes W-2 FICA)',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      incomeType: 'mixed' as const,
      w2WagesCents: d(50_000),
      netSelfEmploymentIncomeCents: d(30_000),
    },
    expected: {
      estimatedAnnualFederalTaxCents: d(12_986.59),
    },
  },
] as const;

export const STAGE2_QUARTERLY = [
  {
    id: 'Q-1',
    label: 'Equal quarterly installment after payments',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      netSelfEmploymentIncomeCents: d(80_000),
      estimatedPaymentsMadeCents: d(4_000),
    },
    expected: {
      totalEstimatedFederalTaxCents: d(19_274.24),
      recommendedQuarterlyPaymentCents: d(3_818.56),
    },
  },
  {
    id: 'Q-2',
    label: 'MFS 110% prior-year safe harbor',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'married_filing_separately' as FilingStatus,
      netSelfEmploymentIncomeCents: d(70_000),
      priorYearTaxCents: d(20_000),
      priorYearAdjustedGrossIncomeCents: d(80_000),
    },
    expected: {
      safeHarborTargetCents: d(14_235.04),
    },
  },
  {
    id: 'Q-3',
    label: 'Remaining estimated tax',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      netSelfEmploymentIncomeCents: d(50_000),
      estimatedPaymentsMadeCents: d(2_500),
    },
    expected: {
      remainingEstimatedTaxCents: d(8_102.39),
    },
  },
  {
    id: 'Q-4',
    label: 'Monthly tax reserve',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      netSelfEmploymentIncomeCents: d(60_000),
    },
    expected: {
      monthlyTaxReserveCents: d(1_094.21),
    },
  },
  {
    id: 'Q-5',
    label: 'Q1 due date from Form 1040-ES',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      netSelfEmploymentIncomeCents: d(40_000),
    },
    expected: {
      q1DueDate: '2025-04-15',
    },
  },
] as const;

export const STAGE2_LLC_VS_SCORP = [
  {
    id: 'LLC-1',
    label: '$100k profit, $50k salary',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      llcBusinessProfitCents: d(100_000),
      sCorpOwnerSalaryCents: d(50_000),
    },
    expected: {
      llcFederalTaxBurdenCents: d(26_189.3),
      sCorpFederalTaxBurdenCents: d(21_264),
    },
  },
  {
    id: 'LLC-2',
    label: '$120k profit, $72k salary — burden difference',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      llcBusinessProfitCents: d(120_000),
      sCorpOwnerSalaryCents: d(72_000),
    },
    expected: {
      taxBurdenDifferenceCents: d(4_041.36),
    },
  },
  {
    id: 'LLC-3',
    label: 'Compliance costs reduce S Corp net value',
    baseInput: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      llcBusinessProfitCents: d(100_000),
      sCorpOwnerSalaryCents: d(50_000),
    },
    complianceInput: {
      annualPayrollAdminCostCents: d(4_000),
    },
    expected: {
      netValueReductionCents: d(4_000),
    },
  },
  {
    id: 'LLC-4',
    label: 'MFJ $150k profit, $60k salary',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'married_filing_jointly' as FilingStatus,
      llcBusinessProfitCents: d(150_000),
      sCorpOwnerSalaryCents: d(60_000),
    },
    expected: {
      sCorpFederalTaxBurdenCents: d(25_408),
    },
  },
  {
    id: 'LLC-5',
    label: 'S Corp distribution',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      llcBusinessProfitCents: d(80_000),
      sCorpOwnerSalaryCents: d(35_000),
    },
    expected: {
      sCorpDistributionCents: d(45_000),
    },
  },
] as const;

export const STAGE2_S_CORP = [
  {
    id: 'SC-1',
    label: 'Total federal tax burden',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      businessProfitCents: d(100_000),
      ownerSalaryCents: d(50_000),
    },
    expected: {
      totalFederalTaxBurdenCents: d(21_264),
    },
  },
  {
    id: 'SC-2',
    label: 'Employee FICA',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      businessProfitCents: d(120_000),
      ownerSalaryCents: d(60_000),
    },
    expected: {
      employeeFicaCents: d(4_590),
    },
  },
  {
    id: 'SC-3',
    label: 'Sole proprietor comparison baseline',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      businessProfitCents: d(100_000),
      ownerSalaryCents: d(50_000),
    },
    expected: {
      soleProprietorTaxBurdenCents: d(26_189.3),
    },
  },
  {
    id: 'SC-4',
    label: 'Employer FICA',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      businessProfitCents: d(150_000),
      ownerSalaryCents: d(80_000),
    },
    expected: {
      employerFicaCents: d(6_120),
    },
  },
  {
    id: 'SC-5',
    label: 'Federal income tax on salary + distribution',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      businessProfitCents: d(100_000),
      ownerSalaryCents: d(40_000),
    },
    expected: {
      federalIncomeTaxCents: d(13_614),
    },
  },
] as const;

export const STAGE2_HSA = [
  {
    id: 'HSA-1',
    label: 'Self-only limit Rev. Proc. 2024-25',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      coverageType: 'self_only' as const,
      age: 40,
      annualIncomeCents: d(80_000),
      hsaContributionCents: d(3_000),
    },
    expected: {
      contributionLimitCents: d(4_300),
    },
  },
  {
    id: 'HSA-2',
    label: 'Family limit',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'married_filing_jointly' as FilingStatus,
      coverageType: 'family' as const,
      age: 45,
      annualIncomeCents: d(120_000),
      hsaContributionCents: d(5_000),
    },
    expected: {
      contributionLimitCents: d(8_550),
    },
  },
  {
    id: 'HSA-3',
    label: 'Catch-up contribution age 55+',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      coverageType: 'self_only' as const,
      age: 55,
      annualIncomeCents: d(90_000),
      hsaContributionCents: d(4_000),
    },
    expected: {
      contributionLimitCents: d(5_300),
    },
  },
  {
    id: 'HSA-4',
    label: 'Federal income tax savings',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      coverageType: 'self_only' as const,
      age: 40,
      annualIncomeCents: d(100_000),
      hsaContributionCents: d(4_300),
    },
    expected: {
      federalIncomeTaxSavingsCents: d(946),
    },
  },
  {
    id: 'HSA-5',
    label: 'Payroll FICA savings',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      coverageType: 'self_only' as const,
      age: 40,
      annualIncomeCents: d(80_000),
      hsaContributionCents: d(3_000),
      payrollDeductedContribution: true,
    },
    expected: {
      payrollTaxSavingsCents: d(229.5),
    },
  },
] as const;

export const STAGE2_W2_VS_1099 = [
  {
    id: 'W2-1',
    label: 'Employee FICA on $100k W-2',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      w2SalaryCents: d(100_000),
      contractorGrossIncomeCents: d(100_000),
    },
    expected: {
      employeeFicaCents: d(7_650),
    },
  },
  {
    id: 'W2-2',
    label: 'Contractor SE + income tax at $100k gross',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      w2SalaryCents: d(100_000),
      contractorGrossIncomeCents: d(100_000),
    },
    expected: {
      contractorTotalTaxCents: d(26_189.3),
    },
  },
  {
    id: 'W2-3',
    label: 'W-2 after-tax income',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      w2SalaryCents: d(80_000),
      contractorGrossIncomeCents: d(80_000),
    },
    expected: {
      w2AfterTaxIncomeCents: d(64_666),
    },
  },
  {
    id: 'W2-4',
    label: 'Contractor with $20k expenses on $100k gross',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      w2SalaryCents: d(100_000),
      contractorGrossIncomeCents: d(100_000),
      contractorBusinessExpensesCents: d(20_000),
    },
    expected: {
      contractorTotalTaxCents: d(19_274.24),
    },
  },
  {
    id: 'W2-5',
    label: 'W-2 total value with benefits',
    input: {
      taxYear: STAGE2_TAX_YEAR,
      filingStatus: 'single' as FilingStatus,
      w2SalaryCents: d(90_000),
      contractorGrossIncomeCents: d(90_000),
      annualBenefitsValueCents: d(12_000),
    },
    expected: {
      w2TotalEstimatedValueCents: d(83_701),
    },
  },
] as const;
