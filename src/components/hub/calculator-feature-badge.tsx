import {
  CALCULATOR_FEATURE_BADGE_LABELS,
  getCalculatorFeatureBadge,
  type CalculatorFeatureBadgeId,
} from '@/config/calculator-badges';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const badgeStyles: Record<CalculatorFeatureBadgeId, string> = {
  most_popular: 'border-tc-brand/25 bg-tc-brand/10 text-tc-brand',
  most_used: 'border-tc-savings/30 bg-tc-savings-muted/60 text-tc-savings',
  recently_updated: 'border-border bg-muted text-foreground',
};

export function CalculatorFeatureBadge({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const badgeId = getCalculatorFeatureBadge(slug);
  if (!badgeId) return null;

  return (
    <Badge
      variant="outline"
      className={cn(
        'shrink-0 text-[10px] font-semibold uppercase tracking-wide',
        badgeStyles[badgeId],
        className,
      )}
    >
      {CALCULATOR_FEATURE_BADGE_LABELS[badgeId]}
    </Badge>
  );
}
