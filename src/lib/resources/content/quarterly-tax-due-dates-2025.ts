import type { SourceReferenceItem } from '@/components/calculator/source-section';
import type { FaqItem } from '@/components/content/faq-block';
import { getQuarterlyDueDateRows } from '@/lib/resources/reference-data';
import { taxYear2025 } from '@/lib/tax-engine';

const config = taxYear2025;

export function getQuarterlyTaxDueDates2025Faqs(): FaqItem[] {
  const dueDates = getQuarterlyDueDateRows(config);

  return [
    {
      question: 'When are 2025 federal quarterly estimated tax payments due?',
      answer: `For tax year 2025, IRS Form 1040-ES payments are generally due ${dueDates.map((row) => row.dueDateLabel).join(', ')}. Each date corresponds to income earned in the preceding payment period shown in the table on this page.`,
    },
    {
      question: 'Why is the Q2 2025 due date June 16 instead of June 15?',
      answer:
        'When a statutory due date falls on a weekend or federal holiday, IRS rules may move the deadline to the next business day. The June 2025 payment uses June 16 for that reason—matching the documented due date in TaxChecker\'s 2025 configuration.',
    },
    {
      question: 'What income period does each quarterly payment cover?',
      answer:
        'Form 1040-ES uses four payment periods: Q1 (Jan–Mar), Q2 (Apr–May), Q3 (Jun–Aug), and Q4 (Sep–Dec). The table on this page maps each period to its 2025 federal due date.',
    },
    {
      question: 'Do state estimated tax deadlines match federal dates?',
      answer:
        'Often no. Many states set their own estimated payment schedules and due dates. This page covers federal Form 1040-ES deadlines only; check your state revenue department for state-specific rules.',
    },
    {
      question: 'Does paying by these dates guarantee no underpayment interest?',
      answer:
        'Not necessarily. Meeting calendar due dates is only one part of estimated tax compliance. Safe harbor amounts and annual liability tests in IRS Publication 505 determine whether underpayment interest may apply. This page lists dates only—it does not evaluate your payments.',
    },
    {
      question: 'How can I estimate quarterly payment amounts?',
      answer:
        'TaxChecker\'s Quarterly Tax Calculator and Estimated Tax Calculator can produce federal planning estimates using documented 2025 rules from IRS publications. They do not submit payments or calculate penalties.',
    },
    {
      question: 'What form are these dates associated with?',
      answer:
        'These are the individual estimated tax due dates associated with IRS Form 1040-ES for tax year 2025, as published in the official form instructions and documented in TaxChecker\'s tax year configuration.',
    },
    {
      question: 'Is this a payment reminder service?',
      answer:
        'No. This is a static reference page for educational planning. TaxChecker does not send reminders, process payments, or provide tax advice.',
    },
  ];
}

export function getQuarterlyTaxDueDates2025Sources(): SourceReferenceItem[] {
  return [
    {
      title: config.sources.estimatedTax.title,
      url: config.sources.estimatedTax.url,
      taxYear: config.sources.estimatedTax.taxYear,
      dateAccessed: config.sources.estimatedTax.dateAccessed,
      note: 'Official 2025 Form 1040-ES vouchers and payment due dates.',
    },
    {
      title: 'Publication 505 — Tax Withholding and Estimated Tax',
      url: 'https://www.irs.gov/publications/p505',
      taxYear: config.taxYear,
      dateAccessed: config.verifiedAt,
      note: 'Estimated tax payment rules and safe harbor context.',
    },
  ];
}

export function getQuarterlyTaxDueDates2025SourceNotice(): string {
  return `Due dates sourced from IRS publications in TaxChecker's 2025 configuration (last reviewed ${config.verifiedAt}). Weekend and holiday adjustments follow IRS published schedules. See our methodology page for documentation.`;
}
