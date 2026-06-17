import type { Tax1099WorkedExampleRow } from '@/lib/calculators/1099-tax-page';
import { format1099ExampleCurrency } from '@/lib/calculators/1099-tax-page';
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

export function Tax1099WorkedExampleCards({
  examples,
  className,
}: {
  examples: Tax1099WorkedExampleRow[];
  className?: string;
}) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-3', className)}>
      {examples.map((example) => (
        <Card
          key={`${example.grossIncomeDollars}-${example.expensesDollars}`}
          className="shadow-tc-sm"
        >
          <CardHeader className="pb-3">
            <p className="tc-overline">Example</p>
            <CardTitle className="text-xl font-semibold tracking-tight">
              {format1099ExampleCurrency(dollarsToCents(example.grossIncomeDollars))}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Gross 1099 income ·{' '}
              {format1099ExampleCurrency(dollarsToCents(example.expensesDollars))}{' '}
              expenses
            </p>
          </CardHeader>
          <CardContent className="space-y-0">
            <ExampleMetric
              label="Gross income"
              value={format1099ExampleCurrency(dollarsToCents(example.grossIncomeDollars))}
            />
            <ExampleMetric
              label="Expenses"
              value={format1099ExampleCurrency(dollarsToCents(example.expensesDollars))}
            />
            <ExampleMetric
              label="Net income"
              value={format1099ExampleCurrency(dollarsToCents(example.netIncomeDollars))}
            />
            <ExampleMetric
              label="Self-employment tax"
              value={format1099ExampleCurrency(example.selfEmploymentTaxCents)}
            />
            <ExampleMetric
              label="Federal income tax"
              value={format1099ExampleCurrency(example.federalIncomeTaxCents)}
            />
            <ExampleMetric
              label="Total estimated federal tax"
              value={format1099ExampleCurrency(example.totalEstimatedFederalTaxCents)}
              emphasis
            />
            <ExampleMetric
              label="Quarterly estimate"
              value={format1099ExampleCurrency(example.quarterlyEstimatedPaymentCents)}
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
