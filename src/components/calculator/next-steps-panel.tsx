'use client';

import { RouteIcon } from 'lucide-react';

import { RelatedContentFlatList } from '@/components/content/related-content-block';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCalculatorJourney } from '@/config/calculator-journeys';
import { buildJourneyLinks } from '@/lib/conversion/build-links';
import type { CalculatorJourneyId } from '@/lib/conversion/types';
import { cn } from '@/lib/utils';

export function NextStepsPanel({
  journeyId,
  className,
}: {
  journeyId: CalculatorJourneyId;
  className?: string;
}) {
  const journey = getCalculatorJourney(journeyId);
  const links = buildJourneyLinks(journey.nextSteps);

  if (links.length === 0) return null;

  return (
    <Card
      className={cn('border-tc-brand/20 bg-tc-brand/5 shadow-tc-sm', className)}
      aria-label="Next steps after your estimate"
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg border border-tc-brand/20 bg-card text-tc-brand">
            <RouteIcon className="size-4" aria-hidden />
          </span>
          <div>
            <CardTitle className="text-base font-semibold">Next steps</CardTitle>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {journey.summary}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <RelatedContentFlatList links={links} />
      </CardContent>
    </Card>
  );
}
