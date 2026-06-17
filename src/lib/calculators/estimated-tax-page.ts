import type { SourceReferenceItem } from '@/components/calculator/source-section';
import type { FaqItem } from '@/components/content/faq-block';
import type { MethodologyPoint } from '@/components/content/methodology-block';
import {
  buildReadyCalculatorNavLinks,
  buildRelatedGuideLinks,
} from '@/lib/calculators/related-links';
import {
  calculateEstimatedTax,
  dollarsToCents,
  formatCurrency,
  type EstimatedTaxIncomeType,
  type TaxYearConfig,
} from '@/lib/tax-engine';

export const ESTIMATED_TAX_SLUG = 'estimated-tax-calculator';

export interface EstimatedWorkedExampleScenario {
  key: string;
  title: string;
  subtitle: string;
  input: {
    incomeType: EstimatedTaxIncomeType;
    netSelfEmploymentIncomeCents?: number;
    w2WagesCents?: number;
    otherIncomeCents?: number;
  };
}

export const WORKED_EXAMPLE_SCENARIOS: EstimatedWorkedExampleScenario[] = [
  {
    key: 'se-75k',
    title: '$75,000 self-employed income',
    subtitle: 'Self-employed only, no withholding or estimated payments',
    input: {
      incomeType: 'self_employed',
      netSelfEmploymentIncomeCents: dollarsToCents(75_000),
    },
  },
  {
    key: 'mixed-120k',
    title: '$120,000 mixed income',
    subtitle: '$80,000 W-2 wages and $40,000 net self-employment income',
    input: {
      incomeType: 'mixed',
      w2WagesCents: dollarsToCents(80_000),
      netSelfEmploymentIncomeCents: dollarsToCents(40_000),
    },
  },
  {
    key: 'se-200k',
    title: '$200,000 self-employed income',
    subtitle: 'Self-employed only, no withholding or estimated payments',
    input: {
      incomeType: 'self_employed',
      netSelfEmploymentIncomeCents: dollarsToCents(200_000),
    },
  },
];

export interface EstimatedWorkedExampleRow {
  key: string;
  title: string;
  subtitle: string;
  estimatedAnnualFederalTaxCents: number;
  remainingTaxCents: number;
  recommendedRemainingQuarterlyPaymentCents: number;
  monthlyTaxReserveCents: number;
  safeHarborTargetCents: number;
  federalIncomeTaxCents: number;
  selfEmploymentTaxCents: number;
}

export function buildEstimatedWorkedExamples(
  filingStatus: 'single' = 'single',
): EstimatedWorkedExampleRow[] {
  return WORKED_EXAMPLE_SCENARIOS.map((scenario) => {
    const result = calculateEstimatedTax({
      taxYear: 2025,
      filingStatus,
      ...scenario.input,
    });

    return {
      key: scenario.key,
      title: scenario.title,
      subtitle: scenario.subtitle,
      estimatedAnnualFederalTaxCents: result.details.estimatedAnnualFederalTaxCents,
      remainingTaxCents: result.details.remainingTaxCents,
      recommendedRemainingQuarterlyPaymentCents:
        result.details.recommendedRemainingQuarterlyPaymentCents,
      monthlyTaxReserveCents: result.details.monthlyTaxReserveCents,
      safeHarborTargetCents: result.details.safeHarborTargetCents,
      federalIncomeTaxCents: result.details.federalIncomeTaxCents,
      selfEmploymentTaxCents: result.details.selfEmploymentTaxCents,
    };
  });
}

export function getWhatEstimatedTaxMeansPoints(): MethodologyPoint[] {
  return [
    {
      title: 'Pay-as-you-go federal tax',
      description:
        'Estimated tax is the method many taxpayers use to pay federal income and self-employment tax during the year when paycheck withholding will not cover the full liability.',
    },
    {
      title: 'Annual liability first',
      description:
        'You estimate your total federal tax for the year, then compare what you have already paid through withholding and estimated payments against that liability.',
    },
    {
      title: 'Remaining tax drives payments',
      description:
        'The amount still owed after withholding and estimated payments helps determine how much to pay on each Form 1040-ES due date.',
    },
    {
      title: 'Safe harbor for penalties',
      description:
        'Federal safe harbor rules can help avoid underpayment penalties if you pay enough tax during the year. This calculator shows common planning targets.',
    },
  ];
}

