import type { TaxWarning } from '../types';

export const ENGINE_VERSION = '0.6.0';

export const BASE_CALCULATOR_WARNINGS: TaxWarning[] = [
  {
    code: 'FEDERAL_ONLY',
    message: 'Federal estimate only. State and local taxes are excluded.',
  },
  {
    code: 'STATE_EXCLUDED',
    message: 'State income taxes are not included in this estimate.',
  },
  {
    code: 'CREDITS_EXCLUDED',
    message: 'Tax credits are excluded from this estimate.',
  },
  {
    code: 'QBI_EXCLUDED',
    message: 'Qualified Business Income (Section 199A) deduction is excluded.',
  },
];

export const PENALTY_EXCLUDED_WARNING: TaxWarning = {
  code: 'PENALTY_EXCLUDED',
  message: 'Underpayment penalties (Form 2210) are not calculated.',
};
