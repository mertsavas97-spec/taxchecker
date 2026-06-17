import {
  centsToDollars,
  formatCurrency,
  percentFromRatio,
  FILING_STATUSES,
  type FilingStatus,
  type MoneyCents,
  type TaxYearConfig,
} from '@/lib/tax-engine';

import { getFilingStatusLabel } from '@/lib/resources/filing-status-labels';

export interface BracketTableRow {
  rateLabel: string;
  taxableIncomeRange: string;
}

export interface StandardDeductionRow {
  status: FilingStatus;
  label: string;
  amountLabel: string;
}

export function formatTaxableIncomeRange(
  min: MoneyCents,
  max: MoneyCents | null,
): string {
  if (min === 0 && max !== null) {
    return `$0 – ${formatCurrency(max)}`;
  }

  if (max === null) {
    return `${formatCurrency(min)} and over`;
  }

  return `${formatCurrency(min)} – ${formatCurrency(max)}`;
}

export function getBracketTableRows(
  config: TaxYearConfig,
  status: FilingStatus,
): BracketTableRow[] {
  return config.federalIncomeTax.brackets[status].map((bracket) => ({
    rateLabel: percentFromRatio(bracket.rate),
    taxableIncomeRange: formatTaxableIncomeRange(bracket.min, bracket.max),
  }));
}

export function getStandardDeductionRows(
  config: TaxYearConfig,
): StandardDeductionRow[] {
  return FILING_STATUSES.map((status) => ({
    status,
    label: getFilingStatusLabel(status),
    amountLabel: formatCurrency(config.standardDeduction[status]),
  }));
}

export interface QuarterlyDueDateRow {
  quarter: string;
  incomePeriod: string;
  dueDateLabel: string;
  dueDateIso: string;
}

const QUARTERLY_INCOME_PERIODS = [
  'January 1 – March 31',
  'April 1 – May 31',
  'June 1 – August 31',
  'September 1 – December 31',
] as const;

export function formatIsoDateLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year!, month! - 1, day);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function getQuarterlyDueDateRows(
  config: TaxYearConfig,
): QuarterlyDueDateRow[] {
  return config.estimatedTax.quarterlyDueDates.map((dueDateIso, index) => ({
    quarter: `Q${index + 1}`,
    incomePeriod: QUARTERLY_INCOME_PERIODS[index]!,
    dueDateLabel: formatIsoDateLabel(dueDateIso),
    dueDateIso,
  }));
}

export function formatPercentFromConfig(rate: number): string {
  return percentFromRatio(rate);
}

export function formatDollarsFromCents(cents: MoneyCents): string {
  return formatCurrency(cents);
}

export function formatDollarsPlain(cents: MoneyCents): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(centsToDollars(cents));
}
