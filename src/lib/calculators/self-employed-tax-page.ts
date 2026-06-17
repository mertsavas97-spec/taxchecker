import type { SourceReferenceItem } from '@/components/calculator/source-section';
import type { FaqItem } from '@/components/content/faq-block';
import type { MethodologyPoint } from '@/components/content/methodology-block';
import { getCalculatorBySlug } from '@/config/calculators';
import {
  buildReadyCalculatorNavLinks,
  buildRelatedGuideLinks,
} from '@/lib/calculators/related-links';
import {
  calculateSelfEmployedTax,
  dollarsToCents,
  formatCurrency,
  percentFromRatio,
  taxYear2025,
  type TaxYearConfig,
} from '@/lib/tax-engine';

export const SELF_EMPLOYED_TAX_SLUG = 'self-employed-tax-calculator';

export const WORKED_EXAMPLE_INCOMES = [50_000, 100_000, 200_000] as const;

export interface WorkedExampleRow {
  netIncomeDollars: number;
  selfEmploymentTaxCents: number;
  federalIncomeTaxCents: number;
  totalEstimatedFederalTaxCents: number;
  quarterlyEstimatedPaymentCents: number;
  effectiveTaxRate: number;
}

export function buildWorkedExamples(
  filingStatus: 'single' = 'single',
): WorkedExampleRow[] {
  return WORKED_EXAMPLE_INCOMES.map((netIncomeDollars) => {
    const result = calculateSelfEmployedTax({
      taxYear: 2025,
      filingStatus,
      netSelfEmploymentIncomeCents: dollarsToCents(netIncomeDollars),
    });

    return {
      netIncomeDollars,
      selfEmploymentTaxCents: result.details.selfEmploymentTaxCents,
      federalIncomeTaxCents: result.details.federalIncomeTaxCents,
      totalEstimatedFederalTaxCents: result.details.totalEstimatedFederalTaxCents,
      quarterlyEstimatedPaymentCents: result.details.quarterlyEstimatedPaymentCents,
      effectiveTaxRate: result.details.effectiveTaxRate,
    };
  });
}

export function getMethodologyPoints(config: TaxYearConfig): MethodologyPoint[] {
  const se = config.selfEmploymentTax;
  const netEarningsPercent = (se.netEarningsFactor * 100).toFixed(2);
  const deductiblePercent = (se.deductiblePortionRate * 100).toFixed(0);

  return [
    {
      title: 'Net self-employment income',
      description:
        'Enter net profit after business expenses (Schedule C line 31 equivalent). This calculator does not subtract expenses for you.',
    },
    {
      title: 'Net earnings subject to SE tax',
      description: `Schedule SE applies a ${netEarningsPercent}% net earnings factor before computing Social Security and Medicare tax on self-employment income.`,
    },
    {
      title: 'Self-employment tax components',
      description: `Social Security and Medicare portions use IRS Schedule SE rates for ${config.taxYear}, including the Social Security wage base cap where applicable.`,
    },
    {
      title: 'Deductible portion of SE tax',
      description: `One-half (${deductiblePercent}%) of self-employment tax is deductible when calculating adjusted gross income, which can reduce federal income tax.`,
    },
    {
      title: 'Federal income tax',
      description: `Federal income tax uses ${config.taxYear} brackets and the standard deduction from IRS publications for your filing status. Itemized deductions are not modeled.`,
    },
    {
      title: 'Quarterly payment estimate',
      description:
        'The suggested quarterly amount divides estimated annual federal tax into four equal payments for planning. Safe harbor rules and prior-year comparisons are not fully modeled here.',
    },
    {
      title: 'Known exclusions',
      description:
        'State and local taxes, tax credits, the QBI deduction (Section 199A), underpayment penalties, AMT, and retirement or health deductions are excluded from this estimate.',
    },
  ];
}

