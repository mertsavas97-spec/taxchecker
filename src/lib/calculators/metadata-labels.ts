import type { CalculatorDefinition } from '@/config/calculators';

export function formatTaxYearLabel(taxYear: number): string {
  return `Tax year ${taxYear}`;
}

export function formatLastReviewedLabel(lastReviewed: string): string {
  return `Last reviewed ${lastReviewed}`;
}

export function formatCalculatorMetadataLine(
  calculator: Pick<CalculatorDefinition, 'lastReviewed' | 'taxYear'>,
): string {
  return `${formatLastReviewedLabel(calculator.lastReviewed)} · ${formatTaxYearLabel(calculator.taxYear)}`;
}
