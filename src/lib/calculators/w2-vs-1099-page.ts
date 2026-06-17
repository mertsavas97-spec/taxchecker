import type { SourceReferenceItem } from '@/components/calculator/source-section';
import type { FaqItem } from '@/components/content/faq-block';
import type { MethodologyPoint } from '@/components/content/methodology-block';
import {
  buildReadyCalculatorNavLinks,
  buildRelatedGuideLinks,
} from '@/lib/calculators/related-links';
import {
  calculateW2Vs1099,
  dollarsToCents,
  formatCurrency,
  type TaxYearConfig,
  type W2Vs1099BetterOption,
} from '@/lib/tax-engine';

export const W2_VS_1099_SLUG = 'w2-vs-1099-calculator';

const HOURS_PER_YEAR = 2_000;

export interface W2Vs1099WorkedExampleScenario {
  key: string;
  title: string;
  w2SalaryCents: number;
  contractorGrossIncomeCents: number;
  contractorBusinessExpensesCents: number;
}

export const WORKED_EXAMPLE_SCENARIOS: W2Vs1099WorkedExampleScenario[] = [
  {
    key: '80k-100k',
    title: '$80,000 W-2 vs $100,000 1099',
    w2SalaryCents: dollarsToCents(80_000),
    contractorGrossIncomeCents: dollarsToCents(100_000),
    contractorBusinessExpensesCents: dollarsToCents(10_000),
  },
  {
    key: '100k-120k',
    title: '$100,000 W-2 vs $120,000 1099',
    w2SalaryCents: dollarsToCents(100_000),
    contractorGrossIncomeCents: dollarsToCents(120_000),
    contractorBusinessExpensesCents: dollarsToCents(12_000),
  },
  {
    key: '150k-190k',
    title: '$150,000 W-2 vs $190,000 1099',
    w2SalaryCents: dollarsToCents(150_000),
    contractorGrossIncomeCents: dollarsToCents(190_000),
    contractorBusinessExpensesCents: dollarsToCents(19_000),
  },
];

export interface W2Vs1099WorkedExampleRow {
  key: string;
  title: string;
  higherEstimatedValueLabel: string;
  w2TotalEstimatedValueCents: number;
  contractorTotalEstimatedValueCents: number;
  differenceCents: number;
  w2AfterTaxIncomeCents: number;
  contractorAfterTaxIncomeCents: number;
  breakEvenContractorGrossIncomeCents: number | null;
  breakEvenContractorHourlyRateCents: number | null;
}

function formatBetterOptionLabel(option: W2Vs1099BetterOption): string {
  if (option === 'w2') return 'W-2';
  if (option === 'contractor_1099') return '1099 contractor';
  return 'Similar';
}

export function buildW2Vs1099WorkedExamples(
  filingStatus: 'single' = 'single',
): W2Vs1099WorkedExampleRow[] {
  return WORKED_EXAMPLE_SCENARIOS.map((scenario) => {
    const result = calculateW2Vs1099({
      taxYear: 2025,
      filingStatus,
      w2SalaryCents: scenario.w2SalaryCents,
      contractorGrossIncomeCents: scenario.contractorGrossIncomeCents,
      contractorBusinessExpensesCents: scenario.contractorBusinessExpensesCents,
      hoursPerYear: HOURS_PER_YEAR,
    });

    return {
      key: scenario.key,
      title: scenario.title,
      higherEstimatedValueLabel: formatBetterOptionLabel(
        result.details.betterEstimatedOption,
      ),
      w2TotalEstimatedValueCents: result.details.w2TotalEstimatedValueCents,
      contractorTotalEstimatedValueCents:
        result.details.contractorTotalEstimatedValueCents,
      differenceCents: result.details.differenceCents,
      w2AfterTaxIncomeCents: result.details.w2AfterTaxIncomeCents,
      contractorAfterTaxIncomeCents: result.details.contractorAfterTaxIncomeCents,
      breakEvenContractorGrossIncomeCents:
        result.details.breakEvenContractorGrossIncomeCents,
      breakEvenContractorHourlyRateCents:
        result.details.breakEvenContractorHourlyRateCents,
    };
  });
}