export function getSelfEmployedTaxFaqs(config: TaxYearConfig): FaqItem[] {
  const se = config.selfEmploymentTax;
  const combinedSeRate = percentFromRatio(
    se.socialSecurityRate + se.medicareRate,
    1,
  );
  const netEarningsPercent = (se.netEarningsFactor * 100).toFixed(2);

  return [
    {
      question: 'What is self-employment tax?',
      answer:
        'Self-employment tax is Social Security and Medicare tax for people who work for themselves. It is reported on Schedule SE and is separate from federal income tax.',
    },
    {
      question: 'How is self-employment tax calculated?',
      answer: `This calculator follows Schedule SE: net self-employment profit is multiplied by ${netEarningsPercent}% to get net earnings, then Social Security and Medicare rates apply (${combinedSeRate} combined before wage-base limits). Half of SE tax may reduce AGI for income tax.`,
    },
    {
      question: `What is the self-employment tax rate for ${config.taxYear}?`,
      answer: `For ${config.taxYear}, the combined Schedule SE rate on net earnings is ${combinedSeRate} (Social Security ${percentFromRatio(se.socialSecurityRate, 1)} + Medicare ${percentFromRatio(se.medicareRate, 1)}), subject to the Social Security wage base and Additional Medicare rules at higher incomes.`,
    },
    {
      question: 'Does this calculator include state taxes?',
      answer:
        'No. This is a federal-only estimate. State and local income taxes are excluded.',
    },
    {
      question: 'Does this calculator include QBI?',
      answer:
        'No. The Qualified Business Income deduction under Section 199A is not included in this estimate.',
    },
    {
      question: 'Do I need to pay quarterly taxes?',
      answer:
        'Many self-employed taxpayers make estimated federal payments during the year if they expect to owe tax. This calculator shows a planning quarterly amount; it does not determine legal filing requirements or penalties.',
    },
    {
      question: 'What income should I enter?',
      answer:
        'Enter net self-employment profit after business expenses — not gross receipts. If you also have W-2 wages or other ordinary income, use the optional other income field for a broader federal income tax estimate.',
    },
    {
      question: 'Are business expenses included?',
      answer:
        'Expenses should already be deducted before you enter net self-employment income. This tool does not collect gross income and expenses separately.',
    },
    {
      question: 'Why is half of SE tax deductible?',
      answer:
        'IRS rules allow you to deduct the employer-equivalent portion of self-employment tax when calculating adjusted gross income, which can lower federal income tax.',
    },
    {
      question: 'Is this tax advice?',
      answer:
        'No. TaxChecker provides simplified federal estimates for planning. It is not a substitute for a CPA, enrolled agent, or other qualified tax professional.',
    },
  ];
}

export function getIrsSources(config: TaxYearConfig): SourceReferenceItem[] {
  return [
    {
      title: config.sources.selfEmploymentTax.title,
      url: config.sources.selfEmploymentTax.url,
      taxYear: config.sources.selfEmploymentTax.taxYear,
      dateAccessed: config.sources.selfEmploymentTax.dateAccessed,
      note: 'Self-employment tax rates and net earnings factor.',
    },
    {
      title: config.sources.federalIncomeTax.title,
      url: config.sources.federalIncomeTax.url,
      taxYear: config.sources.federalIncomeTax.taxYear,
      dateAccessed: config.sources.federalIncomeTax.dateAccessed,
      note: `${config.taxYear} federal income tax brackets and standard deduction.`,
    },
    {
      title: 'Schedule SE (Form 1040)',
      url: 'https://www.irs.gov/forms-pubs/about-schedule-se-form-1040',
      taxYear: config.taxYear,
      dateAccessed: config.verifiedAt,
      note: 'Authoritative form for self-employment tax computation.',
    },
    {
      title: config.sources.estimatedTax.title,
      url: config.sources.estimatedTax.url,
      taxYear: config.sources.estimatedTax.taxYear,
      dateAccessed: config.sources.estimatedTax.dateAccessed,
      note: 'Quarterly estimated tax due dates and payment context.',
    },
    {
      title: 'Publication 505 — Tax Withholding and Estimated Tax',
      url: 'https://www.irs.gov/publications/p505',
      taxYear: config.taxYear,
      dateAccessed: config.verifiedAt,
      note: 'Estimated tax safe harbor overview.',
    },
  ];
}

export function getRelatedCalculatorLinks() {
  return buildReadyCalculatorNavLinks([
    ...(getCalculatorBySlug(SELF_EMPLOYED_TAX_SLUG)?.relatedCalculatorSlugs ?? []),
    'hsa-tax-savings-calculator',
  ]);
}

export function getRelatedGuideLinks() {
  return buildRelatedGuideLinks([
    'self-employment-tax-guide',
    'quarterly-tax-due-dates-2025',
    'tax-brackets-2025',
    'taxchecker-methodology',
  ]);
}

export function formatExampleCurrency(cents: number): string {
  return formatCurrency(cents);
}
