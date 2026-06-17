import type { SourceReferenceItem } from '@/components/calculator/source-section';
import type { FaqItem } from '@/components/content/faq-block';
import type { MethodologyPoint } from '@/components/content/methodology-block';
import {
  buildReadyCalculatorNavLinks,
  buildRelatedGuideLinks,
} from '@/lib/calculators/related-links';
import {
  calculateQuarterlyTax,
  dollarsToCents,
  formatCurrency,
  type TaxYearConfig,
} from '@/lib/tax-engine';

export const QUARTERLY_TAX_SLUG = 'quarterly-tax-calculator';

export const WORKED_EXAMPLE_INCOMES = [50_000, 100_000, 200_000] as const;

export interface QuarterlyWorkedExampleRow {
  netIncomeDollars: number;
  totalEstimatedFederalTaxCents: number;
  recommendedQuarterlyPaymentCents: number;
  monthlyTaxReserveCents: number;
  remainingEstimatedTaxCents: number;
  safeHarborTargetCents: number;
  selfEmploymentTaxCents: number;
  federalIncomeTaxCents: number;
}

export function formatQuarterlyDueDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function buildQuarterlyWorkedExamples(
  filingStatus: 'single' = 'single',
): QuarterlyWorkedExampleRow[] {
  return WORKED_EXAMPLE_INCOMES.map((netIncomeDollars) => {
    const result = calculateQuarterlyTax({
      taxYear: 2025,
      filingStatus,
      netSelfEmploymentIncomeCents: dollarsToCents(netIncomeDollars),
    });

    return {
      netIncomeDollars,
      totalEstimatedFederalTaxCents: result.details.totalEstimatedFederalTaxCents,
      recommendedQuarterlyPaymentCents: result.details.recommendedQuarterlyPaymentCents,
      monthlyTaxReserveCents: result.details.monthlyTaxReserveCents,
      remainingEstimatedTaxCents: result.details.remainingEstimatedTaxCents,
      safeHarborTargetCents: result.details.safeHarborTargetCents,
      selfEmploymentTaxCents: result.details.selfEmployedDetails.selfEmploymentTaxCents,
      federalIncomeTaxCents: result.details.selfEmployedDetails.federalIncomeTaxCents,
    };
  });
}

export function getHowQuarterlyTaxesWorkPoints(): MethodologyPoint[] {
  return [
    {
      title: 'Pay-as-you-go federal tax',
      description:
        'The IRS expects many self-employed taxpayers to pay federal income and self-employment tax during the year rather than in one lump sum at filing time.',
    },
    {
      title: 'Four estimated payments per year',
      description:
        'Form 1040-ES schedules four quarterly payments. Each due date covers tax on income earned in that part of the year.',
    },
    {
      title: 'Based on annualized income',
      description:
        'Quarterly amounts are planning estimates derived from your expected annual federal tax. Actual required payments can change if income shifts.',
    },
    {
      title: 'Safe harbor reduces underpayment risk',
      description:
        'Paying enough through withholding and estimated tax by each due date can help avoid federal underpayment penalties. This calculator shows common safe harbor targets for planning.',
    },
  ];
}

export function getHowCalculatorEstimatesPoints(config: TaxYearConfig): MethodologyPoint[] {
  const rate = (config.estimatedTax.safeHarborCurrentYearRate * 100).toFixed(0);

  return [
    {
      title: 'Annual federal tax first',
      description:
        'The engine estimates annual self-employment tax and federal income tax from your net self-employment income and optional other income.',
    },
    {
      title: 'Remaining tax after payments',
      description:
        'Estimated payments you already made reduce the remaining federal tax used to suggest quarterly amounts.',
    },
    {
      title: 'Equal quarterly split',
      description:
        'The estimated quarterly payment divides remaining estimated tax into four equal installments for planning (Form 1040-ES worksheet simplification).',
    },
    {
      title: 'Safe harbor comparison',
      description: `When prior-year tax and AGI are provided, the calculator compares ${rate}% of current-year tax with prior-year safe harbor rules and shows the lower planning target.`,
    },
    {
      title: 'Known exclusions',
      description:
        'State taxes, tax credits, underpayment penalty calculations, and uneven income timing within the year are not fully modeled.',
    },
  ];
}

