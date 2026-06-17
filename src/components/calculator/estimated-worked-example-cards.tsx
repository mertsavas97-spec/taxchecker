import type { EstimatedWorkedExampleRow } from '@/lib/calculators/estimated-tax-page';
import { formatEstimatedExampleCurrency } from '@/lib/calculators/estimated-tax-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

function ExampleMetric({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-3 first:border-t-0 first:pt-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          'tc-tabular text-sm font-semibold',
          emphasis ? 'text-tc-liability' : 'text-foreground',
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function EstimatedWorkedExampleCards({
  examples,
  className,
}: {
  examples: EstimatedWorkedExampleRow[];
  className?: string;
}) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-3', className)}>
      {examples.map((example) => (
        <Card key={example.key} className="shadow-tc-sm">
          <CardHeader className="pb-3">
            <p className="tc-overline">Example</p>
            <CardTitle className="text-lg font-semibold tracking-tight">
              {example.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{example.subtitle}</p>
          </CardHeader>
          <CardContent className="space-y-0">
            <ExampleMetric
              label="Estimated annual federal tax"
              value={formatEstimatedExampleCurrency(example.estimatedAnnualFederalTaxCents)}
              emphasis
            />
            <ExampleMetric
              label="Remaining tax"
              value={formatEstimatedExampleCurrency(example.remainingTaxCents)}
            />
            <ExampleMetric
              label="Estimated remaining quarterly payment"
              value={formatEstimatedExampleCurrency(
                example.recommendedRemainingQuarterlyPaymentCents,
              )}
            />
            <ExampleMetric
              label="Monthly tax reserve"
              value={formatEstimatedExampleCurrency(example.monthlyTaxReserveCents)}
            />
            <ExampleMetric
              label="Safe harbor target"
              value={formatEstimatedExampleCurrency(example.safeHarborTargetCents)}
            />
            {example.selfEmploymentTaxCents > 0 ? (
              <ExampleMetric
                label="Self-employment tax"
                value={formatEstimatedExampleCurrency(example.selfEmploymentTaxCents)}
              />
            ) : null}
            <ExampleMetric
              label="Federal income tax"
              value={formatEstimatedExampleCurrency(example.federalIncomeTaxCents)}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
