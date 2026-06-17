import type { MoneyCents } from '../types';

/** Convert whole-dollar amount to integer cents */
export function dollarsToCents(dollars: number): MoneyCents {
  return Math.round(dollars * 100);
}

/** Convert integer cents to dollar float (display only) */
export function centsToDollars(cents: MoneyCents): number {
  return cents / 100;
}

/** Round to nearest cent */
export function roundCents(amount: number): MoneyCents {
  return Math.round(amount);
}

/** Multiply a cent amount by a rate and round to nearest cent */
export function multiplyCentsByRate(cents: MoneyCents, rate: number): MoneyCents {
  return roundCents(cents * rate);
}

export interface CurrencyFormatOptions {
  locale?: string;
  currency?: string;
  minimumFractionDigits?: 0 | 2;
  maximumFractionDigits?: 0 | 2;
}

/** Format cents as USD currency string */
export function formatCurrency(
  cents: MoneyCents,
  options: CurrencyFormatOptions = {},
): string {
  const {
    locale = 'en-US',
    currency = 'USD',
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
  } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(centsToDollars(cents));
}

/** Format a ratio (e.g. 0.224) as a percentage string with one decimal */
export function percentFromRatio(ratio: number, fractionDigits = 1): string {
  return `${(ratio * 100).toFixed(fractionDigits)}%`;
}

/** Split annual cents into four equal quarterly payments; remainder to Q1 */
export function splitEqualQuarters(annualCents: MoneyCents): [
  MoneyCents,
  MoneyCents,
  MoneyCents,
  MoneyCents,
] {
  const base = Math.floor(annualCents / 4);
  const remainder = annualCents - base * 4;
  return [base + remainder, base, base, base];
}
