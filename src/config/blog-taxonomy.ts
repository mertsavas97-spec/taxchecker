export interface BlogCategoryDefinition {
  id: string;
  label: string;
  description: string;
  seoDescription: string;
  keywords: string[];
}

export const blogTaxonomy: BlogCategoryDefinition[] = [
  {
    id: 'self-employment',
    label: 'Self Employment',
    description:
      'Federal self-employment tax mechanics, Schedule SE concepts, and planning estimates for sole proprietors and freelancers.',
    seoDescription:
      'Educational articles on U.S. federal self-employment tax, Schedule SE, and net earnings for independent workers.',
    keywords: ['self employment tax', 'Schedule SE', 'freelancer federal tax'],
  },
  {
    id: '1099-contractors',
    label: '1099 Contractors',
    description:
      'How 1099-NEC income is taxed at the federal level, contractor deductions, and comparisons with W-2 wages.',
    seoDescription:
      'Federal tax explainers for 1099 contractors, independent contractor deductions, and 1099 vs W-2 planning concepts.',
    keywords: ['1099 tax', 'independent contractor', '1099 vs W2'],
  },
  {
    id: 'quarterly-taxes',
    label: 'Quarterly Taxes',
    description:
      'Quarterly estimated federal tax payments, Form 1040-ES due dates, and safe harbor planning concepts.',
    seoDescription:
      'Guides to federal quarterly estimated taxes, 1040-ES due dates, and IRS safe harbor rules for planning.',
    keywords: ['quarterly estimated tax', '1040-ES', 'safe harbor'],
  },
  {
    id: 'business-structures',
    label: 'Business Structures',
    description:
      'Educational comparisons of LLC, S corporation, and sole proprietor federal tax treatment—not entity or legal advice.',
    seoDescription:
      'Federal tax education on LLC vs S Corp comparisons, S corporation salary, and entity planning concepts.',
    keywords: ['LLC vs S Corp', 'S corporation tax', 'reasonable salary'],
  },
  {
    id: 'tax-planning',
    label: 'Tax Planning',
    description:
      'Federal tax brackets, annual planning concepts, and how documented IRS constants apply to estimate tools.',
    seoDescription:
      'Federal tax planning articles covering brackets, rates, and estimate-only planning with constants from IRS publications.',
    keywords: ['federal tax brackets', 'tax planning', '2025 tax rates'],
  },
];

export const blogCategories = blogTaxonomy.map((category) => category.label) as readonly string[];

export type BlogCategory = (typeof blogCategories)[number];

export function isBlogCategory(value: string): value is BlogCategory {
  return (blogCategories as readonly string[]).includes(value);
}

export function getBlogCategoryDefinition(
  label: string,
): BlogCategoryDefinition | undefined {
  return blogTaxonomy.find((category) => category.label === label);
}

export const blogCategoryLabels = Object.fromEntries(
  blogTaxonomy.map((category) => [category.label, category.label]),
) as Record<BlogCategory, string>;
