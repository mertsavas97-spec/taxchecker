import { RelatedContentBlock } from '@/components/content/related-content-block';
import { buildCalculatorPageRelatedContent } from '@/lib/conversion/related-content';
import type { CalculatorJourneyId } from '@/lib/conversion/types';

export function CalculatorDiscoveryBlock({
  journeyId,
}: {
  journeyId: CalculatorJourneyId;
}) {
  const related = buildCalculatorPageRelatedContent(journeyId);

  return (
    <RelatedContentBlock
      title="Continue exploring"
      description="Related calculators, guides, and articles for this tax scenario."
      calculators={related.calculators}
      resources={related.resources}
      articles={related.articles}
    />
  );
}
