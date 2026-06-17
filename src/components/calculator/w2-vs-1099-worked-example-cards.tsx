import type { W2Vs1099WorkedExampleRow } from '@/lib/calculators/w2-vs-1099-page';
import { formatW2Vs1099ExampleCurrency } from '@/lib/calculators/w2-vs-1099-page';
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

export function W2Vs1099WorkedExampleCards({
  examples,
  className,
}: {
  examples: W2Vs1099WorkedExampleRow[];
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
            <p className="text-sm text-muted-foreground">
              Higher estimated value: {example.higherEstimatedValueLabel}
            </p>
          </CardHeader>
          <CardContent className="space-y-0">
            <ExampleMetric
              label="Estimated W-2 total value"
              value={formatW2Vs1099ExampleCurrency(example.w2TotalEstimatedValueCents)}
            />
            <ExampleMetric
              label="Estimated 1099 total value"
              value={formatW2Vs1099ExampleCurrency(
                example.contractorTotalEstimatedValueCents,
              )}
            />
            <ExampleMetric
              label="Difference (W-2 minus 1099)"
              value={formatW2Vs1099ExampleCurrency(example.differenceCents)}
              emphasis
            />
            <ExampleMetric
              label="W-2 after-tax income"
              value={formatW2Vs1099ExampleCurrency(example.w2AfterTaxIncomeCents)}
            />
            <ExampleMetric
              label="1099 after-tax income"
              value={formatW2Vs1099ExampleCurrency(
                example.contractorAfterTaxIncomeCents,
              )}
            />
            <ExampleMetric
              label="Break-even contractor gross"
              value={
                example.breakEvenContractorGrossIncomeCents !== null
                  ? formatW2Vs1099ExampleCurrency(
                      example.breakEvenContractorGrossIncomeCents,
                    )
                  : 'Not found'
              }
            />
            {example.breakEvenContractorHourlyRateCents !== null ? (
              <ExampleMetric
                label="Break-even hourly rate"
                value={formatW2Vs1099ExampleCurrency(
                  example.breakEvenContractorHourlyRateCents,
                )}
              />
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