export function getHowEstimatedTaxCalculatorWorksPoints(
  config: TaxYearConfig,
): MethodologyPoint[] {
  const rate = (config.estimatedTax.safeHarborCurrentYearRate * 100).toFixed(0);

  return [
    {
      title: 'Self-employed or mixed income paths',
      description:
        'Choose self-employed only for net business profit, or mixed income when you also have W-2 wages that affect Social Security wage base coordination.',
    },
    {
      title: 'Withholding and estimated payments',
      description:
        'Federal withholding from W-2 jobs and estimated payments you already made reduce remaining tax before quarterly payment suggestions are calculated.',
    },
    {
      title: 'Equal quarterly split',
      description:
        'The estimated remaining quarterly payment divides leftover federal tax into four equal installments for planning.',
    },
    {
      title: 'Safe harbor comparison',
      description: `When prior-year tax and AGI are provided, the calculator compares ${rate}% of current-year tax with prior-year safe harbor rules.`,
    },
    {
      title: 'Known exclusions',
      description:
        'State taxes, tax credits, underpayment penalty calculations, and uneven income timing within the year are not fully modeled.',
    },
  ];
}

export function getEstimatedVsQuarterlyTaxPoints(): MethodologyPoint[] {
  return [
    {
      title: 'Estimated tax is the annual worksheet',
      description:
        'This calculator focuses on annual federal liability, remaining tax after offsets, safe harbor targets, and how much is left to pay over the year.',
    },
    {
      title: 'Quarterly tax is the payment schedule view',
      description:
        'The Quarterly Tax Calculator emphasizes Form 1040-ES due dates and quarterly payment amounts for self-employment income without W-2 withholding fields.',
    },
    {
      title: 'Same federal engine underneath',
      description:
        'Both tools use the same federal tax constants from IRS publications and safe harbor logic. Choose based on whether you need the full annual worksheet or a quarterly planning view.',
    },
  ];
}

export function getEstimatedSafeHarborPoints(config: TaxYearConfig): MethodologyPoint[] {
  const et = config.estimatedTax;
  const currentRate = (et.safeHarborCurrentYearRate * 100).toFixed(0);
  const priorRate = (et.safeHarborPriorYearRate * 100).toFixed(0);
  const highAgiRate = (et.safeHarborPriorYearHighAGIRate * 100).toFixed(0);
  const agiThreshold = formatCurrency(et.safeHarborHighAGIThreshold);
  const mfsThreshold = formatCurrency(et.safeHarborHighAGIThresholdMFS);

  return [
    {
      title: `${currentRate}% of current-year tax`,
      description:
        'A common federal safe harbor is paying at least 90% of your current tax year liability through withholding and estimated payments by the due dates.',
    },
    {
      title: `${priorRate}% of prior-year tax`,
      description: `When prior-year tax and AGI are known, paying ${priorRate}% of last year’s total tax can satisfy safe harbor for filers at or below ${agiThreshold} AGI (${mfsThreshold} married filing separately).`,
    },
    {
      title: `${highAgiRate}% for higher prior-year AGI`,
      description: `When prior-year AGI exceeds the threshold, the prior-year safe harbor increases to ${highAgiRate}% of prior-year tax.`,
    },
    {
      title: 'Planning target only',
      description:
        'This calculator shows the lower applicable safe harbor target. It does not calculate penalties or verify that payments were made on time.',
    },
  ];
}

