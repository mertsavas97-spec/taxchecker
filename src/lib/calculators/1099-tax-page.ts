import type { SourceReferenceItem } from '@/components/calculator/source-section';
import type { FaqItem } from '@/components/content/faq-block';
import type { MethodologyPoint } from '@/components/content/methodology-block';
import { getCalculatorBySlug } from '@/config/calculators';
import {
  buildReadyCalculatorNavLinks,
  buildRelatedGuideLinks,
} from '@/lib/calculators/related-links';
import {
  calculate1099Tax,
  dollarsToCents,
  formatCurrency,
  percentFromRatio,
  type TaxYearConfig,
} from '@/lib/tax-engine';

export const TAX_1099_SLUG = '1099-tax-calculator';

export const WORKED_EXAMPLE_SCENARIOS = [
  { grossDollars: 50_000, expensesDollars: 5_000 },
  { grossDollars: 100_000, expensesDollars: 15_000 },
  { grossDollars: 200_000, expensesDollars: 30_000 },
] as const;

export interface Tax1099WorkedExampleRow {
  grossIncomeDollars: number;
  expensesDollars: number;
  netIncomeDollars: number;
  selfEmploymentTaxCents: number;
  federalIncomeTaxCents: number;
  totalEstimatedFederalTaxCents: number;
  quarterlyEstimatedPaymentCents: number;
  effectiveTaxRate: number;
}

export function build1099WorkedExamples(
  filingStatus: 'single' = 'single',
): Tax1099WorkedExampleRow[] {
  return WORKED_EXAMPLE_SCENARIOS.map(({ grossDollars, expensesDollars }) => {
    const result = calculate1099Tax({
      taxYear: 2025,
      filingStatus,
      gross1099IncomeCents: dollarsToCents(grossDollars),
      businessExpensesCents: dollarsToCents(expensesDollars),
    });

    return {
      grossIncomeDollars: grossDollars,
      expensesDollars,
      netIncomeDollars: grossDollars - expensesDollars,
      selfEmploymentTaxCents: result.details.selfEmploymentTaxCents,
      federalIncomeTaxCents: result.details.federalIncomeTaxCents,
      totalEstimatedFederalTaxCents: result.details.totalEstimatedFederalTaxCents,
      quarterlyEstimatedPaymentCents: result.details.quarterlyEstimatedPaymentCents,
      effectiveTaxRate: result.details.effectiveTaxRate,
    };
  });
}

