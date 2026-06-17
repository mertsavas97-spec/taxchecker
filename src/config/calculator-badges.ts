export type CalculatorFeatureBadgeId =
  | 'most_popular'
  | 'most_used'
  | 'recently_updated';

export const CALCULATOR_FEATURE_BADGE_LABELS: Record<
  CalculatorFeatureBadgeId,
  string
> = {
  most_popular: 'Most Popular',
  most_used: 'Most Used',
  recently_updated: 'Recently Updated',
};

export const calculatorFeatureBadges: Partial<
  Record<string, CalculatorFeatureBadgeId>
> = {
  'self-employed-tax-calculator': 'most_popular',
  'quarterly-tax-calculator': 'most_used',
  'hsa-tax-savings-calculator': 'recently_updated',
};

export function getCalculatorFeatureBadge(
  slug: string,
): CalculatorFeatureBadgeId | undefined {
  return calculatorFeatureBadges[slug];
}
