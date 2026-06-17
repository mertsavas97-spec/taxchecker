export type {
  BreakdownLine,
  CalculatorResult,
  EstimatedTaxDetails,
  EstimatedTaxIncomeType,
  EstimatedTaxInput,
  FilingStatus,
  FederalIncomeTaxResult,
  MoneyCents,
  QuarterlyTaxDetails,
  QuarterlyTaxInput,
  ResultCard,
  SelfEmployedTaxDetails,
  SelfEmployedTaxInput,
  SelfEmploymentTaxResult,
  Tax1099TaxDetails,
  Tax1099TaxInput,
  W2Vs1099BetterOption,
  W2Vs1099Details,
  W2Vs1099Input,
  SoleProprietorFederalBurdenInput,
  SoleProprietorFederalBurdenResult,
  SCorpFederalBurdenInput,
  SCorpFederalBurdenResult,
  SoleProprietorVsSCorpComparisonInput,
  SoleProprietorVsSCorpComparisonResult,
  SCorpBreakEvenProfitInput,
  SCorpBreakEvenProfitResult,
  SCorpTaxInput,
  SCorpTaxDetails,
  LlcVsSCorpInput,
  LlcVsSCorpDetails,
  HsaCoverageType,
  HsaTaxInput,
  HsaTaxDetails,
  HsaTaxSavingsInput,
  HsaTaxSavingsResult,
  TaxBracket,
  TaxDisclaimer,
  TaxWarning,
  TaxYearConfig,
  ValidationError,
} from './types';

export { FILING_STATUSES } from './types';

export { getTaxYearConfig, requireTaxYearConfig, taxYear2025 } from './config';

export { calculateAnnualFederalLiability } from './core/annual-federal-liability';

export {
  calculateFederalIncomeTax,
  calculateFederalIncomeTaxFromAgi,
  calculateMarginalRate,
  calculateEffectiveRate,
  calculateTaxableIncome,
} from './core/federal-income-tax';

export {
  calculateNetEarningsFromSelfEmployment,
  calculateSelfEmploymentTax,
  calculateDeductibleSETax,
  calculateAdditionalMedicareTaxForSEIncome,
} from './core/self-employment-tax';

export {
  calculateEmployeeSocialSecurityTax,
  calculateEmployeeMedicareTax,
  calculateEmployeeAdditionalMedicareTax,
  calculateEmployeeFicaTax,
  calculateEmployerFicaTax,
  calculateApproximateW2FederalLiability,
} from './core/payroll-tax';

export type {
  W2FederalLiabilityInput,
  W2FederalLiabilityResult,
} from './core/payroll-tax';

export {
  calculateSoleProprietorFederalBurden,
  calculateSCorpFederalBurden,
  compareSoleProprietorVsSCorp,
  calculateSCorpBreakEvenProfit,
  LOW_SALARY_TO_PROFIT_RATIO_WARNING,
} from './core/business-entity';

export {
  getHsaContributionLimit,
  calculateRemainingHsaContributionRoom,
  calculateHsaFederalTaxSavings,
  calculateHsaPayrollTaxSavings,
  calculateHsaTaxSavings,
} from './core/hsa';

export {
  calculateSafeHarborTargets,
  computeSafeHarborTargets,
  calculateRemainingEstimatedTax,
  calculateQuarterlyPayments,
  calculateMonthlyReserve,
} from './core/estimated-tax';

export type { SafeHarborInput, SafeHarborResult, SafeHarborRule } from './core/estimated-tax';

export {
  dollarsToCents,
  centsToDollars,
  roundCents,
  formatCurrency,
  percentFromRatio,
  splitEqualQuarters,
} from './core/rounding';

export { ENGINE_VERSION, BASE_CALCULATOR_WARNINGS } from './core/calculator-shared';

export { calculateSelfEmployedTax } from './calculators/self-employed-tax';

export { calculate1099Tax } from './calculators/1099-tax';

export { calculateQuarterlyTax } from './calculators/quarterly-tax';

export { calculateEstimatedTax } from './calculators/estimated-tax';

export { calculateW2Vs1099 } from './calculators/w2-vs-1099';

export { calculateSCorpTax } from './calculators/s-corp-tax';

export { calculateLlcVsSCorp } from './calculators/llc-vs-scorp';

export { calculateHsaTax } from './calculators/hsa-tax';
