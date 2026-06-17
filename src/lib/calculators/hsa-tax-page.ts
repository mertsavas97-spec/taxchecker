import type { SourceReferenceItem } from '@/components/calculator/source-section';
import type { FaqItem } from '@/components/content/faq-block';
import type { MethodologyPoint } from '@/components/content/methodology-block';
import {
  buildReadyCalculatorNavLinks,
  buildRelatedGuideLinks,
} from '@/lib/calculators/related-links';
import {
  calculateHsaTax,
  dollarsToCents,
  formatCurrency,
  type HsaCoverageType,
  type TaxYearConfig,
} from '@/lib/tax-engine';

export const HSA_TAX_SLUG = 'hsa-tax-savings-calculator';

export interface HsaWorkedExampleScenario {
  key: string;
  title: string;
  subtitle: string;
  coverageType: HsaCoverageType;
  age: number;
  hsaContributionCents: number;
}

export function buildHsaWorkedExampleScenarios(
  config: TaxYearConfig,
): HsaWorkedExampleScenario[] {
  const catchUp = config.hsa.catchUpAmount;
  const familyWithCatchUp = config.hsa.familyLimit + catchUp;

  return [
    {
      key: 'self-only-4300',
      title: 'Self-only coverage',
      subtitle: 'Age 35, $4,300 contribution',
      coverageType: 'self_only',
      age: 35,
      hsaContributionCents: config.hsa.selfOnlyLimit,
    },
    {
      key: 'family-8550',
      title: 'Family coverage',
      subtitle: 'Age 45, $8,550 contribution',
      coverageType: 'family',
      age: 45,
      hsaContributionCents: config.hsa.familyLimit,
    },
    {
      key: 'family-catch-up',
      title: 'Family coverage with catch-up',
      subtitle: `Age 56, ${formatCurrency(familyWithCatchUp)} contribution`,
      coverageType: 'family',
      age: 56,
      hsaContributionCents: familyWithCatchUp,
    },
  ];
}

export interface HsaWorkedExampleRow {
  key: string;
  title: string;
  subtitle: string;
  totalTaxSavingsCents: number;
  federalIncomeTaxSavingsCents: number;
  payrollTaxSavingsCents: number;
  netAfterTaxCostCents: number;
  contributionLimitCents: number;
  excessContributionCents: number;
}

export function buildHsaWorkedExamples(
  config: TaxYearConfig,
  filingStatus: 'single' = 'single',
  annualIncomeCents: number = dollarsToCents(85_000),
): HsaWorkedExampleRow[] {
  return buildHsaWorkedExampleScenarios(config).map((scenario) => {
    const result = calculateHsaTax({
      taxYear: config.taxYear,
      filingStatus,
      coverageType: scenario.coverageType,
      age: scenario.age,
      annualIncomeCents,
      hsaContributionCents: scenario.hsaContributionCents,
      eligibleMonths: 12,
    });

    return {
      key: scenario.key,
      title: scenario.title,
      subtitle: scenario.subtitle,
      totalTaxSavingsCents: result.details.totalTaxSavingsCents,
      federalIncomeTaxSavingsCents: result.details.federalIncomeTaxSavingsCents,
      payrollTaxSavingsCents: result.details.payrollTaxSavingsCents,
      netAfterTaxCostCents: result.details.netAfterTaxCostCents,
      contributionLimitCents: result.details.contributionLimitCents,
      excessContributionCents: result.details.excessContributionCents,
    };
  });
}

export function getHsaLimitRows(config: TaxYearConfig): {
  label: string;
  amount: string;
}[] {
  const catchUp = config.hsa.catchUpAmount;

  return [
    {
      label: 'Self-only coverage',
      amount: formatCurrency(config.hsa.selfOnlyLimit),
    },
    {
      label: 'Family coverage',
      amount: formatCurrency(config.hsa.familyLimit),
    },
    {
      label: `Catch-up (age ${config.hsa.catchUpAge}+)`,
      amount: formatCurrency(catchUp),
    },
  ];
}

