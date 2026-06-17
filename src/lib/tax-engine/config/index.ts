import type { TaxYearConfig } from '../types';
import { taxYear2025 } from './tax-year-2025';

const CONFIG_BY_YEAR: Record<number, TaxYearConfig> = {
  2025: taxYear2025,
};

export function getTaxYearConfig(year: number): TaxYearConfig | undefined {
  return CONFIG_BY_YEAR[year];
}

export function requireTaxYearConfig(year: number): TaxYearConfig {
  const config = getTaxYearConfig(year);
  if (!config) {
    throw new Error(`Unsupported tax year: ${year}`);
  }
  return config;
}

export { taxYear2025 };
