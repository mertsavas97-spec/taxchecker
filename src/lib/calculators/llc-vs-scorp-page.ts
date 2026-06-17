import type { SourceReferenceItem } from '@/components/calculator/source-section';
import type { FaqItem } from '@/components/content/faq-block';
import type { MethodologyPoint } from '@/components/content/methodology-block';
import {
  buildReadyCalculatorNavLinks,
  buildRelatedGuideLinks,
} from '@/lib/calculators/related-links';
import {
  calculateLlcVsSCorp,
  dollarsToCents,
  formatCurrency,
  type TaxYearConfig,
} from '@/lib/tax-engine';

export const LLC_VS_SCORP_SLUG = 'llc-vs-scorp-calculator';

export interface LlcVsScorpWorkedExampleScenario {
  key: string;
  title: string;
  businessProfitCents: number;
  ownerSalaryCents: number;
}

export const WORKED_EXAMPLE_SCENARIOS: LlcVsScorpWorkedExampleScenario[] = [
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

export interface LlcVsScorpWorkedExampleRow {
  key: string;
  title: string;
  llcAfterTaxValueCents: number;
  sCorpAfterTaxValueCents: number;
  afterTaxDifferenceCents: number;
  breakEvenProfitCents: number | null;
  llcFederalTaxBurdenCents: number;
  sCorpFederalTaxBurdenCents: number;
  sCorpDistributionCents: number;
}

export function buildLlcVsScorpWorkedExamples(
  filingStatus: 'single' = 'single',
): LlcVsScorpWorkedExampleRow[] {
  return WORKED_EXAMPLE_SCENARIOS.map((scenario) => {
    const result = calculateLlcVsSCorp({
      taxYear: 2025,
      filingStatus,
      llcBusinessProfitCents: scenario.businessProfitCents,
      sCorpOwnerSalaryCents: scenario.ownerSalaryCents,
    });

    return {
      key: scenario.key,
      title: scenario.title,
      llcAfterTaxValueCents: result.details.llcAfterTaxValueCents,
      sCorpAfterTaxValueCents: result.details.sCorpAfterTaxValueCents,
      afterTaxDifferenceCents:
        result.details.llcAfterTaxValueCents - result.details.sCorpAfterTaxValueCents,
      breakEvenProfitCents: result.details.breakEvenProfitCents,
      llcFederalTaxBurdenCents: result.details.llcFederalTaxBurdenCents,
      sCorpFederalTaxBurdenCents: result.details.sCorpFederalTaxBurdenCents,
      sCorpDistributionCents: result.details.sCorpDistributionCents,
    };
  });
}

export function getLlcVsScorpTreatmentPoints(): MethodologyPoint[] {
  return [
    {
      title: 'LLCs can be taxed different ways',
      description:
        'An LLC may be taxed as a sole proprietorship, partnership, C corporation, or S corporation depending on elections and structure. This calculator models a default pass-through sole proprietor LLC baseline.',
    },
    {
      title: 'S corporation pass-through model',
      description:
        'The S corporation path splits profit between owner W-2 salary (FICA) and distributions (not subject to self-employment tax in this simplified model).',
    },
    {
      title: 'After-tax value comparison',
      description:
        'Estimated after-tax value shows what remains after federal taxes and, for the S corporation path, user-entered compliance costs.',
    },
    {
      title: 'Not entity election advice',
      description:
        'Higher estimated after-tax value under these inputs does not mean forming an LLC, electing S status, or changing structure is appropriate for you.',
    },
  ];
}

export function getDefaultLlcTaxationPoints(): MethodologyPoint[] {
  return [
    {
      title: 'Pass-through net profit',
      description:
        'Default LLC treatment in this model taxes net business profit on the owner’s personal return with self-employment tax under Schedule SE.',
    },
    {
      title: 'Self-employment tax on full profit',
      description:
        'Unlike the S corporation salary split, the full LLC net profit amount modeled here is subject to self-employment tax before federal income tax.',
    },
    {
      title: 'No separate payroll layer',
      description:
        'This LLC baseline does not include owner W-2 salary or employer payroll tax unless you model an S corporation separately.',
    },
    {
      title: 'Simplified baseline only',
      description:
        'Multi-member LLCs, partnership returns, and corporate classifications are not fully modeled in this comparison.',
    },
  ];
}

export function getScorpSalaryDistributionPoints(): MethodologyPoint[] {
  return [
    {
      title: 'Profit split',
      description:
        'S corporation business profit equals owner salary plus estimated distribution in this calculator.',
    },
    {
      title: 'Payroll tax on salary',
      description:
        'Owner salary runs through employee and employer FICA. Employer FICA is treated as a business cost in the S corporation path.',
    },
    {
      title: 'Distributions in this model',
      description:
        'Estimated distributions are not subject to self-employment tax in this simplified federal comparison.',
    },
    {
      title: 'Salary is your assumption',
      description:
        'Enter the owner salary you want to test. This tool does not calculate or recommend reasonable compensation.',
    },
  ];
}

export function getLlcVsScorpReasonableCompensationPoints(): MethodologyPoint[] {
  return [
    {
      title: 'IRS officer compensation rules',
      description:
        'S corporation owner-employees are generally expected to receive reasonable W-2 wages for services before taking distributions.',
    },
    {
      title: 'Facts and circumstances',
      description:
        'Reasonable compensation depends on role, industry, profit, and other factors. TaxChecker does not determine whether your entered salary is reasonable.',
    },
    {
      title: 'User-entered salary only',
      description:
        'Model different salary levels to see federal tax effects, then review compensation with a CPA or tax attorney.',
    },
    {
      title: 'Not a compliance test',
      description:
        'This calculator does not evaluate IRS reasonable compensation audits or state payroll rules.',
    },
  ];
}

export function getHowLlcVsScorpComparesPoints(): MethodologyPoint[] {
  return [
    {
      title: 'Parallel federal paths',
      description:
        'The LLC path uses sole proprietor self-employment tax treatment. The S corporation path uses payroll tax on salary plus pass-through income tax and compliance costs.',
    },
    {
      title: 'Estimated difference metric',
      description:
        'Estimated difference equals LLC after-tax value minus S corporation after-tax value based on your inputs—not a recommendation to choose either structure.',
    },
    {
      title: 'Break-even profit',
      description:
        'Break-even profit estimates the business profit where S corporation after-tax value matches the LLC baseline, holding salary and compliance costs constant.',
    },
    {
      title: 'Known exclusions',
      description:
        'State entity taxes, QBI deduction, legal liability differences, and operating agreement complexity are not fully modeled.',
    },
  ];
}

export function getLlcVsScorpFaqs(): FaqItem[] {
  return [
    {
      question: 'How do LLC and S Corp taxes compare in this estimate?',
      answer:
        'There is no universal answer. This calculator shows which path has higher estimated after-tax value based on the profit, salary, and costs you enter. Entity choice depends on legal, operational, and state factors beyond this federal estimate.',
    },
    {
      question: 'How is a default LLC taxed?',
      answer:
        'In this model, a default single-member pass-through LLC pays self-employment tax and federal income tax on net business profit, similar to a sole proprietor.',
    },
    {
      question: 'How is an S Corp taxed?',
      answer:
        'In this model, an S corporation pays FICA on owner salary, federal income tax on pass-through income, and subtracts compliance costs from after-tax value. Distributions are not subject to self-employment tax in this simplified comparison.',
    },
    {
      question: 'Do S Corp distributions avoid self-employment tax?',
      answer:
        'In this simplified federal model, amounts treated as distributions are not subject to self-employment tax. Actual treatment depends on facts, IRS rules, and reasonable compensation requirements.',
    },
    {
      question: 'What is reasonable compensation?',
      answer:
        'It is the W-2 wages an S corporation owner-employee should receive for services performed. This calculator uses your entered salary and does not determine whether it is reasonable under IRS standards.',
    },
    {
      question: 'Does this calculator recommend an entity?',
      answer:
        'No. It compares simplified federal tax scenarios only. It does not recommend forming an LLC, electing S corporation status, or any other entity structure.',
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
        'Common entries include payroll administration, state annual reports or franchise fees, and additional tax preparation or bookkeeping tied to S corporation compliance.',
    },
    {
      question: 'Is this legal or tax advice?',
      answer:
        'No. TaxChecker provides simplified federal comparison estimates for planning. It is not legal, entity formation, or tax advice. Consult a CPA and attorney before choosing a structure.',
    },
  ];
}

export function getLlcVsScorpIrsSources(config: TaxYearConfig): SourceReferenceItem[] {
  return [
    {
      title: 'Limited Liability Company (LLC) — IRS',
      url: 'https://www.irs.gov/businesses/small-businesses-self-employed/limited-liability-company-llc',
      taxYear: config.taxYear,
      dateAccessed: config.verifiedAt,
      note: 'LLC federal tax classification overview (default treatment varies by structure and elections).',
    },
    {
      title: 'S Corporations — IRS Small Business Guide',
      url: 'https://www.irs.gov/businesses/small-businesses-self-employed/s-corporations',
      taxYear: config.taxYear,
      dateAccessed: config.verifiedAt,
      note: 'S corporation federal tax treatment and owner-employee compensation context.',
    },
    {
      title: 'Instructions for Schedule SE (Form 1040) (2025)',
      url: 'https://www.irs.gov/instructions/i1040sse',
      taxYear: config.taxYear,
      dateAccessed: config.verifiedAt,
      note: 'Default LLC sole proprietor self-employment tax baseline in the comparison.',
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
      note: 'Employee and employer FICA rates on S corporation owner salary (Publication 15).',
    },
  ];
}

export function getLlcVsScorpRelatedCalculatorLinks() {
  return buildReadyCalculatorNavLinks([
    's-corp-tax-calculator',
    'self-employed-tax-calculator',
    '1099-tax-calculator',
    'w2-vs-1099-calculator',
  ]);
}

export function getLlcVsScorpRelatedGuideLinks() {
  return buildRelatedGuideLinks([
    'self-employment-tax-guide',
    'tax-brackets-2025',
    'taxchecker-methodology',
  ]);
}

export function formatLlcVsScorpExampleCurrency(cents: number): string {
  return formatCurrency(cents);
}