export function getEstimatedTaxFaqs(config: TaxYearConfig): FaqItem[] {
  return [
    {
      question: 'What is estimated tax?',
      answer:
        'Estimated tax is how many taxpayers pay federal income and self-employment tax during the year when enough tax is not withheld from paychecks. Payments are often made quarterly using Form 1040-ES.',
    },
    {
      question: 'Who needs to pay estimated tax?',
      answer:
        'Self-employed taxpayers and others who expect to owe federal tax after withholding often make estimated payments. This calculator shows planning amounts; it does not determine your legal filing obligation.',
    },
    {
      question: 'How is estimated tax calculated?',
      answer:
        'This tool estimates annual federal tax from your income inputs, subtracts federal withholding and estimated payments already made, and suggests equal quarterly payments on the remaining amount.',
    },
    {
      question: 'What is the difference between estimated tax and quarterly tax?',
      answer:
        'Estimated tax refers to the annual federal liability and how much you still owe after withholding and payments. Quarterly tax usually refers to the four Form 1040-ES payment due dates during the year. This calculator covers both the annual worksheet and the payment schedule.',
    },
    {
      question: 'What is the safe harbor rule?',
      answer:
        'Federal safe harbor rules can help you avoid underpayment penalties if you pay enough tax during the year—often 90% of current-year tax or 100%/110% of prior-year tax depending on AGI.',
    },
    {
      question: 'Does this include W-2 withholding?',
      answer:
        'Yes. Enter expected annual federal withholding from W-2 jobs in the optional field. It reduces remaining tax alongside estimated payments you already made.',
    },
    {
      question: 'Does this include state taxes?',
      answer:
        'No. This is a federal-only estimate. State and local estimated taxes are excluded.',
    },
    {
      question: 'Does this calculate penalties?',
      answer:
        'No. Underpayment penalties and interest are not calculated. A warning notes that missing estimated payments may result in IRS penalties.',
    },
    {
      question: 'What if my income changes?',
      answer:
        'This model uses the income you enter now. If wages or self-employment profit change later, your actual required payments may differ. IRS Form 1040-ES includes annualization worksheets for uneven income.',
    },
    {
      question: 'Is this tax advice?',
      answer:
        'No. TaxChecker provides simplified federal estimates for planning. It is not a substitute for a CPA, enrolled agent, or other qualified tax professional.',
    },
  ];
}

export function getEstimatedIrsSources(config: TaxYearConfig): SourceReferenceItem[] {
  return [
    {
      title: config.sources.estimatedTax.title,
      url: config.sources.estimatedTax.url,
      taxYear: config.sources.estimatedTax.taxYear,
      dateAccessed: config.sources.estimatedTax.dateAccessed,
      note: 'Form 1040-ES estimated tax payment vouchers and due dates.',
    },
    {
      title: 'Publication 505 — Tax Withholding and Estimated Tax',
      url: 'https://www.irs.gov/publications/p505',
      taxYear: config.taxYear,
      dateAccessed: config.verifiedAt,
      note: 'Estimated tax safe harbor and payment rules.',
    },
    {
      title: 'Schedule SE (Form 1040)',
      url: 'https://www.irs.gov/forms-pubs/about-schedule-se-form-1040',
      taxYear: config.taxYear,
      dateAccessed: config.verifiedAt,
      note: 'Self-employment tax computation used when applicable.',
    },
    {
      title: config.sources.federalIncomeTax.title,
      url: config.sources.federalIncomeTax.url,
      taxYear: config.sources.federalIncomeTax.taxYear,
      dateAccessed: config.sources.federalIncomeTax.dateAccessed,
      note: `${config.taxYear} federal income tax brackets and standard deduction (Rev. Proc.).`,
    },
  ];
}

export function getEstimatedRelatedCalculatorLinks() {
  return buildReadyCalculatorNavLinks([
    'self-employed-tax-calculator',
    '1099-tax-calculator',
    'quarterly-tax-calculator',
    'w2-vs-1099-calculator',
  ]);
}

export function getEstimatedRelatedGuideLinks() {
  return buildRelatedGuideLinks([
    'quarterly-tax-due-dates-2025',
    'self-employment-tax-guide',
    'tax-brackets-2025',
    'taxchecker-methodology',
  ]);
}

export function formatEstimatedExampleCurrency(cents: number): string {
  return formatCurrency(cents);
}
