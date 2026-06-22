import type { CmsBlogPost } from '@/lib/admin/content/types';
import { computeReadingTime } from '@/lib/blog/reading-time';
import { getBlogThumbnailPathForSlug } from '@/lib/blog/thumbnails';

export interface LaunchBlogPostInput {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  relatedCalculators: string[];
  relatedResources: string[];
  relatedBlogPosts: string[];
  featured?: boolean;
  taxYear?: number;
}

const PUBLISHED = '2026-06-16';
const AUTHOR = 'TaxChecker';

export function launchBlogPostToCms(input: LaunchBlogPostInput): CmsBlogPost {
  return {
    type: 'blog',
    id: input.id,
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt,
    content: input.content,
    status: 'published',
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    taxYear: input.taxYear ?? 2025,
    category: input.category,
    tags: input.tags,
    authorId: null,
    authorName: AUTHOR,
    canonicalUrl: null,
    ogImage: getBlogThumbnailPathForSlug(input.slug),
    readingTime: computeReadingTime(input.content),
    featured: input.featured ?? false,
    relatedCalculators: input.relatedCalculators,
    relatedResources: input.relatedResources,
    relatedBlogPosts: input.relatedBlogPosts,
    revision: 1,
    faqs: [],
  };
}

export const LEGACY_DRAFT_BLOG_SLUGS = [
  '2026-tax-planning-checklist-freelancers',
  'what-changes-when-irs-updates-tax-brackets',
] as const;

export function mergeLaunchBlogPosts(existing: CmsBlogPost[]): CmsBlogPost[] {
  const launch = getLaunchBlogPosts();
  const launchSlugs = new Set(launch.map((post) => post.slug));
  const preserved = existing.filter(
    (post) =>
      !LEGACY_DRAFT_BLOG_SLUGS.includes(
        post.slug as (typeof LEGACY_DRAFT_BLOG_SLUGS)[number],
      ) && !launchSlugs.has(post.slug),
  );
  return [...preserved, ...launch].sort((a, b) => {
    const aDate = a.publishedAt ?? a.updatedAt;
    const bDate = b.publishedAt ?? b.updatedAt;
    return bDate.localeCompare(aDate);
  });
}

export function getLaunchBlogPosts(): CmsBlogPost[] {
  return launchBlogPostInputs.map(launchBlogPostToCms);
}

