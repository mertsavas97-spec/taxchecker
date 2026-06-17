import type { WorkedExampleRow } from '@/lib/calculators/self-employed-tax-page';
import { formatExampleCurrency } from '@/lib/calculators/self-employed-tax-page';
import { dollarsToCents, percentFromRatio } from '@/lib/tax-engine';
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

export function WorkedExampleCards({
  examples,
  className,
}: {
  examples: WorkedExampleRow[];
  className?: string;
}) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-3', className)}>
      {examples.map((example) => (
        <Card key={example.netIncomeDollars} className="shadow-tc-sm">
          <CardHeader className="pb-3">
            <p className="tc-overline">Example</p>
            <CardTitle className="text-xl font-semibold tracking-tight">
              {formatExampleCurrency(dollarsToCents(example.netIncomeDollars))}
            </CardTitle>
            <p className="text-sm text-muted-foreground">Net self-employment income</p>
          </CardHeader>
          <CardContent className="space-y-0">
            <ExampleMetric
              label="Self-employment tax"
              value={formatExampleCurrency(example.selfEmploymentTaxCents)}
            />
            <ExampleMetric
              label="Federal income tax"
              value={formatExampleCurrency(example.federalIncomeTaxCents)}
            />
            <ExampleMetric
              label="Total estimated federal tax"
              value={formatExampleCurrency(example.totalEstimatedFederalTaxCents)}
              emphasis
            />
            <ExampleMetric
              label="Quarterly estimate"
              value={formatExampleCurrency(example.quarterlyEstimatedPaymentCents)}
            />
            <ExampleMetric
              label="Effective tax rate"
              value={percentFromRatio(example.effectiveTaxRate)}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
