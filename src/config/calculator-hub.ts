import {
  getCalculatorBySlug,
  getReadyCalculators,
  type CalculatorDefinition,
} from '@/config/calculators';

export const POPULAR_CALCULATOR_SLUG = 'self-employed-tax-calculator';

export type HubCategoryId =
  | 'self-employment'
  | 'business-structures'
  | 'health-savings'
  | 'employment';

export interface HubCategory {
  id: HubCategoryId;
  label: string;
  slugs: string[];
}

export const calculatorHubCategories: HubCategory[] = [
  {
    id: 'self-employment',
    label: 'Self Employment',
    slugs: [
      'self-employed-tax-calculator',
      '1099-tax-calculator',
      'quarterly-tax-calculator',
      'estimated-tax-calculator',
    ],
  },
  {
    id: 'business-structures',
    label: 'Business Structures',
    slugs: ['s-corp-tax-calculator', 'llc-vs-scorp-calculator'],
  },
  {
    id: 'health-savings',
    label: 'Health Savings',
    slugs: ['hsa-tax-savings-calculator'],
  },
  {
    id: 'employment',
    label: 'Employment',
    slugs: ['w2-vs-1099-calculator'],
  },
];

const hubCategoryBySlug = new Map<string, HubCategoryId>(
  calculatorHubCategories.flatMap((category) =>
    category.slugs.map((slug) => [slug, category.id] as const),
  ),
);

export function getHubCategoryId(slug: string): HubCategoryId | undefined {
  return hubCategoryBySlug.get(slug);
}

export function getHubCategoryLabel(slug: string): string {
  const categoryId = getHubCategoryId(slug);
  if (!categoryId) return 'Calculator';
  return (
    calculatorHubCategories.find((category) => category.id === categoryId)?.label ??
    'Calculator'
  );
}

export function getCalculatorsForHubCategory(
  categoryId: HubCategoryId,
): CalculatorDefinition[] {
  const category = calculatorHubCategories.find((item) => item.id === categoryId);
  if (!category) return [];

  return category.slugs
    .map((slug) => getCalculatorBySlug(slug))
    .filter(
      (calculator): calculator is CalculatorDefinition =>
        calculator !== undefined && calculator.status === 'ready',
    );
}

export function getAllHubCalculators(): CalculatorDefinition[] {
  return getReadyCalculators().sort(
    (left, right) =>
      calculatorHubCategories.findIndex((category) =>
        category.slugs.includes(left.slug),
      ) -
      calculatorHubCategories.findIndex((category) =>
        category.slugs.includes(right.slug),
      ),
  );
}

export function getPopularCalculator(): CalculatorDefinition {
  const calculator = getCalculatorBySlug(POPULAR_CALCULATOR_SLUG);
  if (!calculator || calculator.status !== 'ready') {
    return getReadyCalculators()[0]!;
  }
  return calculator;
}
