import type { LegalPageContent } from '@/lib/legal/types';
import { legalEntity } from '@/config/legal-entity';
import { site } from '@/config/site';

export const disclaimerLegalContent: LegalPageContent = {
  eyebrow: 'Disclaimer',
  summary:
    'TaxChecker provides educational federal tax estimates only. Results are planning tools—not tax returns, filing recommendations, or professional advice.',
  sections: [
    {
      id: 'operator',
      heading: 'Operator',
      paragraphs: [
        `${legalEntity.operatingName} is operated by ${legalEntity.legalName} (${legalEntity.jurisdiction}). This website is an independent educational publisher—not the IRS, a CPA firm, a law firm, or tax preparation software.`,
      ],
    },
    {
      id: 'educational-use-only',
      heading: 'Educational Use Only',
      paragraphs: [
        'All calculators, articles, and resources are intended to help you understand federal tax mechanics before filing or making planning decisions.',
        'Nothing on this website constitutes tax advice, legal advice, accounting advice, or financial advice tailored to your situation.',
      ],
    },
    {
      id: 'estimates-only',
      heading: 'Estimates Only',
      paragraphs: [
        'All calculator results are simplified federal planning estimates based on the inputs you provide and documented assumptions shown on each calculator page.',
        'Outputs are not tax returns, IRS transcripts, wage and income transcripts, or official determinations of tax owed or refund due.',
      ],
    },
    {
      id: 'results-may-differ',
      heading: 'Results May Differ From Actual IRS Outcomes',
      paragraphs: [
        'Your actual federal tax liability may differ due to credits, adjustments, prior-year items, alternative minimum tax, state taxes, penalties, elections, and facts not captured by a simplified model.',
        'TaxChecker does not represent that any estimate will match what you will owe, pay, or receive after filing.',
      ],
    },
    {
      id: 'methodology-limitations',
      heading: 'Methodology And Source Limitations',
      paragraphs: [
        'TaxChecker documents federal tax constants using IRS publications, forms, and revenue procedures for the labeled tax year and reviews them on a documented schedule.',
        'Internal review against IRS sources is not IRS certification, approval, or endorsement. Errors, delays in updates, or simplifications may occur.',
        'You should verify critical figures against primary IRS sources and a qualified tax professional before relying on results.',
      ],
    },
    {
      id: 'no-filing-recommendation',
      heading: 'No Filing Recommendation',
      paragraphs: [
        'TaxChecker does not recommend whether you should file, how you should file, which forms to use, or which filing status to elect.',
        'TaxChecker does not provide tax filing services and does not prepare, review, sign, or e-file tax returns.',
      ],
    },
    {
      id: 'no-tax-position-recommendation',
      heading: 'No Tax Position Recommendation',
      paragraphs: [
        'TaxChecker does not recommend business structures, worker classification, reasonable S corporation salary, entity elections, or any specific tax position.',
        'Comparison calculators illustrate user-entered scenarios only.',
      ],
    },
    {
      id: 'no-irs-affiliation',
      heading: 'No IRS Affiliation',
      paragraphs: [
        'TaxChecker is not endorsed by, affiliated with, sponsored by, or operated by the Internal Revenue Service or any U.S. government agency.',
      ],
    },
    {
      id: 'federal-scope',
      heading: 'Federal Scope',
      paragraphs: [
        'Unless explicitly stated otherwise, calculators model federal taxes only. State, local, franchise, sales, and other non-federal obligations may apply and are generally excluded.',
      ],
      list: [
        'Many tax credits and above-the-line adjustments',
        'Alternative minimum tax (AMT)',
        'Qualified Business Income (Section 199A) deduction',
        'Underpayment penalties (Form 2210)',
        'Complex multi-state or multi-entity situations',
      ],
    },
    {
      id: 'not-a-substitute-for-professionals',
      heading: 'TaxChecker Does Not Replace Professional Advisors',
      paragraphs: [
        'TaxChecker does not replace a Certified Public Accountant (CPA), Enrolled Agent (EA), tax attorney, or other qualified tax professional.',
        'Consult a qualified advisor before filing returns, responding to IRS notices, electing entity status, or making financial decisions based on calculator output.',
      ],
    },
  ],
  footer: site.disclaimer,
};
