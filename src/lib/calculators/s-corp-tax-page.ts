import type { SourceReferenceItem } from '@/components/calculator/source-section';
import type { FaqItem } from '@/components/content/faq-block';
import type { MethodologyPoint } from '@/components/content/methodology-block';
import {
  buildReadyCalculatorNavLinks,
  buildRelatedGuideLinks,
} from '@/lib/calculators/related-links';
import {
  calculateSCorpTax,
  dollarsToCents,
  formatCurrency,
  type TaxYearConfig,
} from '@/lib/tax-engine';

export const S_CORP_TAX_SLUG = 's-corp-tax-calculator';

export interface SCorpWorkedExampleScenario {
  key: string;
  title: string;
  businessProfitCents: number;
  ownerSalaryCents: number;
}

export const WORKED_EXAMPLE_SCENARIOS: SCorpWorkedExampleScenario[] = [
  {
    key: '100k-60k',
    title: '$100,000 profit / $60,000 salary',
    businessProfitCents: dollarsToCents(100_000),
    ownerSalaryCents: dollarsToCents(60_000),
  },
  {
    key: '150k-75k',
    title: '$150,000 profit / $75,000 salary',
    businessProfitCents: dollarsToCents(150_000),
    ownerSalaryCents: dollarsToCents(75_000),
  },
  {
    key: '250k-120k',
    title: '$250,000 profit / $120,000 salary',
    businessProfitCents: dollarsToCents(250_000),
    ownerSalaryCents: dollarsToCents(120_000),
  },
];

export interface SCorpWorkedExampleRow {
  key: string;
  title: string;
  sCorpNetValueCents: number;
  estimatedSavingsVsSoleProprietorCents: number;
  totalFederalTaxBurdenCents: number;
  breakEvenProfitCents: number | null;
  distributionCents: number;
  soleProprietorTaxBurdenCents: number;
  complianceCostsCents: number;
}

export function buildSCorpWorkedExamples(
  filingStatus: 'single' = 'single',
): SCorpWorkedExampleRow[] {
  return WORKED_EXAMPLE_SCENARIOS.map((scenario) => {
    const result = calculateSCorpTax({
      taxYear: 2025,
      filingStatus,
      businessProfitCents: scenario.businessProfitCents,
      ownerSalaryCents: scenario.ownerSalaryCents,
    });

    return {
      key: scenario.key,
      title: scenario.title,
      sCorpNetValueCents: result.details.sCorpNetValueCents,
      estimatedSavingsVsSoleProprietorCents:
        result.details.estimatedSavingsVsSoleProprietorCents,
      totalFederalTaxBurdenCents: result.details.totalFederalTaxBurdenCents,
      breakEvenProfitCents: result.details.breakEvenProfitCents,
      distributionCents: result.details.distributionCents,
      soleProprietorTaxBurdenCents: result.details.soleProprietorTaxBurdenCents,
      complianceCostsCents: result.details.complianceCostsCents,
    };
  });
}

export function getHowSCorpTaxWorksPoints(): MethodologyPoint[] {
  return [
    {
      title: 'Pass-through federal income tax',
      description:
        'An S corporation generally does not pay federal income tax at the entity level. Profit passes through to owners and is taxed on the owner’s personal return.',
    },
    {
      title: 'Salary runs through payroll',
      description:
        'Owner W-2 salary is subject to employee and employer FICA. The corporation pays employer FICA as a business cost in this model.',
    },
    {
      title: 'Distributions avoid self-employment tax',
      description:
        'Amounts treated as S corporation distributions in this simplified model are not subject to self-employment tax, unlike default sole proprietor net profit.',
    },
    {
      title: 'Compliance costs reduce net value',
      description:
        'Payroll administration, state compliance, and tax preparation costs you enter reduce estimated S corporation net value in the comparison.',
    },
  ];
}

export function getSalaryVsDistributionsPoints(): MethodologyPoint[] {
  return [
    {
      title: 'Business profit is split',
      description:
        'Owner salary plus estimated distribution equals business profit in this calculator. Distribution equals profit minus the salary you enter.',
    },
    {
      title: 'More salary means more payroll tax',
      description:
        'Increasing owner salary shifts income from distribution to wages, which generally increases FICA exposure but may change income tax.',
    },
    {
      title: 'Less salary increases distribution share',
      description:
        'A lower salary leaves more profit as distribution for modeling purposes, which can change self-employment tax savings assumptions.',
    },
    {
      title: 'Your salary is an assumption',
      description:
        'This tool does not calculate or recommend a salary. It only shows federal tax effects of the salary amount you provide.',
    },
  ];
}

export function getReasonableCompensationPoints(): MethodologyPoint[] {
  return [
    {
      title: 'IRS scrutiny of owner salary',
      description:
        'S corporation owner-employees are generally expected to pay themselves reasonable compensation for services before taking distributions.',
    },
    {
      title: 'No fixed IRS salary table',
      description:
        'Reasonable compensation depends on duties, industry, profit, and other facts. TaxChecker does not determine whether your entered salary meets IRS standards.',
    },
    {
      title: 'User-entered salary only',
      description:
        'Enter the W-2 salary you want to model. Review compensation with a CPA or tax attorney before relying on this estimate for entity or payroll decisions.',
    },
    {
      title: 'Not a compliance determination',
      description:
        'Low or zero salary inputs may produce warnings, but this calculator does not evaluate legal or IRS reasonable compensation compliance.',
    },
  ];
}