export function getHowHsaTaxSavingsWorkPoints(): MethodologyPoint[] {
  return [
    {
      title: 'Triple tax advantage (federal)',
      description:
        'HSA contributions can reduce federal taxable income when made with qualifying coverage. Qualified withdrawals for medical expenses may be tax-free, and earnings can grow tax-free when rules are met.',
    },
    {
      title: 'Deduction from taxable income',
      description:
        'This calculator estimates federal income tax savings by applying your marginal federal rate to eligible contributions based on annual income and filing status.',
    },
    {
      title: 'Optional payroll FICA savings',
      description:
        'When you indicate payroll deduction, employee Social Security and Medicare tax savings may also be estimated on eligible contributions.',
    },
    {
      title: 'HDHP required',
      description:
        'You must have qualifying high deductible health plan coverage to contribute. This tool does not verify plan eligibility.',
    },
  ];
}

export function getHsaContributionLimitsPoints(config: TaxYearConfig): MethodologyPoint[] {
  const hsa = config.hsa;
  const catchUpAge = hsa.catchUpAge;

  return [
    {
      title: `${formatCurrency(hsa.selfOnlyLimit)} self-only limit`,
      description: `IRS ${config.taxYear} annual contribution limit for self-only HDHP coverage before catch-up.`,
    },
    {
      title: `${formatCurrency(hsa.familyLimit)} family limit`,
      description: `IRS ${config.taxYear} annual contribution limit for family HDHP coverage before catch-up.`,
    },
    {
      title: `${formatCurrency(hsa.catchUpAmount)} catch-up contribution`,
      description: `Additional annual contribution allowed when you are age ${catchUpAge} or older and otherwise eligible.`,
    },
    {
      title: 'Partial-year eligibility',
      description:
        'Enter eligible months if you were not HSA-eligible for the full year. Last-month rule and testing period rules are simplified.',
    },
  ];
}

export function getEmployerContributionPoints(): MethodologyPoint[] {
  return [
    {
      title: 'Counts toward the annual limit',
      description:
        'Employer HSA contributions count against the same IRS annual limit as your contributions.',
    },
    {
      title: 'Reduces remaining room',
      description:
        'Remaining contribution room equals the annual limit minus employer contributions already made or expected.',
    },
    {
      title: 'User contribution is separate',
      description:
        'Enter your own contribution separately from employer funding to see remaining room and excess contribution risk.',
    },
    {
      title: 'Not benefits advice',
      description:
        'Employer program rules vary. Confirm actual employer funding with your plan administrator.',
    },
  ];
}

export function getPayrollDeductedHsaPoints(): MethodologyPoint[] {
  return [
    {
      title: 'Payroll deduction checkbox',
      description:
        'Select payroll deduction when your HSA contribution is made through employer payroll on a pre-tax basis.',
    },
    {
      title: 'FICA savings estimate',
      description:
        'Employee Social Security and Medicare tax savings may apply to payroll-deducted contributions in this model.',
    },
    {
      title: 'Non-payroll contributions',
      description:
        'Contributions made outside payroll still may qualify for federal income tax deduction but not FICA savings in this estimate.',
    },
    {
      title: 'Simplified payroll model',
      description:
        'Actual paycheck withholding and employer payroll systems may differ from this planning estimate.',
    },
  ];
}

export function getExcessContributionPoints(): MethodologyPoint[] {
  return [
    {
      title: 'What counts as excess',
      description:
        'Excess contribution is the amount by which your user contribution exceeds remaining room after employer contributions and the annual limit.',
    },
    {
      title: 'Additional tax and penalty risk',
      description:
        'IRS rules may impose an excise tax and require corrective distributions for excess HSA contributions. This calculator flags excess amounts but does not compute penalties.',
    },
    {
      title: 'Review before contributing',
      description:
        'If excess contribution is greater than zero, review limits and timing with your plan administrator and tax advisor before making additional deposits.',
    },
    {
      title: 'Correction not modeled',
      description:
        'Withdrawal of excess contributions and Form 5329 reporting are not modeled here.',
    },
  ];
}

