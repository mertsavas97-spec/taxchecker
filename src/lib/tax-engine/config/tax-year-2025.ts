import type { FilingStatus, SourceReference, TaxBracket, TaxYearConfig } from '../types';
import { dollarsToCents } from '../core/rounding';

const RATES = [0.1, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37] as const;

/** Build progressive brackets from inclusive dollar upper bounds per IRS tables */
function buildBracketsFromCaps(capsDollars: readonly number[]): TaxBracket[] {
  return RATES.map((rate, index) => {
    const min: number =
      index === 0 ? 0 : dollarsToCents(capsDollars[index - 1]!) + 100;
    const max: number | null =
      index < capsDollars.length ? dollarsToCents(capsDollars[index]!) : null;
    return { min, max, rate };
  });
}

const SINGLE_CAPS = [11_925, 48_475, 103_350, 197_300, 250_525, 626_350] as const;
const MFJ_CAPS = [23_850, 96_950, 206_700, 394_600, 501_050, 751_600] as const;
const MFS_CAPS = [11_925, 48_475, 103_350, 197_300, 250_525, 375_800] as const;
const HOH_CAPS = [17_000, 64_850, 103_350, 197_300, 250_500, 626_350] as const;

const REV_PROC_2024_40: SourceReference = {
  title: 'Revenue Procedure 2024-40',
  url: 'https://www.irs.gov/pub/irs-drop/rp-24-40.pdf',
  taxYear: 2025,
  dateAccessed: '2026-06-16',
};

const TOPIC_554: SourceReference = {
  title: 'Topic no. 554, Self-employment tax',
  url: 'https://www.irs.gov/taxtopics/tc554',
  taxYear: 2025,
  dateAccessed: '2026-06-16',
};

const SCHEDULE_SE_2025: SourceReference = {
  title: 'Instructions for Schedule SE (Form 1040) (2025)',
  url: 'https://www.irs.gov/instructions/i1040sse',
  taxYear: 2025,
  dateAccessed: '2026-06-16',
};

const ADDITIONAL_MEDICARE_QA: SourceReference = {
  title: 'Questions and Answers for the Additional Medicare Tax',
  url: 'https://www.irs.gov/businesses/small-businesses-self-employed/questions-and-answers-for-the-additional-medicare-tax',
  taxYear: 2025,
  dateAccessed: '2026-06-16',
};

const PUB_15: SourceReference = {
  title: "Publication 15 (Circular E), Employer's Tax Guide",
  url: 'https://www.irs.gov/publications/p15',
  taxYear: 2025,
  dateAccessed: '2026-06-16',
};

const FORM_1040_ES_2025: SourceReference = {
  title: 'Form 1040-ES (2025)',
  url: 'https://www.irs.gov/pub/irs-prior/f1040es--2025.pdf',
  taxYear: 2025,
  dateAccessed: '2026-06-16',
};

const REV_PROC_2024_25: SourceReference = {
  title: 'Revenue Procedure 2024-25',
  url: 'https://www.irs.gov/pub/irs-drop/rp-24-25.pdf',
  taxYear: 2025,
  dateAccessed: '2026-06-16',
};

const NOTICE_2024_80: SourceReference = {
  title: 'Notice 2024-80 — 2025 Retirement Plan Limits',
  url: 'https://www.irs.gov/pub/irs-drop/n-24-80.pdf',
  taxYear: 2025,
  dateAccessed: '2026-06-16',
};

const mfjBrackets = buildBracketsFromCaps(MFJ_CAPS);

const federalBrackets: Record<FilingStatus, TaxBracket[]> = {
  single: buildBracketsFromCaps(SINGLE_CAPS),
  married_filing_jointly: mfjBrackets,
  qualifying_surviving_spouse: mfjBrackets,
  married_filing_separately: buildBracketsFromCaps(MFS_CAPS),
  head_of_household: buildBracketsFromCaps(HOH_CAPS),
};

export const taxYear2025: TaxYearConfig = {
  taxYear: 2025,
  verifiedAt: '2026-06-16',
  sourceNotes: '/methodology',

  sources: {
    federalIncomeTax: REV_PROC_2024_40,
    standardDeduction: REV_PROC_2024_40,
    selfEmploymentTax: TOPIC_554,
    additionalMedicareTax: ADDITIONAL_MEDICARE_QA,
    payrollTax: PUB_15,
    estimatedTax: FORM_1040_ES_2025,
    hsa: REV_PROC_2024_25,
    sepIra: NOTICE_2024_80,
    solo401k: NOTICE_2024_80,
  },

  federalIncomeTax: {
    brackets: federalBrackets,
  },

  standardDeduction: {
    married_filing_jointly: dollarsToCents(30_000),
    qualifying_surviving_spouse: dollarsToCents(30_000),
    head_of_household: dollarsToCents(22_500),
    single: dollarsToCents(15_000),
    married_filing_separately: dollarsToCents(15_000),
  },

  selfEmploymentTax: {
    netEarningsFactor: 0.9235,
    socialSecurityRate: 0.124,
    medicareRate: 0.029,
    socialSecurityWageBase: dollarsToCents(176_100),
    deductiblePortionRate: 0.5,
    minimumNetEarningsThreshold: dollarsToCents(400),
  },

  additionalMedicareTax: {
    rate: 0.009,
    thresholds: {
      married_filing_jointly: dollarsToCents(250_000),
      married_filing_separately: dollarsToCents(125_000),
      single: dollarsToCents(200_000),
      head_of_household: dollarsToCents(200_000),
      qualifying_surviving_spouse: dollarsToCents(200_000),
    },
  },

  payrollTax: {
    socialSecurityRateEmployee: 0.062,
    medicareRateEmployee: 0.0145,
    socialSecurityRateEmployer: 0.062,
    medicareRateEmployer: 0.0145,
    socialSecurityWageBase: dollarsToCents(176_100),
  },

  estimatedTax: {
    safeHarborCurrentYearRate: 0.9,
    safeHarborPriorYearRate: 1.0,
    safeHarborPriorYearHighAGIRate: 1.1,
    safeHarborHighAGIThreshold: dollarsToCents(150_000),
    safeHarborHighAGIThresholdMFS: dollarsToCents(75_000),
    minimumTaxOwedThreshold: dollarsToCents(1_000),
    quarterlyDueDates: ['2025-04-15', '2025-06-16', '2025-09-15', '2026-01-15'],
  },

  hsa: {
    selfOnlyLimit: dollarsToCents(4_300),
    familyLimit: dollarsToCents(8_550),
    catchUpAge: 55,
    catchUpAmount: dollarsToCents(1_000),
  },

  sepIra: {
    maxContribution: dollarsToCents(70_000),
    compensationRate: 0.25,
  },

  solo401k: {
    employeeDeferralLimit: dollarsToCents(23_500),
    catchUpAge: 50,
    catchUpAmount: dollarsToCents(7_500),
    totalAnnualAdditionLimit: dollarsToCents(70_000),
    employerCompensationRate: 0.25,
    annualCompensationLimit: dollarsToCents(350_000),
  },
};
