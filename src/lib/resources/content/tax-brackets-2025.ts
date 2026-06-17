import type { SourceReferenceItem } from '@/components/calculator/source-section';
import type { FaqItem } from '@/components/content/faq-block';
import { taxYear2025 } from '@/lib/tax-engine';

const config = taxYear2025;

export function getTaxBrackets2025Faqs(): FaqItem[] {
  return [
    {
      question: 'What are 2025 federal income tax brackets?',
      answer:
        'Federal income tax uses progressive marginal brackets: different portions of taxable income are taxed at different rates. The tables on this page show 2025 ordinary income brackets by filing status from IRS Revenue Procedure 2024-40—the same source TaxChecker uses in its tax engine.',
    },
    {
      question: 'Which filing statuses does TaxChecker support?',
      answer:
        'TaxChecker calculators support single, married filing jointly, married filing separately, head of household, and qualifying surviving spouse. Bracket tables for each status appear below, derived from the 2025 tax year configuration from IRS publications.',
    },
    {
      question: 'What is the 2025 standard deduction?',
      answer:
        'The standard deduction reduces taxable income before brackets apply. Amounts vary by filing status and are listed in the standard deduction table on this page, using the same TaxChecker configuration documented from IRS publications.',
    },
    {
      question: 'What is progressive taxation?',
      answer:
        'Progressive taxation means higher slices of taxable income may be taxed at higher marginal rates. Moving into a higher bracket does not re-tax all of your income at that rate—only income within that bracket range uses the higher rate.',
    },
    {
      question: 'What is the difference between marginal and effective tax rate?',
      answer:
        'Marginal rate is the tax rate on the next dollar of taxable income within the current bracket. Effective rate is total federal income tax divided by total income or taxable income—a blended average. TaxChecker calculators may display both for planning context.',
    },
    {
      question: 'How does TaxChecker use these brackets?',
      answer:
        'TaxChecker applies these bracket thresholds and rates when estimating federal income tax on taxable income after the standard deduction (or user-provided assumptions). State taxes, credits, alternative minimum tax, and many return-specific items are outside scope.',
    },
    {
      question: 'Do these brackets include self-employment tax?',
      answer:
        'No. These tables show ordinary federal income tax brackets only. Self-employment tax is calculated separately under Schedule SE rules and may affect taxable income through the deductible portion of SE tax.',
    },
    {
      question: 'Is this table tax advice?',
      answer:
        'No. This is a reference derived from IRS-published 2025 constants for educational and calculator alignment purposes. Your actual tax return may differ.',
    },
  ];
}

export function getTaxBrackets2025Sources(): SourceReferenceItem[] {
  return [
    {
      title: config.sources.federalIncomeTax.title,
      url: config.sources.federalIncomeTax.url,
      taxYear: config.sources.federalIncomeTax.taxYear,
      dateAccessed: config.sources.federalIncomeTax.dateAccessed,
      note: 'Authoritative 2025 bracket thresholds and standard deduction amounts.',
    },
    {
      title: 'Form 1040 — U.S. Individual Income Tax Return',
      url: 'https://www.irs.gov/forms-pubs/about-form-1040',
      taxYear: config.taxYear,
      dateAccessed: config.verifiedAt,
      note: 'How taxable income and tax are reported on the federal return.',
    },
  ];
}

export function getTaxBrackets2025SourceNotice(): string {
  return `Bracket and deduction tables generated from TaxChecker constants documented from IRS publications (last reviewed ${config.verifiedAt}). See our methodology page for source documentation.`;
}
