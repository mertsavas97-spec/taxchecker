import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';

import { CalculatorTopicIcon } from '@/components/calculator/calculator-topic-icon';
import { CalculatorFeatureBadge } from '@/components/hub/calculator-feature-badge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getHubCategoryLabel } from '@/config/calculator-hub';
import type { CalculatorDefinition } from '@/config/calculators';
import { formatLastReviewedLabel } from '@/lib/calculators/metadata-labels';
import { cn } from '@/lib/utils';

export function CalculatorCard({
  calculator,
  showCategory = true,
  className,
}: {
  calculator: CalculatorDefinition;
  showCategory?: boolean;
  className?: string;
}) {
  const categoryLabel = getHubCategoryLabel(calculator.slug);

  return (
    <Link
      href={calculator.route}
      className={cn('group block h-full no-underline', className)}
    >
      <Card
        size="sm"
        className="flex h-full flex-col border-border bg-card py-3 shadow-tc-sm transition-all group-hover:border-tc-brand/25 group-hover:shadow-tc-md"
      >
        <CardHeader className="flex-1 gap-2 pb-0">
          <div className="flex items-center justify-between gap-2">
            {showCategory ? (
              <Badge variant="secondary" className="text-[10px] font-semibold uppercase">
                {categoryLabel}
              </Badge>
            ) : (
              <span />
            )}
            <CalculatorFeatureBadge slug={calculator.slug} />
          </div>
          <CalculatorTopicIcon slug={calculator.slug} size="md" />
          <CardTitle className="text-base font-semibold tracking-tight text-foreground group-hover:text-tc-link">
            {calculator.shortTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-auto space-y-3 pt-1">
          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
            {calculator.description}
          </p>
          <div className="flex items-center justify-between gap-2 border-t border-border/70 pt-2">
            <p className="text-[11px] text-muted-foreground">
              {formatLastReviewedLabel(calculator.lastReviewed)}
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-tc-link">
              Calculate
              <ArrowRightIcon
                className="size-3 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
