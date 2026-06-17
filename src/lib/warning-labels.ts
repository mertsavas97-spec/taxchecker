const WARNING_TITLES: Record<string, string> = {
  FEDERAL_ONLY: 'Federal estimate only',
  STATE_EXCLUDED: 'State taxes excluded',
  CREDITS_EXCLUDED: 'Tax credits excluded',
  QBI_EXCLUDED: 'QBI deduction excluded',
  PENALTY_EXCLUDED: 'Penalties not calculated',
  EXPENSES_EXCEED_GROSS: 'Expenses exceed gross income',
  EXPENSES_USER_ENTERED: 'Expenses are user-entered',
  ADDITIONAL_MEDICARE_REVIEW: 'Additional Medicare tax',
  ADDITIONAL_MEDICARE_WAGE_ASSUMPTION: 'Additional Medicare wage assumption',
  ADDITIONAL_MEDICARE_SE_ONLY: 'Additional Medicare on SE income only',
  WITHHOLDING_SIMPLIFIED: 'Withholding simplified',
  SAFE_HARBOR_PRIOR_YEAR_INCOMPLETE: 'Prior-year safe harbor incomplete',
  FICA_PRETAX_SIMPLIFIED: 'Pre-tax FICA simplified',
  BENEFITS_USER_ENTERED: 'Benefits are user-entered',
  CONTRACTOR_EXPENSES_USER_ENTERED: 'Contractor costs are user-entered',
  EMPLOYMENT_PROTECTIONS_LIMITED: 'Employment protections limited',
  NOT_LEGAL_OR_EMPLOYMENT_ADVICE: 'Not employment or legal advice',
  BREAK_EVEN_NOT_FOUND: 'Break-even not found',
  BREAK_EVEN_NOT_CONVERGED: 'Break-even estimate approximate',
  REASONABLE_COMPENSATION_USER_ENTERED: 'Salary is user-entered',
  NO_S_CORP_ELECTION_ADVICE: 'No S Corp election advice',
  STATE_FEES_USER_ENTERED: 'State fees are user-entered',
  COMPLIANCE_COSTS_VARIABLE: 'Compliance costs vary',
  CONSULT_CPA: 'Review with a tax professional',
  LLC_DEFAULT_PASS_THROUGH: 'Default LLC pass-through model',
  NOT_ENTITY_OR_LEGAL_ADVICE: 'Not entity or legal advice',
  INCONSISTENT: 'Input inconsistency',
  SALARY_EXCEEDS_PROFIT: 'Salary exceeds profit',
  LOW_SALARY_RATIO: 'Low salary ratio',
  ZERO_SALARY: 'Zero salary entered',
  HDHP_ELIGIBILITY_NOT_VERIFIED: 'HDHP eligibility not assessed',
  PARTIAL_YEAR_SIMPLIFIED: 'Partial-year simplified',
  EMPLOYER_REDUCES_ROOM: 'Employer contribution reduces room',
  PAYROLL_FICA_ONLY: 'Payroll FICA only',
  EXCESS_CONTRIBUTION_PENALTY: 'Excess contribution penalty',
  NO_INVESTMENT_GROWTH: 'Investment growth excluded',
  NOT_TAX_OR_BENEFITS_ADVICE: 'Not tax or benefits advice',
  FULL_YEAR_ELIGIBILITY_ASSUMED: 'Full-year eligibility assumed',
  ELIGIBLE_MONTHS_CLAMPED: 'Eligible months adjusted',
  PARTIAL_YEAR_PRORATION: 'Partial-year proration',
  EMPLOYER_EXCEEDS_LIMIT: 'Employer contribution exceeds limit',
  FICA_SIMPLIFIED: 'FICA calculation simplified',
  EXCESS_CONTRIBUTION: 'Excess contribution',
  PAYROLL_FICA_SAVINGS_EXCLUDED: 'Payroll FICA savings excluded',
};

function formatWarningCodeFallback(code: string): string {
  return code
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getWarningTitle(code: string): string {
  return WARNING_TITLES[code] ?? formatWarningCodeFallback(code);
}
