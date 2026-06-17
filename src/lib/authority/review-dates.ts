import { getReadyCalculators } from '@/config/calculators';
import { getSitemapResourcesPublic } from '@/lib/cms/public-read';

/** Latest last-reviewed date across ready calculators (YYYY-MM-DD). */
export function getLatestCalculatorReviewDate(): string {
  const calculators = getReadyCalculators();
  return calculators.reduce(
    (latest, calculator) =>
      calculator.lastReviewed > latest ? calculator.lastReviewed : latest,
    calculators[0]?.lastReviewed ?? '',
  );
}

/** Primary tax year shown on ready calculators. */
export function getPrimaryTaxYear(): number {
  return getReadyCalculators()[0]?.taxYear ?? 2025;
}

/** Latest review date across calculators and published resources. */
export async function getLatestSiteReviewDate(): Promise<string> {
  const calculatorReview = getLatestCalculatorReviewDate();
  const resources = await getSitemapResourcesPublic();
  const resourceReview = resources.reduce(
    (latest, resource) =>
      resource.lastReviewed > latest ? resource.lastReviewed : latest,
    '',
  );

  if (!calculatorReview) return resourceReview;
  if (!resourceReview) return calculatorReview;
  return calculatorReview > resourceReview ? calculatorReview : resourceReview;
}
