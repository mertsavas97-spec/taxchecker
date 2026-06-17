import type { QuarterlyWorkedExampleRow } from '@/lib/calculators/quarterly-tax-page';
import { formatQuarterlyExampleCurrency } from '@/lib/calculators/quarterly-tax-page';
import { dollarsToCents } from '@/lib/tax-engine';
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

export function QuarterlyWorkedExampleCards({
  examples,
  className,
}: {
  examples: QuarterlyWorkedExampleRow[];
  className?: string;
}) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-3', className)}>
      {examples.map((example) => (
        <Card key={example.netIncomeDollars} className="shadow-tc-sm">
          <CardHeader className="pb-3">
            <p className="tc-overline">Example</p>
            <CardTitle className="text-xl font-semibold tracking-tight">
              {formatQuarterlyExampleCurrency(dollarsToCents(example.netIncomeDollars))}
            </CardTitle>
            <p className="text-sm text-muted-foreground">Net self-employment income</p>
          </CardHeader>
          <CardContent className="space-y-0">
            <ExampleMetric
              label="Total estimated federal tax"
              value={formatQuarterlyExampleCurrency(example.totalEstimatedFederalTaxCents)}
              emphasis
            />
            <ExampleMetric
              label="Estimated quarterly payment"
              value={formatQuarterlyExampleCurrency(example.recommendedQuarterlyPaymentCents)}
            />
            <ExampleMetric
              label="Monthly tax reserve"
              value={formatQuarterlyExampleCurrency(example.monthlyTaxReserveCents)}
            />
            <ExampleMetric
              label="Remaining estimated tax"
              value={formatQuarterlyExampleCurrency(example.remainingEstimatedTaxCents)}
            />
            <ExampleMetric
              label="Safe harbor target"
              value={formatQuarterlyExampleCurrency(example.safeHarborTargetCents)}
            />
            <ExampleMetric
              label="Self-employment tax"
              value={formatQuarterlyExampleCurrency(example.selfEmploymentTaxCents)}
            />
            <ExampleMetric
              label="Federal income tax"
              value={formatQuarterlyExampleCurrency(example.federalIncomeTaxCents)}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
