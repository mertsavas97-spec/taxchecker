export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export interface NavGroup {
  label: string;
  links: NavLink[];
}

export const siteConfig = {
  name: 'TaxChecker',
  tagline: 'Federal tax estimates you can verify',
  domain: 'https://taxchecker.app',
} as const;

export const calculatorsHubLink: NavLink = {
  label: 'All Calculators',
  href: '/calculators',
  description: 'Browse every federal tax calculator',
};

export const POPULAR_CALCULATOR_ROUTE = '/calculators/self-employed-tax';

export const POPULAR_CALCULATOR_CTA_LABEL = 'Self-Employed Tax Calculator';

export const resourcesNavLink: NavLink = {
  label: 'Resources',
  href: '/resources',
  description: 'Federal tax guides, deadlines, and reference articles',
};

export const guidesNavLink: NavLink = resourcesNavLink;

export const blogNavLink: NavLink = {
  label: 'Blog',
  href: '/blog',
  description: 'Federal tax updates and planning articles',
};

export const aboutNavLink: NavLink = {
  label: 'About',
  href: '/about',
  description: 'How TaxChecker builds independent federal tax estimates',
};

export const methodologyNavLink: NavLink = {
  label: 'Methodology',
  href: '/methodology',
  description: 'How TaxChecker estimates are built',
};

export const calculatorNavGroups: NavGroup[] = [
  {
    label: 'Self Employment',
    links: [
      {
        label: 'Self-Employed Tax',
        href: '/calculators/self-employed-tax',
        description: 'SE tax and federal income tax on net profit',
      },
      {
        label: '1099 Tax',
        href: '/calculators/1099-tax',
        description: 'Contractor income after business expenses',
      },
      {
        label: 'Quarterly Tax',
        href: '/calculators/quarterly-tax',
        description: 'Estimated quarterly federal payments',
      },
      {
        label: 'Estimated Tax',
        href: '/calculators/estimated-tax',
        description: 'Annual and remaining estimated tax',
      },
    ],
  },
  {
    label: 'Employment',
    links: [
      {
        label: 'W-2 vs 1099',
        href: '/calculators/w2-vs-1099',
        description: 'Compare employee vs contractor take-home',
      },
    ],
  },
  {
    label: 'Business Structures',
    links: [
      {
        label: 'S Corp Tax',
        href: '/calculators/s-corp-tax',
        description: 'Salary, distributions, and payroll tax',
      },
      {
        label: 'LLC vs S Corp',
        href: '/calculators/llc-vs-scorp',
        description: 'Compare pass-through structures',
      },
    ],
  },
  {
    label: 'Health Savings',
    links: [
      {
        label: 'HSA Tax Savings',
        href: '/calculators/hsa-tax',
        description: 'Contribution limits and tax savings',
      },
    ],
  },
];

export const allCalculators: NavLink[] = calculatorNavGroups.flatMap(
  (group) => group.links,
);

export const footerNav = {
  calculators: [calculatorsHubLink, ...allCalculators],
  resources: [resourcesNavLink, methodologyNavLink, { label: 'Sources', href: '/sources' }],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Editorial Standards', href: '/editorial-standards' },
    { label: 'Sources', href: '/sources' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Use', href: '/terms' },
    { label: 'Disclaimer', href: '/disclaimer' },
  ],
} as const;
