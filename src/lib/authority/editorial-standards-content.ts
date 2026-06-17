import { authorityRoutes } from '@/config/authority';
import { site } from '@/config/site';

export interface EditorialSection {
  id: string;
  heading: string;
  paragraphs: string[];
  list?: string[];
}

export const editorialStandardsContent = {
  eyebrow: 'Editorial Standards',
  title: 'Editorial Standards',
  summary:
    'How TaxChecker creates and maintains federal tax calculators, resources, and educational articles. Our process prioritizes IRS primary sources, transparency, and estimate-only positioning.',
  sections: [
    {
      id: 'content-process',
      heading: 'Content process',
      paragraphs: [
        'TaxChecker content begins with a documented federal tax question—usually tied to a calculator or reference article. We map the question to IRS publications, forms, notices, or revenue procedures before drafting user-facing copy or enabling a calculator.',
        'Calculator pages combine an interactive tool, methodology notes, worked examples, FAQs, and cited IRS sources. Resource articles explain IRS mechanics in plain language and link back to relevant calculators where appropriate.',
      ],
      list: [
        'Define the federal tax scenario and intended user',
        'Trace rules to IRS primary sources',
        'Implement or update the shared tax engine configuration',
        'Draft educational copy with estimate-only disclaimers',
        'Publish with tax year and last reviewed metadata',
      ],
    },
    {
      id: 'review-process',
      heading: 'Review process',
      paragraphs: [
        'Ready calculators and published resources display a tax year and last reviewed date. Reviews focus on whether constants from IRS publications, due dates, and formulas still match the labeled tax year—not on individualized tax advice.',
        'Comparison calculators (W-2 vs 1099, LLC vs S Corp, S Corp salary modeling) receive additional review to ensure outputs are framed as user-entered scenario estimates, not employment, legal, or entity recommendations.',
      ],
      list: [
        'Check tax-year constants against cited IRS sources',
        'Confirm calculator warnings and disclaimers appear on the page',
        'Confirm resource FAQs state the content is not tax advice',
        'Update last reviewed dates when constants or copy change',
      ],
    },
    {
      id: 'source-standards',
      heading: 'Source standards',
      paragraphs: [
        'We cite IRS.gov publications, forms, instructions, topics, notices, and revenue procedures wherever practical. Third-party summaries are not used as primary sources for tax constants.',
        'Source traceability is documented on calculator pages, resource articles, the Methodology page, and the public Sources appendix. TaxChecker is not affiliated with the IRS, and source documentation is not IRS certification.',
      ],
      list: [
        'Prefer IRS primary sources over secondary commentary',
        'Record tax year and date accessed for each cited source',
        'Link to the public Sources appendix for consolidated references',
        'Do not imply IRS endorsement of TaxChecker',
      ],
    },
    {
      id: 'correction-policy',
      heading: 'Correction policy',
      paragraphs: [
        'If you believe a calculator constant, due date, or educational explanation is outdated or incorrect, contact us with the IRS source you believe should apply. We review good-faith reports and update affected pages when a correction is confirmed.',
        'Corrections may update tax engine configuration, page copy, last reviewed dates, and the Sources appendix. TaxChecker does not provide individualized tax advice through correction requests.',
      ],
      list: [
        'Submit corrections through the contact form',
        'Include the relevant IRS publication, form, or notice when possible',
        'Allow reasonable time for review against primary sources',
        'Check the affected page for an updated last reviewed date after confirmation',
      ],
    },
    {
      id: 'scope-limitations',
      heading: 'Federal scope and limitations',
      paragraphs: [
        'TaxChecker focuses on U.S. federal tax estimation for planning and education. State, local, and non-income taxes are generally excluded unless explicitly stated on a page.',
        'All outputs are educational estimates. They are not tax returns, filing recommendations, or professional advice.',
      ],
      list: [
        'Federal income and self-employment tax estimates',
        'Quarterly estimated payment planning worksheets',
        'Entity and employment comparison models with explicit limitations',
        'No tax preparation, filing, or individualized advice',
      ],
    },
  ] satisfies EditorialSection[],
  relatedLinks: [
    { label: 'Methodology', href: authorityRoutes.methodology },
    { label: 'Sources', href: authorityRoutes.sources },
    { label: 'About', href: authorityRoutes.about },
    { label: 'Contact', href: '/contact' },
  ],
  footer: site.disclaimer,
} as const;
