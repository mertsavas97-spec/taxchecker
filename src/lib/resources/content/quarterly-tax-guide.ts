import type { SourceReferenceItem } from '@/components/calculator/source-section';
import type { FaqItem } from '@/components/content/faq-block';
import {
  formatDollarsFromCents,
  formatPercentFromConfig,
  getQuarterlyDueDateRows,
} from '@/lib/resources/reference-data';
import { taxYear2025 } from '@/lib/tax-engine';

const config = taxYear2025;
const estimated = config.estimatedTax;

export function getQuarterlyTaxGuideFaqs(): FaqItem[] {
  return [
    {
      question: 'What are quarterly estimated taxes?',
      answer:
        'Quarterly estimated tax payments are periodic federal payments toward your expected annual income tax and self-employment tax liability. They are commonly associated with Form 1040-ES for individuals who expect to owe tax beyond paycheck withholding.',
    },
    {
      question: 'Who may need to make estimated tax payments?',
      answer:
        'Taxpayers who expect to owe a meaningful federal balance at filing—often because withholding will not cover income tax and self-employment tax—may need to pay estimated tax during the year. IRS rules look at expected current-year liability and prior-year amounts; this guide does not determine your requirement.',
    },
    {
      question: 'What is the 2025 federal estimated tax payment schedule?',
      answer: `For 2025, IRS Form 1040-ES due dates are ${getQuarterlyDueDateRows(config).map((row) => `${row.quarter}: ${row.dueDateLabel}`).join('; ')}. Dates may shift when they fall on a weekend or holiday.`,
    },
    {
      question: 'What is the estimated tax safe harbor?',
      answer:
        'Safe harbor rules describe payment amounts that may reduce or avoid underpayment interest in many situations. TaxChecker summarizes the common 90%, 100%, and 110% frameworks for planning; IRS Publication 505 contains the full rule set and exceptions.',
    },
    {
      question: 'What do the 90%, 100%, and 110% safe harbor rules mean?',
      answer: `A common planning framework: pay at least ${formatPercentFromConfig(estimated.safeHarborCurrentYearRate)} of the current year\'s expected tax, or ${formatPercentFromConfig(estimated.safeHarborPriorYearRate)} of the prior year\'s tax (${formatPercentFromConfig(estimated.safeHarborPriorYearHighAGIRate)} if prior-year AGI exceeded ${formatDollarsFromCents(estimated.safeHarborHighAGIThreshold)} for most filers, or ${formatDollarsFromCents(estimated.safeHarborHighAGIThresholdMFS)} if married filing separately). Meeting a safe harbor may limit underpayment interest but does not guarantee a refund or zero balance due.`,
    },
    {
      question: 'How do estimated payments relate to self-employment income?',
      answer:
        'Self-employment income often increases both SE tax and income tax without corresponding withholding. Estimated payments are one way to spread that federal liability across the year instead of paying entirely at filing time.',
    },
    {
      question: 'What if my income changes during the year?',
      answer:
        'Mid-year income changes may mean your earlier estimated payments no longer align with your expected annual liability. Taxpayers often revisit estimates after major income or deduction changes. TaxChecker calculators can produce updated planning estimates; they do not submit payments or calculate penalties.',
    },
    {
      question: 'Does this guide calculate penalties or payment amounts I must send?',
      answer:
        'No. This guide explains concepts and IRS due dates only. It does not calculate underpayment penalties, tell you that you must pay, or replace Form 1040-ES instructions.',
    },
  ];
}

export function getQuarterlyTaxGuideSources(): SourceReferenceItem[] {
  return [
    {
      title: config.sources.estimatedTax.title,
      url: config.sources.estimatedTax.url,
      taxYear: config.sources.estimatedTax.taxYear,
      dateAccessed: config.sources.estimatedTax.dateAccessed,
      note: 'Official 2025 estimated tax payment vouchers and due dates.',
    },
    {
      title: 'Publication 505 — Tax Withholding and Estimated Tax',
      url: 'https://www.irs.gov/publications/p505',
      taxYear: config.taxYear,
      dateAccessed: config.verifiedAt,
      note: 'Who should pay estimated tax and safe harbor overview.',
    },
    {
      title: config.sources.selfEmploymentTax.title,
      url: config.sources.selfEmploymentTax.url,
      taxYear: config.sources.selfEmploymentTax.taxYear,
      dateAccessed: config.sources.selfEmploymentTax.dateAccessed,
      note: 'Self-employment tax context for estimated payment planning.',
    },
  ];
}

export function getQuarterlyTaxGuideSourceNotice(): string {
  return `Due dates and safe harbor rates last reviewed ${config.verifiedAt} against IRS publications. See our methodology page for source documentation.`;
}

export function getQuarterlyTaxGuideSafeHarbor() {
  return estimated;
}
