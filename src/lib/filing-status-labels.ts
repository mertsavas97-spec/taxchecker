import type { FilingStatus } from '@/lib/tax-engine';

export const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
  single: 'Single',
  married_filing_jointly: 'Married filing jointly',
  married_filing_separately: 'Married filing separately',
  head_of_household: 'Head of household',
  qualifying_surviving_spouse: 'Qualifying surviving spouse',
};