export const launchBlogPostInputs: LaunchBlogPostInput[] = [
  {
    id: 'blog-self-employment-tax-explained',
    slug: 'self-employment-tax-explained',
    title: 'Self Employment Tax Explained',
    category: 'Self Employment',
    excerpt:
      'A federal-only overview of self-employment tax: what it funds, who it generally applies to, and how it differs from employee FICA withholding.',
    seoTitle: 'Self Employment Tax Explained (2025) — What Freelancers Owe',
    seoDescription:
      'What self-employment tax covers, who it applies to & how it differs from W-2 FICA—2025 federal overview tied to IRS Schedule SE. Planning guide—not tax advice.',
    tags: ['self employment tax', 'Schedule SE', 'federal tax', '2025'],
    featured: true,
    relatedCalculators: ['self-employed-tax', 'quarterly-tax', '1099-tax'],
    relatedResources: ['self-employment-tax-guide', 'quarterly-tax-guide'],
    relatedBlogPosts: [
      'how-self-employment-tax-is-calculated',
      'self-employment-tax-rate-2025',
    ],
    content: `Self-employment tax is the federal payroll tax system that applies to net earnings from self-employment. For many sole proprietors, freelancers, and independent contractors, it covers both the employee and employer portions of Social Security and Medicare that W-2 workers split with employers through FICA withholding.

The IRS generally uses Schedule SE (Form 1040) to compute self-employment tax on net profit from a trade or business. Only net earnings above certain thresholds are subject to the tax, and the Social Security portion applies up to an annual wage base published by the IRS for each tax year.

Self-employment tax is separate from federal income tax. A planning estimate usually includes both: self-employment tax on net self-employment earnings and income tax on taxable income after deductions. TaxChecker's Self-Employed Tax Calculator models both components using documented IRS constants for the labeled tax year.

Quarterly estimated payments often matter for self-employed taxpayers because income tax and self-employment tax may not be withheld from business deposits. The Quarterly Tax Calculator can help translate an annual federal estimate into Form 1040-ES style payment planning amounts.

This article is educational federal reference material. It does not determine whether you owe a specific amount, how you should file, or whether your activity is correctly classified. Consult a qualified tax professional for your situation.`,
  },
  {
    id: 'blog-how-self-employment-tax-is-calculated',
    slug: 'how-self-employment-tax-is-calculated',
    title: 'How Self Employment Tax Is Calculated',
    category: 'Self Employment',
    excerpt:
      'Walk through the federal mechanics behind Schedule SE: net earnings factor, Social Security wage base, Medicare rate, and deductible portion.',
    seoTitle: 'How Self Employment Tax Is Calculated (2025 Schedule SE)',
    seoDescription:
      'Walk through 2025 self-employment tax math: net earnings factor, Social Security wage base & Medicare using IRS Schedule SE concepts. Not tax advice.',
    tags: ['self employment tax calculation', 'Schedule SE', 'net earnings factor'],
    relatedCalculators: ['self-employed-tax', '1099-tax', 'estimated-tax'],
    relatedResources: ['self-employment-tax-guide', 'tax-brackets-2025'],
    relatedBlogPosts: [
      'self-employment-tax-explained',
      'self-employment-tax-rate-2025',
    ],
    content: `Federal self-employment tax starts with net earnings from self-employment. IRS instructions for Schedule SE apply a net earnings factor—commonly 92.35% of net profit—to approximate the amount subject to Social Security and Medicare taxes.

The Social Security portion uses a fixed rate on net self-employment earnings up to the annual wage base for the tax year. Above that base, Social Security tax generally does not apply to additional earnings, though Medicare tax continues.

Medicare tax applies at a separate rate on all net self-employment earnings (subject to Schedule SE rules). High earners may also be subject to Additional Medicare Tax on wages and self-employment income above IRS thresholds, which is outside the scope of basic self-employment tax estimates.

Taxpayers can generally deduct the employer-equivalent portion of self-employment tax when figuring adjusted gross income. Planning tools may show gross self-employment tax and net federal impact separately.

TaxChecker's Self-Employed Tax Calculator and 1099 Tax Calculator apply the same documented formulas used on calculator pages and worked examples. Results are simplified federal estimates for planning—not tax returns.

For bracket context after deductions, see the Federal Tax Brackets 2025 Explained article and the Tax Brackets 2025 resource table sourced from IRS Revenue Procedure 2024-40.`,
  },
  {
    id: 'blog-self-employment-tax-rate-2025',
    slug: 'self-employment-tax-rate-2025',
    title: 'Self Employment Tax Rate For 2025',
    category: 'Self Employment',
    excerpt:
      '2025 federal self-employment tax rates, Social Security wage base, and Medicare components using IRS-published constants.',
    seoTitle: '2025 Self Employment Tax Rate — Social Security & Medicare',
    seoDescription:
      '2025 self-employment tax rates, Social Security wage base & Medicare components from IRS publications. Planning reference for freelancers—not tax advice.',
    tags: ['self employment tax rate 2025', 'Social Security wage base', 'Medicare tax'],
    relatedCalculators: ['self-employed-tax', 'estimated-tax', 'quarterly-tax'],
    relatedResources: ['self-employment-tax-guide', 'tax-brackets-2025'],
    relatedBlogPosts: [
      'self-employment-tax-explained',
      'how-self-employment-tax-is-calculated',
    ],
    content: `For tax year 2025, federal self-employment tax combines Social Security and Medicare components on net self-employment earnings. The Social Security rate applies up to the IRS-published wage base for 2025; the Medicare rate applies more broadly under Schedule SE rules.

TaxChecker documents these constants from IRS primary sources and displays the tax year and last reviewed date on calculator pages. When the IRS updates wage bases or rates for a new year, calculator registries and methodology notes are reviewed against the new publications.

The combined self-employment tax rate is often discussed as a single headline figure, but planning estimates should separate Social Security (capped by the wage base) from Medicare (uncapped at the base rate). Additional Medicare Tax may apply at higher income levels.

Pair rate information with your net profit estimate. The Self-Employed Tax Calculator accepts net self-employment income and filing status to model federal self-employment tax and income tax using the same engine as on-page worked examples.

Estimated tax worksheets may combine self-employment tax with income tax to arrive at annual federal liability. The Estimated Tax Calculator illustrates safe harbor concepts using user-entered prior-year tax information where applicable.

This rate summary is for educational planning with documented 2025 constants. It is not IRS certification and not individualized tax advice.`,
  },
  {
    id: 'blog-1099-vs-w2-explained',
    slug: '1099-vs-w2-explained',
    title: '1099 vs W-2 Explained',
    category: '1099 Contractors',
    excerpt:
      'Compare how federal taxes on W-2 wages and 1099 contractor income are generally modeled—not worker classification or legal advice.',
    seoTitle: '1099 vs W-2 Explained (2025) — Federal Tax Differences',
    seoDescription:
      'Compare how W-2 wages & 1099 contractor income are taxed federally: withholding, self-employment tax & quarterly payments. Not classification advice.',
    tags: ['1099 vs W2', 'contractor taxes', 'employee taxes', 'federal tax'],
    relatedCalculators: ['w2-vs-1099', '1099-tax', 'self-employed-tax'],
    relatedResources: ['self-employment-tax-guide', 'tax-brackets-2025'],
    relatedBlogPosts: ['1099-tax-deductions-explained', 'quarterly-taxes-explained'],
    content: `W-2 employees and 1099 independent contractors are treated differently for federal payroll tax purposes. Employees typically have income tax and FICA withheld from paychecks; employers pay matching Social Security and Medicare tax on wages.

Independent contractors generally receive gross payments reported on Form 1099-NEC and may owe self-employment tax on net profit plus federal income tax. Contractors often make quarterly estimated payments because withholding usually does not apply to business income.

A federal tax comparison is not the same as worker classification. Whether someone should be a W-2 employee or contractor is a legal and factual determination outside TaxChecker's scope.

TaxChecker's W-2 vs 1099 Calculator models side-by-side federal tax scenarios using user-entered wages, benefits, business expenses, and contractor income. The 1099 Tax Calculator focuses on contractor net income after expenses.

Contractors who pay both halves of Social Security and Medicare through self-employment tax may need higher gross income than W-2 wages to achieve similar after-tax cash flow, depending on benefits and expenses. Comparison outputs are planning estimates only.

For deduction concepts on contractor income, see 1099 Tax Deductions Explained. For payment timing, see Quarterly Taxes Explained.`,
  },
  {
    id: 'blog-1099-tax-deductions-explained',
    slug: '1099-tax-deductions-explained',
    title: '1099 Tax Deductions Explained',
    category: '1099 Contractors',
    excerpt:
      'How ordinary and necessary business expenses reduce net 1099 income for federal self-employment and income tax estimates.',
    seoTitle: '1099 Tax Deductions Explained — Business Expenses & Net Profit',
    seoDescription:
      'How ordinary business expenses reduce 1099 net profit for federal self-employment & income tax estimates. Planning overview—not tax preparation advice.',
    tags: ['1099 deductions', 'business expenses', 'Schedule C', 'contractor tax'],
    relatedCalculators: ['1099-tax', 'self-employed-tax', 'quarterly-tax'],
    relatedResources: ['self-employment-tax-guide', 'quarterly-tax-guide'],
    relatedBlogPosts: ['1099-vs-w2-explained', 'quarterly-taxes-explained'],
    content: `Federal tax on 1099 income is generally computed on net profit—not gross payments. Business expenses that are ordinary and necessary for the trade or business may reduce net income on Schedule C, which in turn may reduce self-employment tax and income tax in simplified models.

TaxChecker's 1099 Tax Calculator accepts gross 1099 income and total business expenses to estimate net contractor profit, then applies documented federal self-employment and income tax rules for the labeled tax year.

Not every payment is deductible. Personal expenses, improperly documented costs, and mixed-use items may follow different IRS rules than a simple net entry in a planning calculator. TaxChecker does not audit expense categories or substantiation.

Self-employed taxpayers may also qualify for other federal adjustments—such as self-employed health insurance or retirement contributions—that are not fully modeled on every calculator page. Review calculator methodology sections for active simplifications.

After estimating net tax, many contractors use quarterly estimated payments. The Quarterly Tax Calculator and Quarterly Tax Guide resource explain Form 1040-ES due dates and payment planning concepts.

This article provides educational context for federal planning estimates. It is not tax preparation advice or a substitute for professional review of your records.`,
  },
  {
    id: 'blog-quarterly-taxes-explained',
    slug: 'quarterly-taxes-explained',
    title: 'Quarterly Taxes Explained',
    category: 'Quarterly Taxes',
    excerpt:
      'Federal quarterly estimated tax payments for self-employed taxpayers: who may need them, how they relate to Form 1040-ES, and planning concepts.',
    seoTitle: 'Quarterly Taxes Explained (2025) — Form 1040-ES Payments',
    seoDescription:
      'When self-employed taxpayers pay quarterly federal estimated tax, 2025 Form 1040-ES due dates & planning concepts. Reference article—not tax advice.',
    tags: ['quarterly taxes', 'estimated tax', '1040-ES', 'self-employed'],
    relatedCalculators: ['quarterly-tax', 'estimated-tax', 'self-employed-tax'],
    relatedResources: ['quarterly-tax-guide', 'quarterly-tax-due-dates-2025'],
    relatedBlogPosts: [
      'estimated-tax-safe-harbor-rules',
      'self-employment-tax-explained',
    ],
    content: `Federal quarterly estimated taxes are periodic payments toward annual income tax and self-employment tax liability. The IRS publishes due dates for Form 1040-ES payments, typically in April, June, September, and January following the tax year.

Self-employed taxpayers often pay quarterly because business income may not have withholding. Employees with side business income may also need estimated payments when withholding does not cover total federal liability.

A quarterly planning estimate usually starts with projected annual federal tax, then spreads remaining liability across due dates after accounting for withholding and prior payments. TaxChecker's Quarterly Tax Calculator models this using documented safe harbor rules when users supply prior-year tax information.

The Quarterly Tax Due Dates 2025 resource lists IRS due dates used in TaxChecker's tax-year configuration, including weekend and holiday adjustments where applicable.

Quarterly payments are not a separate tax—they are prepayments of federal income and self-employment tax that reconcile on the annual return. Underpayment penalties may apply when payments fall short of IRS rules; penalty calculations are excluded from TaxChecker calculators.

See Estimated Tax Safe Harbor Rules for the 90% and prior-year percentage tests. This content is educational federal reference material only.`,
  },
  {
    id: 'blog-estimated-tax-safe-harbor-rules',
    slug: 'estimated-tax-safe-harbor-rules',
    title: 'Estimated Tax Safe Harbor Rules',
    category: 'Quarterly Taxes',
    excerpt:
      'IRS safe harbor concepts for federal estimated tax: 90% of current year, 100% or 110% of prior year, and how planners use them in worksheets.',
    seoTitle: 'Estimated Tax Safe Harbor Rules (2025) — Avoid Underpayment',
    seoDescription:
      'IRS safe harbor tests—90% of current year & 100%/110% of prior year—for 2025 federal estimated tax planning. Worksheet concepts—not penalty math.',
    tags: ['safe harbor', 'estimated tax', '1040-ES', 'underpayment'],
    relatedCalculators: ['estimated-tax', 'quarterly-tax', 'self-employed-tax'],
    relatedResources: ['quarterly-tax-guide', 'tax-brackets-2025'],
    relatedBlogPosts: [
      'quarterly-taxes-explained',
      'federal-tax-brackets-2025-explained',
    ],
    content: `IRS safe harbor rules help taxpayers avoid federal underpayment penalties when estimated tax payments are timely. Common tests include paying at least 90% of current-year tax liability or 100% of prior-year tax (110% for higher AGI thresholds under IRS rules).

TaxChecker's Estimated Tax Calculator illustrates these concepts when users enter prior-year tax and current-year projections. Results are simplified worksheets—not penalty computations or filing recommendations.

Safe harbor planning depends on accurate prior-year tax figures and realistic current-year projections. Self-employment income changes, large deductions, and credits may make the current-year 90% test more relevant than prior-year percentages.

Quarterly payment amounts may be derived by dividing remaining annual estimated liability by the number of payments left in the tax year. The Quarterly Tax Calculator uses the same tax engine as annual self-employment estimates for consistency.

Bracket tables affect income tax portions of safe harbor targets. The Federal Tax Brackets 2025 Explained article and Tax Brackets 2025 resource provide rate context from IRS publications for the labeled tax year.

TaxChecker documents sources on the Methodology and Sources pages. Safe harbor constants are traced to IRS publications and Form 1040-ES instructions for the tax year shown on each calculator.`,
  },
  {
    id: 'blog-llc-vs-s-corp-explained',
    slug: 'llc-vs-s-corp-explained',
    title: 'LLC vs S Corp Explained',
    category: 'Business Structures',
    excerpt:
      'Federal tax comparison concepts between a default LLC sole proprietor and an S corporation with owner salary—educational only, not entity advice.',
    seoTitle: 'LLC vs S Corp Explained (2025) — Federal Tax Comparison',
    seoDescription:
      'Federal tax differences between LLC sole proprietor & S corporation salary/distributions—planning concepts only. Not entity formation or legal advice.',
    tags: ['LLC vs S Corp', 'S corporation', 'entity comparison', 'federal tax'],
    relatedCalculators: ['llc-vs-scorp', 's-corp-tax', 'self-employed-tax'],
    relatedResources: ['self-employment-tax-guide', 'taxchecker-methodology'],
    relatedBlogPosts: ['reasonable-salary-explained', '1099-vs-w2-explained'],
    content: `A single-member LLC taxed as a sole proprietorship generally reports business income on Schedule C and may owe self-employment tax on net profit. An S corporation files a corporate return and pays owner-employees W-2 wages subject to payroll tax, with remaining profit potentially passed through as distributions.

Federal tax differences depend on reasonable salary, payroll costs, and profit level. TaxChecker's LLC vs S Corp Calculator compares simplified federal scenarios using user-entered salary—not entity formation or election advice.

S corporation owners often split income between wages (FICA applies) and distributions (generally not subject to self-employment tax in basic models). The IRS expects reasonable compensation for services, which TaxChecker does not determine.

Compliance costs—payroll processing, additional returns, state fees—may reduce net benefit from S corporation treatment. The calculator accepts user-entered compliance costs for planning transparency.

The S Corp Tax Calculator models owner salary, employer FICA, and federal income tax on wages and pass-through income for a single scenario. Pair it with Reasonable Salary Explained for educational context on compensation concepts.

Choosing an entity involves legal, state, and non-income-tax factors beyond TaxChecker's federal estimate scope. Consult attorneys and CPAs before electing S corporation status.`,
  },
  {
    id: 'blog-reasonable-salary-explained',
    slug: 'reasonable-salary-explained',
    title: 'Reasonable Salary Explained',
    category: 'Business Structures',
    excerpt:
      'What "reasonable salary" means in federal S corporation planning conversations—and what TaxChecker models (and does not model).',
    seoTitle: 'Reasonable S Corp Salary Explained — Federal Planning Context',
    seoDescription:
      'What reasonable officer compensation means for S corporations in federal tax planning & what TaxChecker models. Not compensation or legal advice.',
    tags: ['reasonable salary', 'S corporation', 'officer compensation', 'payroll tax'],
    relatedCalculators: ['s-corp-tax', 'llc-vs-scorp', 'w2-vs-1099'],
    relatedResources: ['self-employment-tax-guide', 'taxchecker-methodology'],
    relatedBlogPosts: ['llc-vs-s-corp-explained', '1099-vs-w2-explained'],
    content: `S corporation shareholders who perform services for the corporation generally must receive reasonable compensation as wages before distributions. The IRS examines whether W-2 wages reflect the value of services provided—an area of facts and circumstances TaxChecker does not adjudicate.

TaxChecker's S Corp Tax Calculator and LLC vs S Corp Calculator use user-entered salary amounts to illustrate federal payroll and income tax effects. They do not recommend a salary level or opine on reasonableness.

Higher W-2 wages increase employee and employer FICA, which may reduce distribution amounts subject only to income tax in simplified models. Very low wages relative to profit may create audit risk in real filings—an important limitation for educational comparisons.

Payroll tax rates and wage bases follow IRS Publication 15 and related guidance for the labeled tax year. Self-employment tax on sole proprietor income provides a baseline comparison in the LLC vs S Corp Calculator.

W-2 versus contractor comparisons use similar payroll concepts on the employee side. See 1099 vs W-2 Explained for employment tax framing—not classification advice.

Reasonable compensation analysis requires professional judgment, industry data, and corporate governance. Use TaxChecker outputs as estimate-only planning inputs, not filing positions.`,
  },
  {
    id: 'blog-federal-tax-brackets-2025-explained',
    slug: 'federal-tax-brackets-2025-explained',
    title: 'Federal Tax Brackets 2025 Explained',
    category: 'Tax Planning',
    excerpt:
      'How 2025 federal income tax brackets work by filing status, sourced from IRS Revenue Procedure 2024-40 for planning estimates.',
    seoTitle: '2025 Federal Tax Brackets Explained — Marginal Rates & Tables',
    seoDescription:
      'How 2025 federal income tax brackets work by filing status—aligned with IRS Revenue Procedure 2024-40. Planning article paired with bracket tables.',
    tags: ['2025 tax brackets', 'federal income tax', 'marginal rates', 'Rev. Proc. 2024-40'],
    relatedCalculators: ['self-employed-tax', 'estimated-tax', '1099-tax'],
    relatedResources: ['tax-brackets-2025', 'quarterly-tax-guide'],
    relatedBlogPosts: [
      'self-employment-tax-rate-2025',
      'estimated-tax-safe-harbor-rules',
    ],
    content: `Federal income tax uses progressive marginal brackets. For tax year 2025, inflation-adjusted thresholds appear in IRS Revenue Procedure 2024-40. TaxChecker's Tax Brackets 2025 resource lists rates and brackets by filing status used in calculator constants.

Taxable income—not gross income—generally determines which brackets apply. Standard or itemized deductions, qualified business income rules, and other return items may change taxable income beyond simple calculator inputs.

Self-employed taxpayers often estimate brackets using net profit minus deductible portions of self-employment tax and other adjustments modeled on a page. The Self-Employed Tax Calculator combines bracket tables with self-employment tax for a federal planning total.

Marginal rate is the tax on the next dollar of income within a bracket; effective rate is total tax divided by income. Planning conversations frequently use marginal rates for retirement or HSA contribution decisions.

Safe harbor estimated tax targets depend in part on projected bracket-driven income tax. See Estimated Tax Safe Harbor Rules for payment planning context.

TaxChecker reviews bracket constants when IRS annual guidance changes and updates last reviewed metadata on affected pages. Results remain educational estimates—not tax returns or advice.`,
  },
];