export function getHsaTaxFaqs(config: TaxYearConfig): FaqItem[] {
  const hsa = config.hsa;
  const catchUpAge = hsa.catchUpAge;

  return [
    {
      question: 'What is an HSA?',
      answer:
        'A Health Savings Account is a tax-advantaged account used with qualifying high deductible health plan coverage. Contributions may reduce federal taxable income, and qualified medical withdrawals can be tax-free.',
    },
    {
      question: `How much can I contribute to an HSA in ${config.taxYear}?`,
      answer: `For ${config.taxYear}, IRS limits are ${formatCurrency(hsa.selfOnlyLimit)} for self-only coverage and ${formatCurrency(hsa.familyLimit)} for family coverage, plus a ${formatCurrency(hsa.catchUpAmount)} catch-up when age ${catchUpAge}+ if eligible.`,
    },
    {
      question: 'Does an employer contribution count toward the HSA limit?',
      answer:
        'Yes. Employer contributions count toward the same annual IRS limit and reduce the remaining room for your contributions.',
    },
    {
      question: 'What is the HSA catch-up contribution?',
      answer: `Eligible individuals age ${catchUpAge} or older may contribute an additional ${formatCurrency(hsa.catchUpAmount)} per year on top of the base self-only or family limit, subject to IRS rules.`,
    },
    {
      question: 'Does this include state taxes?',
      answer:
        'No. This is a federal-only estimate. State income tax treatment of HSA contributions varies and is excluded.',
    },
    {
      question: 'Does this verify HDHP eligibility?',
      answer:
        'No. You must have qualifying HDHP coverage to contribute to an HSA. This calculator does not review your health plan.',
    },
    {
      question: 'Do payroll HSA contributions save FICA tax?',
      answer:
        'In this model, employee Social Security and Medicare tax savings are estimated only when you indicate the contribution is payroll-deducted.',
    },
    {
      question: 'What happens if I overcontribute?',
      answer:
        'Excess contributions may be subject to IRS excise tax and require corrective action. This calculator shows excess amounts for planning but does not compute penalties or filing outcomes.',
    },
    {
      question: 'Does this include investment growth?',
      answer:
        'No. HSA investment earnings and long-term account growth are not included in this estimate.',
    },
    {
      question: 'Is this tax or benefits advice?',
      answer:
        'No. TaxChecker provides simplified federal savings estimates for planning. It is not tax, financial, or benefits advice.',
    },
  ];
}

export function getHsaIrsSources(config: TaxYearConfig): SourceReferenceItem[] {
  return [
    {
      title: config.sources.hsa.title,
      url: config.sources.hsa.url,
      taxYear: config.sources.hsa.taxYear,
      dateAccessed: config.sources.hsa.dateAccessed,
      note: `${config.taxYear} HSA contribution limits (Revenue Procedure).`,
    },
    {
      title: 'Publication 969 — Health Savings Accounts and Other Tax-Favored Health Plans',
      url: 'https://www.irs.gov/publications/p969',
      taxYear: config.taxYear,
      dateAccessed: config.verifiedAt,
      note: 'IRS HSA eligibility, contributions, and distribution rules.',
    },
    {
      title: config.sources.federalIncomeTax.title,
      url: config.sources.federalIncomeTax.url,
      taxYear: config.sources.federalIncomeTax.taxYear,
      dateAccessed: config.sources.federalIncomeTax.dateAccessed,
      note: `${config.taxYear} federal income tax brackets used for marginal savings (Rev. Proc.).`,
    },
  ];
}

export function getHsaRelatedCalculatorLinks() {
  return buildReadyCalculatorNavLinks([
    'self-employed-tax-calculator',
    'estimated-tax-calculator',
    '1099-tax-calculator',
    'quarterly-tax-calculator',
  ]);
}

export function getHsaRelatedGuideLinks() {
  return buildRelatedGuideLinks([
    'tax-brackets-2025',
    'self-employment-tax-guide',
    'taxchecker-methodology',
  ]);
}

export function formatHsaExampleCurrency(cents: number): string {
  return formatCurrency(cents);
}
