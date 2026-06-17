import { site } from '@/config/site';
import type { TrustPageSlug } from '@/config/trust-pages';

export interface StaticPageSection {
  heading?: string;
  paragraphs: string[];
  list?: string[];
}

export interface StaticPageContent {
  eyebrow?: string;
  intro: string;
  sections: StaticPageSection[];
  footer?: string;
}

const trustPageContent: Record<TrustPageSlug, StaticPageContent> = {
  about: {
    eyebrow: 'About TaxChecker',
    intro:
      'TaxChecker provides free federal tax calculators built from IRS publications. We help self-employed workers, contractors, and small business owners understand estimated federal taxes before filing—not replace professional advice.',
    sections: [
      {
        heading: 'What we build',
        paragraphs: [
          'TaxChecker focuses on federal income tax, self-employment tax, quarterly estimated payments, entity comparisons, and related planning scenarios. Each calculator uses a documented tax engine tied to IRS publications, forms, and revenue procedures for the selected tax year.',
        ],
        list: [
          'Self-employment and 1099 contractor income estimates',
          'Quarterly and annual estimated federal tax worksheets',
          'W-2 vs 1099 and business structure comparisons',
          'HSA contribution and federal tax savings estimates',
        ],
      },
      {
        heading: 'What we are not',
        paragraphs: [
          'TaxChecker is not affiliated with the IRS, a tax preparation service, or a CPA firm. We do not prepare, file, or e-file tax returns. We do not provide individualized tax, legal, or financial advice.',
        ],
      },
      {
        heading: 'Estimate-only philosophy',
        paragraphs: [
          'Every result is a simplified federal planning estimate based on the inputs you provide. State and local taxes, credits beyond modeled inputs, alternative minimum tax, and complex return situations may not be reflected. Review results with a qualified tax professional before making decisions.',
        ],
      },
    ],
    footer: site.disclaimer,
  },
  contact: {
    eyebrow: 'Contact',
    intro:
      'Questions about TaxChecker calculators, methodology, or the website? Use our contact form. We cannot provide individualized tax advice.',
    sections: [],
  },
  privacy: {
    eyebrow: 'Privacy Policy',
    intro:
      'TaxChecker is designed to minimize data collection. Federal tax calculations run locally in your browser and are not sent to our servers.',
    sections: [
      {
        heading: 'Information we do not collect from calculators',
        paragraphs: [
          'When you use a TaxChecker calculator, income amounts and other inputs you enter are processed in your browser to produce estimates. We do not require an account, and we do not store your calculator inputs on our servers as part of normal calculator use.',
        ],
      },
      {
        heading: 'Information that may be collected automatically',
        paragraphs: [
          'Like most websites, our hosting and analytics providers may process standard server logs or aggregated usage data (such as page views, browser type, and general location derived from IP address) to operate and improve the service. We do not sell personal information.',
        ],
      },
      {
        heading: 'Cookies',
        paragraphs: [
          'TaxChecker may use essential cookies required for site functionality. We do not use advertising or affiliate tracking cookies.',
        ],
      },
      {
        heading: 'Third-party links',
        paragraphs: [
          'Calculator pages may link to IRS.gov and other external reference sites. Those sites have their own privacy policies.',
        ],
      },
      {
        heading: 'Children',
        paragraphs: [
          'TaxChecker is not directed at children under 13, and we do not knowingly collect personal information from children.',
        ],
      },
      {
        heading: 'Changes',
        paragraphs: [
          'We may update this privacy policy as the website evolves. Material changes will be reflected on this page with an updated date.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: [
          'Privacy questions may be submitted through our contact form. We do not publish a public support email address on this website.',
        ],
      },
    ],
  },
  terms: {
    eyebrow: 'Terms of Use',
    intro:
      'By using TaxChecker, you agree to these terms. If you do not agree, please do not use the website.',
    sections: [
      {
        heading: 'Service description',
        paragraphs: [
          'TaxChecker provides free online federal tax estimation tools for informational and planning purposes. The service is provided "as is" without warranties of any kind, express or implied.',
        ],
      },
      {
        heading: 'Not professional advice',
        paragraphs: [
          'TaxChecker does not provide tax, legal, accounting, or financial advice. Calculator outputs are estimates based on simplified models and user-supplied inputs. They may differ from your actual tax liability, safe harbor amounts, or filing requirements.',
        ],
      },
      {
        heading: 'Your responsibility',
        paragraphs: [
          'You are responsible for verifying inputs, interpreting results, and consulting qualified professionals before filing returns or making tax or business decisions. You agree not to rely on TaxChecker as a substitute for professional advice.',
        ],
      },
      {
        heading: 'Intellectual property',
        paragraphs: [
          'TaxChecker content, design, and calculator implementations are protected by applicable intellectual property laws. IRS publications and forms are public domain materials cited for reference.',
        ],
      },
      {
        heading: 'Limitation of liability',
        paragraphs: [
          'To the fullest extent permitted by law, TaxChecker and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the website or reliance on any estimate.',
        ],
      },
      {
        heading: 'Changes',
        paragraphs: [
          'We may modify these terms or discontinue features at any time. Continued use after changes constitutes acceptance of the updated terms.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: [
          'Questions about these Terms of Use may be submitted through our contact form.',
        ],
      },
    ],
  },
  disclaimer: {
    eyebrow: 'Disclaimer',
    intro: site.disclaimer,
    sections: [
      {
        heading: 'Estimates only',
        paragraphs: [
          'All TaxChecker calculator results are simplified federal planning estimates. They are not tax returns, IRS transcripts, or official determinations of tax owed. Your actual liability depends on your complete tax situation, elections, credits, withholding, and applicable law.',
        ],
      },
      {
        heading: 'No IRS affiliation',
        paragraphs: [
          'TaxChecker is an independent website and is not endorsed by, affiliated with, or operated by the Internal Revenue Service or any government agency.',
        ],
      },
      {
        heading: 'Federal scope',
        paragraphs: [
          'Unless explicitly stated otherwise, calculators model federal taxes only. State and local income taxes, franchise taxes, sales taxes, and payroll obligations beyond modeled inputs are excluded.',
        ],
      },
      {
        heading: 'Known exclusions',
        paragraphs: [
          'Calculators may exclude or simplify items such as:',
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
        heading: 'Entity and employment comparisons',
        paragraphs: [
          'Entity and employment comparison tools use user-entered assumptions. They do not recommend a business structure, S corporation election, reasonable salary, or worker classification.',
        ],
      },
      {
        heading: 'Seek professional advice',
        paragraphs: [
          'Consult a qualified tax professional, CPA, enrolled agent, or attorney before filing returns, electing entity status, or making financial decisions based on calculator output.',
        ],
      },
    ],
  },
  methodology: {
    eyebrow: 'Methodology',
    intro:
      'TaxChecker estimates are built from IRS primary sources, documented in code, and reviewed when tax-year constants change. This page summarizes how estimates are produced and what they intentionally omit.',
    sections: [
      {
        heading: 'IRS source documentation',
        paragraphs: [
          'Tax rates, brackets, standard deductions, self-employment tax rules, payroll tax rates, HSA limits, and quarterly due dates are traced to IRS publications, forms, notices, and revenue procedures for the labeled tax year. Calculator pages cite the primary references used.',
        ],
      },
      {
        heading: 'Tax engine',
        paragraphs: [
          'Each calculator calls a shared TypeScript tax engine that implements documented formulas. Worked examples on calculator pages use the same engine as the interactive form, so displayed examples match live calculations for the same inputs.',
        ],
      },
      {
        heading: 'Annual updates',
        paragraphs: [
          'When IRS guidance updates constants for a new tax year, calculator registries and engine configuration are reviewed. Each calculator displays its tax year and last reviewed date.',
        ],
      },
      {
        heading: 'Federal-only scope',
        paragraphs: [
          'Models focus on federal income tax, self-employment tax, and related federal payroll taxes where applicable. State and local taxes are excluded unless a future calculator explicitly states otherwise.',
        ],
      },
      {
        heading: 'Simplifications',
        paragraphs: [
          'To keep tools usable for planning, we apply documented simplifications. Warnings on calculator pages describe active simplifications for your scenario—for example, excluded credits, penalty calculations, or eligibility checks not performed.',
        ],
      },
      {
        heading: 'No data retention',
        paragraphs: [
          'Calculator inputs are processed in your browser. TaxChecker does not store your inputs on servers as part of standard calculator operation.',
        ],
      },
    ],
    footer: site.disclaimer,
  },
  sources: {
    eyebrow: 'Source documentation',
    intro:
      'Primary IRS publications, forms, revenue procedures, and notices referenced across TaxChecker calculators and educational resources.',
    sections: [],
    footer: site.disclaimer,
  },
  'editorial-standards': {
    eyebrow: 'Editorial Standards',
    intro:
      'How TaxChecker creates and maintains federal tax calculators, resources, and articles with IRS source documentation and estimate-only positioning.',
    sections: [],
    footer: site.disclaimer,
  },
  guides: {
    eyebrow: 'Tax Guides',
    intro:
      'Educational guides and reference articles explaining federal tax concepts behind TaxChecker calculators.',
    sections: [
      {
        heading: 'Coming soon',
        paragraphs: [
          'We are building guides on self-employment tax, quarterly estimated payments, federal tax brackets, and safe harbor rules. Until those articles are published, use the calculators and methodology page for planning estimates.',
        ],
        list: [
          'Self-employment tax overview',
          'Quarterly estimated tax deadlines',
          'Federal tax brackets reference',
          'W-2 vs 1099 comparison concepts',
        ],
      },
    ],
    footer:
      'Guides are for educational purposes only and are not tax advice.',
  },
};

export function getTrustPageContent(slug: TrustPageSlug): StaticPageContent {
  return trustPageContent[slug];
}