export function getW2Vs1099ExplainedPoints(): MethodologyPoint[] {
  return [
    {
      title: 'Two ways to earn income',
      description:
        'W-2 employees receive salary with employer payroll tax withholding. Independent contractors typically receive 1099 income and pay self-employment tax on net profit.',
    },
    {
      title: 'Gross pay is not take-home pay',
      description:
        'Federal income tax, FICA or self-employment tax, business expenses, and contractor-only costs all reduce what you keep after taxes.',
    },
    {
      title: 'Benefits change the comparison',
      description:
        'Employer-paid health insurance, retirement match, PTO, and other benefits can add value to a W-2 package that is not always reflected in salary alone.',
    },
    {
      title: 'Not classification advice',
      description:
        'This tool compares simplified federal tax scenarios. It does not determine whether a worker should legally be classified as an employee or contractor.',
    },
  ];
}

export function getHowW2Vs1099ComparesPoints(): MethodologyPoint[] {
  return [
    {
      title: 'W-2 path',
      description:
        'Estimates employee FICA, federal income tax, and after-tax cash pay from W-2 salary. Adds user-entered annual benefits value to total estimated W-2 value.',
    },
    {
      title: '1099 path',
      description:
        'Subtracts business expenses from contractor gross income, then estimates self-employment tax and federal income tax on net profit. Subtracts user-entered contractor extra costs from after-tax income.',
    },
    {
      title: 'Total value comparison',
      description:
        'W-2 total value equals after-tax pay plus benefits. 1099 total value equals after-tax pay after extra contractor costs. The difference is W-2 total value minus 1099 total value.',
    },
    {
      title: 'Known exclusions',
      description:
        'State taxes, retirement matching beyond user-entered benefits, unemployment insurance, workers compensation, and full employment-law protections are not fully modeled.',
    },
  ];
}

export function getContractorCostsToConsiderPoints(): MethodologyPoint[] {
  return [
    {
      title: 'Business expenses',
      description:
        'Software, equipment, travel, home office, and other ordinary business expenses reduce net 1099 profit before tax. Enter expenses tied to your contractor work.',
    },
    {
      title: 'Health insurance and benefits',
      description:
        'Contractors often purchase health coverage and fund retirement themselves. Use contractor extra costs for premiums, insurance, or other annual contractor-only spending not in business expenses.',
    },
    {
      title: 'Administrative overhead',
      description:
        'Accounting, legal, invoicing, and unpaid time spent on business operations can reduce effective hourly pay even when not fully deductible.',
    },
    {
      title: 'Self-employment tax',
      description:
        'Contractors generally pay both halves of Social Security and Medicare through self-employment tax on net earnings, while W-2 employees split FICA with employers.',
    },
  ];
}

export function getBreakEvenRateExplanationPoints(): MethodologyPoint[] {
  return [
    {
      title: 'What break-even means here',
      description:
        'Break-even contractor gross income is the 1099 gross amount where total estimated 1099 value equals total estimated W-2 value for the same inputs (benefits, expenses, and extra costs held constant).',
    },
    {
      title: 'Expense ratio is held constant',
      description:
        'As gross contractor income changes, business expenses scale proportionally using the expense ratio from your entered gross income and expenses.',
    },
    {
      title: 'Hourly break-even',
      description:
        'When hours per year are provided, break-even gross income is divided by hours to show an approximate hourly contractor rate that matches W-2 total value under these assumptions.',
    },
    {
      title: 'Planning estimate only',
      description:
        'Break-even results may not exist if contractor value stays below W-2 value across the search range. This is a simplified federal model, not a contract negotiation recommendation.',
    },
  ];
}