export function getQuarterlyDueDateRows(config: TaxYearConfig): {
  quarter: string;
  dueDate: string;
}[] {
  const labels = ['Q1', 'Q2', 'Q3', 'Q4'] as const;
  return config.estimatedTax.quarterlyDueDates.map((iso, index) => ({
    quarter: labels[index] ?? `Q${index + 1}`,
    dueDate: formatQuarterlyDueDate(iso),
  }));
}

export function getSafeHarborExplanationPoints(config: TaxYearConfig): MethodologyPoint[] {
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
      description: `If prior-year tax and AGI are known, paying ${priorRate}% of last year’s total tax can also satisfy safe harbor when AGI is at or below the IRS threshold (${agiThreshold} for most filers; ${mfsThreshold} married filing separately).`,
    },
    {
      title: `${highAgiRate}% for higher prior-year AGI`,
      description: `When prior-year AGI exceeds the threshold, the prior-year safe harbor increases to ${highAgiRate}% of prior-year tax.`,
    },
    {
      title: 'Planning target shown',
      description:
        'This calculator displays the lower applicable safe harbor target alongside your annual estimate. It does not calculate penalties or verify payment timing.',
    },
  ];
}

export function getQuarterlyTaxFaqs(config: TaxYearConfig): FaqItem[] {
  const dueDates = config.estimatedTax.quarterlyDueDates
    .map((iso, index) => `Q${index + 1}: ${formatQuarterlyDueDate(iso)}`)
    .join('; ');

  return [
    {
      question: 'What are quarterly taxes?',
      answer:
        'Quarterly taxes usually refer to federal estimated tax payments made four times per year on self-employment and other income not subject to paycheck withholding. They help cover income tax and self-employment tax as you earn income.',
    },
    {
      question: 'Who needs to pay quarterly taxes?',
      answer:
        'Many self-employed taxpayers and others who expect to owe federal tax make estimated payments if withholding will not cover their liability. This calculator shows planning amounts; it does not determine your legal filing obligation.',
    },
    {
      question: 'When are 2025 quarterly taxes due?',
      answer: `For tax year ${config.taxYear}, IRS Form 1040-ES due dates are ${dueDates}. A weekend or holiday may shift a due date to the next business day.`,
    },
    {
      question: 'How are quarterly payments calculated?',
      answer:
        'This tool estimates annual federal tax from your inputs, subtracts estimated payments already made, and divides the remainder into four equal quarterly amounts for planning.',
    },
    {
      question: 'What is the safe harbor rule?',
      answer:
        'Federal safe harbor rules let you avoid underpayment penalties if you pay enough tax during the year through withholding and estimated payments—often 90% of current-year tax or 100%/110% of prior-year tax depending on AGI.',
    },
    {
      question: 'Does this include state taxes?',
      answer:
        'No. This is a federal-only estimate. State and local estimated taxes are excluded.',
    },
    {
      question: 'What if I already made estimated payments?',
      answer:
        'Enter federal estimated tax you already paid in the optional field. The calculator reduces remaining estimated tax and adjusts the suggested quarterly payment split.',
    },
    {
      question: 'What if my income changes during the year?',
      answer:
        'This model annualizes the income you enter now. If your profit rises or falls later, your actual required payments may differ. IRS Form 1040-ES includes worksheets for uneven income.',
    },
    {
      question: 'Does this calculate penalties?',
      answer:
        'No. Underpayment penalties and interest are not calculated. A warning notes that missing estimated payments may result in IRS penalties.',
    },
    {
      question: 'Is this tax advice?',
      answer:
        'No. TaxChecker provides simplified federal estimates for planning. It is not a substitute for a CPA, enrolled agent, or other qualified tax professional.',
    },
  ];
}

export function getQuarterlyIrsSources(config: TaxYearConfig): SourceReferenceItem[] {
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
      note: 'Self-employment tax computation used in the annual estimate.',
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

export function getQuarterlyRelatedCalculatorLinks() {
  return buildReadyCalculatorNavLinks([
    'self-employed-tax-calculator',
    '1099-tax-calculator',
    'estimated-tax-calculator',
    'hsa-tax-savings-calculator',
  ]);
}

export function getQuarterlyRelatedGuideLinks() {
  return buildRelatedGuideLinks([
    'quarterly-tax-due-dates-2025',
    'self-employment-tax-guide',
    'quarterly-tax-guide',
    'tax-brackets-2025',
    'taxchecker-methodology',
  ]);
}

export function formatQuarterlyExampleCurrency(cents: number): string {
  return formatCurrency(cents);
}