export function getSCorpVsSolePropComparisonPoints(): MethodologyPoint[] {
  return [
    {
      title: 'Sole proprietor baseline',
      description:
        'The comparison uses default sole proprietor treatment where net business profit is subject to self-employment tax and federal income tax.',
    },
    {
      title: 'S corporation path',
      description:
        'The S corporation path applies payroll tax to owner salary, federal income tax on combined pass-through income, and subtracts compliance costs from net value.',
    },
    {
      title: 'Estimated savings metric',
      description:
        'Estimated savings vs sole proprietor equals sole proprietor net value minus S corporation net value based on your inputs—not a recommendation to elect S status.',
    },
    {
      title: 'Known exclusions',
      description:
        'State entity taxes, QBI deduction, basis limitations, built-in gains, and legal liability differences are not fully modeled.',
    },
  ];
}

export function getBreakEvenProfitExplanationPoints(): MethodologyPoint[] {
  return [
    {
      title: 'What break-even profit means',
      description:
        'Break-even profit is the business profit level where estimated S corporation net value equals estimated sole proprietor net value, holding your entered salary and compliance costs constant.',
    },
    {
      title: 'Salary held constant',
      description:
        'The search adjusts business profit while keeping owner salary and compliance costs fixed at your inputs.',
    },
    {
      title: 'May not exist for every scenario',
      description:
        'If S corporation net value stays below sole proprietor value across the search range, no break-even profit is returned.',
    },
    {
      title: 'Planning estimate only',
      description:
        'Break-even results are simplified federal planning outputs, not a threshold for electing or operating as an S corporation.',
    },
  ];
}

export function getSCorpTaxFaqs(): FaqItem[] {
  return [
    {
      question: 'What is an S Corp tax calculator?',
      answer:
        'It estimates federal taxes for a simplified S corporation salary-plus-distribution model and compares net value to a default sole proprietor scenario using the business profit, salary, and costs you enter.',
    },
    {
      question: 'How does an S Corp save self-employment tax?',
      answer:
        'In this model, only owner salary is subject to FICA. Net profit allocated to distributions is not subject to self-employment tax, unlike sole proprietor net earnings taxed under Schedule SE.',
    },
    {
      question: 'Are S Corp distributions subject to self-employment tax?',
      answer:
        'In this simplified federal model, distributions are not subject to self-employment tax. Actual tax treatment depends on facts, IRS rules, and reasonable compensation requirements.',
    },
    {
      question: 'What is reasonable compensation?',
      answer:
        'It is the W-2 wages an S corporation owner-employee should receive for services performed, based on IRS factors. This calculator uses your entered salary and does not determine whether it is reasonable.',
    },
    {
      question: 'Does this calculator recommend a salary?',
      answer:
        'No. Owner salary is entirely user-entered. The tool shows tax effects of your assumption and does not suggest a reasonable or optimal salary.',
    },
    {
      question: 'Does this include state taxes?',
      answer:
        'No. Federal taxes are modeled. State income, franchise, or entity-level taxes are excluded unless you include amounts in optional compliance costs.',
    },
    {
      question: 'Does this include QBI?',
      answer:
        'No. The Qualified Business Income deduction under Section 199A is not included in this estimate.',
    },
    {
      question: 'What S Corp costs should I include?',
      answer:
        'Common entries include payroll service fees, state annual reports or franchise fees, and additional tax preparation or bookkeeping costs tied to operating as an S corporation.',
    },
    {
      question: 'When might an S Corp not save money?',
      answer:
        'Estimated savings can disappear when owner salary is high, compliance costs are large, profit is low, or payroll and income tax effects outweigh self-employment tax differences. Negative savings means the modeled S corporation net value is lower than the sole proprietor baseline.',
    },
    {
      question: 'Is this tax or legal advice?',
      answer:
        'No. TaxChecker provides simplified federal estimates for planning. It is not tax, legal, or entity advice and does not recommend electing S corporation status or a specific salary.',
    },
  ];
}

export function getSCorpIrsSources(config: TaxYearConfig): SourceReferenceItem[] {
  return [
    {
      title: 'S Corporations — IRS Small Business Guide',
      url: 'https://www.irs.gov/businesses/small-businesses-self-employed/s-corporations',
      taxYear: config.taxYear,
      dateAccessed: config.verifiedAt,
      note: 'Overview of S corporation federal tax treatment and owner-employee compensation context.',
    },
    {
      title: 'Publication 535 — Business Expenses',
      url: 'https://www.irs.gov/publications/p535',
      taxYear: config.taxYear,
      dateAccessed: config.verifiedAt,
      note: 'Business expense and officer compensation context (interpretive guidance only).',
    },
    {
      title: 'Instructions for Schedule SE (Form 1040) (2025)',
      url: 'https://www.irs.gov/instructions/i1040sse',
      taxYear: config.taxYear,
      dateAccessed: config.verifiedAt,
      note: 'Sole proprietor self-employment tax baseline used in the comparison.',
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
      note: 'Employee and employer FICA rates on owner W-2 salary (Publication 15).',
    },
  ];
}

export function getSCorpRelatedCalculatorLinks() {
  return buildReadyCalculatorNavLinks([
    'llc-vs-scorp-calculator',
    'self-employed-tax-calculator',
    '1099-tax-calculator',
    'w2-vs-1099-calculator',
  ]);
}

export function getSCorpRelatedGuideLinks() {
  return buildRelatedGuideLinks([
    'self-employment-tax-guide',
    'tax-brackets-2025',
    'taxchecker-methodology',
  ]);
}

export function formatSCorpExampleCurrency(cents: number): string {
  return formatCurrency(cents);
}
