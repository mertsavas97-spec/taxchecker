import type { ResultCard } from '@/lib/tax-engine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  formatResultCardValue,
  isComparisonHighlightCard,
  isHeroPrimaryCard,
  isSavingsPrimaryCard,
} from '@/lib/calculators/result-layout';
import { cn } from '@/lib/utils';

export function PrimaryResults({
  items,
  taxYear,
  title = 'Your estimate',
  description,
  className,
}: {
  items: ResultCard[];
  taxYear: number;
  title?: string;
  description?: string;
  className?: string;
}) {
  const resultDescription =
    description ?? `Federal estimate for tax year ${taxYear}. Updates instantly.`;

  return (
    <Card
      className={cn(
        'overflow-hidden border-tc-brand/20 bg-card shadow-tc-md ring-1 ring-tc-brand/10',
        className,
      )}
    >
      <CardHeader className="border-b border-border/70 bg-tc-slate-50/50 pb-2.5">
        <p className="tc-overline">Primary results</p>
        <CardTitle className="tc-heading-subsection font-semibold tracking-tight">
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{resultDescription}</p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => {
            const hero = isHeroPrimaryCard(item.id);
            const savings = isSavingsPrimaryCard(item.id);
            const comparison = isComparisonHighlightCard(item.id);

            return (
              <div
                key={item.id}
                className={cn(
                  'relative rounded-lg border px-3.5 py-3.5',
                  comparison &&
                    'border-tc-brand/25 bg-tc-brand/5 sm:col-span-2',
                  hero &&
                    'border-tc-liability/30 bg-tc-liability-muted/50 sm:col-span-2 before:absolute before:top-3 before:bottom-3 before:left-0 before:w-1 before:rounded-full before:bg-tc-liability',
                  savings && 'border-tc-savings/30 bg-tc-savings-muted/40',
                  !hero && !savings && !comparison && 'border-border bg-muted/15',
                  hero && 'pl-4',
                )}
              >
                <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  {item.label}
                </p>
                <p
                  className={cn(
                    'tc-tabular mt-1.5 font-semibold text-foreground',
                    hero ? 'text-3xl sm:text-4xl' : comparison ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl',
                    savings && 'text-tc-savings',
                    hero && 'text-tc-liability',
                  )}
                >
                  {formatResultCardValue(item)}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