export function get1099MethodologyPoints(config: TaxYearConfig): MethodologyPoint[] {
  const se = config.selfEmploymentTax;
  const netEarningsPercent = (se.netEarningsFactor * 100).toFixed(2);
  const deductiblePercent = (se.deductiblePortionRate * 100).toFixed(0);

  return [
    {
      title: 'Gross 1099 income',
      description:
        'Enter total independent contractor income reported on Form 1099-NEC or similar before business expenses. Multiple 1099 forms can be summed into one amount.',
    },
    {
      title: 'Business expenses',
      description:
        'Ordinary and necessary business expenses reduce net profit before self-employment and income tax. This calculator does not verify whether expenses are deductible.',
    },
    {
      title: 'Net 1099 income',
      description:
        'Net income equals gross 1099 income minus business expenses, floored at zero. If expenses exceed gross income, net income is treated as zero and a warning is shown.',
    },
    {
      title: 'Self-employment tax',
      description: `Schedule SE applies a ${netEarningsPercent}% net earnings factor, then Social Security and Medicare rates for ${config.taxYear}. One-half (${deductiblePercent}%) of SE tax may reduce AGI for federal income tax.`,
    },
    {
      title: 'Federal income tax',
      description: `Federal income tax uses ${config.taxYear} brackets and the standard deduction from IRS publications for your filing status. Itemized deductions are not modeled.`,
    },
    {
      title: 'Estimated quarterly payments',
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

export function get1099TaxFaqs(config: TaxYearConfig): FaqItem[] {
  const se = config.selfEmploymentTax;
  const combinedSeRate = percentFromRatio(
    se.socialSecurityRate + se.medicareRate,
    1,
  );
  const netEarningsPercent = (se.netEarningsFactor * 100).toFixed(2);

  return [
    {
      question: 'What is 1099 income?',
      answer:
        '1099 income generally refers to non-employee compensation reported on Form 1099-NEC (or other 1099 forms). For federal tax purposes, it is usually treated as self-employment income subject to self-employment tax and income tax.',
    },
    {
      question: 'How are 1099 taxes calculated?',
      answer: `This calculator subtracts business expenses from gross 1099 income to get net profit, then applies Schedule SE (${netEarningsPercent}% net earnings factor, ${combinedSeRate} combined SE rate before wage-base limits) and federal income tax using ${config.taxYear} brackets.`,
    },
    {
      question: 'What expenses can I subtract?',
      answer:
        'You can enter ordinary and necessary business expenses tied to your independent contractor work. This tool does not validate expense categories, substantiation, or audit risk — it only uses the net amount you enter.',
    },
    {
      question: 'Does this include self-employment tax?',
      answer:
        'Yes. Net 1099 profit is subject to federal self-employment tax (Social Security and Medicare) under Schedule SE, in addition to federal income tax.',
    },
    {
      question: 'Does this calculator include state taxes?',
      answer:
        'No. This is a federal-only estimate. State and local income taxes are excluded.',
    },
    {
      question: 'Does this include QBI?',
      answer:
        'No. The Qualified Business Income deduction under Section 199A is not included in this estimate.',
    },
    {
      question: 'Do I need to pay quarterly taxes on 1099 income?',
      answer:
        'Many taxpayers with 1099 income make estimated federal payments during the year if they expect to owe tax. This calculator shows a planning quarterly amount; it does not determine legal filing requirements or penalties.',
    },
    {
      question: 'What if my expenses are higher than my income?',
      answer:
        'If business expenses exceed gross 1099 income, net income is treated as zero for this estimate and a warning is displayed. A tax loss may still exist on your actual return, but this simplified model does not carry losses forward.',
    },
    {
      question: 'Is 1099 income taxed more than W-2 income?',
      answer:
        'At similar gross compensation, 1099 contractors often pay both halves of Social Security and Medicare through self-employment tax, while W-2 employees split payroll tax with employers. Federal income tax brackets apply to both. Use the W-2 vs 1099 calculator for a side-by-side federal comparison.',
    },
    {
      question: 'Is this tax advice?',
      answer:
        'No. TaxChecker provides simplified federal estimates for planning. It is not a substitute for a CPA, enrolled agent, or other qualified tax professional, and it does not determine worker classification.',
    },
  ];
}

export function get1099IrsSources(config: TaxYearConfig): SourceReferenceItem[] {
  return [
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
      note: 'Quarterly estimated tax due dates and Form 1040-ES context.',
    },
    {
      title: config.sources.federalIncomeTax.title,
      url: config.sources.federalIncomeTax.url,
      taxYear: config.sources.federalIncomeTax.taxYear,
      dateAccessed: config.sources.federalIncomeTax.dateAccessed,
      note: `${config.taxYear} federal income tax brackets and standard deduction (Rev. Proc.).`,
    },
    {
      title: config.sources.selfEmploymentTax.title,
      url: config.sources.selfEmploymentTax.url,
      taxYear: config.sources.selfEmploymentTax.taxYear,
      dateAccessed: config.sources.selfEmploymentTax.dateAccessed,
      note: 'Self-employment tax rates and net earnings factor.',
    },
    {
      title: 'Form 1099-NEC',
      url: 'https://www.irs.gov/forms-pubs/about-form-1099-nec',
      taxYear: config.taxYear,
      dateAccessed: config.verifiedAt,
      note: 'Nonemployee compensation reporting form context.',
    },
  ];
}

export function get1099RelatedCalculatorLinks() {
  return buildReadyCalculatorNavLinks([
    'self-employed-tax-calculator',
    'quarterly-tax-calculator',
    'estimated-tax-calculator',
    'w2-vs-1099-calculator',
  ]);
}

export function get1099RelatedGuideLinks() {
  return buildRelatedGuideLinks([
    'self-employment-tax-guide',
    'quarterly-tax-due-dates-2025',
    'tax-brackets-2025',
    'taxchecker-methodology',
  ]);
}

export function format1099ExampleCurrency(cents: number): string {
  return formatCurrency(cents);
}