export function getW2Vs1099Faqs(): FaqItem[] {
  return [
    {
      question: 'How does W-2 compare to 1099 in this estimate?',
      answer:
        'There is no universal answer. This calculator shows which scenario has higher estimated total value based on the salary, contractor income, expenses, benefits, and costs you enter. Your actual outcome depends on your full compensation package, classification, and personal situation.',
    },
    {
      question: 'Why does 1099 income have self-employment tax?',
      answer:
        'Independent contractor income is generally treated as self-employment income. Schedule SE applies Social Security and Medicare tax on net earnings, covering both employee and employer portions that W-2 workers split with employers through FICA.',
    },
    {
      question: 'What contractor expenses should I include?',
      answer:
        'Include ordinary and necessary business expenses tied to your contractor work—equipment, software, travel, professional services, and similar costs that reduce net profit. This tool does not verify deductibility.',
    },
    {
      question: 'Can I include health insurance as a contractor cost?',
      answer:
        'Yes, if you would pay for health coverage as a contractor and not receive comparable employer coverage as a W-2 employee. You can include premiums in contractor extra costs or reflect employer health benefits in the W-2 benefits field.',
    },
    {
      question: 'How do benefits affect the comparison?',
      answer:
        'Employer-paid benefits increase total estimated W-2 value because they are added to after-tax pay. Contractor extra costs reduce total estimated 1099 value. Enter values that reflect your realistic packages.',
    },
    {
      question: 'What is a break-even contractor rate?',
      answer:
        'It is the contractor gross income (or hourly rate when hours are provided) where estimated 1099 total value equals estimated W-2 total value using the same benefits, expense ratio, and extra costs.',
    },
    {
      question: 'Does this include state taxes?',
      answer:
        'No. This is a federal-only estimate. State and local income taxes are excluded.',
    },
    {
      question: 'Does this include retirement matching?',
      answer:
        'Only if you include it in the optional annual benefits value for W-2 or as a contractor extra cost. Employer 401(k) match is not modeled automatically.',
    },
    {
      question: 'Is this employment or tax advice?',
      answer:
        'No. TaxChecker provides simplified federal comparison estimates for planning. It is not employment, legal, or tax advice and does not determine worker classification.',
    },
    {
      question: 'Why might a higher 1099 rate still be worth less?',
      answer:
        'A higher gross contractor rate can still produce lower total value after self-employment tax, federal income tax, business expenses, and contractor-only costs such as insurance. W-2 packages may also include benefits not captured in salary alone.',
    },
  ];
}

export function getW2Vs1099IrsSources(config: TaxYearConfig): SourceReferenceItem[] {
  return [
    {
      title: config.sources.selfEmploymentTax.title,
      url: config.sources.selfEmploymentTax.url,
      taxYear: config.sources.selfEmploymentTax.taxYear,
      dateAccessed: config.sources.selfEmploymentTax.dateAccessed,
      note: 'Self-employment tax rates and net earnings factor for the 1099 path.',
    },
    {
      title: 'Schedule SE (Form 1040)',
      url: 'https://www.irs.gov/forms-pubs/about-schedule-se-form-1040',
      taxYear: config.taxYear,
      dateAccessed: config.verifiedAt,
      note: 'Self-employment tax computation for contractor income.',
    },
    {
      title: config.sources.federalIncomeTax.title,
      url: config.sources.federalIncomeTax.url,
      taxYear: config.sources.federalIncomeTax.taxYear,
      dateAccessed: config.sources.federalIncomeTax.dateAccessed,
      note: `${config.taxYear} federal income tax brackets and standard deduction (Rev. Proc.).`,
    },
    {
      title: config.sources.payrollTax.title,
      url: config.sources.payrollTax.url,
      taxYear: config.sources.payrollTax.taxYear,
      dateAccessed: config.sources.payrollTax.dateAccessed,
      note: 'Employee and employer FICA rates used in the W-2 path (Publication 15).',
    },
  ];
}

export function getW2Vs1099RelatedCalculatorLinks() {
  return buildReadyCalculatorNavLinks([
    '1099-tax-calculator',
    'self-employed-tax-calculator',
    'estimated-tax-calculator',
    's-corp-tax-calculator',
  ]);
}

export function getW2Vs1099RelatedGuideLinks() {
  return buildRelatedGuideLinks([
    'self-employment-tax-guide',
    'tax-brackets-2025',
    'taxchecker-methodology',
  ]);
}

export function formatW2Vs1099ExampleCurrency(cents: number): string {
  return formatCurrency(cents);
}
