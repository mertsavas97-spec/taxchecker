import type { SourceReferenceItem } from '@/components/calculator/source-section';
import type { FaqItem } from '@/components/content/faq-block';
import {
  formatDollarsFromCents,
  formatPercentFromConfig,
} from '@/lib/resources/reference-data';
import { taxYear2025 } from '@/lib/tax-engine';

const config = taxYear2025;
const se = config.selfEmploymentTax;

export function getSelfEmploymentTaxGuideFaqs(): FaqItem[] {
  const combinedRate = se.socialSecurityRate + se.medicareRate;

  return [
    {
      question: 'What is self-employment tax?',
      answer:
        'Self-employment (SE) tax is the self-employed person\'s equivalent of the Social Security and Medicare taxes withheld from employee wages. For federal purposes, it generally applies to net profit from a trade or business reported on Schedule C or similar pass-through income subject to Schedule SE.',
    },
    {
      question: 'Who may owe self-employment tax?',
      answer:
        'Net earnings from self-employment of $400 or more in a tax year may trigger SE tax filing requirements. This commonly includes freelancers, sole proprietors, and many single-member LLC owners treated as sole proprietors for federal tax purposes. Other entity types may have different payroll rules.',
    },
    {
      question: 'What is the 2025 self-employment tax rate?',
      answer: `The combined SE tax rate is ${formatPercentFromConfig(combinedRate)} on net earnings from self-employment (${formatPercentFromConfig(se.socialSecurityRate)} Social Security plus ${formatPercentFromConfig(se.medicareRate)} Medicare), subject to the Social Security wage base and additional Medicare rules for high earners.`,
    },
    {
      question: 'Why does Schedule SE use 92.35% of net profit?',
      answer: `Schedule SE applies a ${formatPercentFromConfig(se.netEarningsFactor)} factor to net profit before calculating SE tax. This adjustment reflects the employer-equivalent portion of the tax and aligns the SE tax base with IRS Schedule SE mechanics—not your full Schedule C net profit dollar-for-dollar.`,
    },
    {
      question: 'What is the 2025 Social Security wage base for SE tax?',
      answer: `Social Security tax applies only up to ${formatDollarsFromCents(se.socialSecurityWageBase)} of combined wages and net self-employment earnings for 2025. Medicare tax generally continues on earnings above that amount, and additional Medicare tax may apply at higher income levels under separate rules.`,
    },
    {
      question: 'Can you deduct part of self-employment tax?',
      answer: `When calculating federal income tax, you may generally deduct ${formatPercentFromConfig(se.deductiblePortionRate)} of SE tax (the employer-equivalent portion) above the line. This deduction reduces adjusted gross income but does not eliminate SE tax itself.`,
    },
    {
      question: 'How does SE tax relate to federal income tax?',
      answer:
        'SE tax and federal income tax are separate calculations. Net business profit flows into income tax after the SE tax deduction and standard or itemized deductions. TaxChecker models both layers for planning estimates; your actual Form 1040 may include credits, other income, and items not covered here.',
    },
    {
      question: 'Is this guide tax advice?',
      answer:
        'No. This guide explains general IRS mechanics for educational planning. It does not determine whether you owe a specific amount or how you should file. Consult a qualified tax professional for your situation.',
    },
  ];
}

export function getSelfEmploymentTaxGuideSources(): SourceReferenceItem[] {
  return [
    {
      title: config.sources.selfEmploymentTax.title,
      url: config.sources.selfEmploymentTax.url,
      taxYear: config.sources.selfEmploymentTax.taxYear,
      dateAccessed: config.sources.selfEmploymentTax.dateAccessed,
      note: 'Overview of self-employment tax rates and who pays.',
    },
    {
      title: 'Instructions for Schedule SE (Form 1040)',
      url: 'https://www.irs.gov/instructions/i1040sse',
      taxYear: config.taxYear,
      dateAccessed: config.verifiedAt,
      note: 'Net earnings factor, wage base, and SE tax computation steps.',
    },
    {
      title: 'Publication 334 — Tax Guide for Small Business',
      url: 'https://www.irs.gov/publications/p334',
      taxYear: config.taxYear,
      dateAccessed: config.verifiedAt,
      note: 'Self-employed taxpayer overview and recordkeeping context.',
    },
    {
      title: config.sources.federalIncomeTax.title,
      url: config.sources.federalIncomeTax.url,
      taxYear: config.sources.federalIncomeTax.taxYear,
      dateAccessed: config.sources.federalIncomeTax.dateAccessed,
      note: '2025 federal income tax brackets used alongside SE tax estimates.',
    },
  ];
}

export function getSelfEmploymentTaxGuideSourceNotice(): string {
  return `Federal tax constants last reviewed ${config.verifiedAt} against IRS publications. Source documentation is on our methodology page.`;
}

export function getSelfEmploymentTaxGuideRates() {
  return {
    combinedRate: se.socialSecurityRate + se.medicareRate,
    socialSecurityRate: se.socialSecurityRate,
    medicareRate: se.medicareRate,
    netEarningsFactor: se.netEarningsFactor,
    wageBase: se.socialSecurityWageBase,
    deductibleRate: se.deductiblePortionRate,
    minimumThreshold: se.minimumNetEarningsThreshold,
  };
}
